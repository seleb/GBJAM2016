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

var action_drain={
	name:"drain",
	description:"steal sp from target",
	friendly:false,
	cost:0,
	trigger:function(source,target){
		var sp=target.stats.sp;

		if(sp > 0){
			source.setSp(2,true);
			target.setSp(-1,true);
			flash(true);
			return source.name+" drained sp from "+target.name;
		}else{
			return source.name+" tried to drain sp, but "+target.name + " didn't have any";
		}
	}
};

var action_weaken={
	name:"weaken",
	description:"reduces target str and int",
	friendly:false,
	cost:0,
	trigger:function(source,target){
		flash(true);
		source.setSp(-this.cost,true);
		target.buffStat("str",-target.getStat("str"));
		target.buffStat("int",-target.getStat("int"));
		return source.name+" weakened "+target.name+"\nstr : "+target.getStat("str")+", int : "+target.getStat("int");
	}
};

var action_patch={
	name:"patch",
	description:"restores 1 sp and some hp to target",
	friendly:true,
	cost:0,
	trigger:function(source,target){
		var sp=1;
		var hp=Math.ceil(target.stats.hp_max*0.05);

		flash();
		source.setSp(-this.cost,true);
		target.setSp(sp,true);
		target.setHp(hp,true);

		return source.name+" patched "+target.name+"\nsp : +"+sp+" , hp : +"+hp;
	}
}


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
				description:"restore target's sp and some hp\ncosts 2 sp",
				friendly:true,
				cost:2,
				trigger:function(source,target){
					var heal=Math.ceil(source.getStat("int") + target.getStat("hp_max")*0.1);
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
			action_drain,
			{
				name:"heal",
				description:"partially restore target's hp\ncosts 2 sp",
				friendly:true,
				cost:2,
				trigger:function(source,target){
					var heal=Math.ceil(source.getStat("int") + target.getStat("hp_max")*0.1);
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


	skelesword:{
		name:"skele",
		sprite:"skele",
		stats:{
			str:9,
			int:0,
			def:1,
			hp_max:16,
			fast:true
		},
		actions:[
			action_attack,
			action_defend
		]
	},skeleaxe:{
		name:"skele",
		sprite:"skeleaxe",
		stats:{
			str:10,
			int:0,
			def:1,
			hp_max:16,
			fast:true
		},
		actions:[
			action_attack,
			action_attack,
			action_defend
		]
	},skelespear:{
		name:"skele",
		sprite:"skelespear",
		stats:{
			str:8,
			int:0,
			def:2,
			hp_max:16,
			fast:true
		},
		actions:[
			action_attack,
			action_defend
		]
	},skelechamp:{
		name:"shade",
		sprite:"skelechamp",
		stats:{
			str:12,
			int:0,
			def:2,
			hp_max:16,
			fast:true
		},
		actions:[
			action_attack,
			action_defend
		]
	},skelegiant:{
		name:"skele g .",
		sprite:"skelegiant",
		stats:{
			str:14,
			int:0,
			def:4,
			hp_max:32,
			fast:false
		},
		actions:[
			action_attack
		]
	},


	wisp:{
		name:"wisp",
		sprite:"wisp",
		stats:{
			str:0,
			int:14,
			def:0,
			hp_max:32,
			fast:true
		},
		actions:[
			action_weaken,
			{
				name:"absorb",
				description:"steals target life",
				friendly:false,
				cost:1,
				trigger:function(source,target){
					var hp=Math.max(1, Math.min(target.stats.hp, source.getStat("int")-target.getStat("int")));
					flash(true);
					source.setSp(-this.cost,true);
					target.setHp(-hp,true);
					source.setHp(hp,true);
					return source.name+" absorbed "+hp+" hp from "+target.name;
				}
			}
		]
	},
	puppet:{
		name:"puppet",
		sprite:"puppet",
		stats:{
			str:16,
			int:5,
			def:5,
			hp_max:32,
			fast:false
		},
		actions:[
			{
				name:"copy",
				description:"replaces this action with a random action from target",
				friendly:false,
				cost:1,
				trigger:function(source,target){
					flash(true);
					source.setSp(-this.cost,true);

					var actionId = 0;
					var action=target.actions[actionId];
					
					for(var i = 0; i < source.actions.length; ++i){
						if(source.actions[i] == this){
							source.actions[i] = action;
						}
					}

					return source.name+" copied "+action.name+" from "+target.name;
				}
			},
			{
				name:"copy",
				description:"replaces this action with a random action from target",
				friendly:false,
				cost:1,
				trigger:function(source,target){
					flash(true);
					source.setSp(-this.cost,true);

					var actionId = 2;
					var action=target.actions[actionId];
					
					for(var i = 0; i < source.actions.length; ++i){
						if(source.actions[i] == this){
							source.actions[i] = action;
						}
					}

					return source.name+" copied "+action.name+" from "+target.name;
				}
			},
			action_patch
		]
	},
	puppetmaster:{
		name:"master",
		sprite:"puppetmaster",
		stats:{
			str:15,
			int:0,
			def:0,
			hp_max:64,
			fast:true
		},
		actions:[
			action_attack,
			action_drain,
			action_weaken,
			{
				name:"rejuvenates",
				description:"revives fallen puppetmasterhands",
				friendly:true,
				cost:2,
				trigger:function(source,target){
					flash();
					source.setSp(-this.cost,true);

					for(var i = 0; i < enemy_party.length; ++i){
						enemy_party[i].setHp(Math.ceil(enemy_party[i].stats.hp_max/3),true);
						if(enemy_party[i].animations.dead.visible){
							enemy_party[i].setAnimation("idle");
						}
					}

					return source.name+" rejuvenated allies";
				}
			}
		]
	},
	puppetmasterhand:{
		name:"hand",
		sprite:"puppetmasterhand",
		stats:{
			str:11,
			int:0,
			def:0,
			hp_max:32,
			fast:false
		},
		actions:[
			action_attack,
			action_patch
		]
	},

	win:{
		name:"* \\o\/ *",
		sprite:"win",
		stats:{
			str:0,
			int:0,
			def:0,
			hp_max:99,
			fast:false
		},
		actions:[
			{
				name:"msg",
				description:"does nothing useful",
				friendly:true,
				cost:0,
				trigger:function(source,target){
					flash();
					return "the game's over, you really won!";
				}
			},
			{
				name:"msg",
				description:"does nothing useful",
				friendly:true,
				cost:0,
				trigger:function(source,target){
					flash();
					return "reward yourself : play more #gbjam games!";
				}
			},
			{
				name:"msg",
				description:"does nothing useful",
				friendly:true,
				cost:0,
				trigger:function(source,target){
					flash();
					return "thanks for playing all the way through!";
				}
			}
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

	this.hp.position.y=2;
	this.hp.position.x=-10;
	
	this.sp.position.y=5;
	this.sp.position.x=-10;
	

	this.hp.mask = new PIXI.Graphics();
	this.sp.mask = new PIXI.Graphics();

	this.hp.mask.position.y=2;
	this.hp.mask.position.x=-10;
	
	this.sp.mask.position.y=5;
	this.sp.mask.position.x=-10;

	this.container.addChild(base2);
	base2.addChild(this.sp);
	base2.addChild(this.sp.mask);
	this.container.addChild(base);
	base.addChild(this.hp);
	base.addChild(this.hp.mask);
	this.container.addChild(icon_attack);
	this.container.addChild(icon_defend);
	this.container.addChild(icon_special);
	this.container.addChild(icon_skull);
	this.container.addChild(icon_unknown);

	


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
	this.hp.mask.clear();
	this.hp.mask.beginFill();
	this.hp.mask.drawRect(0,0,Math.ceil(clamp(0,_percent,1)*13),2);
	this.hp.mask.endFill();
};
UI.prototype.setSp=function(_v){
	this.sp.mask.clear();
	this.sp.mask.beginFill();
	this.sp.mask.drawRect(0,0,Math.ceil(clamp(0,_v,3)/3*13),2);
	this.sp.mask.endFill();
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
		y:64+8*_slot
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
		this.animations[i].anchor.y=1;
	}
	this.animations.move_enemy.animationSpeed*=2;

	this.spr.position.x=this.battleSlot.t.x;
	this.spr.position.y=this.battleSlot.t.y;
	addLerp(this.spr,0.25);
	addLerp(this.battleSlot,0.1);
	
	var ui=new UI();
	ui.container.position.x=this.battleSlot.t.x;
	ui.container.position.y=this.battleSlot.t.y-48;
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