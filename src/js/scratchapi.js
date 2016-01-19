/* Coding by Zro617
   API of Scratch
   Incomplete but working OK
   API may become deprecated some time
*/

function ajax(request,url,async,success,fail) {
	var xhr = new XMLHttpRequest();
	xhr.open(request,url,async);
	if (async) xhr.responseType = "document";
	xhr.onload = function() {
		if (xhr.status == 200) success(xhr.response);
		else fail(xhr.response);
	};
	xhr.send();
}

var ScratchAPI = {};

ScratchAPI.protocol = "https://";
ScratchAPI.host = "scratch.mit.edu";
ScratchAPI.domains = {
	projects: "projects.scratch.mit.edu",
	staging:  "staging.scratch.mit.edu",
	cdn:      "cdn.scratch.mit.edu"
};
ScratchAPI.links = {
	users:             "/users/",
	projects:          "/projects/",
	favorites:         "/favorites/",
	studios:           "/studios/",
	studios_following: "/studios_following/",
	following:         "/following/",
	followers:         "/followers/",
	api_user:          "/api/v1/user/",
	api_project:       "/api/v1/project/"
};
ScratchAPI._processIds = function(dom,acc) {
	for(var _=dom.querySelectorAll("span.title"),i=0;i<_.length;i++)
		acc.push(_[i].getElementsByTagName("a")[0].href.match(/\d+/)[0]);
};
ScratchAPI._processNames = function(dom,acc) {
	for(var _=dom.querySelectorAll("span.title"),i=0;i<_.length;i++)
		acc.push(_[i].getElementsByTagName("a")[0].innerHTML.trim());
};
ScratchAPI._getPage = function(url,page,acc,cb,exit) {
	ajax("GET",url+"?page="+page,true,
	function(dom) {
		cb(dom,acc);
		ScratchAPI._getPage(url,page+1,acc,cb,exit);
	},
	exit
	);
};
ScratchAPI.checkUser = function(u,cb) {
	ajax("GET",ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+"/",true,function(dom){cb(true)},function(dom){cb(false)});
};
ScratchAPI.getProjectNames = function(u,cb) {
	var projects = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.projects,1,projects,ScratchAPI._processNames,function(){cb(projects)});
};
ScratchAPI.getFavoriteProjectNames = function(u,cb) {
	var projects = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.favorites,1,projects,ScratchAPI._processNames,function(){cb(projects)});
};
ScratchAPI.getStudioCuratingNames = function(u,cb) {
	var studios = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.studios,1,studios,ScratchAPI._processNames,function(){cb(studios)});
};
ScratchAPI.getStudioFollowingNames = function(u,cb) {
	var studios = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.studios_following,1,studios,ScratchAPI._processNames,function(){cb(studios)});
};
ScratchAPI.getFollowerNames = function(u,cb) {
	var followers = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.followers,1,followers,ScratchAPI._processNames,function(){cb(followers)});
};
ScratchAPI.getFollowingNames = function(u,cb) {
	var following = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.following,1,following,ScratchAPI._processNames,function(){cb(following)});
};
ScratchAPI.getProjectIds = function(u,cb) {
	var projects = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.projects,1,projects,ScratchAPI._processIds,function(){cb(projects)});
};
ScratchAPI.getFavoriteIds = function(u,cb) {
	var projects = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.favorites,1,projects,ScratchAPI._processIds,function(){cb(projects)});
};
ScratchAPI.getStudioCuratingIds = function(u,cb) {
	var studios = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.studios,1,studios,ScratchAPI._processIds,function(){cb(studios)});
};
ScratchAPI.getStudioFollowingIds = function(u,cb) {
	var studios = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.user+u+ScratchAPI.links.studios_following,1,studios,ScratchAPI._processIds,function(){cb(studios)});
};
ScratchAPI.getProjectStudioIds = function(p,cb) {
	var studios = [];
	ScratchAPI._getPage(ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.projects+p+ScratchAPI.links.studios,1,studios,ScratchAPI._processIds,function(){cb(studios)});
};
ScratchAPI.getUserProperties = function(u,cb) {
	ajax("GET",ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.api_user+u+"/",true,
	function(dom){ cb(JSON.parse(dom.body.firstChild.innerHTML)); },
	function(dom){ cb(null); });
};
ScratchAPI.getProjectProperties = function(p,cb) {
	ajax("GET",ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.api_project+p+"/",true,
	function(dom) { cb(JSON.parse(dom.body.firstChild.innerHTML)); },
	function(dom) { cb(null); });
};
ScratchAPI.getStudioProperties = function(s,cb) {
	ajax("GET",ScratchAPI.protocol+ScratchAPI.host+ScratchAPI.links.studios+s+"/",true,
	function(dom) {
		cb({
			title:        dom.querySelector("h2").innerHTML,
			thumbnail:    dom.querySelector("div.img-container").firstChild.href,
			last_updated: dom.querySelector("span.date").innerHTML,
			description:  dom.querySelector("div.overview")
		});
	},
	function(dom) { cb(null); });
};
