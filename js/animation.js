// animation.js
// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// Animation class that handles drawing/rendering
function Animation(shape, plot){
	// Store shape and plot to be associated with this animation internally
	this.shape = shape;
	this.plot = plot;
	
	// Timeout ID used for start/stop animation (initialize to 0)
	this.timeoutID = 0;

	// Animation settings
	this.renderFPS = 60;		// FPS
	this.nPlot = 3;				// Detail of animation
								// Every nth point to plot
	this.currFrame = 0;			// Global frame (position) to sync plot + shape
	this.contourLength = 0;		// Number of points in contour of shape
	this.animationFunction = this.plot.animateY.bind(this.plot); 	// Default animation to Y
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
	this.shape.animate(this.currFrame);
	
	this.animationFunction(this.currFrame, this.nPlot);
	this.currFrame += this.nPlot;


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
// [todo] - Sometimes triggers but timeout is already done and new one set
//		  - Fix so it grabs right ID and halts for sure
Animation.prototype.stopAnimation = function(e){
	window.clearTimeout(this.timeoutID);
	console.log("Stop!");
}