/* Coding by Zro617
   API of Scratch
   Incomplete but working OK
   Some parts of the API may become deprecated soon
   
   
   NOTES (PLEASE READ!!!!!)
   *  The most important function you will need is request(req,args)
      *  "req" is the request, which is any one of the members provided under ScratchAPI.hrefs.*
         *  Each member contains the request type and the URL template.
         *  The URL templates are NOT links!!! Arguments are denoted inside angle brackets
            * ex: "/users/<username>/projects/?page=<page>"
      *  "args" is the argument list, which you will provide as an object:
         *  { success: fn(x){ ... }, fail: fn(x){ ... }, body: { (optional) }, etc... } 
            *  "success" is the function that is called when a request is OK, and accepts the XHR response
            *  "fail" is the function that is called otherwise
            *  "success" and "fail" are optional
            *  "body" is optional except when sending a request body, like a comment
            *  The rest of your arguments are necessary for common page requests
               *  "username", "project", "studio", "page", "topic", "post" are common arguments
                  * "username" is the only strictly non-numeric argument
               *  They MUST match argument names in the URL templates!
   *  The default host/domain for most requests is "scratch.mit.edu".
      *  Some requests which are part of the new API use different domains
   *  To send a comment, your request body should look like this:
      { content:"comment stuff",
        parent_id: "id of root comment (leave empty if not replying)",
        commentee_id: ""
      }
   *  The request for following/unfollowing someone apparently needs two "username" arguments
      *  To keep things simple, please refer to the user you're (un)following as "targetusername"
   *  There are two separate requests for "getting" a post:
      *  "get" retrieves the raw post data
      *  "goto" retrieves the topic it resides in
   *  Some requests may require your Scratch CSRF token for permission purposes
      *  In that case, you may need to enter your login credentials if you are not on Scratch
      *  Even with login credentials, some requests may be blocked altogether
   *  ScratchAPI.auxilary contains helpful functions for extracting certain data
      *  Use auxilary.get_page_names for getting the names of objects on a page (e.g. usernames)
      *  Use auxilary.get_page_ids for getting the ID numbers of objects on a page (e.g. project IDs)
      *  Use auxilary.get_all_pages to form a complete list of objects
         *  Requires a loop callback and exit callback, in addition to the request and arg list
         *  Use with the other two auxilary functions for maximum effectiveness
   *  ScratchAPI.main contains many built-in functions for retrieving and sending stuff
      *  Pls look through it all
*/

