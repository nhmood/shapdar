// shape signal
// Shape Contour to Signal Plotter
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// [todo] - Use more complex method to find center of shape
//		  - Currently just using click but maybe use skeleton method
//		  - http://stackoverflow.com/questions/1203135/what-is-the-fastest-way-to-find-the-center-of-an-irregularly-shaped-polygon

// [todo] - Disable event listener(s) for mousemove after drawing is done?
//		  - Possibly reduce load? Maybe do some benchmarks?
//		  - Use removeEventListener and tie evenListeners to object

// [todo] - Fix single point painting disable


// Create new shape object to store all shape related info
// shape corresponds to shape that we will traverse
var shape = new Object();
shape.canvas = document.getElementById("shape");
shape.ctx = shape.canvas.getContext("2d");
shape.canvas.width = 400;
shape.canvas.height = 400;

// drawEnable - only start drawing on mousedown
// drawDone - only allow one shape to be drawn
shape.drawEnable = 0;
shape.drawDone = 0;


// mousedown eventlistener for shape drawing
shape.canvas.addEventListener("mousedown", function(e){
	// Check to make sure first (and only) shape to be drawn
	if (!shape.drawDone){
		// Enable drawing for later mousemove listener
		shape.drawEnable = 1;

		// Get coordinates of mouse and store for path completion at end
		shape.startX = e.offsetX;
		shape.startY = e.offsetY;

		// Set line properties and begin drawing from mousedown location
		shape.ctx.strokeStyle = "black";
	    shape.ctx.lineWidth = 5;
		shape.ctx.moveTo(shape.startX, shape.startY);
	}
	// Else allow use to create new center point
	else {
		// Store new center point in object
		shape.centerX = e.offsetX;
		shape.centerY = e.offsetY;
		
		// Clear entire canvas and restore original shape path
		shape.ctx.clearRect(0, 0, shape.canvas.width, shape.canvas.height);
		shape.ctx.restore();
	
		// Draw a 5x5 block @ center point
		shape.ctx.fillStyle="#FF0000";
		shape.ctx.fillRect(shape.centerX, shape.centerY, 5, 5);

		shape.ctx.stroke();
	}
});


// mousemove eventlistener for shape drawing
shape.canvas.addEventListener("mousemove", function(e){
	// If mousedown event has occured actually draw line
	if(shape.drawEnable){
		// Get new coordinates at every new location (only local needed)
		var x = e.offsetX;
		var y = e.offsetY;

		// Continue the path to the new location and add stroke to see
		shape.ctx.lineTo(x, y);
	    shape.ctx.stroke();
    
		// Only disable overall drawing if there is some movement	
		shape.drawDone = 1;
	}
});


// mousedown eventlistener for shape drawing
shape.canvas.addEventListener("mouseup", function(e){
	if (shape.drawEnable){
		// Finish line contour by closing path at starting point
		shape.ctx.lineTo(shape.startX, shape.startY);
		shape.ctx.stroke();
    	shape.ctx.closePath();

		// Save path for redrawing after
		shape.ctx.save();

    	// Disable drawing for mousemove
    	shape.drawEnable = 0;
	}
});

