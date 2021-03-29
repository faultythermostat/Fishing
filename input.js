//to do:::
//per button dragging? (dragging would eiher be different arrays per button or all buttons would activate the same dragging) {TEST WITH A REGULAR MOUSE FIRST}
//handle off screen draggin (cancels all buttons)
//comment
//request state of "any" key/button or "all"
//flipflop to repeats
//store last states of key/button
//drag offset return function

//multitouch handler (same as mouse but with extra event handlers for gestures)

//make a better version with prototypes intead of static objects

//add "onKeydown" function etc. to run inside of the event instead of a seperate function

//dynamic key adding option to add keys that are pressed to the keys list





//things to remember:
//mouse buttons dont fire more than once when holding, unlike keyboard keys that fire every few milliseconds when held down
	//this means that the mouse doesnt need flipflop variables
//debugging within poll and state requesters happens too often and is way too much
	//debugging will have 3 levels
	//debugging max will debug requesters






/* KEYBOARD USAGE

keyboard.init(); //initializes the event listeners
keyboard.addKeys([{ //adds buttons (must be an object [or multiple] inside an array)
	key:"a", //char will get converted to lowercase
	flipFlop:false //whether to register press down as a continuous stream of fires or as one fire
}]);
keyboard.pollKey("a"); //returns whether the key has been pressed since the last poll (once called, resets the poll state to false unless false is also passed)
keyboard.keyState("a"); //returns current key state

///key examples:///
	a-z: 	"a","A"
	0-9: 	"0","9"
	[] : 	"[","]"
	space: 	" "
	enter: 	"Enter","enter"
	F1-F12:	"F1","f1"
	arrows: "arrowup","arrowdown"

*/

keyboard = {
	keys:[],
	initTime:-1,
	pollKey:function(ktp,resetter=true) { //if you dont want to reset the poll, pass false
		for (var i=0;i<keyboard.keys.length;i++) {
			if (keyboard.keys[i].key.toLowerCase()==ktp.toLowerCase()) {
				return keyboard.keys[i].poll(resetter);
			}
		}
		return null;
	},
	keyState:function(ktp) {
		for (var i=0;i<keyboard.keys.length;i++) {
			if (keyboard.keys[i].key.toLowerCase()==ktp.toLowerCase()) {
				return keyboard.keys[i].getState();
			}
		}
		return null;
	},
	keyDown:function(e) {
		for (var i=0;i<keyboard.keys.length;i++) {
			if (e.key.toLowerCase()==keyboard.keys[i].key.toLowerCase()) {
				if (!(keyboard.keys[i].flipFlop && e.repeat)) {
					keyboard.keys[i].status = true;
					keyboard.keys[i].triggered = true;
					keyboard.keys[i].timeStamp = e.timeStamp;
					return;
				}
			}
		}
	},
	keyUp:function(e) {
		for (var i=0;i<keyboard.keys.length;i++) {
			if (e.key.toLowerCase()==keyboard.keys[i].key.toLowerCase()) {
				keyboard.keys[i].status = false;
				keyboard.keys[i].timeStamp = e.timeStamp;
				return;
			}
		}
	},
	init:function() {
		addEventListener("keydown",keyboard.keyDown);
		addEventListener("keyup",keyboard.keyUp);
		keyboard.initTime = Date.now();
	},
	keyConstructor:function(ky,fp) {
		this.key = ky;
		this.status = false;
		this.triggered = false;
		this.timeStamp = -1;
		this.flipFlop = fp;
		this.poll = function(resetter=true) {
			if (this.triggered==true) {
				if (resetter) this.triggered = false;
				return true;
			}
			return false;
		}
		this.getState = function() {
			return this.status;
		}
	},
	addKeys:function(keys) {
		for (var i=0;i<keys.length;i++) {
			keyboard.keys.push(
				new keyboard.keyConstructor(keys[i].key.toLowerCase(),keys[i].flipFlop)
			)
		}
	}
}

