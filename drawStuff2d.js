var c = document.getElementById("Canvas");//init canvas
ctx = c.getContext("2d");

ctx.init = function() {
	ctx.canvas.width = window.innerWidth;//set canvas size to fill window
	ctx.canvas.height = window.innerHeight;
	SCREENWIDTH = window.innerWidth;//create global width and height vars
	SCREENHEIGHT = window.innerHeight;
	return 1;
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
