export default class PerlinGrid {

  //Pass as parameters a random number generator
  //And the size of your perlin grid 
  constructor(rng, gradientSize) {
    this.GX = gradientSize;
    this.GY = gradientSize;
    this.gradientGrid = new Array(this.GX);
    // TODO: just pass the seed as the arg, not an RNG
    // make the RNG in the constructor
    this.rng = rng;

    for(var i = 0; i < this.GX; i ++){
      this.gradientGrid[i] = new Array(this.GY);
      for(var j = 0; j < this.GY; j ++){
        this.gradientGrid[i][j] = this.generateRandomUnitVector();
      }
    }
  }
  
  generateRandomUnitVector() {
    //Choose one of 16 directions
    var rand = this.rng.intBetween(0,15); 

    //Translate into radians.
    var theta = rand / 8 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  dotProduct(pa, pb) {
    return pa.x * pb.x + pa.y * pb.y;
  }

  //Returns a value between -1 and 1. 
  //Parameter p {x, y} 
  //only pass x and y values in the range [0,gradientSize) 
  getValueForPoint(p) {
    
    //Get the gradient indexes for the top
    //left gradient 
    var i = Math.floor(p.x);
    var j = Math.floor(p.y);
    
    //Calculate local offsets 
    var u = p.x - i;
    var v = p.y - j;
    
    //Grab 4 corner gradient vectors
    var g00 = this.gradientGrid[i][j];
    var g01 = this.gradientGrid[i][j + 1];
    var g10 = this.gradientGrid[i + 1][j];
    var g11 = this.gradientGrid[i + 1][j + 1];

    //Calculate dot products for p's offset from 
    //all 4 corners.
    var n00 = this.dotProduct(g00, { x: u, y: v });
    var n10 = this.dotProduct(g10, { x: u - 1, y: v });
    var n01 = this.dotProduct(g01, { x: u, y: v - 1 });
    var n11 = this.dotProduct(g11, { x: u - 1, y: v - 1 });

    //Smooth function for calculating noise
    var f = function f(t) {
      return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
    };

    //Combine the the smooth function on the u and v offsets
    //that are scaled by the dot products
    var nx0 = n00 * (1 - f(u)) + n10 * f(u);
    var nx1 = n01 * (1 - f(u)) + n11 * f(u);

    return nx0 * (1 - f(v)) + nx1 * f(v);
  }
}
