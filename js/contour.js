// contour.js
// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// Contour creation
function Contour(startx, starty) {
	this.startX = typeof(startx) === "undefined" ? 0 : startx;
	this.startY = typeof(starty) === "undefined" ? 0 : starty;
	this.endX = 0;
	this.endY = 0;

	this.points = new Array();
}

Contour.prototype.addPoint = function(x, y, override){
	// If this is the first point to be added, set as startXY also
	// unless override flag is passed to addPoint
	if (this.points.length == 0 && override !== 'undefined'){
		this.points.push([x, y]);
		this.startX = x;
		this.startY = y;
	}
	else {
		// Get the last points in the array
		// Get interpolated array using x, y values
		// Concatenate to points array
		var prev = this.points[this.points.length - 1];
		var interp = this.pointInterp(prev[0], prev[1], x, y);
		this.points = 	this.points.concat(interp);

	}
};

Contour.prototype.pointInterp = function(startX, startY, endX, endY){
	// To interpolate, draw straight line between given points
	// Use y = mx + b to calculate all points in between

	var interp = new Array();
	
	// Make sure we don't divide by 0!
	var m = 0;
	if (endX != startX){
		m = (endY - startY) / (endX - startX);
	} 


	var b = endY - (m * endX);
	// Interpolate points for axis with smallest difference
	// If xdif is bigger than ydif, traverse x and get all the y points
	if (Math.abs(endX - startX) > Math.abs(endY - startY)){
		// Points need to be generated in the correct direction
		// If x2 is larger, then we are moving right, else left
		var xDir = endX > startX ? 1 : -1;
		
		// Probably shouldn't use != in for comparison but
		// its the only way to not have separate for statements
		// Add xDir to last point to make inclusive
		var y = 0;
		for (var x = startX; x != (endX + xDir); x += xDir){
			// If slope is inf or 0, then the Y stays the same
			y = startY;
			if (m != 0){
				y = (m * x) + b;
			}

			interp.push([Math.round(x), Math.round(y)]);
		}
	}
	// If xdif is smaller than ydif, traverse y and get all the y points
	else {
		// Points need to be generated in the correct direction
		// If y2 is larger, then we are moving right, else left
		var yDir = endY > startY ? 1 : -1;

		// Probably shouldn't use != in for comparison but
		// its the only way to not have separate for statements
		// Add yDir to last point to make inclusive
		var x = 0;
		
		for (var y = startY; y != (endY + yDir); y += yDir){

			// If slope is inf or 0, then the X stays the same
			x = startX;
			if (m != 0){
				x = (y - b)/m;
			}
			interp.push([Math.round(x), Math.round(y)]);
		}
	}

	return interp;
}
