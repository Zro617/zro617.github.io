(function(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET","https://scratch.mit.edu/site-api/projects/in/1000000/1/",true);
  xhr.responseType = "document";
  xhr.onload = function() {
    if(this.status=='200'){
      var projects_in=this.response.querySelectorAll("li"),i,proj,a,_,img,
          projects_out=document.querySelector("#scratch");
          for(i=0;i<projects_in.length;i++){
            proj = projects_in[i];
            a = proj.querySelectorAll("a");
            for (_ in a) a[_].setAttribute("href","//scratch.mit.edu"+a[_].getAttribute("href"));
            img = proj.querySelector("img");
            img.setAttribute("class","thumbnail");
            img.setAttribute("src",img.getAttribute("data-original"));
            img.setAttribute("data-original","");
            proj.removeChild(proj.querySelector("span.owner"));
            projects_out.appendChild(proj);
          }
    }
  };
  xhr.send();
})();
