(function(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET","https://scratch.mit.edu/site-api/projects/in/1000000/1/",true);
  xhr.responseType = "document";
  xhr.onload = function() {
    if(this.status=='200'){var in=this.response.querySelectorAll("li"),i,out=document.querySelector("#scratch");for(i=0;i<in.length;i++)out.appendChild(in[i]);}
  };
  xhr.send();
})();
