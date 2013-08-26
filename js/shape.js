// shape.js
// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS

// did = div id
// cheight = canvas height
// cwidth = canvas width
// lstyle = line style
// lwidth = line width
// ccol = center color
// crad = center radius

function Shape(did, cheight, cwidth, lstyle, lwidth, ccol, crad)  {
	// Grab canvas by ID, use "shape" as default
	this.cID = typeof(did) === "undefined" ? "" : did;
	// Use JQuery selector to get the .shape class within the specified div
	this.canvas = $(did + ' .shape')[0];

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

	// Line parameters default
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
	this.centerValid = 0;
	this.centerX = 0;
	this.centerY = 0;

	// Make center point red always (gets changed to black when color is red though)
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
		this.ctx.moveTo(e.offsetX, e.offsetY);
	}
	// If shape is drawn and mouse is clicked, register new center point
	else {
		// We now have a valid center point 
		this.centerValid = 1;

		// Set center for this instance
		this.centerX = e.offsetX;
		this.centerY = e.offsetY;

		// Clear canvas, restore original shape, and place new center
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawContour();

		// Draw center point
		this.ctx.fillStyle = this.ccol;
		this.ctx.fillRect(this.centerX - this.crad/2, this.centerY - this.crad/2, this.crad, this.crad);
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

		// Draw the point itself using a path
		// We need this to be done instantaneously for the user
		// So using a path is better than drawing each individual contour point
		// We will draw actual contour points as rectangles after full path is done
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

			// Draw contour using actual rectangles then save context so we can
			// redraw this every frame next time 
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.drawContour();

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

Shape.prototype.drawContour = function(e){
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// Check if we have a contour to use
	// Short circuit with || will make sure second statement doesn't cause error
	if (typeof this.contour === 'undefined' || this.contour.points.length == 0){
		console.log("Uh oh, looks like there isn't a contour to draw");
		return;
	}

	// If we have valid contour, draw it
	for (var i = 0; i < this.contour.points.length; i++){
		this.ctx.fillStyle = this.ctx.strokeStyle;
		// Had to shift both dimensions by 2 pixels to line up with path line???
		this.ctx.fillRect(this.contour.points[i][0]-2, this.contour.points[i][1]-2, this.ctx.lineWidth, this.ctx.lineWidth+1);
	}
}

Shape.prototype.drawCenter = function(e){
	this.ctx.fillStyle = this.ccol;
	this.ctx.fillRect(this.centerX - this.crad/2, this.centerY - this.crad/2, this.crad, this.crad);
}


Shape.prototype.animate = function(index){
	var index = index % this.contour.points.length;

	// Clear canvas and redraw contour	
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawContour();
	
	// Draw a line from	center to next point
	this.ctx.beginPath();
	this.ctx.moveTo(this.centerX, this.centerY);
	this.ctx.lineTo(this.contour.points[index][0], this.contour.points[index][1]);
	this.ctx.stroke();
	this.ctx.closePath();
	this.drawCenter();
}


Shape.prototype.borderLine = function(index){
	var index = index % this.contour.points.length;
	// Draw line from contour to edge (to match GIF) if Y animation
	// Was using lineTo before but wasn't matching up right, using fillRect now
	// Fill rect from current x position to width of canvas @ y position
	for (var i = this.contour.points[index][0]; i < this.canvas.width; i++){
		this.ctx.fillStyle = this.ctx.strokeStyle;
		this.ctx.fillRect(i, this.contour.points[index][1], this.ctx.lineWidth, this.ctx.lineWidth);
	}

	// Fill in intersection point with dot
	this.ctx.fillStyle = this.ccol;
	this.ctx.fillRect(this.contour.points[index][0]-2.5, this.contour.points[index][1]-2.5, 5, 5);

}