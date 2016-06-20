/*
  source code from http://www.w3schools.com/html/html5_draganddrop.asp
  (sorry for using w3schools :P)
*/

function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
	var container = ev.target;
	while (container.className != "container") container = container.parentElement;
    container.appendChild(document.getElementById(data));
}
