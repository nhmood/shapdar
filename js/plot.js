// plot.js
// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS



// shape - associated shape object
// did - div id
// cheight - canvas height
// cwidth - canvas width

// Plot class to store/plot the signal 
function Plot(shape, did, cheight, cwidth){
	// Grab canvas by ID, use "plot" as default
	this.cID = typeof(cid) === "undefined" ? "" : did;
	this.canvas = $(did + " .plot")[0];
	this.ctx = this.canvas.getContext('2d');
	
	// Set size of canvas, use 200, 500 as default
	this.canvas.width  = typeof(cwidth)  === "undefined" ? 200 : cwidth;
	this.canvas.height = typeof(cheight) === "undefined" ? 500 : cheight;

	this.ctx.strokeStyle = typeof(lstyle) === "undefined" ? "black" : lstyle;
	this.ctx.lineWidth   = typeof(lwidth) === "undefined" ?    3    : lwidth;


	// Create array the size of the full plot width
	// Prefill with value half the height of the canvas
	this.points = Array.apply(null, new Array(this.canvas.width)).map(Number.prototype.valueOf,(this.canvas.height/2));
	this.pointCount = 0;
	this.shape = shape;
}

// Windowed push function
// Push to front and pop out of back to this instances points array
Plot.prototype.push = function(value) {
	this.points.pop();
	this.points.unshift(value);
}



// Animation for X position
Plot.prototype.animateX = function(index, skip){
	// nPlot of Animation skips contour points in order to speed up animation but we still need
	// to draw all the points to have a cohesive plot so this pushes correct values to instance points array  
	for (var i = 0; i < skip; i++){
		this.push(Math.round((this.shape.contour.points[(index + i) % this.shape.contour.points.length][0] * this.canvas.height) / this.shape.canvas.height));
	}


	// Clear canvas for redrawing
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	
	// Draw all the points in the points array
	this.ctx.fillStyle = this.ctx.strokeStyle;
	for (var i = 0; i < this.canvas.width; i++){
		this.ctx.fillRect(i, this.points[i], this.ctx.lineWidth, this.ctx.lineWidth);	
	}

}

// Animation for Y position
Plot.prototype.animateY = function(index, skip){
	// nPlot of Animation skips contour points in order to speed up animation but we still need
	// to draw all the points to have a cohesive plot so this pushes correct values to instance points array  
	for (var i = 0; i < skip; i++){
		this.push(Math.round((this.shape.contour.points[(index + i) % this.shape.contour.points.length][1] * this.canvas.height) / this.shape.canvas.height));
	}


	// Clear canvas for redrawing
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	
	// Draw all the points in the points array 
	this.ctx.fillStyle = this.ctx.strokeStyle;
	for (var i = 0; i < this.canvas.width; i++){
		this.ctx.fillRect(i, this.points[i], this.ctx.lineWidth, this.ctx.lineWidth);
	}

	this.shape.borderLine(index);
}



// Animation for distance from center
Plot.prototype.animateD = function(index, skip){
	// nPlot of Animation skips contour points in order to speed up animation but we still need
	// to draw all the points to have a cohesive plot so this pushes correct values to instance points array  
	// This will also calculate distance from center to the point (d = sqrt((x2 -x1)^2 + ((y2 - y1)^2)))

	var x1 = this.shape.centerX;
	var y1 = this.shape.centerY; 
	for (var i = 0; i < skip; i++){
		var x2 = this.shape.contour.points[(index + i) % this.shape.contour.points.length][0];
		var y2 = this.shape.contour.points[(index + i) % this.shape.contour.points.length][1];
		var d = Math.sqrt( Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2) );
		this.push( Math.max(this.canvas.height - d, 1) );
	}

	// Clear canvas for redrawing
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// Draw all the points in the points array
	this.ctx.fillStyle = this.ctx.strokeStyle;
	for (var i = 0; i < this.canvas.width; i++){
		this.ctx.fillRect(i, this.points[i], this.ctx.lineWidth, this.ctx.lineWidth);	
	}
}
