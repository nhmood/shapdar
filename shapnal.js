// shapnal
// Shape Contour Signal Graph
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// [todo] - Use more complex method to find center of shape
//		  - Currently just using click but maybe use skeleton method
//		  - http://stackoverflow.com/questions/1203135/what-is-the-fastest-way-to-find-the-center-of-an-irregularly-shaped-polygon
//		  - Or use simple center of 2d mass with uniform density

// cid = canvas id
// cheight = canvas height
// cwidth = canvas width
// lstyle = line style
// lwidth = line width
// ccol = center color
// crad = center radius

function Shape(cid, cheight, cwidth, lstyle, lwidth, ccol, crad)  {
	// Grab canvas by ID, use "shape" as default
	this.cID = typeof(cid) === "undefined" ? "shape" : cid;
	this.canvas = document.getElementById(this.cID);
	
	// Add event handlersr for mouse actions
	// Use .bind(this) to scope "this" to Shape not canvas
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
	this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
	this.canvas.addEventListener("mouseup"  , this.mouseUp.bind(this)); 

	// Set size of canvas, use 400x400 as default
	this.canvas.width  = typeof(cwidth)  === "undefined" ? 400 : cwidth;
	this.canvas.height = typeof(cheight) === "undefined" ? 400 : cheight;

	// Get context of canvas for path drawing
	this.ctx = this.canvas.getContext("2d");

	this.ctx.strokeStyle = typeof(lstyle) === "undefined" ? "black" : lstyle;
	this.ctx.lineWidth   = typeof(lwidth) === "undefined" ?    3    : lwidth;

	// Create contour object to hold contour, gets populated from mouse events
	this.contour = new Contour();

	// ==================
	// Internal flags
	// ==================

	// drawEnable - Flag for when mouse movement registers drawing
	// drawComplete - Flag for when drawing is completed
	this.drawEnable = 0;
	this.drawComplete = 0;

	// Center point for shape that line is drawn from
	this.centerX = 0;
	this.centerY = 0;

	this.ccol = typeof(ccol) === "undefined" ? "FF0000" : ccol;
	this.crad = typeof(crad) === "undefined" ?     5    : crad;


}

Shape.prototype.mouseDown = function(e){
	// If we haven't drawn our shape yet, draw our shape!
	if (!this.drawComplete){
		// Enable drawing for mousemove listener
		this.drawEnable = 1;

		// Add starting points to contour
		this.contour.addPoint(e.offsetX, e.offsetY);
		this.ctx.beginPath();
		this.ctx.moveTo(e.offsetX, e.offsetY);
	}
	// If shape is drawn and mouse is clicked, register new center point
	else {
		// Set center for this instance
		this.centerX = e.offsetX;
		this.centerY = e.offsetY;

		// Clear entire canvas, restore original shape, and place no center
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.restore();
		this.ctx.stroke();

		// Draw center point
		this.ctx.moveTo(this.centerX, this.centerY);
		this.ctx.fillStyle = this.ccol;
		this.ctx.fillRect(this.centerX, this.centerY, this.crad, this.crad);
	}


};

Shape.prototype.mouseMove = function(e){
	// If drawing is enabled, draw the line\
	if (this.drawEnable){

		// Store coords at mouse location 
		var x = e.offsetX;
		var y = e.offsetY;

		// Add this point to our contour
		this.contour.addPoint(x, y);

		// Draw the point itself
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
	}

};

Shape.prototype.mouseUp = function(e){
	if (this.drawEnable){
		// Store coords at mouse location
		var x = e.offsetX;
		var y = e.offsetY;

		// Need a sufficiently sized shape
		// Also prevents accidental clicks
		if (this.contour.points.length > 10){
			// Add this current point to connect last to this
			// Then add initial point again to get contour for closePath
			this.contour.addPoint(x, y);
			this.contour.addPoint(this.contour.startX, this.contour.startY);

			// Finish line contour and save it
			this.ctx.lineTo(this.contour.startX, this.contour.startY);
			this.ctx.stroke();
			this.ctx.closePath();

			// Save path for redrawing after
			this.ctx.save();

			this.drawEnable = 0;
			this.drawComplete = 1;
		}
		// If not big enough, reset canvas, allow drawing, and reset params
		else {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.contour = new Contour();
			this.drawEnable = 0;
			this.drawComplete = 0;
		}
	}
};



function Contour(startx, starty) {
	this.startX = typeof(startx) === "undefined" ? 0 : startx;
	this.startY = typeof(starty) === "undefined" ? 0 : starty;
	this.endX = 0;
	this.endY = 0;

	this.points = new Array();
}

Contour.prototype.addPoint = function(x, y){
	// If this is the first point to be added, set as startXY also
	if (this.points.length == 0){
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

			interp.push([x, y]);
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
			interp.push([x, y]);
		}
	}

	return interp;
}





// Testing
var test = new Shape();
var test2 = new Shape("shape", 400, 400);
var test3 = new Shape("circle", 300, 300);

console.log(Shape);
console.log(test);
console.log(test2);

