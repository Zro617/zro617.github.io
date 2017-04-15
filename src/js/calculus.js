function printTableData(data,header) {
	// data must be passed as an object
	if (typeof data !== "object") {
		return console.error("data must be an array or table / 2d array")
	}
	// if header is not provided, make one
	if (typeof header !== "object") {
		header = ["value"]
	} else if (header.length != data[0].length) {
		return console.error("header columns must be equal to data columns")
	}
	// if data is just a singular array, add a column for index
	if (typeof data[0] !== "object") {
		for (let i=0;i<data.length;i++) data[i] = [i,data[i]]
		// include a header for the new column
		header.unshift("index")
	}
	// calculate table widths
	let widths = new Array(header.length).fill(0)
	for (let col=0;col<data[0].length;col++) {
		widths[col] = String(header[col]).length
		for (let row=0;row<data.length;row++) {
			widths[col] = Math.max(widths[col],String(data[row][col]).length)
		}
		// add padding between item and column divisions
		 widths[col] += 2
	}
	function strfill(width,ch,string,offset) {
		offset = offset || 0
		let str = (new Array(Math.max(width,string.length))).fill(ch||" ")
		if (string) for (let i=0;i<string.length;i++) str[i+offset] = string[i]
		return str.join("")
	}
	// create table
	var table = "",
	    temp  = []
	// create header text
	for (let col=0;col<header.length;col++) {
		temp.push(strfill(widths[col]," ",header[col],1))
	}
	table += temp.join("|") + "\n"
	// create border separating header from data
	temp = []
	for (let col=0;col<header.length;col++) {
		temp.push(strfill(widths[col],"-",""))
	}
	table += temp.join("+") + "\n"
	// create data text
	for (let row=col=0;row<data.length;row++) {
		temp = []
		for (col=0;col<data[0].length;col++) {
			temp.push(strfill(widths[col]," ",String(data[row][col]),1))
		}
		table += temp.join("|") + "\n"
	}
	console.log(table)
}

function FunctionArray(fn,len) {
	let i = 0
	return Array(len).fill(0).map(x=>fn(i++))
}

function SlopeField(fn,xmin,xmax,ymin,ymax) {
	if (!xmin) xmin = -10
	if (!xmax) xmax = 10
	if (!ymin) ymin = -10
	if (!ymax) ymax = 10
	let sf = ""
	for (let y=ymin;y<=ymax;y++) {
		for (let x=xmin;x<=xmax;x++) {
			if (x == 0) {
				sf += y == 0 ? "+" : "|"
			} else if (y == 0) {
				sf += "\u2014"
			} else {
				var slope = fn(x,y)
				if (Math.abs(slope) < 0.5) {
					sf += "\u2014"
				} else if (Math.abs(slope) > 20) {
					sf += "|"
				} else if (slope > 0) {
					sf += slope > 1.5 ? "\u002f" : "\u2215"
				} else if (slope < 0) {
					sf += slope < -1.5 ? "\u005c" : "\uff3c"
				} else {
					sf += "·"
				}
			}
		}
		sf += "\n"
	}
	console.log(sf)
}

function Newton(fn,fder,x0,n) {
	let data = []
	let f0, f1, f0_f1, newt
	let x = x0
	for (let i=0;i<n;i++) {
		f0 = fn(x)
		f1 = fder(x)
		f0_f1 = f0 / f1
		newt = x - f0_f1
		data.push([i,x,f0,f1,f0_f1,newt])
		x = newt
	}
	printTableData(data,["iteration","x","f(x)","f'(x)","f(x)/f'(x)","x-f(x)/f'(x)"])
}

function CompareDeltas(y,dy,x,dx) {
	console.log(
`Calculating Δy and dy:
	x     = ${x}
	dx    = ${dx}
	y(x)  = ${y(x)}
	y'(x) = ${dy(x)}
	Δy    = ${y(x+dx)-y(x)}
	dy    = ${dy(x) * dx}
`)
}

function Delta(y,dy,x,dx) {
	return y(x) + dy(x) * dx
}

function Integrate(fn,a,b,n) {
	if (n <= 0) n = 10 // default partitions
	// init variables
	let data = []
	let rect_sum_l = rect_sum_r = trap_sum = simp_sum = 0
	let dx = (b-a)/n
	// pre-calculate values of f
	var x = FunctionArray(i=>a+i*dx,n+1)
	var y = FunctionArray(i=>fn(x[i]),n+1)
	for (let i=0;i<=n;i++) data.push([x[i],y[i]])
	// integrate with rectangles and trapezoids
	for (let i=0;i<n;i++) {
		rect_sum_l += y[i]
		rect_sum_r += y[i+1]
		trap_sum   += y[i] + y[i+1]
	}
	rect_sum_l *= dx
	rect_sum_r *= dx
	trap_sum   *= dx / 2
	// integrate using simpson's rule
	if (n % 2 == 0) {
		for (let i=0;i<n-1;i+=2)
			simp_sum += y[i] + 4 * y[i+1] + y[i+2]
		simp_sum *= (b - a) / (3 * n)
	}
	
	console.log(
`Integration values:
	lower limit (a)  = ${a}
	upper limit (b)  = ${b}
	partitions  (n)  = ${n}
	Δx = (b - a) / n = ${dx}
Table data:
`)
	printTableData(data,["x","f(x)"])
  console.log(
`Calculated areas:
	Left-hand  = ${rect_sum_l}
	Right-hand = ${rect_sum_r}
	Trapezoid  = ${trap_sum}
	Simpson    = ${(n%2==0)?simp_sum:"(not applicable)"}
`)
}

function Decay(C,k,t) {
  return C * Math.exp(k * t)
}

function HalfLifeDecayRate(hl) {
	return Math.log(1/2) / h1
}

function TimeToDouble(rate) {
	return Math.LN2 / rate
}

class Mass {
	constructor(x,m) {
		this.distance = x
		this.mass = m
		this.moment = this.distance * this.mass
	}
}

function findFulcrum(masses) {
	let totalMass = 0, totalMoment = 0
	for (let m of masses) {
		totalMass += m.mass
		totalMoment += m.moment
	}
	return totalMoment / totalMass
}
