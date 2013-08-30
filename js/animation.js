// animation.js
// shapdar - Shape Radar...kinda
// nhmood @ [gooscode labs] - 2013
// HTML5 Canvas + JS


// Animation class that handles drawing/rendering
function Animation(did, shape, plot){
 	// Grab controls by ID, use "controls" as default

	this.dID = typeof(did) === "undefined" ? "#controls" : did;


	// Store shape and plot to be associated with this animation internally
	this.shape = shape;
	this.plot = plot;
	
	// Timeout ID used for start/stop animation (initialize to 0)
	this.timeoutID = 0;
	this.stopAnim = 0;
	this.currAnim = 0;

	// Animation settings
	this.renderFPS = 60;		// FPS
	this.nPlot = 3;				// Detail of animation
								// Every nth point to plot
	this.currFrame = 0;			// Global frame (position) to sync plot + shape
	this.contourLength = 0;		// Number of points in contour of shape
	this.animationFunction = this.plot.animateY.bind(this.plot); 	// Default animation to Y

	// Initialize jQuery calls
	this.jInit();
};

// jQuery stuff for option changing 
// This stuff is pretty messy, like really messy
// I recall the entire selector a couple times so I can get the value of
// the input (for checkbox as well as sliders), this can prob be done better
Animation.prototype.jInit = function(e){
	var that = this;
	
	// Grid lines 
	$( this.dID + ' input.gl').change(function(e){
		shape.gridEnable = $(that.dID + ' input.gl').is(':checked');
	})	

	// Line width change
	$( this.dID + ' input.lw').change(function(e){
		$(that.dID + ' span.lw').text(this.value);
		shape.ctx.lineWidth = this.value;
		plot.ctx.lineWidth = this.value;
	});


	// Speed change
	$(this.dID + ' input.ps').change(function(e){
		$(that.dID + " span.ps").text(this.value);
		animation.nPlot = parseInt(this.value);
	})

	// Animation change
	$(this.dID + ' select.anim').change(function(e){
		// This syntax is pretty nifty
		// plot is this animations plot object (tied to our plot canvas)
		// this.value is the name of the function we want to use to animate (if our HTML is right)
		// plot[this.value] -> bracket notation for accessing objects properties
		// Advantage of bracker [] over dot . is that you can throw strings in there and it'll work
		// Not sure if object."propertyasastring" would work but don't think object.thisvalue would?
		animation.animationFunction = plot[this.value].bind(animation.plot);
	});

	// Line color change
	$(this.dID + ' select.lc').change(function(e){
		
		// If line is red, change center to blue, else keep red
		shape.ccol = (this.options[this.selectedIndex].text == "Red") ? "#0099ff" : "#c95f5e";
		
		// Update stroke styles of shape and plot with updated color
		shape.ctx.strokeStyle = this.value;
		plot.ctx.strokeStyle = this.value
	});

	// Draw type
	$(this.dID + ' select.draw').change(function(e){
		// Same nifty syntax as animation change
		shape.shapeDraw = shape[this.value].bind(animation.shape);
	});

};


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
};


// Animation handler
Animation.prototype.animate = function(e){


	if (this.stopAnim){
		this.stopAnim = 0;
		this.timeoutID = 0;
	}
	else {
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
};




// Cancel next animate() call by clearing the currently stored timeout
// [todo] - Sometimes triggers but timeout is already done and new one set
//		  - Fix so it grabs right ID and halts for sure
Animation.prototype.stopAnimation = function(e){
	this.stopAnim = 1;
	console.log("Stop!");
};



// Reset animation and corresponding plot and shape
Animation.prototype.reset = function(e){
	// Stop any future animations and reset timeoutID
	this.stopAnim = 1;
	this.timeoutID = 0;

	// Default animation settings
	this.renderFPS = 60;		
	this.nPlot = 3;				
								
	this.currFrame = 0;			
	this.contourLength = 0;		
	this.animationFunction = this.plot.animateY.bind(this.plot);

	// Call reset functions on shape and plot
	this.shape.reset();
	this.plot.reset();

	// Reset HTML controls
	// Uncheck gridlines
	$(this.dID + ' input.gl').attr("checked", false);

	// Reset line width
	$(this.dID + ' input.lw').attr("value", this.shape.ctx.lineWidth);
	$(this.dID + ' span.lw').text(this.shape.ctx.lineWidth);

	// Reset speed
	$(this.dID + ' input.ps').attr("value", this.nPlot);
	$(this.dID + ' span.ps').text(this.nPlot);

	// Reset animation type
	$(this.dID + ' select.anim').val('');

	// Reset line color
	$(this.dID + ' select.lc').val('');

	// Reset draw type
	$(this.dID + ' select.draw').val('');
};