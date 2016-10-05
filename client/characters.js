var action_attack={
	name:"attack",
	description:"attack an enemy for physical damage",
	friendly:false,
	cost:0,
	trigger:function(source,target){
		console.log(source.name+" attacked "+target.name);
		target.setHp(-source.stats.str,true);
	}
};
var action_defend={
	name:"defend",
	description:"put up defenses to reduce incoming damage\nrecovers 1 sp",
	friendly:true,
	cost:-1,
	trigger:function(source,target){
		console.log(source.name+" defended "+target.name);
		source.setSp(1,true);
	}
};


var character_templates={
	buddy1:{
		name:"soldier",
		sprite:"soldier",
		stats:{
			str:4,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack,
			action_defend,
			{
				name:"slash",
				description:"attack for double physical damage\ncosts 2 sp",
				friendly:false,
				cost:2,
				trigger:function(source,target){
					console.log(source.name+" sliced "+target.name);
					source.setSp(-2,true);
					target.setHp(-source.stats.str*2,true);
				}
			}
		]
	},
	buddy2:{
		name:"punchy",
		sprite:"punchy",
		stats:{
			str:4,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack,
			action_defend,
			{
				name:"inspire",
				description:"fully restore target's sp\ncosts 3 sp",
				friendly:true,
				cost:3,
				trigger:function(source,target){
					console.log(source.name+" inspired "+target.name);
					source.setSp(-3,true);
					target.setSp(3);
				}
			}
		]
	},
	buddy3:{
		name:"wizard",
		sprite:"wizard",
		stats:{
			str:4,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack,
			action_defend,
			{
				name:"heal",
				description:"partially restore target's hp\ncosts 2 sp",
				friendly:true,
				cost:2,
				trigger:function(source,target){
					console.log(source.name+" healed "+target.name);
					source.stats.sp -= 3;
					target.stats.hp += source.stats.int;
				}
			}
		]
	},


	blob:{
		name:"blob",
		sprite:"blob",
		stats:{
			str:15,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack
		]
	},skele:{
		name:"skele",
		sprite:"skele",
		stats:{
			str:15,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack
		]
	}
};




var UI=function(){
	this.container=new PIXI.Container();
	var base=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_base.png"));
	var base2=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_base2.png"));
	this.sp=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_sp.png"));
	this.hp=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_hp.png"));
	var icon_attack=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_icon_attack.png"));
	var icon_defend=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_icon_defend.png"));
	var icon_special=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_icon_special.png"));
	var icon_skull=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_icon_skull.png"));
	var icon_unknown=new PIXI.Sprite(PIXI.Texture.fromFrame("character_ui_icon_unknown.png"));

	base.anchor.x=0.5;
	base2.anchor.x=0.5;
	icon_attack.anchor.x=0.5;
	icon_defend.anchor.x=0.5;
	icon_special.anchor.x=0.5;
	icon_skull.anchor.x=0.5;
	icon_unknown.anchor.x=0.5;

	this.icons={
		attack:icon_attack,
		defend:icon_defend,
		sp:icon_special,
		skull:icon_skull,
		unknown:icon_unknown
	};

	this.container.addChild(base2);
	base2.addChild(this.sp);
	this.container.addChild(base);
	base.addChild(this.hp);
	this.container.addChild(icon_attack);
	this.container.addChild(icon_defend);
	this.container.addChild(icon_special);
	this.container.addChild(icon_skull);
	this.container.addChild(icon_unknown);

	

	this.hp.position.y=2;
	this.hp.position.x=-10;
	
	this.sp.position.y=5;
	this.sp.position.x=-10;
	

	this.setHp(1);
	this.setSp(3);
	this.setIcon(null);
};
UI.prototype.setIcon=function(_icon){
	for(var i in this.icons){
		this.icons[i].visible=false;
	}
	if(_icon != null){
		if(this.icons[_icon]){
			this.icons[_icon].visible=true;
		}else{
			this.icons.sp.visible=true;
		}
	}
};
UI.prototype.setHp=function(_percent){
	this.hp.width=_percent <= 0 ? 0 : Math.max(1,_percent*13);
};
UI.prototype.setSp=function(_v){
	this.sp.width=clamp(0,_v,3)/3*13;
};

var Character=function(_name, _enemy, _slot){
	this.template=character_templates[_name];

	this.name=this.template.name;
	this.stats={
		str:this.template.stats.str,
		int:this.template.stats.int,
		def:this.template.stats.def,
		hp:this.template.stats.hp_max,
		hp_max:this.template.stats.hp_max,
		sp:3
	};
	this.actions=this.template.actions.slice();

	this.battleSlot={
		id:_slot,
		x: 16+16*(3-_slot),
		y: 33+8*_slot
	};
	this.enemy=_enemy;
	if(_enemy){
		this.battleSlot.x = 160-this.battleSlot.x;
	}
	
	this.spr=new PIXI.Container();

	this.animations={
		idle:null,
		dead:null,
		move_friendly:null,
		move_enemy:null
	};


	for(var i in this.animations){
		this.animations[i] = new PIXI.extras.MovieClip(getFrames(this.template.sprite+"_"+i));
		this.animations[i].visible = false;
		this.animations[i].animationSpeed= 1/40*this.animations[i].totalFrames;
		this.spr.addChild(this.animations[i]);
		this.animations[i].anchor.x=0.5;
	}
	this.animations.move_enemy.animationSpeed*=2;

	this.spr.position.x=this.battleSlot.x;
	this.spr.position.y=this.battleSlot.y;
	addLerp(this.spr,0.25);
	
	var ui=new UI();
	ui.container.position.x=this.battleSlot.x;
	ui.container.position.y=this.battleSlot.y-16;
	this.ui=ui;

	this.setAnimation("idle");
};

Character.prototype.isDead=function(){
	return this.stats.hp <= 0;
};
Character.prototype.setHp=function(v,by){
	this.stats.hp = clamp(0, by ? this.stats.hp+v : v, this.stats.hp_max);
	this.ui.setHp(this.stats.hp/this.stats.hp_max);
	if(this.isDead()){
		this.setAnimation("dead");
	}
	return this.stats.hp;
};
Character.prototype.setSp=function(v,by){
	this.stats.sp = clamp(0, by ? this.stats.sp+v : v, 3);
	this.ui.setSp(this.stats.sp);
	return this.stats.sp;
};
Character.prototype.setAnimation=function(_animation){
	var swap=!this.animations[_animation].visible;
	// hide all animations
	for(var i in this.animations){
		this.animations[i].visible=false;
	}

	// show selected animation
	this.animations[_animation].visible=true;
	// play selected animation
	if(swap){
		if(_animation == "idle"){
			this.animations[_animation].gotoAndPlay(this.battleSlot.id%2==0 ? 0 : this.animations[i].totalFrames/2)
		}else{
			this.animations[_animation].gotoAndPlay(0);
		}
	}else{
		this.animations[_animation].play();		
	}
}