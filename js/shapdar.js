// shapnal
// Shape Contour Signal Graph
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// [todo] - Use more complex method to find center of shape
//		  - Currently just using click but maybe use skeleton method
//		  - http://stackoverflow.com/questions/1203135/what-is-the-fastest-way-to-find-the-center-of-an-irregularly-shaped-polygon
//		  - Or use simple center of 2d mass with uniform density



// Run

// Create necessary components

var shape = new Shape("#shapnal1", 400, 400);
var plot = new Plot(shape, "#shapnal1", 400, 600);
var animation = new Animation(shape, plot);



// JQuery stuff for option changing
// Line width change
$('#shapnal1 input.lw').change(function(e){
	$('#shapnal1 span.lw').text(this.value);
	shape.ctx.lineWidth = this.value;
	plot.ctx.lineWidth = this.value;
});


// Speed change
$('#shapnal1 input.ps').change(function(e){
	$("#shapnal1 span.ps").text(this.value);
	animation.nPlot = parseInt(this.value);
})

// Animation change
$('#shapnal1 select.anim').change(function(e){
	animation.animationFunction = plot[this.value].bind(animation.plot);
});



// Line color change
$('#shapnal1 select.lc').change(function(e){
	if (this.value == "red"){
		shape.ccol = "blue";
	}
	else {
		shape.ccol = "red";
	}
	shape.ctx.strokeStyle = this.value;
	plot.ctx.strokeStyle = this.value
})

