function lerp(from,to,t){
	if(Math.abs(to-from) < 1){
		return to;
	}
	return from+(to-from)*t;
}

function clamp(min,v,max){
	return Math.max(min,Math.min(v,max));
}


// fullscreen toggle from https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API#Toggling_fullscreen_mode
function isFullscreen(){
	return !(!document.fullscreenElement&& !document.mozFullScreenElement&& !document.webkitFullscreenElement&& !document.msFullscreenElement);
}
function toggleFullscreen(){
	if(!isFullscreen()){
		if (document.body.requestFullscreen) {
			document.body.requestFullscreen();
		} else if (document.body.msRequestFullscreen) {
			document.body.msRequestFullscreen();
		} else if (document.body.mozRequestFullScreen) {
			document.body.mozRequestFullScreen();
		} else if (document.body.webkitRequestFullscreen) {
			document.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

function ease(t) {
	if ((t/=0.5) < 1) {
		return 0.5*t*t*t;
	}
	return 0.5*((t-=2)*t*t + 2);
};

function range(rng,range){
	return rng.real()*(range[1]-range[0])+range[0];
}


function nextPowerOfTwo(v){
	return Math.pow(2, Math.ceil(Math.log(v)/Math.log(2)));
}

function getFrames(_texture){
	var res=[];
	var i = 0;
	do{
		i+=1;
		var t=_texture+"_"+i+".png";
		
		if(!PIXI.loader.resources.spritesheet.textures[t]){
			break;
		}
		t=PIXI.Texture.fromFrame(t);
		
		res.push(t);
	}while(i<32);

	if(res.length == 0){
		res.push(PIXI.Texture.fromFrame("error.png"));
	}

	return res;
}