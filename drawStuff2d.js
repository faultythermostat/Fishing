//color scaler function (b-w scale)

var c = document.getElementById("Canvas");
ctx = c.getContext("2d");

ctx.init = function() {
	//make the size changable as a parameter?
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	SCREENWIDTH = window.innerWidth;
	SCREENHEIGHT = window.innerHeight;
	//camera = new _camera(new _VECTOR3D(0,0,0));
	return true;
}
ctx.changeFontSize = function(ns=12) {
	for (var i=0;i<ctx.font.length;i++) {
		if (isNaN(ctx.font.charAt(i))) {
			ctx.font = ns+ctx.font.substr(2)
		}
	}
}
ctx.strokeCircle = function(x,y,r,color="white") {
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*2);
	ctx.strokeStyle = color
	ctx.stroke()
}
ctx.clearScreen = function() {
	ctx.clearRect(0,0,SCREENWIDTH,SCREENHEIGHT);
}
ctx.setColor = function(col) {
	ctx.strokeStyle = col
	ctx.fillStyle = col
}
ctx.init()
