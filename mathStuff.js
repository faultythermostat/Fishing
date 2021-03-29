Math.distance = function(a,b) {
	return Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y)))
}
Math.angle = function(a,b) {
	return Math.atan2(b.y-a.y,b.x-a.x)
}
