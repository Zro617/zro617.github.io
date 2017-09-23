class NumberBuffer {
	constructor(x = '0.0') {
		if (x == 'Infinity' || x == '-Infinity' || x == 'NaN') {
			throw 'NaN'
		}
		if (x instanceof NumberBuffer) {
			this.digits = x.digits
			this.isNegative = x.isNegative
		} else {
			this.parse(x)
		}
	}
	parse(x) {
		this.digits = (x instanceof Array ? x : String(x).split('')).map(x => Number(x)||x)
		
		// assert the sign, remove it if found
		this.isNegative = this.firstInteger == '-'
		if (this.isNegative) {
			this.digits.shift()
		}
	}
	set(idx,x) {
		while (this.digits.length < idx+1) {
			this.digits.push(0)
		}
		this.digits[idx] = Number(x) || 0
	}
	get(idx) {
		return this.digits[idx]
	}
	get value() {
		return (this.isNegative ? '-' : '') + this.digits.join('')
	}
	get length() {
		return this.digits.length
	}
	get sign() {
		return this.isNegative ? -1 : 1
	}
	get integerValue() {
		let dp = this.decimalPlace
		if (dp > -1) {
			return (this.isNegative ? '-' : '') + this.digits.slice(0,dp).join('')
		} else {
			return this.value
		}
	}
	get decimalValue() {
		let dp = this.decimalPlace
		if (dp > -1) {
			return (this.isNegative ? '-' : '') + '0.' + this.digits.slice(dp+1).join('')
		} else {
			return '0.0'
		}
	}
	get isPositive() {
		return !this.isNegative
	}
	get isZero() {
		return Number(this.digits.join('')) === 0
	}
	get isInteger() {
		return this.integerPlaces === this.digits.length
	}
	get isDecimal() {
		return this.integerPlaces < this.digits.length
	}
	get decimalPlace() {
		return this.digits.indexOf('.')
	}
	get integerPlaces() {
		let dp = this.decimalPlace
		if (dp == -1) {
			return this.digits.length
		} else {
			return dp
		}
	}
	get decimalPlaces() {
		let dp = this.decimalPlace
		if (dp == -1) {
			return 0
		} else {
			return this.digits.length - dp - 1
		}
	}
	get firstInteger() {
		return this.digits[0]
	}
	get secondInteger() {
		return this.digits[1]
	}
	get lastInteger() {
		let dp = this.decimalPlace
		if (dp == -1) {
			return this.digits[this.digits.length-1]
		} else {
			return this.digits[this.decimalPlace-1]
		}
	}
	get firstDecimal() {
		let dp = this.decimalPlace
		if (dp == -1) {
			return '0'
		} else {
			return this.digits[dp+1]
		}
	}
	get lastDecimal() {
		let dp = this.decimalPlace
		if (dp == -1) {
			return '0'
		} else {
			return this.digits[this.digits.length-1]
		}
	}
	setIntegerPadding(ip) {
		ip = ip < 0 ? 0 : ip
		let padding = this.integerPlaces
		while (padding > ip) {
			this.digits.splice(0,1)
			padding--
		}
		while (padding < ip) {
			this.digits.unshift(0)
			padding++
		}
	}
	setDecimalPadding(dp) {
		dp = dp < 0 ? 0 : dp
		let padding = this.decimalPlaces
		if (padding == 0) {
			this.digits.push('.')
		}
		while (padding > dp) {
			this.digits.pop()
			padding--
		}
		while (padding < dp) {
			this.digits.push(0)
			padding++
		}
	}
	setPadding(ip,dp) {
		this.setIntegerPadding(ip)
		this.setDecimalPadding(dp)
	}
	negate() {
		this.isNegative = !this.isNegative
	}
	push(x) {
		this.digits.push(Number(x)||x)
	}
	pop() {
		return this.digits.pop()
	}
	reverseDigitOrder() {
		this.digits = this.digits.reverse()
	}
	trim() {
		while (this.firstInteger == 0 && this.secondInteger != '.' && this.length > 1) {
			this.digits.shift()
		}
		if (this.decimalPlace > 0) {
			while (this.lastDecimal == 0) {
				this.digits.pop()
			}
			if (this.lastDecimal == '.') {
				this.digits.pop()
			}
		}
	}
	map(fn) {
		let index = 0
		this.digits = this.digits.map(function (val, idx) {
			if (val == '.') {
				return val
			} else {
				return fn(val, idx, index++)
			}
		})
	}
	forEach(fn) {
		let index = 0
		this.digits.forEach(function (val, idx) {
			if (val == '.') {
				return val
			} else {
				return fn(val, idx, index++)
			}
		})
	}
	removeDecimal() {
		let dp = this.decimalPlace
		if (dp > -1) {
			this.digits.splice(dp,1)
		}
	}
	insertDecimal(idx) {
		let dp = this.decimalPlace
		if (dp > -1) {
			this.digits.splice(dp,1)
		}
		while (this.length < idx+1) {
			this.digits.push(0)
		}
		this.digits.splice(idx,0,'.')
	}
}

