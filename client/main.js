

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


	scene = new PIXI.Container;
	game.addChild(scene);


	player_party=[
		new Character("buddy1",false,1),
		new Character("buddy2",false,2),
		new Character("buddy3",false,3)
	];
	enemy_party=[
		new Character("blob",true,1),
		new Character("blob",true,2),
		new Character("blob",true,3)
	];

	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	screen_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	screen_filter.uniforms.uPalette = 0;
	screen_filter.uniforms.uBrightness = 0;

	screen_filter.padding=0;

	renderSprite.filters = [screen_filter];


	// screen background
	bg = new PIXI.Container();
	addLerp(bg,0.1);
	bg.cacheAsBitmap=true;
	scene.addChild(bg);

	for(var i = 0; i < player_party.length; ++i){
		scene.addChild(player_party[i].spr);
		scene.addChild(player_party[i].ui.container);
	}
	for(var i = 0; i < enemy_party.length; ++i){
		scene.addChild(enemy_party[i].spr);
		scene.addChild(enemy_party[i].ui.container);
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
				tile.position.x=x*16;
				tile.position.y=y*16;
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
				tile.position.x=x*16;
				tile.position.y=y*16;
				menu.addChild(tile);
			}
		}
		}
	}

	sprite_pointer=new PIXI.Container();
	sprite_pointer.actualSprite=new PIXI.Sprite(PIXI.Texture.fromFrame("pointer.png"));
	sprite_pointer.addChild(sprite_pointer.actualSprite);
	sprite_pointer.position.x=0;
	sprite_pointer.position.y=0;
	addLerp(sprite_pointer,0.5);
	scene.addChild(sprite_pointer);

	menu.options=[
		new PIXI.extras.BitmapText("option slot", fontStyle),
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
		menu.options[menu.selected].text=menu.options[menu.selected].text.trim();
		menu.options[menu.selected].tint = menu.options[menu.selected].disabled ? 0x666666 : 0xCCCCCC;
		menu.selected+=_by;

		// wrap-around menu and skip over disabled options
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
		menu.states[menu.states.current].select();
		sounds["sfx_select"].play();
	};
	menu.cancel=function(){
		menu.states[menu.states.current].cancel();
		sounds["sfx_cancel"].play();
	};
	menu.update=function(){
		menu.states[menu.states.current].update();
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
				if(!turn.player_turns > 0){
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

				if(turn.taken.length == turn.player_turns){
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


	scene.addChild(menu);



	game.state="end";


	// start the main loop
	window.onresize = onResize;
	_resize();
	main();


}
	turn={
		taken:[],
		player_turns:0,
		enemy_turns:0
	};

function update(){
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

	switch(game.state){
		case "player_turn":
			menu.update();
			break;
		case "enemy_turn":
			// TODO: delay these to make it look like they're "thinking"
			for(var i = 0; i < enemy_party.length; ++i){
				var t={
					sourceId:i,
					source:enemy_party[i]
				};
				t.actionId = clamp(0,Math.floor(Math.random()*t.source.actions.length),t.source.actions.length-1);
				t.action = t.source.actions[t.actionId];
				t.targetParty = t.action.friendly ? enemy_party : player_party;
				t.targetId = clamp(0,Math.floor(Math.random()*t.targetParty.length),t.targetParty.length-1);
				t.target = t.targetParty[t.targetId];

				t.source.spr.lerp.t.x-=8;

				turn.taken.push(t);
			}
			console.log("enemy_turn");
			game.state="animation";
			break;
		case "animation":
			// TODO: delay these and add some actual animation
			
			for(var i = 0; i < turn.taken.length; ++i){
				var t = turn.taken[i];
				t.action.trigger(t.source,t.target);
			}

			console.log("animation");
			game.state="end";
			break;
		case "end":
			console.log("end");
			for(var i = 0; i < player_party.length; ++i){
				player_party[i].ui.setIcon(player_party[i].isDead() ? "skull" : null);
				player_party[i].spr.lerp.t.x=player_party[i].battleSlot.x;
				player_party[i].spr.lerp.t.y=player_party[i].battleSlot.y;
			}
			for(var i = 0; i < enemy_party.length; ++i){
				enemy_party[i].ui.setIcon(enemy_party[i].isDead() ? "skull" : null);
				enemy_party[i].spr.lerp.t.x=enemy_party[i].battleSlot.x;
				enemy_party[i].spr.lerp.t.y=enemy_party[i].battleSlot.y;
			}

			turn.taken=[]; // just resets

			turn.player_turns=0;
			for(var i = 0; i < player_party.length; ++i){
				if(!player_party[i].isDead()){
					turn.player_turns+=1;
				}
			}

			menu.states.set("select_party_member");
			menu.sourceId=null;
			menu.actionId=null;

			game.state="player_turn";
			break;
	}
	menu.update();

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


	for(var i = 0; i < lerps.length; ++i){
		lerps[i].spr.position.y = lerp(lerps[i].spr.position.y, lerps[i].t.y, lerps[i].by);
		lerps[i].spr.position.x = lerp(lerps[i].spr.position.x, lerps[i].t.x, lerps[i].by);
	}

	sprite_pointer.actualSprite.position.y = Math.sin(curTime/100)*2;

	// update ui bars
	var characters=player_party.concat(enemy_party);
	for(var i = 0; i < characters.length; ++i){
		characters[i].ui.setHp(characters[i].stats.hp/characters[i].stats.hp_max);
		characters[i].ui.setSp(characters[i].stats.sp);
	}

	// cycle palettes
	screen_filter.uniforms.uPalette = 5/5;//(Math.floor(curTime/1000)%6)/6;
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
		by:_by
	};

	_spr.lerp=l;
	lerps.push(l);
}