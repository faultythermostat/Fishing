class _key {
	constructor(ky,fp=true) {
		this.key = ky;
		this.status = false;
		this.triggered = false;
		this.flipFlop = fp;
	}
	poll = function(resetter=true) {
		if (this.triggered==true) {
			if (resetter) this.triggered = false;
			return true;
		}
		return false;
	}
	get state() {
		return this.status;
	}
	keyDown(repeat) {//repeat is true if the keypress was fired by holding the key down
		if (!(this.flipFlop && repeat)) {
			this.status = true;
			this.triggered = true;
			return;
		}
	}
	keyUp() {
		this.status = false;
		return;
	}
}

class _keyboard {
	constructor() {
		addEventListener("keydown",this.keyDown.bind(this));
		addEventListener("keyup",this.keyUp.bind(this));
		this.keys = []
	}
	keyDown(e) {
		if (!this.keys.some(a=>e.key.toLowerCase()==a.key)) this.addKey(e.key.toLowerCase())//check if the key doesnt exist already
		this.callKey(e.key.toLowerCase()).keyDown(e.repeat)
	}
	keyUp(e) {
		if (!this.keys.some(a=>e.key.toLowerCase()==a.key)) this.addKey(e.key.toLowerCase())//check if the key doesnt exist already
		this.callKey(e.key.toLowerCase()).keyUp(e.repeat)
	}
	callKey(ky) {
		if (!this.keys.some(a=>ky.toLowerCase()==a.key)) this.addKey(ky.toLowerCase())//check if the key doesnt exist already
		return this.keys.find(a=>ky==a.key)
	}
	addKey(ky,fp=false) {
		this.keys.push(new _key(ky,fp))
	}
}

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
