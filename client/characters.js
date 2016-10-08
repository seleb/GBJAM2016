var action_attack={
	name:"attack",
	description:"attack an enemy for physical damage",
	friendly:false,
	cost:0,
	trigger:function(source,target){
		// damage target
		// damage is source strength - target defense, with a minimum of 1 damage
		var dmg = Math.max(1, source.getStat("str")-target.getStat("def"));
		target.setHp(-dmg,true);
		target.stagger();
		return source.name + (target.isDead() ? " defeated " : " attacked ") + target.name + "\nhp : -"+dmg;
	}
};
var action_defend={
	name:"defend",
	description:"increase target's defense for 1 turn\nrestores 1 sp",
	friendly:true,
	cost:-1,
	trigger:function(source,target){
		// temp buff target's defense by source's root defense 
		var def=source.getStat("def",true);
		target.buffStat("def", def);
		source.setSp(-this.cost,true);
		return source.name+" is defending "+target.name+"\ndef : +"+def;
	}
};
var action_fireball={
	name:"fireball",
	description:"attack for magic damage\ncosts 1 sp",
	friendly:false,
	cost:1,
	trigger:function(source,target){
		// damage target
		// damage is source int - target int, with a minimum of 1 damage
		var dmg=Math.max(1, source.getStat("int")-target.getStat("int"));
		source.setSp(-this.cost,true);
		target.setHp(-dmg,true);
		target.stagger();
		flash();
		return source.name + (target.isDead() ? " defeated " : " fireballed ") + target.name + "\nhp : -"+dmg;
	}
};


var character_templates={
	soldier:{
		name:"knight",
		sprite:"soldier",
		stats:{
			str:6,
			int:1,
			def:6,
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
					// damage target
					// damage is 2 * source strength - target defense, with a minimum of 1 damage
					var dmg = Math.max(1, source.getStat("str")*2 - target.getStat("def"));
					source.setSp(-this.cost,true);
					target.setHp(-dmg,true);
					target.stagger();
					flash();
					return source.name + (target.isDead() ? " defeated " : " sliced ") + target.name + "\nhp : -"+dmg;
				}
			}
		]
	},
	punchy:{
		name:"punchy",
		sprite:"punchy",
		stats:{
			str:9,
			int:3,
			def:4,
			hp_max:32
		},
		actions:[
			action_attack,
			action_defend,
			{
				name:"inspire",
				description:"restore target's sp and some hp\ncosts 3 sp",
				friendly:true,
				cost:3,
				trigger:function(source,target){
					var heal=source.getStat("int");
					source.setSp(-this.cost,true);
					target.setSp(3);
					target.setHp(heal,true);
					flash();
					return source.name+" inspired "+target.name+"\nhp : +"+heal;
				}
			}
		]
	},
	wizard:{
		name:"wizard",
		sprite:"wizard",
		stats:{
			str:2,
			int:9,
			def:2,
			hp_max:32
		},
		actions:[
			action_fireball,
			{
				name:"drain",
				description:"steal 1 sp from target",
				friendly:false,
				cost:0,
				trigger:function(source,target){
					var sp=target.getStat("sp");

					if(sp > 0){
						source.setSp(1,true);
						target.setSp(-1,true);
						flash(true);
						return source.name+" drained 1 sp from "+target.name;
					}else{
						return source.name+" tried to drain sp, but "+target.name + " didn't have any";
					}
				}
			},
			{
				name:"heal",
				description:"partially restore target's hp\ncosts 2 sp",
				friendly:true,
				cost:2,
				trigger:function(source,target){
					var heal=source.getStat("int");
					source.setSp(-this.cost,true);
					target.setHp(heal,true);
					flash();
					return source.name+" healed "+target.name + "\nhp : +"+heal;
				}
			}
		]
	},


	blob:{
		name:"blob",
		sprite:"blob",
		stats:{
			str:5,
			int:0,
			def:0,
			hp_max:32,
			fast:false
		},
		actions:[
			action_attack
		]
	},
	blobqueen:{
		name:"gwob",
		sprite:"blobqueen",
		stats:{
			str:9,
			int:5,
			def:3,
			hp_max:32,
			fast:false
		},
		actions:[
			action_attack,
			{
				name:"deplete",
				description:"deplete target's sp\ncosts 1 sp",
				friendly:false,
				cost:1,
				trigger:function(source,target){
					// deplete target's sp
					source.setSp(-this.cost,true);
					target.setSp(0);
					target.stagger();
					flash(true);
					return source.name + " depleted " + target.name + "'s sp";
				}
			},
		]
	},
	blobwiz:{
		name:"merlob",
		sprite:"blobwiz",
		stats:{
			str:2,
			int:11,
			def:2,
			hp_max:32,
			fast:false
		},
		actions:[
			action_fireball,
			action_attack,
			{
				name:"heal",
				description:"partially restore target's hp\ncosts 1 sp",
				friendly:true,
				cost:1,
				trigger:function(source,target){
					var heal=source.getStat("int");
					source.setSp(-this.cost,true);
					target.setHp(heal,true);
					flash();
					return source.name+" healed "+target.name + "\nhp : +"+heal;
				}
			}
		]
	},
	blobchamp:{
		name:"labelob",
		sprite:"blobchamp",
		stats:{
			str:11,
			int:0,
			def:4,
			hp_max:32,
			fast:false
		},
		actions:[
			action_attack
		]
	},


	skele:{
		name:"skele",
		sprite:"skele",
		stats:{
			str:10,
			int:1,
			def:3,
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
	this.hp.width=Math.ceil(_percent <= 0 ? 0 : Math.max(1,_percent*13));
};
UI.prototype.setSp=function(_v){
	this.sp.width=Math.ceil(clamp(0,_v,3)/3*13);
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
		sp:3,
		fast:this.template.stats.fast
	};
	this.cancelBuffs();

	this.actions=this.template.actions.slice();

	this.battleSlot=new PIXI.Container();
	this.battleSlot.id = _slot;
	this.battleSlot.t={
		x:16+16*(3-_slot),
		y:33+8*_slot
	};

	this.enemy=_enemy;
	if(_enemy){
		this.battleSlot.t.x = 160-this.battleSlot.t.x;
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

	this.spr.position.x=this.battleSlot.t.x;
	this.spr.position.y=this.battleSlot.t.y;
	addLerp(this.spr,0.25);
	addLerp(this.battleSlot,0.1);
	
	var ui=new UI();
	ui.container.position.x=this.battleSlot.t.x;
	ui.container.position.y=this.battleSlot.t.y-16;
	this.ui=ui;
	this.battleSlot.addChild(this.spr);
	this.battleSlot.addChild(this.ui.container);

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
		this.setSp(0);
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
};
Character.prototype.stagger=function(){
	this.spr.position.x += this.enemy ? 8 : -8;
	world.position.x += this.enemy ? 2 : -2;
};
Character.prototype.getStat=function(_stat, _nonBuffed){
	return (_nonBuffed ? this.stats : this.stats.temp)[_stat];
};
Character.prototype.buffStat=function(_stat, _value, _permanent){
	this.stats.temp[_stat]+=_value;
	if(_permanent){
		this.stats[_stat] += _value;
	}
};
Character.prototype.cancelBuffs=function(){
	this.stats.temp = null;
	this.stats.temp = JSON.parse(JSON.stringify(this.stats));
};
Character.prototype.destroy=function(){
	this.battleSlot.destroy();

	lerps.splice(lerps.indexOf(this.spr.lerp),1);
	lerps.splice(lerps.indexOf(this.battleSlot.lerp),1);
}