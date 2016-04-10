class PerlinGrid{
	constructor(rng, gradientSize){
		this.GX = gradientSize;
		this.GY = gradientSize;
		this.gradientGrid = new Array(this.GX);
		this.rng = rng;

		this.gradientGrid.forEach((_elem,i) =>{
			this.gradientGrid[i] = new Array(this.GY);
			this.gradientGrid[i].forEach((_elem, j) =>{
				this.gradientGrid[i][j] = generateRandomNormal();
			});
		});
	}
	generateRandomNormal(){
		let theta = rng.floatBetween(0, 2*Math.PI);

		return {x: Math.cos(theta), y: Math.sin(theta)};
	}
	dotProduct(pa, pb){
		return pa.x * pb.x + pa.y * pb.y;
	}
	getValueForPoint(p){
		let i = Math.floor(p.x);
		let j = Math.floor(p.y);
		let u = p.x - i;
		let v = p.y - j;
		let g00 = gradientGrid[i][j];
		let g01 = gradientGrid[i][j+1];
		let g10 = gradientGrid[i+1][j];
		let g11 = gradientGrid[i+1][j+1];

		let n00 = dotProduct(g00, {x:u, y:v});
		let n10 = dotProduct(g10, {x:u-1,y:v});
		let n01 = dotProduct(g01, {x:u, y: v-1});
		let n11 = dotProduct(g11, {x:u-1, y: v-1});

		let f = function(t){
			return 6 * Math.pow(t, 5)  - 15 * Math.pow(t,4) + 10 * Math.pow(t,3);
		}

		let nx0 = n00*(1-f(u)) + n10*f(u);
		let nx1 = n01*(1-f(u)) + n11*f(u);

		return nx0*(1-f(v)) + nx1 * f(v);
	}
}
