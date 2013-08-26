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
var plot = new Plot(shape, "#shapnal1", 400, 500);
var animation = new Animation(shape, plot);


