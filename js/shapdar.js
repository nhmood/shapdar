// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// [todo] - Use more complex method to find center of shape
//		  - Currently just using click but maybe use skeleton method
//		  - http://stackoverflow.com/questions/1203135/what-is-the-fastest-way-to-find-the-center-of-an-irregularly-shaped-polygon
//		  - Or use simple center of 2d mass with uniform density




// Run
// Create necessary components, use desired size + divs
var shape = new Shape("#shapdar", 400, 300);
var plot = new Plot(shape, "#shapdar", 400, 450);
var animation = new Animation("#controls", shape, plot);

