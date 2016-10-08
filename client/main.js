

function main(){
	curTime=Date.now()-startTime;
	deltaTime=curTime-lastTime;

	update();
	render();

	lastTime=curTime;

	// request another frame to keep the loop going
	requestAnimationFrame(main);
}

function init(){
	// initialize input managers
	gamepads.init();
	keys.init();


	scene = new PIXI.Container();
	game.addChild(scene);

	world = new PIXI.Container(); // container for all the in-game stuff (i.e. not the menu)
	addLerp(world, 0.05);


	// setup screen filter
	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	screen_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	screen_filter.uniforms.uBrightness = -1;
	screen_filter.targetBrightness = 0;

	screen_filter.padding=0;

	renderSprite.filters = [screen_filter];

	palettes=[
		"good ol' green (gameboy)",
		"\"web\"-\"safe\"",
		"grayscale",
		"not so good ol' green",
		"diffused liquids",
		"1-bit",
		"hallowe'en (default)",
		"cmyk (zx spectrum)",
		"blue (commodore 64)",
		"crimson (pico-8)",
		"aqua (cga)",
		"pastel (gbc)",
		"taiga (master system)",
		"flat and dirty (db16)",
		"venus in the 60s (nes)"
	];
	currentPalette = 5;
	swapPalette();


	// enemy parties
	enemy_parties=[
		["blob"],
		["blob","blob","blob"],
		["blobwiz","blobqueen","blobchamp"], // THE BLOB COURT
		["skelesword"],
		["skelesword","skeleaxe","skelesword"],
		["skeleaxe","skelechamp","skelespear"],
		["skelechamp","skelegiant","skelechamp"] // SKELE GIANT
	];


	// screen background
	bg = new PIXI.Container();
	addLerp(bg,0.1);
	bg.cacheAsBitmap=true;
	world.addChild(bg);
	world.swapSlot = new PIXI.Container();


	var tiles=PIXI.loader.resources.tilemap.data;
	{
		var tilemap=tiles.layers[0].data;
		for(var x=0; x<tiles.width; ++x){
		for(var y=0; y<9; ++y){
			var tileId=tilemap[x+y*tiles.width]-1;
			if(tileId != -1){
				var tileTex=tiles.tilesets[0].tiles[tileId].image;
				var tile=new PIXI.Sprite(PIXI.Texture.fromFrame(tileTex));
				tile.position.x=(x-3)*tiles.tilewidth;
				tile.position.y=(y-3)*tiles.tileheight;
				bg.addChild(tile);
			}
		}
		}
	}
	menu = new PIXI.Container();
	{
		var tilemap=tiles.layers[1].data;
		for(var x=0; x<10; ++x){
		for(var y=0; y<9; ++y){
			var tileId=tilemap[x+y*tiles.width]-1;
			if(tileId != -1){
				var tileTex=tiles.tilesets[0].tiles[tileId].image;
				var tile=new PIXI.Sprite(PIXI.Texture.fromFrame(tileTex));
				tile.position.x=x*tiles.tilewidth;
				tile.position.y=y*tiles.tileheight;
				menu.addChild(tile);
			}
		}
		}
	}

	menu.options=[
		new PIXI.extras.BitmapText("option slot", fontStyle),
		new PIXI.extras.BitmapText("option slot", fontStyle),
		new PIXI.extras.BitmapText("option slot", fontStyle)
	];

	menu.descriptionTxt = new PIXI.extras.BitmapText("description slot", fontStyle);
	menu.descriptionTxt.position.x=32+20;
	menu.descriptionTxt.position.y=4;
	menu.descriptionTxt.tint=0xCCCCCC;
	menu.descriptionTxt.maxWidth=100;

	menu.selectionText = new PIXI.extras.BitmapText("[           ]", fontStyle);
 	menu.selectionText.position.x = 4;
	menu.selectionText.maxLineHeight=1;
	menu.selectionText.maxWidth=size[0];
	menu.selectionText.tint=0x333333;

	menu.selectionBg = new PIXI.Graphics();
	menu.selectionBg.position.x = 4;
	menu.selectionBg.position.y = 4;
	menu.selectionBg.beginFill(0xCCCCCC);
	menu.selectionBg.drawRect(1,1,38,5);
	menu.selectionBg.endFill();

	for(var i=0; i < menu.options.length; ++i){
		menu.options[i].position=new PIXI.Point(4,4+8*i);
		menu.options[i].maxLineHeight=1;
		menu.options[i].maxWidth=size[0];
		menu.options[i].disable=function(){
			this.disabled=true;
			this.tint=0x666666;
		};menu.options[i].enable=function(){
			this.disabled=false;
			this.tint=0xCCCCCC;
		};

		menu.options[i].enable();
	}

	menu.selected=0;
	menu.nav=function(_by){
		// unhighlight current selection
		menu.options[menu.selected].text=menu.options[menu.selected].text.trim();
		menu.options[menu.selected].tint = menu.options[menu.selected].disabled ? 0x666666 : 0xCCCCCC;

		// update selection
		// wrap-around menu and skip over disabled options
		menu.selected+=_by;
		while(menu.selected  < 0|| menu.selected >= menu.options.length || menu.options[menu.selected].disabled){
			if(menu.selected < 0){
				menu.selected+=menu.options.length;
			}if(menu.selected >= menu.options.length){
				menu.selected-=menu.options.length;
			}if(menu.options[menu.selected].disabled){
				var s = Math.sign(_by);
				menu.selected += Math.abs(s) > 0 ? s : 1;
			}
		}

		// highlight new selection
		menu.options[menu.selected].text=" "+menu.options[menu.selected].text+" ";
		menu.options[menu.selected].tint=0x333333;
		menu.selectionBg.position.y = 4+8*menu.selected;
		menu.selectionText.position.y = 4+8*menu.selected;

		menu.states[menu.states.current].nav();

		sounds["sfx_move"].play();
	};
	menu.navReset=function(){
		for(var i = 0; i < menu.options.length; ++i){
			menu.options[i].text=menu.options[i].text.trim();
			menu.options[i].tint = menu.options[i].disabled ? 0x666666 : 0xCCCCCC;
		}
		menu.selected=0;
		menu.nav(0);
	};
	menu.next=function(){
		menu.nav(1);
	};
	menu.prev=function(){
		menu.nav(-1);
	};
	menu.select=function(){
		if(!menu.validOptions){
			sounds["sfx_cancel"].play();
			return;
		}
		menu.states[menu.states.current].select();
		sounds["sfx_select"].play();
	};
	menu.cancel=function(){
		menu.states[menu.states.current].cancel();
		sounds["sfx_cancel"].play();
	};
	menu.update=function(){
		menu.states[menu.states.current].update();

		var inputs={
			up:
				keys.isJustDown(keys.UP) ||
				keys.isJustDown(keys.W) ||
				gamepads.isJustDown(gamepads.DPAD_UP) ||
				gamepads.axisJustPast(gamepads.LSTICK_V,-0.5) ||

				keys.isJustDown(keys.LEFT) ||
				keys.isJustDown(keys.A) ||
				gamepads.isJustDown(gamepads.DPAD_LEFT) ||
				gamepads.axisJustPast(gamepads.LSTICK_H,-0.5),

			down:
				keys.isJustDown(keys.DOWN) ||
				keys.isJustDown(keys.S) ||
				gamepads.isJustDown(gamepads.DPAD_DOWN) ||
				gamepads.axisJustPast(gamepads.LSTICK_V,0.5) ||

				keys.isJustDown(keys.RIGHT) ||
				keys.isJustDown(keys.D) ||
				gamepads.isJustDown(gamepads.DPAD_RIGHT) ||
				gamepads.axisJustPast(gamepads.LSTICK_H,0.5),

			select:
				keys.isJustDown(keys.Z) ||
				keys.isJustDown(keys.ENTER) ||
				keys.isJustDown(keys.SPACE) ||
				gamepads.isJustDown(gamepads.A) ||
				gamepads.isJustDown(gamepads.Y),

			cancel:
				keys.isJustDown(keys.X) ||
				keys.isJustDown(keys.BACKSPACE) ||
				keys.isJustDown(keys.ESCAPE) ||
				gamepads.isJustDown(gamepads.B) ||
				gamepads.isJustDown(gamepads.X)
		};

		var dir=[0,0];
		if(inputs.up){
			dir[1]-=1;
		}if(inputs.down){
			dir[1]+=1;
		}

		if(dir[1] > 0){
			menu.next();
		}else if(dir[1] < 0){
			menu.prev();
		}


		if(inputs.select){
			menu.select();
		}
		if(inputs.cancel){
			menu.cancel();
		}
	}

	menu.states={
		"main_menu":{
			init:function(){
				menu.options[0].text="start";
				menu.options[1].text="options";
				menu.options[2].text="about";

				for(var i = 0; i < menu.options.length; ++i){
					menu.options[i].enable();
				}

				if(!menu.pocket_sprite){
					menu.pocket_sprite=new PIXI.Sprite(PIXI.Texture.fromFrame("pocket_edition.png"));
					menu.pocket_sprite.position.x=size[0]-menu.pocket_sprite.width-4;
					menu.pocket_sprite.position.y=size[1]-menu.pocket_sprite.height-36;
					menu.addChild(menu.pocket_sprite);
				}

				if(!menu.title_sprite){
					menu.title_sprite=new PIXI.Sprite(PIXI.Texture.fromFrame("title.png"));
					menu.title_sprite.position.x=size[0]/2;
					menu.title_sprite.anchor.x=0.5;
					menu.title_sprite.anchor.y=0.5;
					menu.addChild(menu.title_sprite);
				}
			},
			update:function(){
				menu.title_sprite.position.y=size[1]/3+Math.sin(curTime/1000)*3;
			},
			nav:function(){
				var s="";
				switch(menu.selected){
					case 0:
						s="start a new game";
						break;
					case 1:
						s="change stuff";
						break;
					case 2:
						s="made by @seansleblanc for #gbjam 5\nwith pixi . js";
						break;
				}
				menu.descriptionTxt.text=s;
			},
			select:function(){
				var s="";
				switch(menu.selected){
					case 0:
						s="select_party_member";
						menu.pocket_sprite.destroy();
						menu.pocket_sprite=null;
						menu.title_sprite.destroy();
						menu.title_sprite=null;

						startGame();
						break;
					case 1:
						s="options_menu";
						break;
					case 2:
						return;
						break;
				}


				menu.states.set(s);
			},
			cancel:function(){
				// nowhere to quit to
			}
		},
		"options_menu":{
			init:function(){
				menu.options[0].text="sound";
				menu.options[1].text="palette";
				menu.options[2].text="scale";

				for(var i = 0; i < menu.options.length; ++i){
					menu.options[i].enable();
				}
			},
			update:function(){
				menu.title_sprite.position.y=size[1]/3+Math.sin(curTime/1000)*3;
			},
			nav:function(){
				var s="";
				switch(menu.selected){
					case 0:
						s="select to "+(Howler._muted ? "unmute" : "mute") + " audio";
						break;
					case 1:
						s="select to change palette\ncurrent: " + palettes[currentPalette];
						break;
					case 2:
						s="not implemented yet";
						break;
				}
				menu.descriptionTxt.text=s;
			},
			select:function(){
				var s=menu.descriptionTxt.text;
				switch(menu.selected){
					case 0:
					toggleMute();
						s="select to "+(Howler._muted ? "unmute" : "mute") + " audio";
						break;
					case 1:
						swapPalette();
						s="select to change palette\ncurrent: " + palettes[currentPalette];
						break;
					case 2:
						break;
				}
				menu.descriptionTxt.text=s;
			},
			cancel:function(){
				menu.states.set("main_menu");
			}
		},
		"select_party_member":{
			init:function(){

				for(var i = 0; i < menu.options.length; ++i){
					if(i < player_party.length){
						menu.options[i].text = player_party[i].name;
						menu.options[i].enable();

						if(player_party[i].isDead()){
							menu.options[i].disable();
						}else{
							for(var j = 0; j < turn.taken.length; ++j){
								if(i == turn.taken[j].sourceId){
									menu.options[i].disable();
								}
							}
						}
					}else{
						menu.options[i].text = "";
						menu.options[i].disable();
					}
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = player_party[menu.selected].spr.toGlobal(PIXI.zero).x;
				sprite_pointer.lerp.t.y = player_party[menu.selected].spr.toGlobal(PIXI.zero).y-80;
			},
			nav:function(){
				menu.descriptionTxt.text="";
			},
			select:function(){
				menu.sourceId=menu.selected;
				menu.states.set("select_action");
				player_party[menu.sourceId].spr.lerp.t.x += 8;
			},
			cancel:function(){
				if(turn.taken.length > 0){
					// undo the previous turn commit
					// and replicate the previous turn right before commit
					// (selected party member, action, and target)
					var t=turn.taken.pop();
					menu.sourceId=t.sourceId;
					menu.actionId=t.actionId;
					menu.target_party=t.target_party;
					menu.states.set("select_target");
					menu.nav(t.targetId);
				}else{
					// this is the base state, can't go back any further
				}
			}
		},
		"select_action":{
			init:function(){
				for(var i = 0; i < menu.options.length; ++i){
					if(i < player_party[menu.sourceId].actions.length){
						menu.options[i].text = player_party[menu.sourceId].actions[i].name;
						menu.options[i].enable();

						// can't pick actions that cost more SP than you have
						if(player_party[menu.sourceId].actions[i].cost > player_party[menu.sourceId].stats.sp){
							menu.options[i].disable();
						}
					}else{
						menu.options[i].text = "";
						menu.options[i].disable();
					}
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = player_party[menu.sourceId].spr.toGlobal(PIXI.zero).x;
				sprite_pointer.lerp.t.y = player_party[menu.sourceId].spr.toGlobal(PIXI.zero).y-64;
			},
			nav:function(){
				menu.descriptionTxt.text = player_party[menu.sourceId].actions[menu.selected].description;
			},
			select:function(){
				menu.actionId = menu.selected;
				menu.target_party = player_party[menu.sourceId].actions[menu.actionId].friendly ? player_party : enemy_party;
				menu.states.set("select_target");
				player_party[menu.sourceId].ui.setIcon(player_party[menu.sourceId].actions[menu.actionId].name);
			},
			cancel:function(){
				// go back to party member selection
				player_party[menu.sourceId].spr.lerp.t.x -= 8;
				menu.states.set("select_party_member");
				menu.nav(menu.sourceId);
				menu.sourceId=null;
			}
		},
		"select_target":{
			init:function(){
				for(var i = 0; i < menu.options.length; ++i){
					if(i < menu.target_party.length){
						menu.options[i].text = menu.target_party[i].name;
						menu.options[i].enable();

						// can't target dead characters
						if(menu.target_party[i].isDead()){
							menu.options[i].disable();
						}
					}else{
						menu.options[i].text = "";
						menu.options[i].disable();
					}
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = menu.target_party[menu.selected].spr.toGlobal(PIXI.zero).x;
				sprite_pointer.lerp.t.y = menu.target_party[menu.selected].spr.toGlobal(PIXI.zero).y-80;
			},
			nav:function(){
				menu.descriptionTxt.text = player_party[menu.sourceId].name+" :\n"+player_party[menu.sourceId].actions[menu.actionId].name + " " + menu.target_party[menu.selected].name;
			},
			select:function(){
				// commit the turn
				turn.taken.push({
					sourceId:menu.sourceId,
					actionId:menu.actionId,
					targetId:menu.selected,
					target_party:menu.target_party,
					source:player_party[menu.sourceId],
					action:player_party[menu.sourceId].actions[menu.actionId],
					target:menu.target_party[menu.selected]
				});

				menu.sourceId=null;
				menu.actionId=null;
				menu.target_party=null;

				if(turn.taken.length == turn.player_available.length){
					// all player turns committed, go to enemy turn
					game.state="enemy_turn";
					menu.selectionText.visible=false;
					menu.selectionBg.visible=false;
					for(var i = 0; i < menu.options.length; ++i){
						menu.options[i].text="";
					}
					menu.descriptionTxt.text="";
				}else{
					// start over
					menu.states.set("select_party_member");
				}
			},
			cancel:function(){
				// go back to action selection
				menu.states.set("select_action");
				menu.nav(menu.actionId);
				menu.actionId=null;
				menu.target_party=null;
				player_party[menu.sourceId].ui.setIcon(null);
			}
		},

		current:null,

		set: function(state){
			// switch state
			menu.states.current = state;
			
			// initialize the new state
			menu.states[menu.states.current].init();

			// make sure there's at least one enabled option
			menu.validOptions=false;
			for(var i = 0; i < menu.options.length; ++i){
				if(!menu.options[i].disabled){
					menu.validOptions = true;
					break;
				}
			}
			menu.selectionBg.visible=menu.validOptions;
			menu.selectionText.visible=menu.validOptions;
			if(!menu.validOptions){
				return;
			}

			// select the first menu item in the new state
			menu.navReset();
		}
	};

	menu.states.set("main_menu");



 

    menu.container = new PIXI.Container();
    menu.container.position.y = size[1]-32;

    menu.container.addChild(menu.selectionBg);
    menu.container.addChild(menu.selectionText);
	for(var i=0; i < menu.options.length; ++i){
    	menu.container.addChild(menu.options[i]);
	}
	menu.container.addChild(menu.descriptionTxt);
	menu.addChild(menu.container);

	scene.addChild(world);
	scene.addChild(menu);


	// start the main loop
	window.onresize = onResize;
	_resize();
	main();
}





function startGame(){
	game.started=true;

	player_party=[
		new Character("soldier",false,1),
		new Character("punchy",false,2),
		new Character("wizard",false,3)
	];
	enemy_party=[];

	// add characters
	for(var i = 0; i < player_party.length; ++i){
		world.addChild(player_party[i].battleSlot);
	}
	for(var i = 0; i < enemy_party.length; ++i){
		world.addChild(enemy_party[i].battleSlot);
	}

	sprite_pointer=new PIXI.Container();
	sprite_pointer.actualSprite=new PIXI.Sprite(PIXI.Texture.fromFrame("pointer.png"));
	sprite_pointer.actualSprite.anchor.x=0.5;
	sprite_pointer.addChild(sprite_pointer.actualSprite);
	sprite_pointer.position.x=0;
	sprite_pointer.position.y=0;
	addLerp(sprite_pointer,0.5);
	menu.addChild(sprite_pointer);

	screen_filter.uniforms.uBrightness=1;

	game.state="moving_up";

	sounds["music_battle"].play();
	sounds["music_battle"].fadeIn(0.5,5000);
	sounds["music_menu"].fadeOut(0,2000);

	world.position.x-=96;
	world.lerp.t.x-=96;
}




turn={
	taken:[],
	player_available:[],
	enemy_available:[],
	timer:0
};

function update(){


	if(!game.started){
		menu.update();
	}else{
		sprite_pointer.visible=game.state=="player_turn";
		// pointer bounce
		sprite_pointer.actualSprite.position.y = Math.sin(curTime/100)*2;
		switch(game.state){
			case "moving_up":  // adds new enemies, moves the world up, then transitions the characters into view, then goes to start_turn
				if(enemy_party.length == 0){
					if(enemy_parties.length == 0){
						// final win state! game over!
						console.log("win");
					}else{
						enemy_party=enemy_parties[0];
						enemy_parties.shift();
						for(var i = 0; i < enemy_party.length; ++i){
							enemy_party[i] = new Character(enemy_party[i], true, (enemy_party.length == 1 ? 2 : i+1));
						}
						for(var i = 0; i < enemy_party.length; ++i){
							world.addChild(enemy_party[i].battleSlot);
						}
						world.lerp.t.x -= 160;
					}
				}
				if(Math.abs(world.lerp.t.x - world.position.x) < 1){
					for(var i = 0; i < enemy_party.length; ++i){
						enemy_party[i].battleSlot.lerp.t.x = -world.lerp.t.x;
						enemy_party[i].battleSlot.position.x = enemy_party[i].battleSlot.lerp.t.x+280*(i+1);
					}
					for(var i = 0; i < player_party.length; ++i){
						player_party[i].battleSlot.lerp.t.x = -world.lerp.t.x;
						player_party[i].battleSlot.position.x = player_party[i].battleSlot.lerp.t.x-280*(i+1);
					}
					game.state="start_turn";
				}
				break;
			case "player_turn":  // menu interaction while available, then goes to enemy_turn
				if(turn.player_available.length > 0){
					menu.update();
				}else{
					game.state="enemy_turn";
				}
				break;
			case "enemy_turn":  // appends random enemy actions to turn, ten goes to animation
				if(turn.timer <= 0){
					turn.timer = 240;
					if(turn.taken.length < turn.player_available.length+turn.enemy_available.length){
						// add an enemy turn
						var t={
							sourceId:turn.enemy_available[turn.taken.length-turn.player_available.length]
						};
						t.source = enemy_party[t.sourceId];

						// pick a random action (has to be affordable)
						do{
							t.actionId = clamp(0,Math.floor(Math.random()*t.source.actions.length),t.source.actions.length-1);
							t.action = t.source.actions[t.actionId];
						}while(t.action.cost > t.source.stats.sp);

						// pick a random target (has to be alive)
						t.target_party = t.action.friendly ? enemy_party : player_party;
						do{
							t.targetId = clamp(0,Math.floor(Math.random()*t.target_party.length),t.target_party.length-1);
							t.target = t.target_party[t.targetId];
						}while(t.target.isDead());

						t.source.spr.lerp.t.x-=8;
						t.source.ui.setIcon(t.action.name);

						if(t.source.stats.fast){
							turn.taken.unshift(t);
						}else{
							turn.taken.push(t);
						}

						sounds["sfx_select"].play();
					}else{
						// go to the next state
						game.state="animation";
						turn.timer=1000;

						// move back to slots before animations start
						for(var i = 0; i < player_party.length; ++i){
							player_party[i].spr.lerp.t.x = player_party[i].battleSlot.t.x;
							player_party[i].spr.lerp.t.y = player_party[i].battleSlot.t.y;
						}
						for(var i = 0; i < enemy_party.length; ++i){
							enemy_party[i].spr.lerp.t.x = enemy_party[i].battleSlot.t.x;
							enemy_party[i].spr.lerp.t.y = enemy_party[i].battleSlot.t.y;
						}
					}
				}else{
					turn.timer-=deltaTime;
				}
				break;
			case "animation":  // processes turn, then goes to end_turn
				if(turn.taken.length == 0){
					// if there are no moves left, finish turn
					game.state="end_turn";
				}else if(turn.taken[0].done){
					// prepare for next move
					turn.timer=1000;

					var t = turn.taken[0];
					// move back to slot
					t.source.spr.lerp.t.x = t.source.battleSlot.t.x;
					t.source.spr.lerp.t.y = t.source.battleSlot.t.y;

					turn.taken.shift();
				}else{
					turn.timer-=deltaTime;
					var t = turn.taken[0];

					// if source or target is dead or source can't afford action before the action starts, skip it
					if(!t.started && (t.source.isDead() || t.target.isDead() || (t.source.stats.sp < t.action.cost) ) ){
						t.done=true;
						turn.timer=0;
					}

					if(!t.done){

						// move to target
						if(!t.started){
							t.started=true;
							t.source.spr.lerp.t.x = t.target.battleSlot.t.x + 16 * (t.action.friendly==t.source.enemy ? -1 : 1);
							t.source.spr.lerp.t.y = t.target.battleSlot.t.y;

							sounds["sfx_swoosh"].play();
							world.addChildAt(world.swapSlot,world.children.length-1);
							world.swapChildren(t.source.battleSlot, world.swapSlot);
						}

						// play animation + trigger action
						if(!t.hit && Math.abs(t.source.spr.lerp.t.x - t.source.spr.position.x) < 1){
							t.source.setAnimation("move_" + (t.action.friendly ? "friendly" : "enemy"));
							sounds["sfx_" + (t.action.friendly ? "buff" : "pow")].play();
							t.hit = true;
							menu.descriptionTxt.text = t.action.trigger(t.source,t.target);
						}else if(turn.timer <= 0){
							// done action
							t.done = true;
							t.source.setAnimation("idle");
							world.swapChildren(t.source.battleSlot, world.swapSlot);
						}
					}
				}

				break;
			case "start_turn":  // clears the old turn, puts characters back into their places, cancels buffs, resets icons, then goes to player_turn
				turn.taken=[];

				turn.player_available=[];
				for(var i = 0; i < player_party.length; ++i){
					if(!player_party[i].isDead()){
						turn.player_available.push(i);
					}
				}
				turn.enemy_available=[];
				for(var i = 0; i < enemy_party.length; ++i){
					if(!enemy_party[i].isDead()){
						turn.enemy_available.push(i);
					}
				}

				var characters = player_party.concat(enemy_party);
				for(var i = 0; i < characters.length; ++i){
					characters[i].ui.setIcon(characters[i].isDead() ? "skull" : (characters[i].enemy ? "unknown" : null));
					characters[i].spr.lerp.t.x=characters[i].battleSlot.t.x;
					characters[i].spr.lerp.t.y=characters[i].battleSlot.t.y;

					characters[i].cancelBuffs();
				}

				game.state="player_turn";

				menu.sourceId=null;
				menu.actionId=null;
				menu.target_party=null;
				menu.states.set("select_party_member");
				break;

			case "end_turn":  // checks if the battle is over. if it is, goes to moving_up. otherwise, goes to start_turn
				if(isBattleLost()){
					// all players dead
					screen_filter.targetBrightness=-1;
					if(screen_filter.uniforms.uBrightness <= -1){
						// go to loss state
						screen_filter.targetBrightness=0;
						console.log("game over!");
					}
				}else if(isBattleWon()){

					// all enemies dead
					flash();
					flash(); // ...shut up

					// player party recovers 25% hp and 1 sp as a reward
					// (also recovers from death)
					for(var i = 0; i < player_party.length; ++i){
						player_party[i].setHp(player_party[i].stats.hp_max*0.25, true);
						player_party[i].setSp(1, true);
						player_party[i].setAnimation("idle");
					}

					// clear the dead enemies
					for(var i = 0; i < enemy_party.length; ++i){
						enemy_party[i].destroy();
					}
					enemy_party=[];

					game.state="moving_up";
				}else{
					// continue battle
					game.state="start_turn";
				}
				break;
		}
	}

	if(Math.abs(screen_filter.uniforms.uBrightness - screen_filter.targetBrightness) < 0.025){
		screen_filter.uniforms.uBrightness= screen_filter.targetBrightness;
	}else{
		screen_filter.uniforms.uBrightness -= Math.sign(screen_filter.uniforms.uBrightness - screen_filter.targetBrightness)*0.025;
	}



	// update lerps
	for(var i = 0; i < lerps.length; ++i){
		lerps[i].spr.position.y = lerp(lerps[i].spr.position.y, lerps[i].t.y, lerps[i].by);
		lerps[i].spr.position.x = lerp(lerps[i].spr.position.x, lerps[i].t.x, lerps[i].by);
	}


	// shortcuts for mute/palette swap
	if(keys.isJustDown(keys.M)){
		toggleMute();
		sounds["sfx_select"].play();
	}
	if(keys.isJustDown(keys.P)){
		swapPalette();
		sounds["sfx_select"].play();
	}

	// cycle palettes
	//screen_filter.uniforms.uPalette = curTime/1000%15/15;
	//screen_filter.uniforms.uBrightness = 0;//Math.sin(curTime/1000);


	// update input managers
	gamepads.update();
	keys.update();
}

function render(){
	renderer.render(scene,renderTexture);
	try{
		renderer.render(renderSprite,null,true,false);
	}catch(e){
		renderer.render(scene,null,true,false);
	}
}


lerps=[];
function addLerp(_spr,_by){
	var l={
		t:{
			x:_spr.position.x,
			y:_spr.position.y,
		},
		spr:_spr,
		by:_by||0.1
	};

	_spr.lerp=l;
	lerps.push(l);
}


function swapPalette(){
	currentPalette+=1;
	currentPalette%=palettes.length;
	screen_filter.uniforms.uPalette = (currentPalette+1)/palettes.length;
}
function toggleMute(){
	if(Howler._muted){
		Howler.unmute();
	}else{
		Howler.mute();
	}
}


function flash(_dark){
	screen_filter.uniforms.uBrightness+=0.25 * (_dark ? -1 : 1);
}

function isBattleWon(){
	for(var i = 0; i < enemy_party.length; ++i){
		if(!enemy_party[i].isDead()){
			return false;
		}
	}
	return true;
}
function isBattleLost(){
	for(var i = 0; i < player_party.length; ++i){
		if(!player_party[i].isDead()){
			return false;
		}
	}
	return true;
}

function bigCheats(){
	for(var i = 0; i < enemy_party.length; ++i){
		enemy_party[i].setHp(1);
	}
}