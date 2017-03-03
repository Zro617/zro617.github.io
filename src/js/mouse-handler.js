var scroll = { x:0, y:0 }, mouse = { x:0, y:0, oldx:0, oldy:0, dx:0, dy:0, down:false, dragging:null }

document.onscroll = function(e){
	scroll.x = (document.documentElement.scrollLeft) ? document.documentElement.scrollLeft : document.body.scrollLeft
	scroll.y = (document.documentElement.scrollTop)  ? document.documentElement.scrollTop  : document.body.scrollTop
}
document.onmousedown = function(e){
	mouse.down=true
}
document.onmouseup = function(e){
	mouse.down=false
	mouse.dragging=null
}
document.onmousemove = function(e){
	e = e || window.event
	mouse.oldx = mouse.x
	mouse.oldy = mouse.y
	mouse.x = (e.PageX) ? e.PageX : e.clientX + scroll.x
	mouse.y = (e.PageY) ? e.PageY : e.clientY + scroll.y
	mouse.dx = mouse.x - mouse.oldx
	mouse.dy = mouse.y - mouse.oldy
	if (mouse.dragging) {
		var position = positionOf(mouse.dragging)
		mouse.dragging.style.left = String(position.x + mouse.dx) + "px"
		mouse.dragging.style.top = String(position.y + mouse.dy) + "px"
	}
}

for(let e of document.querySelectorAll(".draggable"))
	e.addEventListener("mousedown",function() {
		if(this.className.indexOf("draggable") >- 1)
			mouse.dragging = this
		else
			mouse.dragging = null
	},false)

function positionOf(elem) {
	var position = {x:0, y:0}
	while (elem.offsetParent) {
		position.x += elem.offsetLeft
		position.y += elem.offsetTop
		elem = elem.offsetParent
	}
	position.x += elem.offsetLeft
	position.y += elem.offsetTop
	return position
}