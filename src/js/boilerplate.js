(function(h,f){
function qs(x){return document.querySelector(x);}
function ac(a,b){a.appendChild(b);return a;}
function e(a,b,c,d){var _=document.createElement(a);for(d in b)_.setAttribute(d,b[d]);if(c)"string"==typeof c?_.innerHTML=c:ac(_,c);return _;}
var header = e("ul",{class:"nodot"},""), footer = e("ul",{class:"nodot"},""),_,n,l;
for(_=0;_<h.length;_++)n=h[_].name,l=h[_].link,ac(header,(e("li",{class:"allcaps"},e("a",{href:l},n))));
for(_=0;_<f.length;_++)n=f[_].name,l=f[_].link,ac(footer,(e("li",{class:"ln"},l?e("a",{href:l},n):n)));
ac(qs("header"),header);ac(qs("footer"),footer);ac(qs("head"),e("link",{rel:"shortcut icon",href:"//cloud.githubusercontent.com/assets/11638093/12807329/2f8206e4-cad4-11e5-9881-a2ff91b2fb8e.png",type:"image/x-icon",sizes:"32x32"},""));
})([{name:"Home",link:"//zro617.github.io"},{name:"About Me",link:"//zro617.github.io/aboutme.html"}],[{name:"Copyright &copy; 2015-2016 Zro617",link:""},{name:"GitHub",link:"//github.io/Zro617"},{name:"Scratch",link:"//scratch.mit.edu/users/Zro716"},{name:"SoundCloud",link:"//soundcloud.com/zro-from-scratch"},{name:"Google+",link:"//plus.google.com/103893775840439999959"},{name:"Email",link:"mailto:zropotato@gmail.com"}]);