var ScratchAPI = {
	protocol: "https://",
	host: "scratch.mit.edu",
	domains: {
		api:          "api.scratch.mit.edu", // new API in progress
		projects:     "projects.scratch.mit.edu",
		staging:      "staging.scratch.mit.edu", // is it staging or staging-api?
		cdn:          "cdn.scratch.mit.edu",
		cdn2:         "cdn2.scratch.mit.edu", // what is this for?
		cdn_projects: "cdn.projects.scratch.mit.edu",
		cdn_assets:   "cdn.assets.scratch.mit.edu",
		cloud:        "cloud.scratch.mit.edu"
	},
	hrefs: {
		frontpage: {
			activity: ["GET","/"],
			featured: ["GET","/"],
			project_count: ["GET","/"]
		},
		users: {
			get: ["GET","/users/<username>/"],
			api: ["GET","/api/v1/user/<username>/"],
			session: ["GET","/session/"],
			account_nav: ["GET","/fragment/account-nav.json"],
			messages: {
				get: ["GET","/messages/"],
				count: ["GET","/messages/ajax/get-message-count/"]
			},
			backpack: ["GET","/internalapi/backpack/<username>/get/"],
			projects: ["GET","/users/<username>/projects/?page=<page>"],
			favorites: "GET","/users/<username>/favorites/?page=<page>"],
			studios: ["GET","/users/<username>/studios/?page=<page>"],
			studios_following: ["GET","/users/<username>/studios_following/?page=<page>"],
			following: {
				get: ["GET","/users/<username>/following/?page=<page>"],
				add: ["PUT","/site-api/users/followers/<targetusername>/add/?usernames=<username>"],
				remove: ["PUT","/site-api/users/followers/<targetusername>/remove/?usernames=<username>"]
			},
			followers: {
				get: ["GET","/users/<username>/followers/?page=<page>"]
			},
			comments: {
				get: ["GET","/site-api/comments/user/<username>/?page=<page>"],
				add: ["POST","/site-api/comments/user/<username>/add/"]
			},
			report: ["","/"]
		},
		projects: {
			get: ["GET","/projects/<project>/"],
			api: ["GET","/api/v1/project/<project>/"],
			loveits: {
				get: ["GET","/"],
				add: ["PUT","/site-api/users/lovers/<project>/add/?usernames=<username>"],
				remove: ["PUT","/site-api/users/lovers/<project>/remove/?usernames=<username>"]
			},
			favorites: {
				get: ["GET","/"],
				add: ["PUT","/site-api/users/favoriters/<project>/add/?usernames=<username>"],
				remove: ["PUT","/site-api/users/favoriters/<project>/remove/?usernames=<username>"]
			},
			remixes: {
				get: ["GET","/projects/<project>/remixes/"],
				remixtree: ["GET","/projects/<project>/remixtree/bare/"]
			},
			studios: {
				get: ["GET","/projects/<project>/studios/?page=<page>"],
				add: ["PUT","/site-api/projects/in/<studio>/add/?pks=<project>"],
				remove: ["PUT","/site-api/projects/in/<studio>/remove/?pks=<project>"]
			},
			comments: {
				get: ["GET","/site-api/comments/project/<project>/?page=<page>"],
				add: ["POST","/site-api/comments/project/<project>/add/"]
			},
			report: ["","/"]
		},
		studios: {
			get: ["GET","/studios/<studio>/"],
			projects: {
				get: ["GET","/site-api/projects/in/<studio>/<page>/"],
				add: ["GET","/site-api/projects/in/<studio>/add/?pks=<project>"],
				remove: ["GET","/site-api/projects/in/<studio>/remove/?pks=<project>"]
			},
			curators: {
				get: ["GET","/site-api/users/curators-in/<studio>/<page>"],
				invite: ["PUT",""],
				promote: ["PUT",""],
				remove: ["PUT",""]
			},
			managers: {
				get: ["GET","/site-api/users/owners-in/<studio>/<page>"],
				demote: ["","/"], // :(
				remove: ["PUT",""]
			}
			comments: {
				get: ["GET","/site-api/comments/gallery/<studio>/?page=<page>"],
				add: ["POST","/site-api/comments/gallery/<studio>/add/"]
			},
			report: ["","/"]
		},
		discuss: {
			get: ["GET","/discuss/"],
			get_forum: ["GET","/discuss/<forum>/"],
			topics: {
				get: ["GET","/discuss/topic/<topic>/?page=<page>"],
				add: ["POST","/discuss/<forum>/topic/add/"],
				open: ["PUT","/discuss/topic/<topic>/open_close/o/"],
				close: ["PUT","/discuss/topic/<topic>/open_close/c/"]
			},
			posts: {
				get: ["GET","/discuss/post/<post>/source/"],
				goto: ["GET","/discuss/post/<post>/"],
				add: ["POST","/discuss/topic/<topic>/add/"],
				edit: ["POST","/discuss/post/<post>/edit/"],
				report: ["","/"]
			},
			signature: ["GET","/discuss/<username>/settings/"]
		}
	},
	session: {
		login: function() {
			var u = prompt("Username"), // TODO: Find a sleeker way to do this...
			    p = prompt("Password"),
			    c = "",
			    s = "";
			if (u && p) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET","https://scratch.mit.edu/login/",false);
				xhr.onload = function() {
					if (this.status==200)
						s = this.response.cookie.match(/scratchsessionid=([A-Za-z0-9]+)/)[1];
						c = this.response.cookie.match(/scratchcsrftoken=([A-Za-z0-9]+)/)[1];
					else
						alert("Login failed");
				};
				xhr.send(JSON.stringify({username:u,password:p}));
			}
			return { csrf:c,session:s };
		},
		get_csrf: function() {
			return Scratch ? document.cookie.match(/scratchcsrftoken=([A-Za-z0-9]+)/)[1] : ScratchAPI.session.login().csrf;
		},
		get_sessionid: function() {
			return Scratch ? document.cookie.match(/scratchsessionid=([A-Za-z0-9]+)/)[1] : ScratchAPI.session.login().session;
		}
		get_user_model: function() {
			return Scratch ? Scratch.INIT_DATA.LOGGED_IN_USER.model : { error: "not logged in" };
		}
		get_user_id: function() {
			return Scratch ? Scratch.INIT_DATA.LOGGED_IN_USER.model.id : prompt("Please enter your Scratch ID"); // TODO: Retrieve user ID from username via XHR
		},
		get_username: function() {
			return Scratch ? Scratch.INIT_DATA.LOGGED_IN_USER.model.username : prompt("Please enter your Scratch username");
		},
		get_password: function() {
			return alert("hahahahaha so funny");
		}
	},
	request: function(req,args) {
		var type = req[0],
		    url = this.protocol+this.host+req[1];
		    params = req[1].match(/<(.*)>/g);
		console.log("URL (before): "+url);
		if (args && params.length)
			for (var e=0;e<params.length;e++)
				url=url.replace("<"+params[e]+">",args[params[e]]);
		console.log("URL (after):  "+url);
		var xhr = new XMLHttpRequest();
		xhr.open(type,url,true);
		if (type=="PUT"||type=="POST")xhr.setRequestHeader("X-CSRFToken",this.session.get_csrf());
		xhr.onload = function() {
			if (this.status==200) {
				if (args.success) { args.success(this.response); }
				else { console.log("SUCCESS"); }
			} else {
				if (args.fail) { args.fail(this.response); }
				else { console.log("FAIL"); }
			}
		};
		xhr.send(args.body?JSON.stringify(args.body):null);
	},
	auxiliary: {
		get_page_ids: function(dom,acc) {
			for(var _=dom.querySelectorAll("span.title"),i=0;i<_.length;i++)
				acc.push(_[i].getElementsByTagName("a")[0].href.match(/\d+/)[0]);
		},
		get_page_names: function(dom,acc) {
			for(var _=dom.querySelectorAll("span.title"),i=0;i<_.length;i++)
				acc.push(_[i].getElementsByTagName("a")[0].innerHTML.trim());
		},
		get_page_elements: function(dom,acc) {
			for(var _=dom.querySelectorAll("li"),i=0;i<_.length;i++)
				acc.push(_[i]);
		}
		get_all_pages: function(req,args,cb,exit) {
			function next(pg) {
				args.page = pg || 1;
				ScratchAPI.request(req,args);
			}
			args.success = function(x) { cb(x);next(args.page+1); };
			args.fail = args.fail || exit;
			//args.body = args.body || {};
			next();
		}
	},
	main: {
		users: {
			test: function(u,cb) {
				cb = cb || console.log;
				var args = {
					username: u || "test",
					success: function(x) { cb(true) },
					fail: function(x) { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.get,args);
			},
			get: function(u,cb) {
				var args = {
					username: u,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.get,args);
			},
			get_api: function(u,cb) {
				var args = {
					username: u,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.api,args);
			}
			get_project_names: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.projects,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_project_ids: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.projects,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects) },
				function(x) { cb(projects) });
			},
			get_favorite_names: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.favorites,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_favorite_ids: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.favorites,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects) },
				function(x) { cb(projects) });
			},
			get_studios_curating_names: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,studios) },
				function(x) { cb(studios) });
			},
			get_studios_curating_ids: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios) },
				function(x) { cb(studios) });
			},
			get_studios_following_names: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios_following,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,studios) },
				function(x) { cb(studios) });
			},
			get_studios_following_ids: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios_following,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios) },
				function(x) { cb(studios) });
			},
			get_following_names: function(u,cb) {
				var users = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.following,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,users) },
				function(x) { cb(users) });
			},
			get_follower_names: function(u,cb) {
				var users = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.followers,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,users) },
				function(x) { cb(users) });
			},
			get_comments: function(u,cb) {
				var comments = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			}
		},
		projects: {
			test: function(p,cb) {
				cb = cb || console.log;
				var args = {
					project: p || "123456",
					success: function(x) { cb(true) },
					fail: function(x) { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.get,args);
			},
			get: function(p,cb) {
				var args = {
					project: p,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.get,args);
			},
			get_api: function(p,cb) {
				var args = {
					project: p,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.api,args);
			}
			get_studio_names: function(p,cb) {
				var studios = [];
				var args = { project: p };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.projects.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,studios) },
				function(x) { cb(studios) });
			},
			get_studio_ids: function(p,cb) {
				var studios = [];
				var args = { project: p };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.projects.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios) },
				function(x) { cb(studios) });
			},
			get_comments: function(u,cb) {
				var comments = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.projects.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			}
		},
		studios: {
			test: function(s,cb) {
				cb = cb || console.log;
				var args = {
					studio: s || "123456",
					success: function(x) { cb(true) },
					fail: function(x) { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.get,args);
			},
			get: function(s,cb) {
				var args = {
					studio: s,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.get,args);
			},
			get_properties: function(s,cb) {
				var args = {
					studios: s,
					success: function(x) {
						cb({
						title:        x.querySelector("h2").innerHTML,
						thumbnail:    x.querySelector("div.img-container").firstChild.href,
						last_updated: x.querySelector("span.date").innerHTML,
						description:  x.querySelector("div.overview")
						});
					},
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.get,args);
			},
			get_comments: function(u,cb) {
				var comments = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			}
		}
	}
};
