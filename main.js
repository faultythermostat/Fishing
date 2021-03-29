////remove outward calls to globals from inside classes, all needed data shoudl be passed as a parameter
////localize all vars
////change obj def to classes
////move line and casting objects to under the player obj
//animations
//better map making with better tile diversity
//debug mode
//fish escape based on type nd strength
//hook, bait, lines
//better gui and info text, show bucket
//when catching, pull fish toward land and if released, throw back to shore
//if bucket full, choose what fish to throw back
//inventory/shop
//fish attitudes based off temp
//think about changing size of player/line to better suit scale
//different rods cast further
//bait stats, only attract certain fish
//fish type stats that are constant per species
//keep track of fish caught, even if released
//fish favor the top right

init = function() {
	ctx.init()
	keyboard.init()//using an old version of my keyboard/mouse handler, will update to a newer version soon
	keyboard.addKeys([
		{key:"a",flipFlop:false},
		{key:"w",flipFlop:false},
		{key:"s",flipFlop:false},
		{key:"d",flipFlop:false},
		{key:" ",flipFlop:true},
		{key:"escape",flipFlop:false},
		{key:"m",flipFlop:false}
	])
	mouse.init();
	mouse.addButtons({button:0})
	
	SCALE = 20
	DEBUG = true;
	TIMERES = 1;//how many frames a seconds equals (raising makes day longer)
	fishTypes = ["bass","trout"]
	map = new _map(Math.floor(SCREENWIDTH/SCALE),Math.floor(SCREENHEIGHT/SCALE))//create the empty map
	map.addLake(map.width/3) //add  lake to the map
	map.populate(10)
	
	loop();
}

player = {
	x:0,y:0,speed:0.05,dir:"xp",
	caughtFish:false,bucket:[],
	bucketSize:5,
	move:function(x,y) {//might change this later, not very good. the player doesnt ever actually touch the edges of things which can cause strange movements
		if (x>0) {
			player.dir = "xp"//set the players direction to x positive
			if ((player.x+player.speed)>map.width-1) return
			if ((map.data[Math.ceil(player.x+player.speed)+(Math.floor(player.y)*map.width)]||//dont do anything if player is about to make an invalid move
				map.data[Math.ceil(player.x+player.speed)+(Math.ceil(player.y)*map.width)])) return
		}
		if (x<0) {
			player.dir = "xn"
			if ((player.x-player.speed)<0) return
			if ((map.data[Math.floor(player.x-player.speed)+(Math.floor(player.y)*map.width)]||
					map.data[Math.floor(player.x-player.speed)+(Math.ceil(player.y)*map.width)])) return
		}
		if (y>0) {
			player.dir = "yp"
			if ((player.y+player.speed)>map.height-1) return
			if ((map.data[Math.floor(player.x)+(Math.ceil(player.y+player.speed)*map.width)]||
				map.data[Math.ceil(player.x)+(Math.ceil(player.y+player.speed)*map.width)])) return
		}
		if (y<0) {
			player.dir = "yn"
			if (player.y-player.speed<0) return
			if ((map.data[Math.floor(player.x)+(Math.floor(player.y-player.speed)*map.width)]||
				map.data[Math.ceil(player.x)+(Math.floor(player.y-player.speed)*map.width)])) return
		}
		//if we got here, it must be a valid move, so do it
		player.x += x*player.speed;
		player.y += y*player.speed;
	},
	getBucketLevel:function() {
		return player.bucket.reduce((acc,cv)=>acc+cv.weight,0)
	},
	addToBucket:function(f) {
		if (player.getBucketLevel()+f.weight<=player.bucketSize) {//if the bucket can hold it
			player.bucket.push(f)
			return true
		} else {
			console.log("too heavy for bucket, throwing back")
			return false
		}
	},
	draw:function() {
		ctx.fillStyle = "red"
		ctx.strokeStyle = "black"
		ctx.fillRect(player.x*SCALE,player.y*SCALE,SCALE,SCALE)
		ctx.strokeRect(player.x*SCALE,player.y*SCALE,SCALE,SCALE)
		if (DEBUG) {
			ctx.fillStyle = "black"
			ctx.fillText(player.dir,player.x*SCALE,(player.y*SCALE)+10)
			ctx.fillStyle = "white"
			if (player.bucket.length) ctx.fillText(player.bucket.reduce((acc,cv)=>acc+","+cv.type,""),0,10)
		}
	}
}

casting = {
	active:false,
	strength:0,
	sv:0.1,
	maxStrength:5,//distance in blocks that can be thrown
	update:function(){
		casting.active=true;
		casting.strength+=casting.sv;
		if (casting.strength+casting.sv>casting.maxStrength || casting.strength+casting.sv<0) {casting.sv*=-1}
	},
	draw:function() {
		ctx.setColor("white")
		ctx.strokeRect(0,0,12,102)
		ctx.fillRect(1,1+(100*(1-(casting.strength/casting.maxStrength))),10,(100*(casting.strength/casting.maxStrength)))
	},
	finish:function(){
		console.log("casted with strength: "+casting.strength)
		line.cast(casting.strength)
		casting.sv = 0.1;
		casting.active = false;
		casting.strength = 0;
	}
}

