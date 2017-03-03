function range(a,b) {
	return a<b ? Array(b-a+1).fill(0).map(i=>a++) : Array(a-b+1).fill(0).map(i=>a--)
}