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

var scaleMode = 0;

$(document).ready(function(){

	// try to auto-focus and make sure the game can be focused with a click if run from an iframe
	window.focus();
	$(document).on("mousedown",function(event){
		window.focus();
	});

	// setup game
	startTime=Date.now();
	sounds["music_menu"] = new Howl({
		urls:["assets/audio/menumusic.ogg"],
		autoplay:false,
		loop:true,
		volume:0
	});
	sounds["music_battle"] = new Howl({
		urls:["assets/audio/battlemusic.ogg"],
		autoplay:false,
		loop:true,
		volume:0
	});

	// menu SFX
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

	// combat SFX
	sounds["sfx_swoosh"] = new Howl({
		urls:["assets/audio/sfx_4.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_pow"] = new Howl({
		urls:["assets/audio/sfx_3.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_buff"] = new Howl({
		urls:["assets/audio/sfx_5.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_win"] = new Howl({
		urls:["assets/audio/sfx_6.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});
	sounds["sfx_lose"] = new Howl({
		urls:["assets/audio/sfx_7.wav"],
		autoplay:false,
		loop:false,
		volume:1
	});

	sounds["music_menu"].play();
	sounds["music_menu"].fadeIn(1,1000);

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
		.add("enemies","assets/enemies.json")
		.add("tilemap","assets/tilemap.json")
		.add("font","assets/font/font.fnt")
		.add("palette","assets/palette.png");

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
	

	var aw,ah;

	if(scaleMode==0){
		aw=size[0];
		ah=size[1];


		while(aw <= w || ah <= h){
			aw+=size[0];
			ah+=size[1];
		}

		aw-=size[0];
		ah-=size[1];
	}else if(scaleMode==1){
		aw=w;
		ah=h;
	}else{
		aw=size[0];
		ah=size[1];
	}

	renderer.view.style.width=aw+"px";
	renderer.view.style.height=ah+"px";

	console.log("Resized",size,aw,ah);
}

PIXI.zero=new PIXI.Point(0,0);