class _bait {
	constructor() {
		this.radius = 5//for debugging
	}
}

line = {
	active:false,
	x:0,
	y:0,
	size:1,
	bait:new _bait(),
	fish:false,
	pull:function() {
		line.active = false;
		if (line.fish) {
			player.caughtFish = line.fish
			console.log(player.caughtFish.type)
		}
		line.fish = false;
	},
	update:function() {
		
	},
	cast:function(strength) {
		switch(player.dir) {
			case "yp":
				line.x = player.x
				line.y = player.y+strength
			break;
			case "yn":
				line.x = player.x
				line.y = player.y-strength
			break;
			case "xp":
				line.x = player.x+strength
				line.y = player.y
			break;
			case "xn":
				line.x = player.x-strength
				line.y = player.y
			break;
		}
		line.active = true
		if (!map.data[Math.round(line.x)+(Math.round(line.y)*map.width)]) line.pull()
	},
	draw:function() {
		if (line.fish) {ctx.setColor("pink")} else {ctx.setColor("blue")}
		ctx.strokeRect(line.x*SCALE,line.y*SCALE,SCALE/2,SCALE/2)
		ctx.fillRect(line.x*SCALE,line.y*SCALE,SCALE/2,SCALE/2)
	}
}

class _fish {
	constructor(type,x,y,d) {
		this.x = x;
		this.y = y;
		this.weight = 0.5;//lbs
		this.young = false;
		this.length = 7;//inches
		this.active = true
		this.type = type;
		this.caught = false;
		this.depth = d;//has to stay at the deoth that it spawned in at, will change to allow certain fishes in pre-determined depths based on their type
	}
	update(m) {//super stupid implementation of movement ai, CHANGE LATER PLEASE GOD
		var possMoves = [
					{val:m.data[(this.x+1)+((this.y)*m.width)],x:this.x+1,y:this.y},{val:m.data[(this.x+1)+((this.y+1)*m.width)],x:this.x+1,y:this.y+1},
					{val:m.data[(this.x+1)+((this.y-1)*m.width)],x:this.x+1,y:this.y-1},{val:m.data[(this.x-1)+((this.y)*m.width)],x:this.x-1,y:this.y},
					{val:m.data[(this.x-1)+((this.y+1)*m.width)],x:this.x-1,y:this.y+1},{val:m.data[(this.x-1)+((this.y-1)*m.width)],x:this.x-1,y:this.y-1},
					{val:m.data[(this.x)+((this.y+1)*m.width)],x:this.x,y:this.y+1},{val:m.data[(this.x)+((this.y-1)*m.width)],x:this.x,y:this.y-1},
					{val:m.data[(this.x)+((this.y)*m.width)],x:this.x,y:this.y}
					]
		var cd = m.data[(this.x)+((this.y)*m.width)]//curreent depth
		possMoves = possMoves.filter(a=>a.val>=Math.min(this.depth,cd),this)//only move to places that are deeper or of equal depth, if ina place that the fish isnt allowed to be, try and find deeper water
		possMoves.sort(function(a,b) {//prioritize bait
			if (line.active && Math.distance(a,line)<=line.bait.radius && Math.distance(a,line)<Math.distance(b,line)) {
				return -1
			} else if (line.active && Math.distance(b,line)<=line.bait.radius) {
				return 1
			}
			
			return Math.random()>0.5?-1:1//shuffle
		})
		this.x = possMoves[0].x;//make the next move from the pri-list obtained above
		this.y = possMoves[0].y;
		if (line.active && Math.distance({x:line.x,y:line.y},{x:this.x,y:this.y})<=line.size) {//check if caught
			line.fish = this;//attach itself to the line
			this.caught = true
		} else {
			this.caught = false
		}
	}
}

