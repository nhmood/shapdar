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
	this.centerValid = 0;
	this.centerX = 0;
	this.centerY = 0;

	this.ccol = typeof(ccol) === "undefined" ? "FF0000" : ccol;
	this.crad = typeof(crad) === "undefined" ?     5    : crad;

	this.counter = 0;

}

Shape.prototype.mouseDown = function(e){
	// If we haven't drawn our shape yet, draw our shape!
	if (!this.drawComplete){
		// Enable drawing for mousemove listener
		this.drawEnable = 1;

		// Add starting points to contour
		this.contour.addPoint(e.offsetX, e.offsetY);
		this.ctx.moveTo(e.offsetX, e.offsetY);
		console.log("mousedowndraw");
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
		console.log("mousemovedraw");
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
		this.ctx.fillStyle = "#000000";
		// Had to shift both dimensions by 2 pixels to line up with path line???
		this.ctx.fillRect(this.contour.points[i][0]-2, this.contour.points[i][1]-2, this.ctx.lineWidth, this.ctx.lineWidth+1);
	}
}

Shape.prototype.drawCenter = function(e){
	this.ctx.fillStyle = this.ccol;
	this.ctx.fillRect(this.centerX - this.crad/2, this.centerY - this.crad/2, this.crad, this.crad);
}




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



// Plot class to store/plot the signal 
function Plot(shape, cid, cheight, cwidth){
	// Grab canvas by ID, use "plot" as default
	this.cID = typeof(cid) === "undefined" ? "plot" : cid;
	this.canvas = document.getElementById(this.cID);
	this.ctx = this.canvas.getContext('2d');
	
	// Set size of canvas, use 200, 500 as default
	this.canvas.width  = typeof(cwidth)  === "undefined" ? 200 : cwidth;
	this.canvas.height = typeof(cheight) === "undefined" ? 500 : cheight;
}



// Animation class that handles drawing/rendering
function Animation(shape, plot){
	// Store shape and plot to be associated with this animation internally
	this.shape = shape;
	this.plot = plot;
	
	// Timeout ID used for start/stop animation (initialize to 0)
	this.timeoutID = 0;

	// Animation settings
	this.renderFPS = 1;		// FPS
	this.pSkip = 5;				// Detail of animation
								// Every nth point to plot
	this.currFrame = 0;			// Global frame (position) to sync plot + shape
	this.contourLength = 0;		// Number of points in contour of shape
}



// Adapted from the Paul Irish & CreativeJS 
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://creativejs.com/resources/requestanimationframe/
Animation.prototype.beginAnimation = function(e){
	// Only allow for animation start if we have a shape and a center
	if ((shape.drawComplete) && (shape.centerValid) ){

		// Populate contour length only when there is a contour to use
		this.contourLength = this.shape.contour.points.length;

		// Set up requestAnimationFrame per browser
		window._requestAnimationFrame = window.requestAnimationFrame	 	 || // Chrome
								 		window.webkitRequestAnimationFrame	 || // Safari
                                 		window.mozRequestAnimationFrame   	 || // Firefox
                                 		window.oRequestAnimationFrame     	 || // Opera
	                             		window.msRequestAnimationFrame    	 || // IE
								 		function(callback){
											window.setTimeout(callback, 1000/60);   // 60fps
								 		}
	
		// Initiate requestAnimationFrame callback to Animation.animate()
		// Bind call to "this" (this instance of Animation) to allow for
		// proper access of vars
		window._requestAnimationFrame(this.animate.bind(this));
	
	}
	else {
		console.log("Hey now, draw a shape and a center please!");
	}
}


// Animation handler
Animation.prototype.animate = function(e){


	// Animation Stuff Here!
	console.log("Animating!");

	// Create a timeout for another requestAnimationFrame
	// Binding hell commence...not sure the full reason for these binds but I know the problems they solve
	// First pass this instance of Animation's animate method to the rAF
	// Bind "this" to it or else you get a Uncaught TypeError: Type Error 
	// Bind the entire function you pass to rAF to this so it knows what this.animate is

	// Set timeout to 1000/renderFPS which is an Animation parameter to control FPS
	// Store setTimeout ID return so we can cancel if we want
	this.timeoutID = setTimeout(function() {
		window._requestAnimationFrame(this.animate.bind(this));
	}.bind(this), 1000/this.renderFPS);
		
}




// Cancel next animate() call by clearing the currently stored timeout
Animation.prototype.stopAnimation = function(e){
	window.clearTimeout(this.timeoutID);
	console.log("Stop animating :(");

}


    

debugTrace = function(e){
	e = e || window.event;
	if (e.keyCode == "37"){
		this.counter++;
		// Restore shape by clearing canvas and restoring
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawContour();
		this.drawCenter();	
		// Draw center point
		this.ctx.beginPath();
		this.ctx.moveTo(this.centerX, this.centerY);
		this.ctx.lineTo(this.contour.points[this.counter % this.contour.points.length][0], this.contour.points[this.counter % this.contour.points.length][1]);
		this.ctx.stroke();
		this.ctx.closePath();

		this.counter++;	
	}

};




// Run
var shape = new Shape("shape", 400, 400);
var plot = new Plot(shape, "plot", 200, 500);
var animation = new Animation(shape, plot);

// Debug trace
//document.onkeydown = debugTrace.bind(shape);
