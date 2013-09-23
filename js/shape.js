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

function Shape(did, cheight, cwidth, lstyle, lwidth, ccol, crad, grid)  {
	// Grab canvas by ID, use "shape" as default
	this.dID = typeof(did) === "undefined" ? "" : did;
	// Use JQuery selector to get the .shape class within the specified div
	this.canvas = $(this.dID + ' .shape')[0];

	// Add event handlersr for mouse actions
	// Use .bind(this) to scope "this" to Shape not canvas
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
	this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
	this.canvas.addEventListener("mouseup"  , this.mouseUp.bind(this)); 
	
	// Shift key listener should be added to window, not canvas
	window.addEventListener("keydown", this.keyDown.bind(this));
	window.addEventListener("keyup"  , this.keyUp.bind(this));
	// Set size of canvas, use 400x400 as default
	this.canvas.width  = typeof(cwidth)  === "undefined" ? 400 : cwidth;
	this.canvas.height = typeof(cheight) === "undefined" ? 400 : cheight;

	// Grid size, default = 10 per dimension and grid flag
	this.gridSize = typeof(grid) === "undefined" ? 5 : grid;
	this.gridEnable = 0;

	// Get context of canvas for path drawing
	this.ctx = this.canvas.getContext("2d");

	// Line parameters default
	this.ctx.strokeStyle = typeof(lstyle) === "undefined" ? "#c95f5e" : lstyle;
	this.ctx.lineWidth   = typeof(lwidth) === "undefined" ?    3      : lwidth;

	// Create contour object to hold contour, gets populated from mouse events
	this.contour = new Contour();

	// ==================
	// Internal flags
	// ==================

	// drawEnable - Flag for when mouse movement registers drawing
	// drawComplete - Flag for when drawing is completed
	this.drawEnable = 0;
	this.drawComplete = 0;

	// straightDraw - Flag when shift key held down to draw straight lines
	this.straightDraw = 0;
	this.straightDir = new Array();

	// Center point for shape that line is drawn from
	this.centerValid = 0;
	this.centerX = 0;
	this.centerY = 0;

	// Make center point red always (gets changed to black when color is red though)
	this.ccol = typeof(ccol) === "undefined" ? "#0099ff" : ccol;
	this.crad = typeof(crad) === "undefined" ?     5    : crad;

	// Default Shape drawing function
	this.shapeDraw = this.freeDraw;
};


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
	// If drawing is enabled, draw the line
	if (this.drawEnable){
		// Store coords at mouse location 
		var x = e.offsetX;
		var y = e.offsetY;

		// Run current drawing function with state = 0 --> mouseMove
		this.shapeDraw(x, y, 0);		
	}
};


Shape.prototype.mouseUp = function(e){
	if (this.drawEnable){
		// Store coords at mouse location
		var x = e.offsetX;
		var y = e.offsetY;

		// Run current drawing function with state = 1 --> mouseUp
		this.shapeDraw(x, y, 1);
		
	}
};

Shape.prototype.keyDown = function(e){
	if (e.keyCode == 16){
		console.log("Shift key down");
		this.straightDraw = 1;
		//this.straightX = this.contour.points.slice(-1)[0][0];
		//this.straightY = this.contour.points.slice(-1)[0][1];
	}			
}

Shape.prototype.keyUp = function(e){
	if (e.keyCode == 16){
		console.log("Shift key up");
		this.straightDraw = 0;
		this.straightX = 0;
		this.straightY = 0;
	}			
}