/*

mouse.init(); //initializes the event listeners (add false param. to ignore mouse movements)
mouse.addButtons([{ //adds buttons (must be an object [or multiple] inside an array)
	button:0, //0 is left, 1 middle, 2 right
}]);
mouse.pollButton(0); //returns whether the button has been pressed since the last poll (once called, resets the poll state to false unless false is also passed)
mouse.buttonState(0); //returns current button state

*/
mouse = {
	buttons:[],
	initTime:-1,
	location:{x:0,y:0},
	wheel:{position:0,lastDeltaY:0,timeStamp:-1,reset:function(){mouse.wheel.position=0}},
	lastClickLocation:{x:null,y:null},
	dragging:false,
	moved:false,
	dragLocations:[],
	getLocation:function() {
		return mouse.location;
	},
	wasMoved:function(ignoreReset=false) {
		if (mouse.moved) {
			if (!ignoreReset) mouse.moved = false;
			return true;
		}
		return false;
	},
	getClickLocation:function() {
		return mouse.lastClickLocation;
	},
	pollButton:function(btp,resetter=true) {
		for (var i=0;i<mouse.buttons.length;i++) {
			if (mouse.buttons[i].button==btp) {
				return mouse.buttons[i].poll(resetter);
			}
		}
		return null;
	},
	buttonState:function(btp) {
		for (var i=0;i<mouse.buttons.length;i++) {
			if (mouse.buttons[i].button==btp) {
				return mouse.buttons[i].getState();
			}
		}
		return null;
	},
	mouseMove:function(e) {
		mouse.location.x = e.clientX;
		mouse.location.y = e.clientY;
		mouse.moved = true;
		mouse.location.timeStamp = e.timeStamp;
		for (var i=0;i<mouse.buttons.length;i++) {
			if (mouse.buttons[i].getState()) {
				if (!mouse.dragging) { //just started dragging
					mouse.dragLocations.push({x:mouse.lastClickLocation.x,y:mouse.lastClickLocation.y});
					mouse.dragLocations = [];
				}
				mouse.dragging = true;
				break;
			}
		}
		if (mouse.dragging) {
			mouse.dragLocations.push({x:e.clientX,y:e.clientY});
			return;
		}
	},
	mouseDown:function(e) {
		mouse.location.x = e.clientX;
		mouse.location.y = e.clientY;
		mouse.lastClickLocation.x = e.clientX;
		mouse.lastClickLocation.y = e.clientY;
		for (var i=0;i<mouse.buttons.length;i++) {
			if (e.button==mouse.buttons[i].button) {
				mouse.buttons[i].status = true;
				mouse.buttons[i].triggered = true;
				mouse.buttons[i].timeStamp = e.timeStamp;
				return;
			}
		}
	},
	mouseWheel:function(e) {
		//console.log(e)
		if (!e.ctrlKey) mouse.wheel.position+=e.deltaY
		mouse.wheel.timeStamp = e.timeStamp;
		mouse.wheel.lastDeltaY = e.deltaY;
	},
	mouseUp:function(e) {
		mouse.location.x = e.clientX;
		mouse.location.y = e.clientY;
		var buttonsAreDown = false;
		for (var i=0;i<mouse.buttons.length;i++) {
			if (e.button==mouse.buttons[i].button) {
				mouse.buttons[i].status = false;
				mouse.buttons[i].timeStamp = e.timeStamp;
				continue;
			}
			if (mouse.buttons[i].getState()) {
				buttonsAreDown=true;
				break;
			}
		}
		if (!buttonsAreDown) {
			mouse.dragging = false; //if no buttons are pressed, you must not be dragging anymore
		}
	},
	init:function(initAll=true) { //if you dont want mouse movement events, pass false
		addEventListener("mousedown",mouse.mouseDown);
		addEventListener("mouseup",mouse.mouseUp);
		addEventListener("wheel",mouse.mouseWheel);
		if (initAll) {
			addEventListener("mousemove",mouse.mouseMove);
		}
		mouse.initTime = -1;
	}, //if mouse movement events are ignored, mouse location is still updated when mouse is clicked
	buttonConstructor:function(btn) {
		this.button = btn;
		this.status = false;
		this.triggered = false;
		this.timeStamp = -1;
		this.poll = function(resetter=true) {
			if (this.triggered==true) {
				if (resetter) this.triggered = false;
				return true;
			}
			return false;
		}
		this.getState = function() {
			if (this.status==true) return true;
			return false;
		}
	},
	addButtons:function(buttons) {
		for (var i=0;i<buttons.length;i++) {
			mouse.buttons.push(
				new mouse.buttonConstructor(buttons[i].button)
			)
		}
	}
}


