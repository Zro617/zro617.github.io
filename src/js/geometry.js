/*
  geometry.js by Zro617
	A basic JavaScript library for drawing geometric shapes on a canvas
	Requires color-gradient.js for the Color class
*/

Color;

const TAU = 2 * Math.PI

var Canvas = document.querySelector("canvas")
if (!Canvas) {
	Canvas = document.createElement("canvas")
	document.body.appendChild(Canvas)
}

var Pen = Canvas.getContext("2d")


class Point {
	constructor(x,y) {
		this.x = Number(x)
		this.y = Number(y)
	}
	round() {
		this.x = ~~this.x
		this.y = ~~this.y
		return this
	}
}

class Line {
	constructor(x1,y1,x2,y2) {
		if (typeof x1 === "object" && typeof y1 === "object") {
			this.start = x1
			this.end = y1
		} else {
			this.start = new Point(x1,y1)
			this.end = new Point(x2,y2)
		}
		this.color = new Color().random()
	}
	get length() {
		return Math.sqrt(Math.pow(this.end.x - this.start.x,2) + 
		                 Math.pow(this.end.y - this.start.y,2))
	}
	get midpoint() {
		return new Point((this.start.x+this.end.x)/2,(this.start.y+this.end.y)/2)
	}
	interpolate(t) {
		return new Point(this.start.x * (1-t) + this.end.x * t,
		                 this.start.y * (1-t) + this.end.y * t)
	}
	cull() {
		let tmp = new Point(this.start.x,this.start.y);
		let onscreen = tmp.x >= 0 && tmp.x <= Canvas.width && tmp.y >= 0 && tmp.y <= Canvas.height
		if (!onscreen) {
			let dx = this.end.x - this.start.x,
			    dy = this.end.y - this.start.y
			if (tmp.x > Canvas.width) {
				
			}
		}
		return this
	}
	draw() {
		Pen.strokeStyle = this.color.rgb
		Pen.moveTo(this.start.x,this.start.y)
		Pen.lineTo(this.end.x,this.end.y)
		Pen.stroke()
	}
}

class HorizontalLine extends Line {
	constructor(y,x1,x2) {
	  y = y || (Canvas.height * Math.random())
		x1 = x1 || (Canvas.width * Math.random())
		x2 = x2 || (Canvas.width * Math.random())
		super(x1,y,x2,y)
	}
}

class VerticalLine extends Line {
	constructor(x,y1,y2) {
		x = x || (Canvas.width * Math.random())
		y1 = y1 || (Canvas.height * Math.random())
		y2 = y2 || (Canvas.height * Math.random())
		super(x,y1,x,y2)
	}
}

class Polygon {
	constructor() {
		this.points = [...arguments]
		this.innerColor = new Color().random()
		this.outerColor = new Color().random()
	}
	draw() {
		Pen.strokeStyle = this.outerColor.rgb
		Pen.fillStyle = this.innerColor.rgb
		
		Pen.beginPath()
		let first = true
		for (let p of this.points) {
			if (first) {
				Pen.moveTo(p.x,p.y)
				first = false
			} else {
				Pen.lineTo(p.x,p.y)
			}
		}
		Pen.closePath()
		Pen.fill()
		Pen.stroke()
	}
}

class RegularPolygon extends Polygon {
	constructor(x,y,sides,radius,tilt) {
		super()
		x = x || ~~(Canvas.width * Math.random())
		y = y || ~~(Canvas.height * Math.random())
		sides = sides || ~~(3 + 5 * Math.random())
		radius = radius || (200 * Math.random())
		tilt = tilt || (TAU * Math.random())
		for (let s=0,t=tilt,dt=TAU/sides;s<sides;s++,t+=dt) {
			this.points.push(new Point(x+radius*Math.sin(t),y+radius*Math.cos(t)))
		}
	}
}

class Triangle extends RegularPolygon {
	constructor(x,y,radius,tilt) {
		super(x,y,3,radius,tilt)
	}
}

class Square extends RegularPolygon {
	constructor(x,y,radius,tilt) {
		super(x,y,4,radius,tilt+TAU/4)
	}
}

class Pentagon extends RegularPolygon {
	constructor(x,y,radius,tilt) {
		super(x,y,5,radius,tilt)
	}
}

class Hexagon extends RegularPolygon {
	constructor(x,y,radius,tilt) {
		super(x,y,6,radius,tilt+TAU/12)
	}
}

class Rectangle extends Polygon {
	constructor(x,y,width,height,tilt) {
		let center = new Point(x,y)
		super(new Point(x-width/2,y-height/2).transform(tilt,center),
		      new Point(x+width/2,y-height/2).transform(tilt,center),
					new Point(x+width/2,y+height/2).transform(tilt,center),
					new Point(x-width/2,y+height/2).transform(tilt,center))
	}
}

class Rhombus extends Polygon {
	constructor(x,y,width,height,tilt) {
		let center = new Point(x,y)
		super(new Point(x-width/2,y).tranform(tilt,center),
		      new Point(x,y-height/2).transform(tilt,center),
					new Point(x+width/2,y).transform(tilt,center),
					new Point(x,y+height/2).transform(tilt,center))
	}
}

class RightTriangle extends Polygon {
	constructor(x,y,legx,legy,tilt) {
		let center = new Point(x,y)
		super(center,
		      new Point(x+legx,y).transform(tilt,center),
					new Point(x,y+legy).transform(tilt,center))
	}
}

class Ellipse {
	constructor(x,y,a,b,tilt) {
		let center = new Point(x,y)
	}
	draw() {
		
	}
}

class Circle extends Ellipse {
	constructor(x,y,radius) {
		super(x,y,radius,radius,0)
	}
}

class Wave {
	constructor(x,y,amplitude,frequency,phase,tilt) {
		this.x = x || ~~(Canvas.width * Math.random())
		this.y = y || ~~(Canvas.height * Math.random())
		this.amplitude = amplitude || (200 * Math.random())
		this.frequency = frequency || (69 * Math.random())
		this.phase = phase || (TAU * Math.random())
		this.tilt = tilt || (TAU * Math.random())
		
		this.color = new Color().random()
	}
	draw() {
		let longest = Math.max(Canvas.width,Canvas.height)
		let center = new Point(this.x,this.y)
		let line = new Line(new Point(this.x-longest,this.y).transform(this.tilt,center),
		                    new Point(this.x+longest,this.y).transform(this.tilt,center)).cull()
		let distance = line.length
		
		for (let t=0,first=true,i,intensity,tmp;t<distance;t++) {
			i = t / distance
			intensity = this.amplitude * Math.sin(this.phase + TAU * this.frequency * i)
			tmp = line.interpolate(i).add(new Point(0,intensity).transform(this.tilt))
			if (first) {
				Pen.moveTo(tmp.x,tmp.y)
				first = false
			} else {
				Pen.lineTo(tmp.x,tmp.y)
			}
		}
		Pen.strokeStyle = this.color.rgb
		Pen.stroke()
	}
}