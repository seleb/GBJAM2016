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
		name:"buddy 1",
		sprite:"soldier",
		stats:{
			str:5,
			int:5,
			def:5,
			hp_max:32
		},
		actions:[
			action_attack,
			action_defend,
			{
				name:"slice",
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
		name:"buddy 2",
		sprite:"soldier",
		stats:{
			str:5,
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
		name:"buddy 3",
		sprite:"soldier",
		stats:{
			str:5,
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
			action_attack,
			action_defend
		]
	}
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
		x: 16*(3-_slot),
		y: 33+8*_slot
	};

	if(_enemy){
		this.battleSlot.x = 160-32-this.battleSlot.x;
	}
	
	var spr=new PIXI.extras.MovieClip(getFrames(this.template.sprite+"_idle"));
	spr.position.x=this.battleSlot.x;
	spr.position.y=this.battleSlot.y;
	this.spr=spr;
	addLerp(spr,0.25);
	spr.gotoAndPlay(_slot%2==0 ? 0 : spr.totalFrames/2);
	spr.animationSpeed= 1/20*spr.totalFrames;
	
	var ui=getUI();
	ui.position.x=this.battleSlot.x;
	ui.position.y=this.battleSlot.y-16;
	this.ui=ui;
};

Character.prototype.isDead=function(){
	return this.stats.hp <= 0;
};
Character.prototype.setHp=function(v,by){
	this.stats.hp = clamp(0, by ? this.stats.hp+v : v, this.stats.hp_max);
	return this.stats.hp;
};
Character.prototype.setSp=function(v,by){
	this.stats.sp = clamp(0, by ? this.stats.sp+v : v, 3);
	return this.stats.sp;
};