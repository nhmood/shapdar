## shapdar
shapdar is a shape radar kinda thing written with HTML5 and JS.  
This project was created after seeing [this](http://imgur.com/DWuA6Vn) animation posted by my
friend [@eugenekolo](https://twitter.com/eugenekolo).  
I thought, I bet I could do that.  
Then I thought, I bet I could do that, for any arbitrary shape.  
Then I did, yeahhhhhhh.  


### See shapdar in action [here](http://goosecode.com/shapdar)


## Structure
Each component of shapdar is broken into its corresponding .js file and is fairly self documented. 
This is simply an overview of functionality from each component  
  

### shapdar.js
All components of shapdar are initialized here and linked to their respective HTML elements.

### animation.js
All animation logic is managed here. Frame rendering is handled using the requestAnimationFrame method
which allows for pretty reliable "rendering" of frames at a specified FPS. "Rendering" is handled by calling
individual drawing methods for the various components that need to be drawn on the canvas. __animation.js__ also
handles most of the interaction and synchronization between different components of shapdar.


### contour.js
All shape interpolation and contour creation is managed here. This is __not__ where the actual drawing occurs, only where
the the __contour__ of the shape is populated. All necessary coordinate bookkeeping (and interpolation) happens here.


### shape.js
All components related to the "shape" portion of shapdar are managed here. This includes the user input paintbrush functionality, 
as well as various drawing modes such as circle, square, and free draw. __contour.js__ is utilized here in order to take a 
users input drawing and convert it into a renderable canvas shape as well as provide coordinates necessary for various animations. 
__shape.js__ also performs the calculations and control logic for animations of center point to contour line. __animation.js__ is used here to synchronize the center-to-contour drawing with the corresponding plot animation.


### plot.js
All components related to the "plot" portion of shapdar are managed here. This includes drawing the various plot functions with relation
to the shape drawn in the __shape.js__ region. Currently, this supports plotting the the X distance, Y distance, distance from center, and a 
"bitcrusher" mode (that was accidentally born from a bug, but turned out to be super cool). The contour point (synchronized to __shape.js__)
is determined and added to an array each frame, creating a function vs. time display on each frame render.
 __animation.js__ is used here to synchronize the plotting function animations with the corresponding shape animation.



## Issues (as of 9/22/13)
  * Only works with __Chrome__
    * Does NOT work with __Firefox__
    * Has not been tested with any other browser
   * Does NOT work with __mobile__
     * mouseUp/Down/Move events don't really work the same way on mobile I guess