// summation utility function
function summation(start,end,fn) {
	let sum = 0
	let prev = 0
	
	for (let k = start; k < end; k++) {
		prev = sum
		sum = fn(sum,k)
		
		// check for convergence, finish early if possible
		if (sum == prev) {
			break
		}
	}
	
	return sum
}

/**
	BigNum class constructor
*/
const BigNum = function (x) {
	if (x instanceof BigNum || x instanceof NumberBuffer) {
		this.value = x.value
	} else if (x instanceof Array) {
		this.value = x.join('')
	} else {
		this.value = String(x)
	}
}

/**
	BigNum properties
*/
Object.defineProperties(BigNum,{
	'precision': {
		value: 100,
		configurable: false,
		enumerable: false,
		writable: true
	},
	'maxIterations': {
		value: 100,
		configurable: false,
		enumerable: false,
		writable: true
	},
	'useTaylorSeries': {
		value: true,
		configurable: false,
		enumerable: false,
		writable: true
	}
})
/**
	Property functions
*/
BigNum.typeOf = BigNum.type_of = function (x) {
	if (BigNum.isNaN(x)) {
		return 'NaN'
	} else if (BigNum.isZero(x) || BigNum.isInfinite(x)) {
		return x
	} else {
		return 'number'
	}
}
BigNum.isNaN = BigNum.is_nan = function (x) {
	return isNaN(x)
}
BigNum.isNumber = BigNum.is_number = function (x) {
	return !isNaN(Number(x))
}
BigNum.isZero = BigNum.is_zero = BigNum.z = function (x) {
	return !BigNum.isNaN(x) && Number(x) === 0
}
BigNum.isNotZero = BigNum.is_not_zero = BigNum.nz = function (x) {
	return Number(x) !== 0
}
BigNum.isPositive = BigNum.is_positive = function (x) {
	return !isNaN(x) && String(x)[0] !== '-'
}
BigNum.isNegative = BigNum.is_negative = function (x) {
	return !isNaN(x) && String(x)[0] === '-'
}
BigNum.isInteger = BigNum.is_integer = function (x) {
	return !isNaN(x) && String(x).indexOf('.') === -1
}
BigNum.isDecimal = BigNum.is_decimal = function (x) {
	return !isNaN(x) && String(x).indexOf('.') > -1
}
BigNum.isNormal = BigNum.is_normal = function (x) {
	return !isNaN(x) && !BigNum.isGreater(BigNum.abs(x),1)
}
BigNum.isFinite = BigNum.is_finite = function (x) {
	return isFinite(x)
}
BigNum.isInfinite = BigNum.is_infinite = function (x) {
	return !isNaN(x) && !isFinite(x)
}
BigNum.isEven = BigNum.is_even = function (x) {
	return BigNum.isInteger(x) && x[x.length-1] % 2 == 0
}
BigNum.isOdd = BigNum.is_odd = function (x) {
	return BigNum.isInteger(x) && x[x.length-1] % 2 == 1
}
/**
	Comparison functions
*/
BigNum.isGreater = BigNum.is_greater = BigNum.gt = function (x,y) {
	return BigNum.isPositive(BigNum.subtract(x,y))
}
BigNum.isLesser = BigNum.is_lesser = BigNum.lt = function (x,y) {
	return BigNum.isNegative(BigNum.subtract(x,y))
}
BigNum.isEqual = BigNum.is_equal = BigNum.eq = function (x,y) {
	return BigNum.isZero(BigNum.subtract(x,y))
}
BigNum.isNotEqual = BigNum.is_not_equal = BigNum.neq = function (x,y) {
	return !BigNum.isEqual(x,y)
}
BigNum.compare = BigNum.cmp = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 0
	}
	let sub = BigNum.subtract(x,y)
	if (BigNum.isPositive(sub)) {
		return 1
	} else if (BigNum.isNegative(sub)) {
		return -1
	} else {
		return 0
	}
}
BigNum.compareAbs = BigNum.cmpabs = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 0
	}
	let sub = BigNum.subtract(BigNum.abs(x),BigNum.abs(y))
	if (BigNum.isPositive(sub)) {
		return 1
	} else if (BigNum.isNegative(sub)) {
		return -1
	} else {
		return 0
	}
}
BigNum.maximum = BigNum.max = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	}
	switch (BigNum.compare(x,y)) {
		case 0:
		case 1:
			return x
		case -1:
			return y
	}
}
BigNum.mininum = BigNum.min = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	}
	switch (BigNum.compare(x,y)) {
		case 0:
		case 1:
			return y
		case -1:
			return x
	}
}
/**
	Rounding functions
*/
BigNum.truncate = BigNum.trunc = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	let X = new NumberBuffer(x)
	let prec = BigNum.precision
	while (X.decimalPlaces > prec) {
		X.pop()
	}
	return X.value
}
BigNum.round = BigNum.rnd = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	let X = new NumberBuffer(x)
	if (X.firstDecimal < 5) {
		return X.integerValue
	} else {
		return BigNum.add(X.integerValue,1)
	}
}
BigNum.floor = BigNum.flr = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	let X = new NumberBuffer(x)
	return X.integerValue
}
BigNum.ceiling = BigNum.ceil = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	let X = new NumberBuffer(x)
	if (BigNum.isNotZero(X.decimalValue)) {
		return BigNum.add(X.integerValue,1)
	} else {
		return X.integerValue
	}
}
/**
	Elementary operations
*/
BigNum.opposite = BigNum.negate = BigNum.neg = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (String(x)[0] == '-') {
		return x.substring(1)
	} else {
		return '-' + x
	}
}
BigNum.add = BigNum.plus = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	}
	let X = new NumberBuffer(x)
	let Y = new NumberBuffer(y)
	let Z = new NumberBuffer(0)
	
	// align decimal places
	let ip = Math.max(X.integerPlaces,Y.integerPlaces)
	let dp = Math.max(X.decimalPlaces,Y.decimalPlaces)
	
	X.setPadding(ip,dp)
	Y.setPadding(ip,dp)
	Z.setPadding(ip,dp)
	
	// reverse digits so that the last decimal comes first
	X.reverseDigitOrder()
	Y.reverseDigitOrder()
	Z.reverseDigitOrder()
	
	let xs = X.sign
	let ys = Y.sign
	let temp = 0
	let carry = 0
	
	// perform integer arithmetic
	Z.map(function (d, i) {
		temp = (X.get(i) * xs) + (Y.get(i) * ys) + carry
		carry = Math.floor(temp/10)
		temp -= 10 * carry
		return temp
	})

    // add another digit if needed
    if (carry > 0) {
		Z.digits.push(carry)
	}
	
	// or do negation
	else if (carry < 0) {
		
		carry = 0
		Z.map(function (d) {
			temp = carry - d
			carry = Math.floor(temp/10)
			temp -= 10 * carry
			return temp
		})
		
		Z.negate()
	}

	// reverse again
	Z.reverseDigitOrder()
	
	// remove trailing/leading zeros
	Z.trim()
	
	return Z.value
}
BigNum.subtract = BigNum.sub = BigNum.minus = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	}
	return BigNum.add(x,BigNum.negate(y))
}
BigNum.multiply = BigNum.mult = BigNum.times = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	} else if (BigNum.isInfinite(x)) {
		if (BigNum.isZero(y)) {
			return 'NaN'
		} else {
			return x
		}
	} else if (BigNum.isInfinite(y)) {
		if (BigNum.isZero(x)) {
			return 'NaN'
		} else {
			return y
		}
	}
	
	let X = new NumberBuffer(x)
	let Y = new NumberBuffer(y)
	let Z = new NumberBuffer(0)
	
	// set product's estimated size
	Z.setPadding(X.integerPlaces + Y.integerPlaces, X.decimalPlaces + Y.decimalPlaces)

	// reverse digits so that the last decimal comes first
	X.reverseDigitOrder()
	Y.reverseDigitOrder()
	Z.reverseDigitOrder()

	let zs = 0
	let zi = 0
	let zj = 0
	let temp = 0
	let carry = 0
	
	// perform integer arithmetic
	Y.forEach(function (ys) {
		// get the initial digit offset
		if (Z.get(zj) == '.') zj++
		zi = zj++
		
		// multiply each digit in the first number by the current digit in the second
		carry = 0
		X.forEach(function (xs) {
			// get the current digit in the product
			while ((zs = Z.get(zi)) == '.') zi++
			
			// calculate and carry
			temp = (xs * ys) + Number(zs) + carry
			carry = Math.floor(temp/10)
			temp -= 10 * carry
			Z.set(zi, temp)
			
			zi++
		})
		
		// carry throughout the rest of the product
		while (carry > 0) {
			while ((zs = Z.get(zi)) == '.') zi++
			
			temp = Number(zs) + carry
			carry = Math.floor(temp/10)
			temp -= 10 * carry
			Z.set(zi, temp)

			zi++
		}
	})
	
	// positive * negative = negative
	if (X.sign * Y.sign < 0) {
		Z.negate()
	}
	
	// reverse again
	Z.reverseDigitOrder()
	
	// remove trailing/leading zeros
	Z.trim()
	
	return Z.value
}
BigNum.divide = BigNum.div = function (n,d, integerOnly = false) {
	if (isNaN(n) || isNaN(d)) {
		return 'NaN'
	} else if (BigNum.isZero(d)) {
		if (BigNum.isPositive(n)) {
			return 'Infinity'
		} else if (BigNum.isNegative(n)) {
			return '-Infinity'
		} else {
			return 'NaN'
		}
	} else if (BigNum.isZero(n)) {
		return '0'
	}

	let N = new NumberBuffer(n) // numerator
	let D = new NumberBuffer(d) // denominator/divisor
	let Q = new NumberBuffer('') // quotient of N/D
	let R = '' // remainder
	
	// Check if divisor has a decimal point, and if so
    // count the decimal places and shift it by a magnitude
    // until it is an integer.  Extend the numerator with
    // zeroes then move its decimal point equally.
    if (D.decimalPlace > -1) {
        let ddp = D.decimalPlaces
        D.removeDecimal()
		D.trim()

		let ndp = N.decimalPlace
		if (ndp > -1) {
			N.insertDecimal(ndp + ddp)
		} else {
			N.insertDecimal(N.integerPlaces + ddp)
		}
		N.trim()
    }
	
	// resolve the signage
	if (N.sign * D.sign < 0) {
		Q.negate()
	}
	
	// force each operand to be positive
	N.isNegative = D.isNegative = false
	
	// use the string value rather than the object
	N = N.value
	D = D.value

    let c = 0 // counter for subtractions from remainder
    let dec = -1 // decimal places; -1 = no decimal point
	let temp = ''
	
	// perform long division so long as there are digits to process in the numerator
	for (let d of N) {
		// insert decimal place
		if (d == '.') {
			if (integerOnly) {
				break
			} else {
				Q.push(d)
				dec = 0
				continue
			}
		}
		// increment decimal counter if a decimal place has been added
		else if (dec > -1) {
			dec++
		}
		
		// append dividend digit to remainder
		R += String(d)
		
		// subtract divisor from remainder and count the number of iterations
		c = 0
		// lexicographic string comparison works well for long digit strings
		while (!BigNum.isNegative(temp = BigNum.sub(R,D))) {
			R = temp
			c++
		}
		
		// append count to quotient
		Q.push(c)
	}
	
	// if a remainder is still around after all digits are used,
	// continue long division until precision limit reached or
	// the remainder is gone
    if (!integerOnly && R > 0) {
        if (dec < 0) {
            Q.push('.')
            dec = 0
        }
        while (dec < BigNum.precision && R > 0) {
            R += '0'
            c = 0
            while (!BigNum.isNegative(temp = BigNum.sub(R,D))) {
				R = temp
				c++
			}
            Q.push(c)
			dec++
        }
    }
	
	Q.trim()

    return Q.value
}
BigNum.integerDivide = BigNum.idiv = function (n,d) {
	return BigNum.divide(n,d,true)
}
BigNum.modulo = BigNum.mod = function (x,y) {
	if (isNaN(x) || isNaN(y)) {
		return 'NaN'
	}
	return BigNum.sub(x,BigNum.multiply(y,BigNum.integerDivide(x,y)))
}
BigNum.increment = BigNum.inc = function (x) {
	return BigNum.add(x,1)
}
BigNum.decrement = BigNum.dec = function (x) {
	return BigNum.sub(x,1)
}
BigNum.absoluteValue = BigNum.abs = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isNegative(x)) {
		return BigNum.negate(x)
	} else {
		return x
	}
}
/**
	Power functions
*/
BigNum.powerOf = BigNum.pow = function (b,p) {
	if (isNaN(b) || isNaN(p)) {
		return 'NaN'
	}
	// 0^0 = ???
	if (BigNum.isZero(b) && BigNum.isZero(p)) {
		return 'NaN'
	}
	
	let N = BigNum.isNegative(p)
	if (N) {
		p = BigNum.abs(p)
		b = BigNum.div(1,b)
	}
	
	if (BigNum.isDecimal(p)) {
		return 'Not supported'
	}
	
	// Objective: Calculate the powers of 2 whose sum is the integer exponent p
	let E = 1
	// As long as p > 0, apply decimal->binary conversion and multiply E by the power of b
	while (BigNum.gt(p,1)) {
		if (BigNum.isNotZero(BigNum.mod(p,2))) {
			E = BigNum.mult(E,b)
		}
		// square b
		b = BigNum.mult(b,b)
		
		// integer divide the power p
		p = BigNum.idiv(p,2)
	}
	
	return E
}
BigNum.powerOf2 = BigNum.pow2 = function (p) {
	return BigNum.pow(2,p)
}
BigNum.powerOf10 = BigNum.pow10 = function (p) {
	return BigNum.pow(10,p)
}
BigNum.powE = BigNum.exp = BigNum.e = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	let pow = '1' // power of x, starting at x^0 = 1
	let fct = '1' // factorial, starting at 0! = 1
	let delta
	
	return summation(1, BigNum.maxIterations, function (sum,i) {
		delta = BigNum.div(pow, fct)
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			// each iteration increases the power of x by 1, e.g. x^2, x^3, x^4, ...
			pow = BigNum.mult(pow, x)
			// perform one multiply to optimize factorial calculation
			fct = BigNum.mult(fct, i)
		}
		
		return sum
	})
}
BigNum.square = BigNum.sqr = function (x) {
	return BigNum.pow(x,2)
}
BigNum.cube = BigNum.cb = function (x) {
	return BigNum.pow(x,3)
}
BigNum.nthRoot = BigNum.nrt = function (x,n) {
	if (isNaN(x) || isNaN(n)) {
		return 'NaN'
	}
	// 0th root of 0 = ???
	if (BigNum.isZero(x) && BigNum.isZero(n)) {
		return 'NaN'
	}
	// x^n where x < 0 and n is even
	if (BigNum.isNegative(x) && BigNum.isEven(n)) {
		return 'NaN'
	}
	//x^n where n is non-integer
	if (BigNum.isDecimal(n)) {
		return 'Not supported'
	}
	
	// Babylonian method
	// See: https://en.wikipedia.org/wiki/Nth_root_algorithm
	let root = 1
	let prev = 0
	let nMinus1 = BigNum.sub(n, 1)
	let max = BigNum.maxIterations

	for (let i = 0; i < max; i++) {
		prev = root
		root = BigNum.add(
			root,
			BigNum.div( // ((A / (x ^ (n - 1))) - x) / n
				BigNum.sub( // (A / (x ^ (n - 1))) - x
					BigNum.div( // A / (x ^ (n - 1))
						x,
						BigNum.pow( // x ^ (n - 1)
							root,
							nMinus1 // n - 1
						)
					),
					root
				),
				n
			)
		)
		if (prev == root) {
			break
		}
	}
	
	return root
}
BigNum.squareRoot = BigNum.sqrt = function (x) {
	if (isNaN(x) || BigNum.isNegative(x)) {
		return 'NaN'
	}
	return BigNum.nthRoot(x,2)
}
BigNum.cubeRoot = BigNum.cbrt = function (x) {
	return BigNum.nthRoot(x,3)
}
/**
	Trigonometric functions
	* 6 basic functions and their inverses
	* 6 hyperbolic functions and their inverses
*/
BigNum.sine = BigNum.sin = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	let zTerm = x
	let zTermSquared = BigNum.negate(BigNum.mult(x,x))
	let fctTerm = '1'
	let delta
	let k2
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/0eeb6209d2ef99d44eb022f43b79787eade4c648
	return summation(0, BigNum.maxIterations, function (sum,k) {
		delta = BigNum.div(zTerm, fctTerm)
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			k2      = 2 * (k + 1)
			zTerm   = BigNum.mult(zTerm, zTermSquared)
			fctTerm = BigNum.mult(fctTerm, (k2) * (k2 + 1))
		}
		
		return sum
	})
}
BigNum.cosine = BigNum.cos = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	let zTerm = '1'
	let zTermSquared = BigNum.negate(BigNum.mult(x,x))
	let fctTerm = '1'
	let delta
	let k2
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/9386a3bfce6368adbad6c7962f37b18b9b995012
	return summation(0, BigNum.maxIterations, function (sum,k) {
		delta = BigNum.div(zTerm, fctTerm)
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			k2      = 2 * (k + 1)
			zTerm   = BigNum.mult(zTerm, zTermSquared)
			fctTerm = BigNum.mult(fctTerm,(k2)*(k2 - 1))
		}
		
		return sum
	})
}
BigNum.tangent = BigNum.tan = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	return BigNum.div(BigNum.sin(x),BigNum.cos(x))
}
BigNum.cosecant = BigNum.csc = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	return BigNum.div(1,BigNum.sin(x))
}
BigNum.secant = BigNum.sec = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	return BigNum.div(1,BigNum.cos(x))
}
BigNum.cotangent = BigNum.cot = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	return BigNum.div(BigNum.cos(x),BigNum.sin(x))
}
BigNum.arcSine = BigNum.arcsin = BigNum.asin = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isGreater(BigNum.abs(x),1)) {
		return 'NaN'
	}
	
	let nFctTerm = '1'
	let zTerm = x
	let zTermSquared = BigNum.mult(x,x)
	let pow2Term = '1'
	let dFctTerm = '1'
	let delta
	let k2
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/4fc3700c4addbf8311c6ff90b93ac759a750d6d8
	return summation(0, BigNum.maxIterations, function (sum,k) {
		delta = BigNum.div(BigNum.mult(nFctTerm,zTerm),BigNum.mult(BigNum.mult(pow2Term,2*k+1),BigNum.mult(dFctTerm,dFctTerm)))
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			k2 = 2 * (k+1)
			nFctTerm  = BigNum.mult(nFctTerm,(k2)*(k2 - 1))
			zTerm     = BigNum.mult(zTerm,zTermSquared)
			pow2Term  = BigNum.mult(pow2Term,4) // * 2^2
			dFctTerm  = BigNum.mult(dFctTerm,k+1)
		}
		
		return sum
	})
}
BigNum.arcCosine = BigNum.arccos = BigNum.acos = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isGreater(BigNum.abs(x),1)) {
		return 'NaN'
	}
	
	return BigNum.sub(BigNum.asin(1),BigNum.asin(x))
}
BigNum.arcTangent = BigNum.arctan = BigNum.atan = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	let zTerm = x
	let zTermSquared = BigNum.negate(BigNum.mult(x,x))
	let nTerm = 1
	let delta
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/bde385b223a3706eb46a282d932a6dc758bbd8fa
	return summation(0, BigNum.maxIterations, function (sum) {
		delta = BigNum.div(zTerm,nTerm)
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			zTerm = BigNum.mult(zTerm, zTermSquared)
			nTerm += 2
		}
		
		return sum
	})
}
BigNum.arcCosecant = BigNum.arccsc = BigNum.acsc = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isLesser(BigNum.abs(x),1)) {
		return 'NaN'
	}
	
	return BigNum.asin(BigNum.div(1,x))
}
BigNum.arcSecant = BigNum.arcsec = BigNum.asec = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isLesser(BigNum.abs(x),1)) {
		return 'NaN'
	}
	
	return BigNum.acos(BigNum.div(1,x))
}
BigNum.arcCotangent = BigNum.arccot = BigNum.acot = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	return BigNum.atan(BigNum.div(1,x))
}
BigNum.hyperSine = BigNum.hypsin = BigNum.sinh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		let zTerm = x
		let zTermSquared = BigNum.mult(x,x)
		let fctTerm = '0'
		let delta = ''
		let k2 = 0
		
		// https://wikimedia.org/api/rest_v1/media/math/render/svg/0eeb6209d2ef99d44eb022f43b79787eade4c648
		return summation(0, BigNum.maxIterations, function (sum,k) {
			delta = BigNum.div(zTerm,fctTerm)
			
			if (BigNum.isNotZero(delta)) {
				sum = BigNum.add(sum, delta)
				k2 = 2 * (k + 1)
				zTerm     = BigNum.mult(zTerm, zTermSquared)
				fctTerm   = BigNum.mult(fctTerm,(k2)*(k2 + 1))
			}
			
			return sum
		})
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(BigNum.sub(e1,e2),2)
}
BigNum.hyperCosine = BigNum.hypcos = BigNum.cosh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		let zTerm = '1'
		let zTermSquared = BigNum.mult(x,x)
		let fctTerm = '1'
		let delta = ''
		let k2 = 0
		
		// https://wikimedia.org/api/rest_v1/media/math/render/svg/9386a3bfce6368adbad6c7962f37b18b9b995012
		return summation(0, BigNum.maxIterations, function (sum,k) {
			delta = BigNum.div(zTerm,fctTerm)
			
			if (BigNum.isNotZero(delta)) {
				sum = BigNum.add(sum, delta)
				k2 = 2 * (k + 1)
				zTerm     = BigNum.mult(zTerm, zTermSquared)
				fctTerm   = BigNum.mult(fctTerm,(k2)*(k2 + 1))
			}
			
			return sum
		})
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(BigNum.add(e1,e2),2)
}
BigNum.hyperTangent = BigNum.hyptan = BigNum.tanh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		let zTerm = '1'
		let zTermSquared = BigNum.mult(x,x)
		let fctTerm = '1'
		let delta = ''
		
		// TODO: use Bernoulli numbers
		//return summation(0, BigNum.maxIterations, function (sum,k) {})
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(BigNum.sub(e1,e2),BigNum.add(e1,e2))
}
BigNum.hyperCosecant = BigNum.hypcsc = BigNum.csch = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		return BigNum.div(1,BigNum.sinh(x))
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(2,BigNum.sub(e1,e2))
}
BigNum.hyperSecant = BigNum.hypsec = BigNum.sech = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		return BigNum.div(1,BigNum.cosh(x))
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(2,BigNum.add(e1,e2))
}
BigNum.hyperCotangent = BigNum.hypcot = BigNum.coth = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		return BigNum.div(1,BigNum.tanh(x))
	}
	
	let e1 = BigNum.exp(x)
	let e2 = BigNum.exp(BigNum.negate(x))
	return BigNum.div(BigNum.add(e1,e2),BigNum.sub(e1,e2))
}
BigNum.arcHyperSine = BigNum.arhypsin = BigNum.arsinh = BigNum.asinh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}

	let nFctTerm = '1'
	let zTerm = x
	let zTermSquared = BigNum.negate(BigNum.mult(x,x))
	let pow2Term = '1'
	let dFctTerm = '1'
	let delta
	let k2
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/e915cadf00a2f6f95ccc6ae99dbf5c5b574a820b
	return summation(0, BigNum.maxIterations, function (sum,k) {
		delta = BigNum.div(BigNum.mult(nFctTerm,zTerm),BigNum.mult(BigNum.mult(pow2Term,2*k+1),BigNum.mult(dFctTerm,dFctTerm)))
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			k2 = 2 * (k+1)
			nFctTerm  = BigNum.mult(nFctTerm,(k2)*(k2 - 1))
			zTerm     = BigNum.mult(zTerm,zTermSquared)
			pow2Term  = BigNum.mult(pow2Term,4)
			dFctTerm  = BigNum.mult(dFctTerm,k+1)
		}
		
		return sum
	})
}
BigNum.arcHyperCosine = BigNum.arhypcos = BigNum.arcosh = BigNum.acosh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isLesser(x,1)) {
		return 'NaN'
	}
	// TODO: find a better Taylor series than pi/2 - asinh(x)
	return BigNum.sub(BigNum.asinh(1),BigNum.asinh(x))
}
BigNum.arcHyperTangent = BigNum.arhyptan = BigNum.artanh = BigNum.atanh = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isGreater(BigNum.abs(x),1)) {
		return 'NaN'
	}
	
	let zTerm = x
	let zTermSquared = BigNum.mult(x,x)
	let delta = ''
	
	// https://wikimedia.org/api/rest_v1/media/math/render/svg/33cab9855e7ab0d8b6e59cdfe1e8e99cef53d093
	return summation(0, BigNum.maxIterations, function (sum,k) {
		delta = BigNum.div(zTerm,2*k+1)
		
		if (BigNum.isNotZero(delta)) {
			sum = BigNum.add(sum, delta)
			zTerm = BigNum.mult(zTerm, zTermSquared)
		}
		
		return sum
	})
}
BigNum.arcHyperCosecant = BigNum.arhypcsc = BigNum.arcsch = BigNum.acsch = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isZero(x)) {
		return 'NaN'
	}
	return BigNum.asinh(BigNum.div(1,x))
}
BigNum.arcHyperSecant = BigNum.arhypsec = BigNum.arsech = BigNum.asech = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (!BigNum.isGreater(x,0) || BigNum.isGreater(x,1)) {
		return 'NaN'
	}
	return BigNum.acosh(BigNum.div(1,x))
}
BigNum.arcHyperCotangent = BigNum.arhypcot = BigNum.arcoth = BigNum.acoth = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	if (BigNum.isLesser(BigNum.abs(x),1)) {
		return 'NaN'
	}
	return BigNum.atanh(BigNum.div(1,x))
}
/**
	Archaic trig functions
	* Versed sine and cosine
	* Coversed sine and cosine
	* Their half-versed constituents
	* Exsecant and excosecant
*/
BigNum.versedSine = BigNum.versine = BigNum.versin = BigNum.sinver = BigNum.vers = BigNum.ver = function (x) {
	// Versed sine: 1 - cos x
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		let zTerm = '1' // at k = 1 initial term, (-1)^(k-1) is 1
		let zTermSquared = BigNum.negate(BigNum.mult(x,x))
		let fctTerm = '1'
		let delta
		let k2
		
		// https://wikimedia.org/api/rest_v1/media/math/render/svg/9386a3bfce6368adbad6c7962f37b18b9b995012
		return summation(1, BigNum.maxIterations, function (sum,k) {
			k2 = 2 * k
			fctTerm = BigNum.mult(fctTerm,(k2)*(k2-1))
			delta = BigNum.div(zTerm,fctTerm)
			
			if (BigNum.isNotZero(delta)) {
				sum = BigNum.add(sum, delta)
				zTerm = BigNum.mult(zTerm, zTermSquared)
			}
			
			return sum
		})
	}
	
	return BigNum.sub(1,BigNum.cos(x))
}
BigNum.versedCosine = BigNum.vercosine = BigNum.vercosin = BigNum.vercos = BigNum.vcs = function (x) {
	// Versed cosine: 1 + cos x
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: find Taylor polynomial
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.add(1,BigNum.cos(x))
}
BigNum.coversedSine = BigNum.coversine = BigNum.coversin = BigNum.covers = BigNum.cvs = function (x) {
	// Co-versed sine = 1 - sin x
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: find Taylor polynomial
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.sub(1,BigNum.sin(x))
}
BigNum.coversedCosine = BigNum.covercosine = BigNum.covercosin = BigNum.covercos = BigNum.cvc = function (x) {
	// Co-versed cosine: 1 + sin x
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: find Taylor polynomial
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.add(1,BigNum.sin(x))
}
BigNum.haversedSine = BigNum.haversine = BigNum.haversin = BigNum.hav = BigNum.hvs = function (x) {
	// Half-versed sine
	if (isNaN(x)) {
		return 'NaN'
	}
	
	if (BigNum.useTaylorSeries) {
		let zTerm = '1' // at k = 1 initial term, (-1)^(k-1) is 1
		let zTermSquared = BigNum.negate(BigNum.mult(x,x))
		let fctTerm = '1'
		let delta
		let k2
		
		// https://wikimedia.org/api/rest_v1/media/math/render/svg/9386a3bfce6368adbad6c7962f37b18b9b995012
		return summation(1, BigNum.maxIterations, function (sum,k) {
			k2 = 2 * k
			fctTerm = BigNum.mult(fctTerm,(k2)*(k2-1))
			delta = BigNum.div(zTerm,BigNum.mult(2,fctTerm))
			
			if (BigNum.isNotZero(delta)) {
				sum = BigNum.add(sum, delta)
				zTerm = BigNum.mult(zTerm, zTermSquared)
			}
			
			return sum
		})
	}
	
	return BigNum.div(BigNum.ver(x),2)
}
BigNum.haversedCosine = BigNum.havercosine = BigNum.havercos = BigNum.hac = BigNum.hvc = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: Find Taylor series
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.div(BigNum.vcs(x),2)
}
BigNum.hacoversedSine = BigNum.hacoversine = BigNum.hacovers = BigNum.hacov = BigNum.hcv = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: Find Taylor series
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.div(BigNum.cvs(x),2)
}
BigNum.hacoversedCosine = BigNum.hacovercosine = BigNum.hacovercos = BigNum.hcc = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO: Find Taylor series
	if (BigNum.useTaylorSeries) {
		
	}
	
	return BigNum.div(BigNum.cvc(x),2)
}
BigNum.exsecant = BigNum.exsec = BigNum.exs = function (x) {
	return BigNum.sub(BigNum.sec(x),1)
}
BigNum.excosecant = BigNum.excsc = BigNum.exc = function (x) {
	return BigNum.sub(BigNum.csc(x),1)
}
/**
	Other functions
*/
BigNum.factorial = BigNum.fct = function (x) {
	if (isNaN(x) || BigNum.isDecimal(x)) {
		return 'NaN'
	}
	if (BigNum.isInfinite(x)) {
		return 'Infinity'
	}
	
	x = Number(x)
	let F = '1'
	
	while(x > 1) {
		F = BigNum.mult(F,x--)
	}
	
	return F
}
BigNum.hypotenuse = BigNum.hypot = function (x,y) {
	return BigNum.sqrt(BigNum.add(BigNum.mult(x,x),BigNum.mult(y,y)))
}
BigNum.logE = BigNum.ln = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	let x2 = BigNum.mult(x,x)
	return BigNum.atanh(BigNum.div(BigNum.sub(x2,1),BigNum.add(x2,1)))
}
BigNum.log2 = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO
}
BigNum.log10 = function (x) {
	if (isNaN(x)) {
		return 'NaN'
	}
	// TODO
}
BigNum.random = function () {
	return BigNum.mod(BigNum.mult(Math.random(),Math.random()+1),1)
}
BigNum.randomFrom = function (x,y) {
	return BigNum.add(x,BigNum.mult(BigNum.random(),BigNum.sub(y,x)))
}

for (let k in BigNum) {
	if (BigNum.hasOwnProperty(k) && BigNum[k] instanceof Function) {
		BigNum.prototype[k] = function() {
			return BigNum[k](this.value,...arguments)
		}
	}
}

if (typeof(module) !== 'undefined' && module.exports) {
	module.exports = BigNum
}
