

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

	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	screen_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	screen_filter.uniforms.uPalette = 0;
	screen_filter.uniforms.uBrightness = 0;

	screen_filter.padding=0;

	renderSprite.filters = [screen_filter];


	// screen background
	bg = new PIXI.Container();
	bg.cacheAsBitmap=true;
	bg.tx=0;
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


	sprite_skele=new PIXI.extras.MovieClip(getFrames("blob_idle",2));
	sprite_skele.play();
	sprite_skele.animationSpeed=1/20;
	sprite_skele.position.x=100;
	sprite_skele.position.y=64;
	scene.addChild(sprite_skele);




	sprite_soldier=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
	sprite_soldier.play();
	sprite_soldier.animationSpeed=1/10;
	sprite_soldier.position.x=32;
	sprite_soldier.position.y=64-9;
	scene.addChild(sprite_soldier);

	sprite_soldier=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
	sprite_soldier.gotoAndPlay(2);
	sprite_soldier.animationSpeed=1/10;
	sprite_soldier.position.x=16;
	sprite_soldier.position.y=64+8-9;
	scene.addChild(sprite_soldier);

	sprite_soldier=new PIXI.extras.MovieClip(getFrames("soldier_idle",4));
	sprite_soldier.play();
	sprite_soldier.animationSpeed=1/10;
	sprite_soldier.position.x=0;
	sprite_soldier.position.y=64+16-9;
	scene.addChild(sprite_soldier);



	//menu={};
	menu.options=[];

	fontStyle={font: "8px font", align: "left"};

	var attackTxt = new PIXI.extras.BitmapText(" Attack ", fontStyle);
	var defendTxt = new PIXI.extras.BitmapText("Defend", fontStyle);
	var specialTxt = new PIXI.extras.BitmapText("Special", fontStyle);
	attackTxt.description="Attack an enemy for physical damage";
	defendTxt.description="Put up defenses to reduce incoming damage";
	specialTxt.description="Do a thing that does a thing!";
	attackTxt.select=function(){
		bg.tx=160;
	}
	defendTxt.select=function(){
		bg.tx=0;
	}
	specialTxt.select=function(){
		screen_filter.uniforms.uBrightness -= 1/4;
		if(screen_filter.uniforms.uBrightness < -1){
			screen_filter.uniforms.uBrightness+=2;
		}
	}

	menu.descriptionTxt = new PIXI.extras.BitmapText("do a thing!", fontStyle);
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



	menu.options.push(attackTxt);
	menu.options.push(defendTxt);
	menu.options.push(specialTxt);

	for(var i=0; i < menu.options.length; ++i){
		menu.options[i].position=new PIXI.Point(4,4+8*i);
		menu.options[i].tint=0xCCCCCC;
		menu.options[i].maxLineHeight=1;
		menu.options[i].maxWidth=size[0];
	}

	menu.selected=0;
	menu.nav=function(_by){
		menu.options[menu.selected].text=menu.options[menu.selected].text.substr(1,menu.options[menu.selected].text.length-2);
		menu.options[menu.selected].tint=0xCCCCCC;
		menu.selected+=_by;
		while(menu.selected < 0){
			menu.selected+=menu.options.length;
		}
		while(menu.selected >= menu.options.length){
			menu.selected-=menu.options.length;
		}
		menu.options[menu.selected].text=" "+menu.options[menu.selected].text+" ";
		menu.options[menu.selected].tint=0x333333;
		menu.selectionBg.position.y = 4+8*menu.selected;
		menu.selectionText.position.y = 4+8*menu.selected;

		menu.descriptionTxt.text=menu.options[menu.selected].description;
	};
	menu.next=function(){
		menu.nav(1);
	};
	menu.prev=function(){
		menu.nav(-1);
	};

	menu.nav(0);
 

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
		menu.options[menu.selected].select();
	}
	if(inputs.cancel){
		bg.tx=0;
	}

 	bg.position.x = lerp(bg.position.x,-bg.tx,0.1);

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