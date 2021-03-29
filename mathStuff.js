//class type code storage:
VECTOR2D = "VEC2";
VECTOR3D = "VEC3";
//////////////////////////

Math.distance = function(a,b) {
	return Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y)))
}
Math.angle = function(a,b) {
	return Math.atan2(b.y-a.y,b.x-a.x)
}

_VECTOR3D = function(x=null,y=null,z=null) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.type = VECTOR3D;
}
_VECTOR3D.prototype.add = function(a) {
	return new _VECTOR3D(this.x+a.x,this.y+a.y,this.z+a.z);
}
_VECTOR3D.prototype.subtract = function(a) {
	return new _VECTOR3D(this.x-a.x,this.y-a.y,this.z-a.z);
}
_VECTOR3D.prototype.magnitude = function() {
	return Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));
}
_VECTOR3D.prototype.dot = function(a) {
	return (this.x*a.x)+(this.y*a.y)+(this.z*a.z);
}
_VECTOR3D.prototype.cross = function(a) {
	return new _VECTOR3D(
		this.y * a.z - this.z * a.y,
    	this.z * a.x - this.x * a.z,
    	this.x * a.y - this.y * a.x
	)
}
_VECTOR3D.prototype.multiply = function(a) {
	return new _VECTOR3D(
		this.x * a,
    	this.y * a,
    	this.z * a
	)
}

_VECTOR2D = function(x=null,y=null) {
	this.x = x;
	this.y = y;
	this.type = VECTOR2D;
}
_VECTOR2D.prototype.add = function(a) {
	return new _VECTOR2D(this.x+a.x,this.y+a.y);
}

Math.rotatePoint = function(p, c, angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var nx = (cos * (p.x - c.x)) + (sin * (p.y - c.y)) + c.x;
        var ny = (cos * (p.y - c.y)) - (sin * (p.x - c.x)) + c.y;
    return new _VECTOR3D(nx,ny,p.z);
}
Math.rotate3DPoint = function(p, c, pitch, roll, yaw) {
	var rp = Math.yawPoint({x:p.x-c.x,y:p.y-c.y,z:p.z-c.z},yaw);
	var rp2 = Math.pitchPoint(rp,pitch);
	var rp3 = Math.rollPoint(rp2,roll);
	return new _VECTOR3D(rp3.x+c.x,rp3.y+c.y,rp3.z+c.z)
}
Math.rollPoint = function(p, roll) {
    var cosc = Math.cos(roll);
    var sinc = Math.sin(roll);
	
	return {x:(p.x),y:(cosc*p.y + (-sinc)*p.z),z:(sinc*p.y + cosc*p.z)};
}
Math.pitchPoint = function(p,pitch) {
    var cosb = Math.cos(pitch);
    var sinb = Math.sin(pitch);

    var Axx = cosb;
    var Axz = sinb;

    var Azx = -sinb;
    var Azz = cosb;

    var px = p.x
    var py = p.y
    var pz = p.z
	
	var rp = {};

	rp.x = (Axx*px + Axz*pz)
    rp.y = (py)
    rp.z = (Azx*px + Azz*pz)
	
	return rp;
}
Math.yawPoint = function(p, yaw) {
    var cosa = Math.cos(-yaw);
    var sina = Math.sin(-yaw);

    var Axx = cosa;
    var Axy = -sina;

    var Ayx = sina;
    var Ayy = cosa;
	
    var px = p.x;
    var py = p.y;
    var pz = p.z;
	
	var rp = {};

	rp.x = (Axx*px + Axy*py);
    rp.y = (Ayx*px + Ayy*py);
    rp.z = (pz);
	
	return rp;
}

Math.cot = function(a) {
   return 1/Math.tan(a);
}

Math.pointInTriangle = function(pt, tr)
{
	function sign(p1,p2,p3)
	{
	    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	}

    var d1 = sign(pt, tr.p1, tr.p2);
    var d2 = sign(pt, tr.p2, tr.p3);
    var d3 = sign(pt, tr.p3, tr.p1);

   	var has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    var has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

Math.eulerToVector = function(a) { //WIP
		return new _VECTOR3D(
			-Math.cos(a.yaw)*Math.sin(a.pitch)-Math.sin(a.yaw),
			-Math.sin(a.yaw)*Math.sin(a.pitch)+Math.cos(a.yaw),
			Math.cos(a.pitch)
		)
}
Math.rayTriangleIntersection = function(rayOrigin,rayVector,inTriangle) {
	kEpsilon = 0.0000000001;
    v0v1 = inTriangle.p2.subtract(inTriangle.p1);
    v0v2 = inTriangle.p3.subtract(inTriangle.p1);
    pvec = rayVector.cross(v0v2);
	det = v0v1.dot(pvec);
    // if the determinant is negative the triangle is backfacing
    // if the determinant is close to 0, the ray misses the triangle
    if (det < kEpsilon) return false;
    // ray and triangle are parallel if det is close to 0
    if (Math.abs(det) < kEpsilon) return false;
    invDet = 1 / det;
 
    tvec = rayOrigin.subtract(inTriangle.p1);
    u = tvec.dot(pvec) * invDet;
    if (u < 0 || u > 1) return false;
 
    qvec = tvec.cross(v0v1);
    v = rayVector.dot(qvec) * invDet;
    if (v < 0 || u + v > 1) return false;
 
    t = v0v2.dot(qvec) * invDet;
 
    return true;
}

Math.average = function(a) {
	var b=0;
	for (var i=0;i<a.length;i++) {
		b+=a[i]
	}
	return b/a.length
}
