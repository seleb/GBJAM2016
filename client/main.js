

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
	gamepads.init();
	keys.init();


	scene = new PIXI.Container();
	game.addChild(scene);

	world = new PIXI.Container(); // container for all the in-game stuff (i.e. not the menu)
	addLerp(world);

	player_party=[
		new Character("buddy1",false,1),
		new Character("buddy2",false,2),
		new Character("buddy3",false,3)
	];
	enemy_party=[
		new Character("skele",true,1),
		new Character("blob",true,2),
		new Character("skele",true,3)
	];

	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	screen_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	screen_filter.uniforms.uPalette = 5/15;
	screen_filter.uniforms.uBrightness = 0;

	screen_filter.padding=0;

	renderSprite.filters = [screen_filter];

	palettes=[
		"good ol' green (gameboy)",
		"grayscale",
		"not so good ol' green",
		"diffused liquids",
		"hallowe'en (default)",
		"cmyk (zx spectrum)",
		"blue (commodore 64)",
		"crimson (pico-8)",
		"1-bit",
		"aqua (cga)",
		"pastel (gbc)",
		"(master system)",
		"flat and dirty",
		"venus in the 60s",
		"\"web\"-\"safe\""
	];


	// screen background
	bg = new PIXI.Container();
	addLerp(bg,0.1);
	bg.cacheAsBitmap=true;
	world.addChild(bg);

	// add characters
	for(var i = 0; i < player_party.length; ++i){
		world.addChild(enemy_party[i].spr);
		world.addChild(player_party[i].spr);
	}
	// add UI
	for(var i = 0; i < enemy_party.length; ++i){
		world.addChild(enemy_party[i].ui.container);
		world.addChild(player_party[i].ui.container);
	}


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

	sprite_pointer=new PIXI.Container();
	sprite_pointer.actualSprite=new PIXI.Sprite(PIXI.Texture.fromFrame("pointer.png"));
	sprite_pointer.actualSprite.anchor.x=0.5;
	sprite_pointer.addChild(sprite_pointer.actualSprite);
	sprite_pointer.position.x=0;
	sprite_pointer.position.y=0;
	addLerp(sprite_pointer,0.5);
	menu.addChild(sprite_pointer);

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
				gamepads.axisJustPast(gamepads.LSTICK_V,-0.5),

			down:
				keys.isJustDown(keys.DOWN) ||
				keys.isJustDown(keys.S) ||
				gamepads.isJustDown(gamepads.DPAD_DOWN) ||
				gamepads.axisJustPast(gamepads.LSTICK_V,0.5),

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





				// skip player turn if no party members are available
				if(!turn.player_available.length > 0){
					game.state="enemy_turn";
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = player_party[menu.selected].spr.position.x;
				sprite_pointer.lerp.t.y = player_party[menu.selected].spr.position.y-48;
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
				sprite_pointer.lerp.t.x = player_party[menu.sourceId].spr.position.x;
				sprite_pointer.lerp.t.y = player_party[menu.sourceId].spr.position.y-32;
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
				sprite_pointer.lerp.t.x = menu.target_party[menu.selected].spr.position.x;
				sprite_pointer.lerp.t.y = menu.target_party[menu.selected].spr.position.y-48;
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
					targetParty:menu.targetParty,
					source:player_party[menu.sourceId],
					action:player_party[menu.sourceId].actions[menu.actionId],
					target:menu.target_party[menu.selected]
				});

				if(turn.taken.length == turn.player_available.length){
					// TODO if all turns are taken, commit enemy turns and play out action
					

					game.state="enemy_turn";
				}else{
					// start over
					menu.states.set("select_party_member");
					menu.sourceId=null;
					menu.actionId=null;
				}
			},
			cancel:function(){
				// go back to action selection
				menu.states.set("select_action");
				menu.nav(menu.actionId);
				menu.actionId=null;
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

	menu.states.set("select_party_member");



 

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



	game.state="end";


	// start the main loop
	window.onresize = onResize;
	_resize();
	main();


}
	turn={
		taken:[],
		player_available:[],
		enemy_available:[],
		timer:0
	};

