

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
	scene = new PIXI.Container;
	game.addChild(scene);

	palette_filter = new CustomFilter(PIXI.loader.resources.palette_shader.data);
	screen_filter = new CustomFilter(PIXI.loader.resources.screen_shader.data);

	palette_filter.padding=1;
	screen_filter.padding=0;

	renderSprite.filters = [screen_filter];


	sprite_skele=new PIXI.Sprite(PIXI.Texture.fromFrame("skele.png"));
	sprite_skele.filters = [palette_filter];
	scene.addChild(sprite_skele);


	sprite_face=new PIXI.Sprite(PIXI.Texture.fromFrame("face.png"));
	sprite_face.filters = [palette_filter];
	scene.addChild(sprite_face);


	palette_filter.uniforms.uPaletteSampler = PIXI.loader.resources.palette.texture;
	palette_filter.uniforms.uPalette = 0;


	menu={};
	menu.options=[];

	fontStyle={font: "8px font", align: "left"};

	var attackTxt = new PIXI.extras.BitmapText(" Attack ", fontStyle);
 	attackTxt.filters=[palette_filter];
	attackTxt.position.x = 8;
	attackTxt.position.y = size[1]-32;
	attackTxt.maxLineHeight=1;
	attackTxt.maxWidth=size[0];
	attackTxt.tint=0xCCCCCC;

	var specialTxt = new PIXI.extras.BitmapText("Special", fontStyle);
 	specialTxt.filters=[palette_filter];
	specialTxt.position.x = 8;
	specialTxt.position.y = size[1]-24;
	specialTxt.maxLineHeight=1;
	specialTxt.maxWidth=size[0];
	specialTxt.tint=0xCCCCCC;

	var runTxt = new PIXI.extras.BitmapText("Run", fontStyle);
 	runTxt.filters=[palette_filter];
	runTxt.position.x = 8;
	runTxt.position.y = size[1]-16;
	runTxt.maxLineHeight=1;
	runTxt.maxWidth=size[0];
	runTxt.tint=0xCCCCCC;

	menu.selectionText = new PIXI.extras.BitmapText("[          ]", fontStyle);
 	menu.selectionText.filters=[palette_filter];
	menu.selectionText.position.x = 8;
	menu.selectionText.position.y = size[1]-32;
	menu.selectionText.maxLineHeight=1;
	menu.selectionText.maxWidth=size[0];
	menu.selectionText.tint=0x333333;

	menu.selectionBg = new PIXI.Graphics();
	menu.selectionBg.position.x = 8;
	menu.selectionBg.position.y = size[1]-32;
	menu.selectionBg.beginFill(0xCCCCCC);
	menu.selectionBg.drawRect(1,1,35,5);
	menu.selectionBg.beginFill(0x333333);
	menu.selectionBg.drawRect(1,1,1,1);
	menu.selectionBg.filters=[palette_filter];
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
		menu.selectionBg.position.y = size[1]-32+8*menu.selected;
		menu.selectionText.position.y = size[1]-32+8*menu.selected;
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

	$(document).on("keydown",function(){
		menu.next();
	});
}


function update(){
	// cycle palettes
	palette_filter.uniforms.uPalette = (Math.floor(curTime/1000)%5)/5;


	// TODO
	sprite_face.position.x=Math.sin(curTime/2000.0)*50+50;
	sprite_face.position.y=Math.cos(curTime/2000.0)*50+50;
	sprite_skele.position.y=Math.sin(curTime/2300.0)*10+20;
	sprite_skele.position.x=Math.cos(curTime/2300.0)*10+20;
}

function render(){
	renderer.render(scene,renderTexture);
	try{
		renderer.render(renderSprite,null,true,false);
	}catch(e){
		renderer.render(scene,null,true,false);
	}
}