class _map {
	constructor (w,h) {
		this.width = w
		this.height = h
		this.time = 0;
		this.updateRes = 5;//frames per update
		this.lastUpdateTime = 0;//tracks when the last update was
		this.data = new Array(w*h)
		this.data.fill(0);
		this.fish = []
		this.depthRes = 10;
		this.fishCap = 20;
		this.breedProbability = 1
	}
	birth(par) {
		var bb = new _fish(par.type,par.x,par.y,par.depth)
		bb.young = true;
		this.fish.push(bb)
	}
	populate(amnt) {
		for (var i=0;i<amnt;i++) {
			var rx = Math.floor(Math.random()*this.width);
			var ry = Math.floor(Math.random()*this.height);
			if (this.data[(rx)+((ry)*this.width)]!=0) {
				this.fish.push(new _fish(fishTypes[Math.floor(Math.random()*fishTypes.length)],
								rx,
								ry,
								this.data[(rx)+((ry)*this.width)]))
			} else {i--}
		}
	}
	getTimeOfDay() {
		return (this.time/(TIMERES*60*60))
	}
	breed() {
		for (var i=0;i<this.fish.length-1;i++) {
			for (var j=i+1;j<this.fish.length;j++) {
				if (!this.fish[i].young && !this.fish[j].young && this.fish[i].type == this.fish[j].type && this.fish[i].x == this.fish[j].x && this.fish[i].y == this.fish[j].y) {
					if (this.fish.length<this.fishCap && Math.random()<=this.breedProbability) {
						this.birth(this.fish[i])
					}
				}
			}
		}
	}
	update() {
		this.time = (this.time+1)%(TIMERES*24*60*60)
		this.fish.forEach(function(a,b){if (!a.active) this.splice(b,1)},this.fish)
		if (Math.abs(this.time-this.lastUpdateTime)>=this.updateRes) {
			this.fish.forEach(a=>a.update(this),this);
			this.lastUpdateTime = this.time
			this.breed()
		}
	}
	addLake(size) {
		this.data.forEach(function(a,b) {
			//console.log(Math.distance({x:(b%this.width),y:Math.floor(b/this.width)},{x:this.width/2,y:this.height/2}))
			if (Math.distance({x:(b%this.width),y:Math.floor(b/this.width)},{x:Math.floor(this.width/2),y:Math.floor(this.height/2)})<size) {
				this.data[b]=Math.floor((1-Math.distance({x:(b%this.width),y:Math.floor(b/this.width)},{x:Math.floor(this.width/2),y:Math.floor(this.height/2)})/size)*this.depthRes)
			}
		},this)
	}
	draw() {
		this.data.forEach(function(a,b) {
			//switch(a) {
				//case 0:
					if (a==0) {ctx.strokeStyle = "white"} else {ctx.strokeStyle = "blue"}
					if (a==0) {ctx.fillStyle = "black"} else {ctx.fillStyle = "rgba("+0+","+0+","+(64+((a/(this.depthRes))*191))+",1)";}
					ctx.fillRect((b%this.width)*SCALE,Math.floor(b/this.width)*SCALE,SCALE,SCALE);
					ctx.strokeRect((b%this.width)*SCALE,Math.floor(b/this.width)*SCALE,SCALE,SCALE);
				//break;
			//}
		},this)
		if (DEBUG) {
			this.fish.forEach(function(a) {
				if (a.young) {ctx.strokeStyle = "red"} else {ctx.strokeStyle = "white"}
				ctx.fillStyle = "rgba("+(0)+","+(1-(a.depth/this.depthRes))*255+","+(0)+",1)"
				ctx.fillRect((a.x)*SCALE,(a.y)*SCALE,SCALE,SCALE);
				ctx.strokeRect((a.x)*SCALE,(a.y)*SCALE,SCALE,SCALE);
			},this)
			ctx.fillStyle = "white"
			ctx.fillText(map.getTimeOfDay(),100,100)
			if (line.active) {
				this.data.forEach(function(a,b) {
					if (Math.distance({x:(b%this.width),y:Math.floor(b/this.width)},line)<=line.bait.radius) {
						ctx.strokeStyle = "purple"
					} else {return}
					ctx.strokeRect((b%this.width)*SCALE,Math.floor(b/this.width)*SCALE,SCALE,SCALE);
				},this)
			}
		}
	}
}

update = function() {
	if (keyboard.pollKey("m")) DEBUG = !DEBUG
	if (keyboard.keyState("w")) {//player moves faster diagonally than straight
		player.move(0,-1)
	}
	if (keyboard.keyState("s")) {
		player.move(0,1)
	}
	if (keyboard.keyState("a")) {
		player.move(-1,0)
	}
	if (keyboard.keyState("d")) {
		player.move(1,0)
	}
	if (keyboard.pollKey(" ") && !casting.active && !line.active) {casting.update()}
	if (keyboard.keyState(" ")) {
		if (line.active) {
			line.pull()
			keyboard.pollKey(" ")
		} else if (casting.active)  {
			casting.update()
		}
	} else if (casting.active) {
		casting.finish()
	}
	if (line.active) line.update()
	map.update()
}

drawCaughtFish = function(fish) {
	var fw = ctx.measureText(fish.type).width
	var fh = 10;
	var cx = (map.width/2)*SCALE
	var cy = (map.height/2)*SCALE
	ctx.fillStyle = "black"
	ctx.fillRect(cx-(fw),cy-(fh),fw*2,fh*2)
	ctx.strokeStyle = "white"
	ctx.strokeRect(cx-(fw),cy-(fh),fw*2,fh*2)
	ctx.fillStyle = "white"
	ctx.fillText(fish.type,cx-(fw/2),cy+(fh/2))
}

draw = function() {
	map.draw()
	player.draw()
	if (line.active) line.draw()
	if (casting.active) casting.draw()
}

loop = function() {
	requestAnimationFrame(loop)
	if (player.caughtFish) {
		drawCaughtFish(player.caughtFish)
		if (keyboard.pollKey(" ")) {
			if (player.addToBucket(player.caughtFish)) {//will return true if successfully added to the bucket
				player.caughtFish.active = false//set the fish to be removed from the lake
			}
			player.caughtFish = false//clear the fish being caught
		}
		if (keyboard.pollKey("escape")) {
			//player.addToBucket(player.caughtFish)
			player.caughtFish = false
		}
	} else {
		update()
		draw()
	}
}

window.onload = init;
