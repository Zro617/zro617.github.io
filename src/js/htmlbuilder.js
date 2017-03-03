/*
	Utility functions for building complex web elements
*/

function CSSBuilder(json) {
	if (typeof json === "string") return json
	var css = "", k
	for (k in json) css += k + ":" + json[k] + ";"
	return css
}
function HTMLBuilder(json) {
	/*	Syntax is as follows:
		{
			tag:"element",
			attributes:{
				class:"class",
				id:"id"
			},
			children:[
				...
			]
		}
	*/
	var e
	if (json.tag) {
		e = document.createElement(json.tag)
		if (json.attributes)
			for (let a in json.attributes)
				e.setAttribute(a,json.attributes[a])
		if (json.children)
			for (let c in json.children)
				e.appendChild(HTMLBuilder(json.children[c]))
	} else {
		e = document.createTextNode(json)
	}
	return e
}