function update(){
	sprite_pointer.visible=game.state=="player_turn";


	if(!game.started){
		menu.update();
	}else{
		switch(game.state){
			case "player_turn":
				menu.update();
				break;
			case "enemy_turn":
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
						t.targetParty = t.action.friendly ? enemy_party : player_party;
						do{
							t.targetId = clamp(0,Math.floor(Math.random()*t.targetParty.length),t.targetParty.length-1);
							t.target = t.targetParty[t.targetId];
						}while(t.target.isDead());

						t.source.spr.lerp.t.x-=8;
						t.source.ui.setIcon(t.action.name);

						turn.taken.push(t);

						sounds["sfx_select"].play();
					}else{
						// go to the next state
						game.state="animation";
						turn.timer=1000;

						// move back to slots before animations start
						for(var i = 0; i < player_party.length; ++i){
							player_party[i].spr.lerp.t.x = player_party[i].battleSlot.x;
							player_party[i].spr.lerp.t.y = player_party[i].battleSlot.y;
						}
						for(var i = 0; i < enemy_party.length; ++i){
							enemy_party[i].spr.lerp.t.x = enemy_party[i].battleSlot.x;
							enemy_party[i].spr.lerp.t.y = enemy_party[i].battleSlot.y;
						}
					}
				}else{
					turn.timer-=deltaTime;
				}
				break;
			case "animation":
				if(turn.taken.length == 0){
					// if there are no moves left, finish turn
					game.state="end";
				}else if(turn.taken[0].done){
					// prepare for next move
					turn.timer=1000;

					var t = turn.taken[0];
					// move back to slot
					t.source.spr.lerp.t.x = t.source.battleSlot.x;
					t.source.spr.lerp.t.y = t.source.battleSlot.y;

					turn.taken.shift(1);
				}else{
					turn.timer-=deltaTime;
					var t = turn.taken[0];

					// if source or target is dead before the action starts, skip it
					if(!t.started && (t.source.isDead() || t.target.isDead())){
						t.done=true;
						turn.timer=0;
					}

					if(!t.done){

						// move to target
						if(!t.started){
							t.started=true;
							t.source.spr.lerp.t.x = t.target.battleSlot.x + 16 * (t.action.friendly==t.source.enemy ? -1 : 1);
							t.source.spr.lerp.t.y = t.target.battleSlot.y;

							sounds["sfx_swoosh"].play();
							t.swap=world.children[world.children.length-1];
							world.swapChildren(t.source.spr,t.swap);
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
							world.swapChildren(t.source.spr,t.swap);
						}
					}
				}

				break;
			case "end":
				console.log("end");
				for(var i = 0; i < player_party.length; ++i){
					player_party[i].ui.setIcon(player_party[i].isDead() ? "skull" : null);
					player_party[i].spr.lerp.t.x=player_party[i].battleSlot.x;
					player_party[i].spr.lerp.t.y=player_party[i].battleSlot.y;
				}
				for(var i = 0; i < enemy_party.length; ++i){
					enemy_party[i].ui.setIcon(enemy_party[i].isDead() ? "skull" : "unknown");
					enemy_party[i].spr.lerp.t.x=enemy_party[i].battleSlot.x;
					enemy_party[i].spr.lerp.t.y=enemy_party[i].battleSlot.y;
				}

				turn.taken=[]; // just resets

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


				if(turn.player_available.length == 0){
					// all players dead
					screen_filter.uniforms.uBrightness-=0.01;
					if(screen_filter.uniforms.uBrightness < -1){
						// go to loss state
						screen_filter.uniforms.uBrightness=0;
						console.log("game over!");
					}
				}else if(turn.enemy_available.length == 0){
					// all enemies dead
				}else{
					// continue battle
					menu.states.set("select_party_member");
					menu.sourceId=null;
					menu.actionId=null;

					game.state="player_turn";
				}
				break;
		}
	}

	// pointer bounce
	sprite_pointer.actualSprite.position.y = Math.sin(curTime/100)*2;


	// update lerps
	for(var i = 0; i < lerps.length; ++i){
		lerps[i].spr.position.y = lerp(lerps[i].spr.position.y, lerps[i].t.y, lerps[i].by);
		lerps[i].spr.position.x = lerp(lerps[i].spr.position.x, lerps[i].t.x, lerps[i].by);
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