Shape.prototype.squareDraw = function(x, y, state){
	// If called on mouseMove
	if (state == 0){
		// Clear the canvas and draw box from mouseDown point to current coords
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	
		
		this.ctx.beginPath();
		// Draw from origin -> straight vertical line (shift y)
		this.ctx.moveTo(this.contour.startX, this.contour.startY);
		this.ctx.lineTo(this.contour.startX, y);
		// Draw from origin -> straight horizontal line (shift x)
		this.ctx.moveTo(this.contour.startX, this.contour.startY);
		this.ctx.lineTo(x, this.contour.startY);
		// Draw from origin x / new y -> horizontal line (shift x)
		this.ctx.moveTo(this.contour.startX, y);
		this.ctx.lineTo(x, y);
		// Draw from origin y / new x -> vertical line (shift y)
		this.ctx.moveTo(x, this.contour.startY);
		this.ctx.lineTo(x, y);

		// Stroke so its visible
		this.ctx.stroke();
	}
	// If called on mouseUp
	else {
		// Now we just have to use contour.addPoint on the 4 coords
		// and it SHOULD interpolate the line for us!
		// Add points in clockwise fashion
		this.contour.addPoint(x, this.contour.startY);
		this.contour.addPoint(x, y);
		this.contour.addPoint(this.contour.startX, y);
		this.contour.addPoint(this.contour.startX, this.contour.startY);

		// Need a sufficiently sized shape
		// Also prevents accidental clicks
		if (this.contour.points.length > 10){
			// Draw contour using actual rectangles
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.drawContour();

			// Stop drawing
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
}


Shape.prototype.circleDraw = function(x, y, state){
	// If called on mouseMove
	if (state == 0){
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	
		
		// We can draw a circle with mouseDown being the center and the larger
		// of x/y being the radius, where radius is distance from center to new x/y
		var radiusX = Math.abs(this.contour.startX - x);
		var radiusY = Math.abs(this.contour.startY - y);

		// Because we are drawing this every mouseMove, keep it simple and just use canvas arc
		// Use startX/Y, biggest radius (X/Y), full 360 arc, and clockwise drawing
		this.ctx.beginPath();
		this.ctx.arc(this.contour.startX, this.contour.startY, Math.max(radiusX, radiusY), 0, 360, false);
		this.ctx.stroke();
	}
	// If called on mouseUp
	else {
		// Store the center points as we need them, but don't want them in our contour
		var startX = this.contour.startX;
		var startY = this.contour.startY;

		// Clear the contour and calculate new radii based on distance from center to current x/y
		this.contour = new Contour();
		var radiusX = Math.abs(startX - x);
		var radiusY = Math.abs(startY - y);


		// We know the radius and the angle so lets use some good ol' trig! 
		// SOH-CAH-TOA! Just SOH and CAH really...sorry TOA
		// SOH => Sin(angle) = Opposite / Hypotenuse
		// CAH => Cos(angle) = Adjacent / Hypotenuse
		// Opposite = height(y), Adjacent = width(x), Hypotenuse = radius()

		// Math.sin(x) takes its input in degrees radian,
		// so gotta convert degrees to rad

		// Go through entire 360 degrees of the circle
		for (var i = 1; i < 360; i++){
			// Convert degree to rad
			var rad = i * (Math.PI / 180);

			// Calculate x and y of point on circle using SOH (for x) and CAH (for y)
			var xC = Math.cos(rad) * Math.max(radiusX, radiusY); 
			var yC = Math.sin(rad) * Math.max(radiusX, radiusY);

			// Add points to the contour
			this.contour.addPoint(Math.round(xC)+startX, Math.round(yC)+startY);
		}


		// Need a sufficiently sized shape
		// Also prevents accidental clicks
		if (this.contour.points.length > 10){
			// Draw contour using actual rectangles
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.drawContour();

			// Drawing complete
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



Shape.prototype.freeDraw = function(x, y, state){
	// If called on mouseMove 
	if (state == 0){
		// If shift key is pressed, we are in straight edge mode
		// Lock down first dimension to show movement (x / y)
		// Only do this if we already have established movement
		if ((this.straightDraw == 1) && (this.contour.points.length != 0)) {

			// Get distance from last x/y positions
			var xD = Math.abs(x - this.contour.points.slice(-1)[0][0]);
			var yD = Math.abs(y - this.contour.points.slice(-1)[0][1]);

			// Depending on which is bigger, freeze the opposite direction
			this.straightDir = xD > yD ? [0, y] : [1, x];

			// Increment this so we can lock the position and not repeat this part
			// of the check
			this.straightDraw++;
		}

		// If we already locked on a dimension
		if ((this.straightDraw == 2)){
			// If the direction we determined is x (lock y)
			if (this.straightDir[0] == 0){
				// Set the Y coord to what we froze it to
				y = this.straightDir[1];
			}
			else {
				// Else set the X coord to waht we froze it to
				x = this.straightDir[1];
			}
		}


		// Add this point to our contour
		this.contour.addPoint(x, y);

		// Draw the point itself using a path
		// We need this to be done instantaneously for the user
		// So using a path is easier than drawing each individual contour point
		// We will draw actual contour points as rectangles after full path is done
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
	}
	else {
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

			// Draw contour using actual rectangles
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.drawContour();

			// Drawing complete
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
	this.drawGrid();
	
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
		this.ctx.fillRect(i, this.contour.points[index][1]-(this.ctx.lineWidth/2), this.ctx.lineWidth, this.ctx.lineWidth);
	}

	// Fill in intersection point with dot
	this.ctx.fillStyle = this.ccol;
	this.ctx.fillRect(this.contour.points[index][0]-2.5, this.contour.points[index][1]-2.5, 5, 5);
}


Shape.prototype.drawGrid = function(e){
	if (this.gridEnable){
		this.ctx.beginPath();
		// Draw Y axis grids
		for (var i = 0; i < Math.round(this.canvas.width / this.gridSize); i++){
			this.ctx.moveTo(i*(Math.round(this.canvas.width / this.gridSize)), 0);
			this.ctx.lineTo(i*(Math.round(this.canvas.width / this.gridSize)), this.canvas.height);
		}

		// Draw X axis grids
		for (var i = 0; i < Math.round(this.canvas.height / this.gridSize); i++){
			this.ctx.moveTo(0, i*(Math.round(this.canvas.height / this.gridSize)));
			this.ctx.lineTo(this.canvas.height, i*(Math.round(this.canvas.height / this.gridSize)));
		}

		// Store previous line width and style so we don't mess up our actual shape
		var prevWidth = this.ctx.lineWidth;
		var prevStyle = this.ctx.strokeStyle;

		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = "#000000";
		this.ctx.stroke();
		
		// Reset our previous line style and width
		this.ctx.lineWidth = prevWidth;
		this.ctx.strokeStyle = prevStyle;
	}
}


// Reset shape to defaults and blank canvas
Shape.prototype.reset = function(lstyle, lwidth, ccol, crad){

	// Reset line style
	this.ctx.strokeStyle = typeof(lstyle) === "undefined" ? "#c95f5e" : lstyle;
	this.ctx.lineWidth   = typeof(lwidth) === "undefined" ?    3      : lwidth;

	// Restore contour
	this.contour = new Contour();

	// Restore drawing function
	this.shapeDraw = this.freeDraw;

	// Reset drawing flags
	this.drawEnable = 0;
	this.drawComplete = 0;

	// Reset center points
	this.centerValid = 0;
	this.centerX = 0;
	this.centerY = 0;

	// Reset center colors (not really necessary)
	this.ccol = typeof(ccol) === "undefined" ? "#0099ff" : ccol;
	this.crad = typeof(crad) === "undefined" ?     5    : crad;

	// Clear canvas and remove any existing paths
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.beginPath();
}