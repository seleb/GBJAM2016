var startTime=0;
var lastTime=0;
var curTime=0;

var game;
try{
	game = new PIXI.Container();
}catch(e){
	document.body.innerHTML="<p>Unsupported Browser. Sorry :(</p>";
}
var resizeTimeout=null;

var mouse={
	pos:[0,0]
};
var size=[160,144];

var sounds=[];

$(document).ready(function(){

	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on("mousedown",function(event){
		window.focus();
	});

	// setup game
	startTime=Date.now();
	sounds["bgm"] = new Howl({
		urls:["assets/audio/moody music.wav"],
		autoplay:true,
		loop:true,
		volume:0
	});

	sounds["sfx_select"] = new Howl({
		urls:["assets/audio/sfx_2.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_cancel"] = new Howl({
		urls:["assets/audio/sfx_1.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_move"] = new Howl({
		urls:["assets/audio/sfx_0.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});

	sounds["bgm"].fadeIn(1,1000);

	//Howler.mute();

	// create renderer
	renderer = PIXI.autoDetectRenderer(
		size[0],size[1],
		{
			antiAlias:false,
			transparent:false,
			resolution:1,
			roundPixels:true,
			clearBeforeRender:true,
			autoResize:false
		}
	);
	renderer.backgroundColor = 0x000000;

	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	PIXI.WRAP_MODES.DEFAULT = PIXI.WRAP_MODES.MIRRORED_REPEAT;

	// add the canvas to the html document
	$("#display").prepend(renderer.view);



	// create a new render texture..
	renderTexture = PIXI.RenderTexture.create(size[0],size[1],PIXI.SCALE_MODES.NEAREST,1);
	 
	// create a sprite that uses the new render texture...
	// and add it to the stage
	renderSprite = new PIXI.Sprite(renderTexture, new PIXI.Rectangle(0,0,size[0],size[1]));
	game.addChild(renderSprite);
	
	fontStyle={font: "8px font", align: "left"};

	CustomFilter.prototype = Object.create(PIXI.Filter.prototype);
	CustomFilter.prototype.constructor = CustomFilter;

	PIXI.loader
		.add("screen_shader","assets/screen_shader.frag")
		.add("spritesheet","assets/textures.json")
		.add("tilemap","assets/img/tilemap.json")
		.add("font","assets/font/font.fnt")
		.add("palette","assets/img/palette.png");

	PIXI.loader
		.on("progress", loadProgressHandler)
		.load(init);
});


function CustomFilter(fragmentSource){
	PIXI.Filter.call(this,
		// vertex shader
		null,
		// fragment shader
		fragmentSource
	);
}


function loadProgressHandler(loader, resource){
	// called during loading
	console.log("loading: " + resource.url);
	console.log("progress: " + loader.progress+"%");
}

function onResize() {
	/*if(resizeTimeout != null){
		window.clearTimeout(resizeTimeout);
	}

	resizeTimeout=window.setTimeout(_resize,150);*/
	_resize();
}


function _resize(){
	var w=$("#display").innerWidth();
	var h=$("#display").innerHeight();
	var ratio=size[0]/size[1];
	
	if(w/h < ratio){
		h = Math.round(w/ratio);
	}else{
		w = Math.round(h*ratio);
	}

	renderer.view.style.width=w+"px";
	renderer.view.style.height=h+"px";

	console.log("Resized",size,w,h);
}