Math.minmax = (min,x,max) => Math.min(Math.max(x,min),max)
class Pixel {
	constructor(r,g,b,a) {
		this.red = r
		this.green = g
		this.blue = b
		this.alpha = a
	}
}
class ImageBuffer {
	constructor(e,context) {
		if (e.isBuffer) {
			this.context = e.context
			this.width = e.width
			this.height = e.height
			this.image = e.context.createImageData(e.width,e.height)
		} else {
			this.context = context || e.getContext("2d")
			this.width = e.width
			this.height = e.height
			this.image = this.context.getImageData(0,0,e.width,e.height)
		}
		this.isBuffer = true
	}
	get pixels() {
		return (this.width * this.height) / 4
	}
	getPixel(x,y) {
		x = Math.minmax(0,x,this.width-1)
		y = Math.minmax(0,y,this.height-1)
		let i = 4*(y*this.width+x)
		return new Pixel(this.image.data[i  ],
		                 this.image.data[i+1],
						 this.image.data[i+2],
						 this.image.data[i+3])
	}
	setPixel(x,y,r,g,b,a) {
		x = Math.minmax(0,x,this.width-1)
		y = Math.minmax(0,y,this.height-1)
		let i = 4*(y*this.width+x)
		this.image.data[i]   = ~~Math.minmax(0,r,255)
		this.image.data[i+1] = ~~Math.minmax(0,g,255)
		this.image.data[i+2] = ~~Math.minmax(0,b,255)
		this.image.data[i+3] = ~~Math.minmax(0,a,255)
	}
	addPixel(x,y,r,g,b,a) {
		x = Math.minmax(0,x,this.width-1)
		y = Math.minmax(0,y,this.height-1)
		let i = 4*(y*this.width+x)
		this.image.data[i]   = ~~Math.minmax(0,this.image.data[i  ]+r,255)
		this.image.data[i+1] = ~~Math.minmax(0,this.image.data[i+1]+g,255)
		this.image.data[i+2] = ~~Math.minmax(0,this.image.data[i+2]+b,255)
		this.image.data[i+3] = ~~Math.minmax(0,this.image.data[i+3]+a,255)
	}
	multiplyPixel(x,y,m) {
		x = Math.minmax(0,x,this.width-1)
		y = Math.minmax(0,y,this.height-1)
		let i = 4*(y*this.width+x)
		this.image.data[i]   = ~~Math.minmax(0,this.image.data[i  ]*m,255)
		this.image.data[i+1] = ~~Math.minmax(0,this.image.data[i+1]*m,255)
		this.image.data[i+2] = ~~Math.minmax(0,this.image.data[i+2]*m,255)
		this.image.data[i+3] = ~~Math.minmax(0,this.image.data[i+3]*m,255)
	}
	interpPixel(x,y,r,g,b,a,t) {
		x = Math.minmax(0,x,this.width-1)
		y = Math.minmax(0,y,this.height-1)
		let i = 4*(y*this.width+x)
		let interp = (a0,a1,w) => a0 * (1-w) + a1 * w
		this.image.data[i]   = ~~Math.minmax(0,interp(this.image.data[i  ],r,t),255)
		this.image.data[i+1] = ~~Math.minmax(0,interp(this.image.data[i+1],g,t),255)
		this.image.data[i+2] = ~~Math.minmax(0,interp(this.image.data[i+2],b,t),255)
		this.image.data[i+3] = ~~Math.minmax(0,interp(this.image.data[i+3],a,t),255)
	}
	getPixelLocale(x,y,range) {
		let locale = []
		let rx, ry
		for (ry=y-range;ry<=y+range;ry++) {
			locale.push([])
			for (rx=x-range;rx<=x+range;rx++) {
				locale[locale.length-1].push(this.getPixel(rx,ry))
			}
		}
		return locale
	}
	applyConvolution(convolution,convMult) {
		convMult = convMult || 1
		var size = convolution.length
		var rad = (size - 1) / 2
		var temp = new ImageBuffer(this)
		var x,y,p,px,py,group
		for (y=0;y<this.height;y++) {
			for (x=0;x<this.width;x++) {
				group = this.getPixelLocale(x,y,rad)
				p = new Pixel(0,0,0,0)
				// apply convolution matrix to pixel locale
				for (py=0;py<size;py++) {
					for (px=0;px<size;px++) {
						p.red   += group[py][px].red   * convolution[py][px]
						p.green += group[py][px].green * convolution[py][px]
						p.blue  += group[py][px].blue  * convolution[py][px]
					}
				}
				p.red   *= convMult
				p.green *= convMult
				p.blue  *= convMult
				temp.setPixel(x,y,p.red,p.green,p.blue,255)
			}
		}
		// replace with temp buffer
		for (y=0;y<this.height;y++) {
			for (x=0;x<this.width;x++) {
				p = temp.getPixel(x,y)
				this.setPixel(x,y,p.red,p.green,p.blue,p.alpha)
			}
		}
		return this
	}
	applyUnsharpMasking() {
		return this.applyConvolution([
			[ 1, 4,   6, 4, 1],
			[ 4,16,  24,16, 4],
			[ 6,24,-476,24, 6],
			[ 4,16,  24,16, 4],
			[ 1, 4,   6, 4, 1]
		],-1/256)
	}
	applySharpen() {
		return this.applyConvolution([
			[ 0,-1, 0],
			[-1, 5,-1],
			[ 0,-1, 0]
		])
	}
	applyBoxBlur3x3() {
		return this.applyConvolution([
			[1,1,1],
			[1,1,1],
			[1,1,1]
		],1/9)
	}
	applyBoxBlur5x5() {
		return this.applyConvolution([
			[1,1,1,1,1],
			[1,1,1,1,1],
			[1,1,1,1,1],
			[1,1,1,1,1],
			[1,1,1,1,1]
		],1/25)
	}
	applyGaussianBlur3x3() {
		return this.applyConvolution([
			[1,2,1],
			[2,4,2],
			[1,2,1]
		],1/16)
	}
	applyGaussianBlur5x5() {
		return this.applyConvolution([
			[ 1, 4, 6, 4, 1],
			[ 4,16,24,16, 4],
			[ 6,24,36,24, 6],
			[ 4,16,24,16, 4],
			[ 1, 4, 6, 4, 1]
		],1/256)
	}
	applyQuantization(q) {
		let x,y,p
		for (y=0;y<this.height;y++) {
			for (x=0;x<this.width;x++) {
				p = this.getPixel(x,y)
				p.red   = q * Math.round(p.red/q)
				p.green = q * Math.round(p.green/q)
				p.blue  = q * Math.round(p.blue/q)
				this.setPixel(x,y,p.red,p.green,p.blue,p.alpha)
			}
		}
		return this
	}
}
class ImageExtractor {
	constructor(src) {
		this.data = []
		this.width = 0
		this.height = 0
		this.loaded = false
		var cnv = document.createElement("canvas")
		var ctx = cnv.getContext("2d")
		var img = new Image()
		img.onload = function(){
			this.width = cnv.width = img.width
			this.height = cnv.height = img.height
			ctx.drawImage(img,0,0,img.width,img.height)
			var rgba = ctx.getImageData(0,0,cnv.width,cnv.height)
			for (let y=0;y<rgba.height;y++) {
				var row = []
				for (let x=0;x<rgba.width;x++) {
					var i = 4*(y*rgba.width + x)
					row.push({r:rgba.data[i],g:rgba.data[i+1],b:rgba.data[i+2]})
				}
				this.data.push(row)
			}
			this.loaded = true
		}.bind(this)
		img.src = src
	}
}