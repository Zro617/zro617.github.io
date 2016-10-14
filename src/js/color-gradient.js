class Color {
	constructor(r,g,b) {
		this.r = (r || 0) & 0xFF;
		this.g = (g || 0) & 0xFF;
		this.b = (b || 0) & 0xFF;
	}
	get red() {
		return this.r;
	}
	set red(x) {
		this.r = x & 0xFF;
	}
	get green() { 
		return this.g;
	}
	set green(x) {
		this.g = x & 0xFF;
	}
	get blue() {
		return this.b;
	}
	set blue(x) {
		this.b = x & 0xFF;
	}
	get val() {
		return (this.red * 0x10000) + (this.green * 0x100) + (this.blue * 0x1);
	}
	set val(x) {
		this.red = Math.floor(x/65536);
		this.green = Math.floor(x/256) % 256;
		this.blue = x % 256;
	}
	get rgb() {
		return "rgb("+this.red+","+this.green+","+this.blue+")";
	}
	get hex() {
		return "#" + this.val.toString(16);
	}
	random() {
		this.r = ~~(255*Math.random());
		this.g = ~~(255*Math.random());
		this.b = ~~(255*Math.random());
		return this;
	}
	compare(c) {
		if (this.val > c.val) return 1;
		if (this.val < c.val) return -1;
		return 0;
	}
	greyscale() {
		let g = (this.red + this.green + this.blue) / 3;
		return new Color(g,g,g);
	}
	average() {
		let colors = [...arguments];
		let num = colors.length + 1;
		let avgColor = new Color(this.red,this.green,this.blue);
		for (let c of colors) {
			avgColor.r += c.red;
			avgColor.g += c.green;
			avgColor.b += c.blue;
		}
		avgColor.red   = avgColor.r / num;
		avgColor.green = avgColor.g / num;
		avgColor.blue  = avgColor.b / num;
		return avgColor;
	}
	interpolate(color,weight) {
		new Color(this.red   + weight * (color.red   - this.red),
		          this.green + weight * (color.green - this.green),
							this.blue  + weight * (color.blue  - this.blue));
	}
}

class ColorGradient {
	constructor() {
		this.colors = [];
		this.gradient = [];
	}
	color(x) {
		let c1 = this.colors[Math.floor(x) % this.colors.length];
		let c2 = this.colors[(c1+1) % this.colors.length];
		let t = x % 1;
		return c1.interpolate(c2,t);
	}
	push(color) {
		if (typeof color === "Color") this.colors.push(color);
		return this;
	}
	random(x) {
		this.colors = [];
		while (x--) this.colors.push((new Color()).random());
		return this;
	}
	blend(size,cycles) {
		size = size || (this.colors.length * 2);
		cycles = cycles || 1;
		this.gradients = [];
		for (let x=0;x<size;x++) {
			this.gradients.push(this.color((x/size)*cycles));
		}
		return this;
	}
}