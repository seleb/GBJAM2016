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



	var bitmapFontText = new PIXI.extras.BitmapText("yo waddup", {font: "8px font", align: "left"});
 	bitmapFontText.filters=[palette_filter];
	//bitmapFontText.position.x = 620 - bitmapFontText.width - 20;
	//bitmapFontText.position.y = 20;
 
    scene.addChild(bitmapFontText);

	// start the main loop
	window.onresize = onResize;
	_resize();
	main();
}


function update(){
	palette_filter.uniforms.uPalette = (Math.floor(curTime/1000)%5)/5;
	console.log(palette_filter.uniforms.uPalette);
	// TODO
	sprite_face.position.x=Math.sin(curTime/2000.0)*50+50;
	sprite_face.position.y=Math.cos(curTime/2000.0)*50+50;
	sprite_skele.position.y=Math.sin(curTime/2300.0)*10+20;
	sprite_skele.position.x=Math.cos(curTime/2300.0)*10+20;
	//console.log(sprite_face.position.x,sprite_face.xr);
}

function render(){
	renderer.render(scene,renderTexture);
	try{
		renderer.render(renderSprite,null,true,false);
	}catch(e){
		renderer.render(scene,null,true,false);
	}
}