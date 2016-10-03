

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



	var action_attack={
		name:"attack",
		description:"attack an enemy for physical damage",
		friendly:false,
		trigger:function(source,target){
			console.log(source.name+" attacked "+target.name);
		}
	};
	var action_defend={
		name:"defend",
		description:"put up defenses to reduce incoming damage",
		friendly:true,
		trigger:function(source,target){
			console.log(source.name+" defended "+target.name);
		}
	};

	player_party=[
		{
			name:"buddy 1",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			},
			actions:[
				action_attack,
				action_defend,
				{
					name:"special1",
					description:"this is my special move",
					friendly:false,
					trigger:function(){
						console.log(source.name+" defended "+target.name);
					}
				}
			]
		},
		{
			name:"buddy 2",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			},
			actions:[
				action_attack,
				action_defend,
				{
					name:"special2",
					description:"i also get a special move",
					friendly:false,
					trigger:function(){
						console.log(source.name+" defended "+target.name);
					}
				}
			]
		},
		{
			name:"buddy 3",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			},
			actions:[
				action_attack,
				action_defend
			]
		}
	];
	enemy_party=[
		{
			name:"blob1",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			}
		},
		{
			name:"blob2",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			}
		},
		{
			name:"blob3",
			sprite:null,
			stats:{
				str:5,
				int:5,
				def:5
			}
		}
	];


	scene = new PIXI.Container;
	game.addChild(scene);

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


	{
		var spr=new PIXI.extras.MovieClip(getFrames("blob_idle",2));
		spr.position.x=96;
		spr.position.y=63-8;
		addLerp(spr,0.25);
		spr.gotoAndPlay(0);
		spr.animationSpeed=1/20;
		scene.addChild(spr);
		enemy_party[0].spr=spr;
	}
	{
		var spr=new PIXI.extras.MovieClip(getFrames("blob_idle",2));
		spr.position.x=112;
		spr.position.y=63;
		addLerp(spr,0.25);
		spr.gotoAndPlay(1);
		spr.animationSpeed=1/20;
		scene.addChild(spr);
		enemy_party[1].spr=spr;
	}
	{
		var spr=new PIXI.extras.MovieClip(getFrames("blob_idle",2));
		spr.position.x=128;
		spr.position.y=63+8;
		addLerp(spr,0.25);
		spr.gotoAndPlay(0);
		spr.animationSpeed=1/20;
		scene.addChild(spr);
		enemy_party[2].spr=spr;
	}

	{
		var spr=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
		spr.position.x=32;
		spr.position.y=63-8;
		addLerp(spr,0.25);
		spr.gotoAndPlay(0);
		spr.animationSpeed=1/10;
		scene.addChild(spr);
		player_party[0].spr=spr;
	}
	{
		var spr=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
		spr.position.x=16;
		spr.position.y=63;
		addLerp(spr,0.25);
		spr.gotoAndPlay(2);
		spr.animationSpeed=1/10;
		scene.addChild(spr);
		player_party[1].spr=spr;
	}
	{
		var spr=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
		spr.position.x=0;
		spr.position.y=63+8;
		addLerp(spr,0.25);
		spr.gotoAndPlay(0);
		spr.animationSpeed=1/10;
		scene.addChild(spr);
		player_party[2].spr=spr;
	}

	sprite_pointer=new PIXI.Container();
	sprite_pointer.actualSprite=new PIXI.Sprite(PIXI.Texture.fromFrame("pointer.png"));
	sprite_pointer.addChild(sprite_pointer.actualSprite);
	sprite_pointer.position.x=0;
	sprite_pointer.position.y=64+16-9-32;
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
		menu.options[menu.selected].text=menu.options[menu.selected].text.substr(1,menu.options[menu.selected].text.length-2);
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

						for(var j = 0; j < turn.taken.length; ++j){
							if(i == turn.taken[j].source){
								menu.options[i].disable();
							}
						}
					}else{
						menu.options[i].text = "";
						menu.options[i].disable();
					}
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = player_party[menu.selected].spr.position.x;
				sprite_pointer.lerp.t.y = player_party[menu.selected].spr.position.y-32;
			},
			nav:function(){
				menu.descriptionTxt.text=player_party[menu.selected].stats.toString();
			},
			select:function(){
				menu.source=menu.selected;
				menu.states.set("select_action");
				player_party[menu.source].spr.lerp.t.x += 8;
			},
			cancel:function(){
				if(turn.taken.length > 0){
					// undo the previous turn commit
					// and replicate the previous turn right before commit
					// (selected party member, action, and target)
					var t=turn.taken.pop();
					menu.source=t.source;
					menu.action=t.action;
					menu.states.set("select_target");
					menu.nav(t.target);
				}else{
					// this is the base state, can't go back any further
				}
			}
		},
		"select_action":{
			init:function(){
				for(var i = 0; i < menu.options.length; ++i){
					if(i < player_party[menu.source].actions.length){
						menu.options[i].text = player_party[menu.source].actions[i].name;
						menu.options[i].enable();
					}else{
						menu.options[i].text = "";
						menu.options[i].disable();
					}
				}
			},
			update:function(){
				sprite_pointer.lerp.t.x = player_party[menu.source].spr.position.x;
				sprite_pointer.lerp.t.y = player_party[menu.source].spr.position.y-32;
			},
			nav:function(){
				menu.descriptionTxt.text = player_party[menu.source].actions[menu.selected].description;
			},
			select:function(){
				menu.action = menu.selected;
				menu.target_party = player_party[menu.source].actions[menu.action].friendly ? player_party : enemy_party;
				menu.states.set("select_target");

			},
			cancel:function(){
				// go back to party member selection
				player_party[menu.source].spr.lerp.t.x -= 8;
				menu.states.set("select_party_member");
				menu.nav(menu.source);
				menu.source=null;
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
				sprite_pointer.lerp.t.y = menu.target_party[menu.selected].spr.position.y-32;
			},
			nav:function(){
				menu.descriptionTxt.text = player_party[menu.source].name+" :\n"+player_party[menu.source].actions[menu.action].name + " " + menu.target_party[menu.selected].name;
			},
			select:function(){
				// commit the turn
				turn.taken.push({
					source:menu.source,
					action:menu.action,
					target:menu.selected
				});

				if(turn.taken.length == player_party.length){
					// TODO if all turns are taken, commit enemy turns and play out action
					
					turn.taken=[]; // just resets
					menu.states.set("select_party_member");
					menu.source=null;
					menu.action=null;
				}else{
					// start over
					menu.states.set("select_party_member");
					menu.source=null;
					menu.action=null;
				}
			},
			cancel:function(){
				// go back to action selection
				menu.states.set("select_action");
				menu.nav(menu.action);
				menu.action=null;
			}
		},

		current:null,

		set: function(state){
			// switch state
			menu.states.current = state;
			
			// initialize the new state
			menu.states[menu.states.current].init();

			// select the first menu item in the new state
			menu.options[menu.selected].text = " "+menu.options[menu.selected].text+" ";
			menu.nav(-menu.selected);
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

	// start the main loop
	window.onresize = onResize;
	_resize();
	main();





}
	turn={
		taken:[]
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

	// cycle palettes
	screen_filter.uniforms.uPalette = 5;//(Math.floor(curTime/1000)%6)/6;
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