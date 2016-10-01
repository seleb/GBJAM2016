

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

	sprite_filter = new CustomFilter(PIXI.loader.resources.sprite_shader.data);
	tile_filter = new CustomFilter(PIXI.loader.resources.tile_shader.data);
	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	sprite_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	sprite_filter.uniforms.uPalette = 0;
	tile_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	tile_filter.uniforms.uPalette = 0;

	sprite_filter.padding=1;
	screen_filter.padding=0;
	tile_filter.padding=0;

	renderSprite.filters = [screen_filter];


	sprite_skele=new PIXI.Sprite(PIXI.Texture.fromFrame("skele.png"));
	sprite_skele.filters = [sprite_filter];
	scene.addChild(sprite_skele);


	sprite_face=new PIXI.Sprite(PIXI.Texture.fromFrame("face.png"));
	sprite_face.filters = [sprite_filter];
	scene.addChild(sprite_face);


	sprite_menu=new PIXI.Sprite(PIXI.Texture.fromFrame("menu.png"));
	sprite_menu.filters = [tile_filter];
	sprite_menu.position.x=0;
	sprite_menu.position.y=size[1]-32;
	scene.addChild(sprite_menu);



	menu={};
	menu.options=[];

	fontStyle={font: "8px font", align: "left"};

	var attackTxt = new PIXI.extras.BitmapText(" Attack ", fontStyle);
 	attackTxt.filters=[tile_filter];
	attackTxt.position.x = 4;
	attackTxt.position.y = size[1]-24-4;
	attackTxt.maxLineHeight=1;
	attackTxt.maxWidth=size[0];
	attackTxt.tint=0x333333;

	var specialTxt = new PIXI.extras.BitmapText("Special", fontStyle);
 	specialTxt.filters=[tile_filter];
	specialTxt.position.x = 4;
	specialTxt.position.y = size[1]-16-4;
	specialTxt.maxLineHeight=1;
	specialTxt.maxWidth=size[0];
	specialTxt.tint=0xCCCCCC;

	var runTxt = new PIXI.extras.BitmapText("Run", fontStyle);
 	runTxt.filters=[tile_filter];
	runTxt.position.x = 4;
	runTxt.position.y = size[1]-8-4;
	runTxt.maxLineHeight=1;
	runTxt.maxWidth=size[0];
	runTxt.tint=0xCCCCCC;

	menu.selectionText = new PIXI.extras.BitmapText("[          ]", fontStyle);
 	menu.selectionText.filters=[tile_filter];
	menu.selectionText.position.x = 4;
	menu.selectionText.position.y = size[1]-24-4;
	menu.selectionText.maxLineHeight=1;
	menu.selectionText.maxWidth=size[0];
	menu.selectionText.tint=0x333333;

	menu.selectionBg = new PIXI.Graphics();
	menu.selectionBg.position.x = 4;
	menu.selectionBg.position.y = size[1]-24-4;
	menu.selectionBg.beginFill(0xCCCCCC);
	menu.selectionBg.drawRect(1,1,35,5);
	menu.selectionBg.filters=[tile_filter];
	menu.selectionBg.endFill();



	menu.options.push(attackTxt);
	menu.options.push(specialTxt);
	menu.options.push(runTxt);

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
		menu.selectionBg.position.y = size[1]-24+8*menu.selected-4;
		menu.selectionText.position.y = size[1]-24+8*menu.selected-4;
	};
	menu.next=function(){
		menu.nav(1);
	};
	menu.prev=function(){
		menu.nav(-1);
	};
 
    scene.addChild(menu.selectionBg);
    scene.addChild(menu.selectionText);
    scene.addChild(attackTxt);
    scene.addChild(specialTxt);
    scene.addChild(runTxt);

	// start the main loop
	window.onresize = onResize;
	_resize();
	main();
}

var navved=false;
function update(){
	var dir=[0,0];

	var dpad=gamepads.getDpad();
	dir[0]+=dpad[0];
	dir[1]+=dpad[1];

	if(keys.isJustDown(keys.UP) || keys.isJustDown(keys.W)){
		dir[1]-=1;
	}if(keys.isJustDown(keys.DOWN) || keys.isJustDown(keys.S)){
		dir[1]+=1;
	}

	if(dir[1] > 0){
		if(!navved){
			menu.next();
			navved=true;
		}
	}else if(dir[1] < 0){
		if(!navved){
			menu.prev();
			navved=true;
		}
	}else{
		navved=false;
	}

	// cycle palettes
	sprite_filter.uniforms.uPalette = 
	tile_filter.uniforms.uPalette = (Math.floor(curTime/1000)%5)/5;


	// TODO
	sprite_face.position.x=Math.sin(curTime/2000.0)*50+50;
	sprite_face.position.y=Math.cos(curTime/2000.0)*50+50;
	sprite_skele.position.y=Math.sin(curTime/2300.0)*10+20;
	sprite_skele.position.x=Math.cos(curTime/2300.0)*10+20;


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