inputTest = {};
inputTest.init = function() {
	keyboard.init();
	keyboard.addKeys([{key:"a",flipFlop:false},{key:"b",flipFlop:true}]);
	console.log("Initiated keys A as a non flipflop key and B as a flipFlop key");
	graph = new Array(SCREENWIDTH);
	graph2 = new Array(SCREENWIDTH);
	graph3 = new Array(SCREENWIDTH);
	graph4 = new Array(SCREENWIDTH);

	mouse.init();
	mouse.addButtons([{button:0}]);
	console.log("Initiated button 0 as a non flipflop button");
	graph5 = new Array(SCREENWIDTH);
	graph6 = new Array(SCREENWIDTH);
	graph7 = new Array(SCREENWIDTH);
	graph8 = new Array(SCREENWIDTH);
	
}
inputTest.loop = function() {
	requestAnimationFrame(inputTest.loop);
	ctx.clearRect(0,0,SCREENWIDTH,SCREENHEIGHT);
	inputTest.keyboardTest();
	inputTest.mouseTest();
}
inputTest.keyboardTest = function() {
	graph.shift();
	graph.push(keyboard.pollKey("a"));
	
	graph2.shift();
	graph2.push(keyboard.keyState("a"));
	
	graph3.shift();
	graph3.push(keyboard.pollKey("b"));
	
	graph4.shift();
	graph4.push(keyboard.keyState("b"));
	
	ctx.beginPath();
	ctx.moveTo(0,10+(graph[0]*5));
	for (var i=1;i<graph.length;i++) {
		ctx.lineTo(i,10+(graph[i]*5));
	}
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,20+(graph2[0]*5));
	for (var i=1;i<graph.length;i++) {
		ctx.lineTo(i,20+(graph2[i]*5));
	}
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,30+(graph3[0]*5));
	for (var i=1;i<graph3.length;i++) {
		ctx.lineTo(i,30+(graph3[i]*5));
	}
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,40+(graph4[0]*5));
	for (var i=1;i<graph4.length;i++) {
		ctx.lineTo(i,40+(graph4[i]*5));
	}
	ctx.stroke();
	
};
inputTest.mouseTest = function() {
	if (mouse.dragLocations.length) {
		ctx.beginPath();
		ctx.moveTo(mouse.dragLocations[0].x,mouse.dragLocations[0].y);
		for (var i=1;i<mouse.dragLocations.length;i++) {
			ctx.lineTo(mouse.dragLocations[i].x,mouse.dragLocations[i].y);
		}
		ctx.stroke();
		ctx.fillText("start",mouse.dragLocations[0].x,mouse.dragLocations[0].y);
		ctx.fillText("end",mouse.dragLocations[mouse.dragLocations.length-1].x,mouse.dragLocations[mouse.dragLocations.length-1].y);
	}
	if (!mouse.buttonState(0)) {
		ctx.beginPath();
		ctx.moveTo(mouse.location.x-10,mouse.location.y);
		ctx.lineTo(mouse.location.x+10,mouse.location.y);
		ctx.moveTo(mouse.location.x,mouse.location.y-10);
		ctx.lineTo(mouse.location.x,mouse.location.y+10);
		ctx.stroke();
	}
	
	graph5.shift();
	graph5.push(mouse.pollButton(0));
	
	graph6.shift();
	graph6.push(mouse.buttonState(0));
	
	graph7.shift();
	graph7.push(mouse.wheel.position/100);
	
	graph8.shift();
	graph8.push(mouse.wasMoved());
	
	ctx.beginPath();
	ctx.moveTo(0,50+(graph5[0]*5));
	for (var i=1;i<graph5.length;i++) {
		ctx.lineTo(i,50+(graph5[i]*5));
	}
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,60+(graph6[0]*5));
	for (var i=1;i<graph6.length;i++) {
		ctx.lineTo(i,60+(graph6[i]*5));
	}
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(0,100+(graph7[0]*5));
	for (var i=1;i<graph7.length;i++) {
		ctx.lineTo(i,100+(graph7[i]*5));
	}
	ctx.stroke();
	ctx.fillText(mouse.wheel.position,SCREENWIDTH-(ctx.measureText(mouse.wheel.position).SCREENWIDTH),98+(graph7[SCREENWIDTH-1]*5))
	
	ctx.beginPath();
	ctx.moveTo(0,110+(graph8[0]*5));
	for (var i=1;i<graph8.length;i++) {
		ctx.lineTo(i,110+(graph8[i]*5));
	}
	ctx.stroke();
};

_FPS = function(sampleRate) {
	this.average = null;
	this.samples = new Array(sampleRate);
	this.samples.fill(0)
	this.startTime = null;
	this.max = null;
	this.min = null;
	this.sampleRate = sampleRate;
}
_FPS.prototype.start = function() {
	this.startTime = Date.now();
}
_FPS.prototype.stop = function() {
	this.samples.push(/*Math.round*/(1/((Date.now()-this.startTime)/1000)));
	this.average = Math.average(this.samples);
	while (this.samples.length>=this.sampleRate) this.samples.shift()
}
_FPS.prototype.draw = function(SCREENWIDTH,SCREENHEIGHT) {
	ctx.strokeStyle = "white";
	ctx.fillStyle = "white";
	ctx.font = "12px sans-serif";
	//ctx.strokeRect(0,12,SCREENWIDTH,SCREENHEIGHT);
	this.max = Math.max(...this.samples);
	this.min = Math.min(...this.samples);
	this.mid = this.average
	yScale = -(SCREENHEIGHT/(this.max-this.min));
	yShift = this.mid;
	xScale = SCREENWIDTH/this.samples.length;
	ctx.fillText(fps.average,2,12);
	ctx.beginPath();
	ctx.moveTo(0,((this.samples[0]-yShift)*yScale)+(12+SCREENHEIGHT/2))
	for (var i=1;i<this.samples.length;i++) {
		ctx.lineTo((i*xScale),((this.samples[i]-yShift)*yScale)+(12+SCREENHEIGHT/2))
	}
	ctx.stroke();
}

