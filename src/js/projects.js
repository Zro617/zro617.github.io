(function(){
  var xhr = new XMLHttpRequest();
  xhr.open("GET","https://scratch.mit.edu/site-api/projects/in/1000000/1/",true);
  xhr.responseType = "document";
  xhr.onload = function() {
    if(this.status=='200'){
      var projects_in=this.response.querySelectorAll("li"),i,proj,img,
          projects_out=document.querySelector("#scratch");
          for(i=0;i<projects_in.length;i++){
            proj = projects_in[i];
            img = proj.querySelector("img");
            img["class"] = "thumbnail";
            img["src"] = img["data-original"];
            img["data-original"] = "";
            proj.removeChild(proj.querySelector("span.owner"));
            projects_out.appendChild(proj);
          }
    }
  };
  xhr.send();
})();
