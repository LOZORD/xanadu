
function getPerlinGrid(rng,gradientSize){
	return new PerlinGrid(rng,gradientSize);
}


class PerlinGrid{

	constructor(rng, gradientSize) {
		this.GX = gradientSize;
		this.GY = gradientSize;
		this.gradientGrid = new Array(this.GX);
		this.rng = rng;

		for(var i = 0; i < this.GX; i ++){
			this.gradientGrid[i] = new Array(this.GY);
			for(var j = 0; j < this.GY; j ++){
				this.gradientGrid[i][j] = this.generateRandomNormal();
			}
		}
		
	}

	
	generateRandomNormal() {
		//var theta = rng.floatBetween(0, 2 * Math.PI);
		var rand = Math.floor(rng.floatBetween(0,16));
		
		var theta = rand / 8 * Math.PI;
		
		return { x: Math.cos(theta), y: Math.sin(theta) };
	}
	
	dotProduct(pa, pb) {
		return pa.x * pb.x + pa.y * pb.y;
	}
	
	getValueForPoint(p) {
		var i = Math.floor(p.x);
		var j = Math.floor(p.y);
		var u = p.x - i;
		var v = p.y - j;
		var g00 = this.gradientGrid[i][j];
		var g01 = this.gradientGrid[i][j + 1];
		var g10 = this.gradientGrid[i + 1][j];
		var g11 = this.gradientGrid[i + 1][j + 1];

		var n00 = this.dotProduct(g00, { x: u, y: v });
		var n10 = this.dotProduct(g10, { x: u - 1, y: v });
		var n01 = this.dotProduct(g01, { x: u, y: v - 1 });
		var n11 = this.dotProduct(g11, { x: u - 1, y: v - 1 });

		var f = function f(t) {
			return 6 * Math.pow(t, 5) - 15 * Math.pow(t, 4) + 10 * Math.pow(t, 3);
		};

		var nx0 = n00 * (1 - f(u)) + n10 * f(u);
		var nx1 = n01 * (1 - f(u)) + n11 * f(u);

		return nx0 * (1 - f(v)) + nx1 * f(v);
	}
}
