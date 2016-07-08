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
	async: true,
	credentials: {
		username: "",
		password: "",
		csrf: "",
		session: ""
	},
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
	headers: {
		"Cookie":"scratchcsrftoken=a;scratchlanguage=en",
		"X-CSRFToken":"",
		"Referer":"https://scratch.mit.edu",
		"X-Requested-With":"XMLHttpRequest",
		"Content-Length": 0
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
			login: ["POST","/login/"],
			session: ["GET","/session/"],
			account_nav: ["GET","/fragment/account-nav.json"],
			messages: {
				get: ["GET","/messages/"],
				count: ["GET","/messages/ajax/get-message-count/"],
				clear: ["GET","/messages/ajax/purge"]
			},
			backpack: {
				get: ["GET","/internalapi/backpack/<username>/get/"]
			},
			projects: ["GET","/users/<username>/projects/?page=<page>"],
			favorites: ["GET","/users/<username>/favorites/?page=<page>"],
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
				remixtree: ["GET","/projects/<project>/remixtree/bare/"],
				remix: ["GET","/project/<project>/remix/"] // might not be right
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
			share: ["","/projects/<project>/share/"],
			unshare: ["","/projects/<project>/unshare/"],
			trash: ["","/"],
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
			},
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
				report: ["POST","/discuss/misc/?action=report&post_id=<post>"] // this goes to the report page, not the report API
			},
			signature: ["GET","/discuss/<username>/settings/"]
		}
	},
	session: {
		login: function(u,p) {
			ScratchAPI.credentials.username = (u || ScratchAPI.credentials.username || prompt("Username"));
			ScratchAPI.credentials.password = (p || ScratchAPI.credentials.password || prompt("Password"));
			ScratchAPI.credentials.csrf = "";
			ScratchAPI.credentials.session = "";
			if (ScratchAPI.credentials.username && ScratchAPI.credentials.password) {
				var args = {
					body: {
						username:ScratchAPI.credentials.username,
					        password:ScratchAPI.credentials.password
					},
					success: function() {
						ScratchAPI.credentials.csrf = this.response.cookie.match(/scratchcsrftoken=([A-Za-z0-9]+)/)[1];
						ScratchAPI.credentials.session = this.response.cookie.match(/scratchsessionid=([A-Za-z0-9]+)/)[1];
					},
					fail: function() {
						alert("Login failed");
					}
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.login,args,false); 
			}
			
			return ScratchAPI.credentials;
		},
		logout: function() {
			ScratchAPI.credentials.username = "";
			ScratchAPI.credentials.password = "";
			ScratchAPI.credentials.csrf = "";
			ScratchAPI.credentials.session = "";
		},
		get_csrf: function() {
			if (typeof Scratch !== 'undefined') return document.cookie.match(/scratchcsrftoken=([A-Za-z0-9]+)/)[1] ;
			return (ScratchAPI.credentials.csrf || ScratchAPI.session.login().csrf);
		},
		get_sessionid: function() {
			if (typeof Scratch !== 'undefined') return document.cookie.match(/scratchsessionid=([A-Za-z0-9]+)/)[1];
			return (ScratchAPI.credentials.session || ScratchAPI.session.login().session);
		},
		get_user_model: function() {
			if (typeof Scratch !== 'undefined') return Scratch.INIT_DATA.LOGGED_IN_USER.model
			return { error: "not logged in" };
		},
		get_user_id: function() {
			if (typeof Scratch !== 'undefined') return Scratch.INIT_DATA.LOGGED_IN_USER.model.id;
			return prompt("Please enter your Scratch ID"); // TODO: Retrieve user ID from username via XHR
		},
		get_username: function() {
			if (typeof Scratch !== 'undefined') return Scratch.INIT_DATA.LOGGED_IN_USER.model.username;
			return (ScratchAPI.credentials.username = (ScratchAPI.credentials.username || prompt("Username pls")));
		},
		get_password: function() {
			return ScratchAPI.credentials.password = (ScratchAPI.credentials.password || prompt("Password pls"));
		}
	},
	request: function(req,args,async) {
		var type = req[0], url = this.protocol+this.host+req[1], params = req[1].match(/<(\w+)>/g);
		if (args && params && params.length)
			for (var e=0;e<params.length;e++)
				url=url.replace(params[e],args[params[e].substring(1,params[e].length-1)] || 1);
		
		var body = (typeof args.body !== "undefined") ? JSON.stringify(args.body) : "";
		
		var xhr = new XMLHttpRequest();
		xhr.open(type,url,async||this.async);
		
		if (body.length) this.headers["Content-Length"] = body.length;
		if (type=="PUT"||type=="POST") {
			if (this.credentials.csrf) this.headers["X-CSRFToken"] = this.credentials.csrf;
			this.headers["Cookie"] = "scratchlanguage=en;";
			if (this.credentials.csrf) this.headers["Cookie"] += this.credentials.csrf+";";
			if (this.credentials.session) this.headers["Cookie"] += this.credentials.session+";";
		}

		var headers = Object.keys(this.headers);
		for (var h in headers) {
			try { xhr.setRequestHeader(headers[h],this.headers[headers[h]]); }
			catch (e) {}
		}
		xhr.onload = function() {
			// Handle plaintext documents from sync'ed requests
			var doc = (typeof this.response=="string")?(new DOMParser).parseFromString(this.response,"text/html"):this.response;
			if (this.status==200) {
				if (args.success) args.success(doc);
				else console.log("SUCCESS");
			} else {
				if (args.fail) args.fail(doc);
				else console.log("FAIL");
			}
		};
		xhr.send(body||null);
	},
	auxiliary: {
		get_page_ids: function(dom,acc) {
			for(var _=dom.querySelectorAll("span.title"),i=0,x;i<_.length;i++) {
				x = _[i].getElementsByTagName("a")[0].href.match(/\d+/g);
				acc.push(x[x.length-1]);
			}
		},
		get_page_names: function(dom,acc) {
			for(var _=dom.querySelectorAll("span.title"),i=0;i<_.length;i++)
				acc.push(_[i].getElementsByTagName("a")[0].innerHTML.trim());
		},
		get_page_ids_and_names: function(dom,acc) {
			for(var _=dom.querySelectorAll("span.title"),i=0,a,x;i<_.length;i++){
				a = _[i].getElementsByTagName("a")[0];
				x = a.href.match(/\d+/g);
				acc.push({id:x[x.length-1],name:a.innerHTML.trim()});
			}
		},
		get_page_elements: function(dom,acc) {
			for(var _=dom.querySelectorAll("li"),i=0;i<_.length;i++)acc.push(_[i]);
		},
		get_all_pages: function(req,args,cb,exit) {
			function next(pg) {
				args.page = pg || 1; ScratchAPI.request(req,args);
			}
			args.success = function(x) { cb(x); next(args.page+1); };
			args.fail = args.fail || exit || console.log;
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
			get_properties: function(u,cb) {
				var args = {
					username: u,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.api,args);
			},
			get_backpack: function(u,cb) {
				var args = {
					username: u,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.backpack,args);
			},
			get_projects: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.projects,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids_and_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_projects: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids_and_names(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.projects,args);
			},
			get_project_names: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.projects,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_project_names: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.projects,args);
			},
			get_project_ids: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.projects,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_project_ids: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.projects,args);
			},
			get_favorites: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.favorites,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids_and_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_favorites: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids_and_names(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.favorites,args);
			},
			get_favorite_names: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.favorites,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_favorite_names: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.favorites,args);
			},
			get_favorite_ids: function(u,cb) {
				var projects = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.favorites,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_favorite_ids: function(u,p,cb) {
				var projects = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.favorites,args);
			},
			get_studios_curating_names: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,studios) },
				function(x) { cb(studios) });
			},
			get_page_of_studios_curating_names: function(u,p,cb) {
				var studios = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,studios);cb(studios) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.studios,args);
			},
			get_studios_curating_ids: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios) },
				function(x) { cb(studios) });
			},
			get_page_of_studios_curating_ids: function(u,p,cb) {
				var studios = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios);cb(studios) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.studios,args);
			},
			get_studios_following_names: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios_following,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,studios) },
				function(x) { cb(studios) });
			},
			get_page_of_studios_following_names: function(u,p,cb) {
				var studios = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,studios);cb(studios) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.studios_following,args);
			},
			get_studios_following_ids: function(u,cb) {
				var studios = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.studios_following,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios) },
				function(x) { cb(studios) });
			},
			get_page_of_studios_following_ids: function(u,p,cb) {
				var studios = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,studios);cb(studios) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.studios_following,args);
			},
			get_following_names: function(u,cb) {
				var users = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.following.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,users) },
				function(x) { cb(users) });
			},
			get_page_of_following_names: function(u,p,cb) {
				var users = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,users);cb(users) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.following.get,args);
			},
			get_follower_names: function(u,cb) {
				var users = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.followers.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,users) },
				function(x) { cb(users) });
			},
			get_page_of_follower_names: function(u,p,cb) {
				var users = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,users);cb(users) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.followers.get,args);
			},
			get_comments: function(u,cb) {
				var comments = [];
				var args = { username: u };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.users.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			},
			get_page_of_comments: function(u,p,cb) {
				var comments = [];
				var args = {
					username: u,
					page: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments);cb(comments) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.comments.get,args);
			},
			follow: function(u,cb) {
				var args = {
					username: ScratchAPI.session.get_username(),
					targetusername: u
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.following.add,args);
			},
			unfollow: function(u,cb) {
				var args = {
					username: ScratchAPI.session.get_username(),
					targetusername: u
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.following.remove,args);
			},
			comment: function(u,c,cb) {
				var args = {
					username: u,
					body: {
						content: c,
						parent_id: "",
						commentee_id: ""
					},
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.users.comments.add,args);
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
			get_properties: function(p,cb) {
				var args = {
					project: p,
					success: function(x) { cb(x) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.api,args);
			},
			get_remix_names: function(p,cb) {
				var projects = [];
				var args = { 
					project: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,projects);cb(projects); }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.remixes.get,args);
			},
			get_remix_ids: function(p,cb) {
				var projects = [];
				var args = { 
					project: p,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects);cb(projects); }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.remixes.get,args);
			},
			get_remixtree: function(p,cb) {
				var args = {
					project: p,
					success: cb,
					fail: function() { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.remixes.remixtree,args);
			},
			get_studios: function(p,cb) {
				var studios = [];
				var args = {
					project: p,
					success: function(x) {
						ScratchAPI.auxiliary.get_page_ids_and_names(x,studios);
						cb(studios);
					},
					fail: function() { cb(studios) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.studios.get,args);
			},
			get_page_of_studios: function(p,pg,cb) {
				console.warning("This method is deprecated. Use get_studios() instead.");
				ScratchAPI.main.projects.get_studios(p,cb);
			},
			get_studio_names: function(p,cb) {
				var studios = [];
				var args = {
					project: p,
					success: function(x) {
						ScratchAPI.auxiliary.get_page_names(x,studios);
						cb(studios);
					},
					fail: function() { cb(studios) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.studios.get,args);
			},
			get_page_of_studio_names: function(p,pg,cb) {
				console.warning("This method is deprecated. Use get_studio_names() instead.");
				ScratchAPI.main.projects.get_studio_names(p,cb);
			},
			get_studio_ids: function(p,cb) {
				var studios = [];
				var args = {
					project: p,
					success: function(x) {
						ScratchAPI.auxiliary.get_page_ids(x,studios);
						cb(studios);
					},
					fail: function() { cb(studios) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.studios.get,args);
			},
			get_page_of_studio_ids: function(p,pg,cb) {
				console.warning("This method is deprecated. Use get_studio_ids() instead.");
				ScratchAPI.main.projects.get_studio_ids(p,cb);
			},
			get_comments: function(p,cb) {
				var comments = [];
				var args = { project: p };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.projects.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			},
			get_page_of_comments: function(p,pg,cb) {
				var comments = [];
				var args = {
					project: p,
					page: pg,
					success: function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments);cb(comments) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.comments.get,args);
			},
			love: function(p,cb) {
				var args = {
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.loveits.add,args);
			},
			unlove: function(p,cb) {
				var args = {
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.loveits.remove,args);
			},
			favorite: function(p,cb) {
				var args = {
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.favorites.add,args);
			},
			unfavorite: function(p,cb) {
				var args = {
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.favorites.remove,args);
			},
			add_to_studio: function(p,s,cb) {
				var args = {
					project: p,
					studio: s,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.studios.add,args);
			},
			remove_from_studio: function(p,s,cb) {
				var args = {
					project: p,
					studio: s,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.studios.remove,args);
			},
			comment: function(p,c,cb) {
				var args = {
					project: p,
					body: {
						content: c,
						parent_id: "",
						commentee_id: ""
					},
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.projects.comments.add,args);
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
			get_project_names: function(s,cb) {
				var projects = [];
				var args = { studios: s };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.projects.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_project_names: function(s,pg,cb) {
				var projects = [];
				var args = {
					studio: s,
					page: pg,
					success: function(x) { ScratchAPI.auxilary.get_page_names(x,projects);cb(projects); },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.projects.get,args);
			},
			get_project_ids: function(s,cb) {
				var projects = [];
				var args = { studio: s };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.projects.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects) },
				function(x) { cb(projects) });
			},
			get_page_of_project_ids: function(s,pg,cb) {
				var projects = [];
				var args = {
					studio: s,
					page: pg,
					success: function(x) { ScratchAPI.auxiliary.get_page_ids(x,projects);cb(projects) },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.projects.get,args);
			},
			get_curators: function(s,cb) {
				var users = [];
				var args = { studio: s };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.curators.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,users) },
				function(x) { cb(users) });
			},
			get_page_of_curators: function(s,pg,cb) {
				var users = [];
				var args = {
					studio: s,
					page: pg,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,users);cb(users); },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.curators.get,args);
			},
			get_managers: function(s,cb) {
				var users = [];
				var args = { studio: s };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.managers.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_names(x,users) },
				function(x) { cb(users) });
			},
			get_page_of_managers: function(s,pg,cb) {
				var users = [];
				var args = {
					studio: s,
					page: pg,
					success: function(x) { ScratchAPI.auxiliary.get_page_names(x,users);cb(users); },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.managers.get,args);
			},
			get_comments: function(s,cb) {
				var comments = [];
				var args = { studio: s };
				ScratchAPI.auxiliary.get_all_pages(ScratchAPI.hrefs.studios.comments.get,args,
				function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments) },
				function(x) { cb(comments) });
			},
			get_page_of_comments: function(s,pg,cb) {
				var comments = [];
				var args = {
					studio: s,
					page: pg,
					success: function(x) { ScratchAPI.auxiliary.get_page_elements(x,comments);cb(comments); },
					fail: function(x) { cb(null) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.comments.get,args);
			},
			add_project: function(s,p,cb) {
				var args = {
					studio: s,
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.projects.add,args);
			},
			remove_project: function(s,p,cb) {
				var args = {
					studio: s,
					project: p,
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.projects.remove,args);
			},
			comment: function(s,c,cb) {
				var args = {
					studio: s,
					body: {
						content: c,
						parent_id: "",
						commentee_id: ""
					},
					success: cb
				};
				ScratchAPI.request(ScratchAPI.hrefs.studios.comments.add,args);
			}
		},
		discuss: {
			test_forum: function(f,cb) {
				cb = cb || console.log;
				var args = {
					forum: f,
					success: function() { cb(true) },
					fail: function() { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.get_forum,args);
			},
			test_topic: function(t,cb) {
				cb = cb || console.log;
				var args = {
					topic: t,
					success: function() { cb(true) },
					fail: function() { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.topics.get,args);
			},
			test_post: function(p,cb) {
				cb = cb || console.log;
				var args = {
					post: p,
					success: function() { cb(true) },
					fail: function() { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.posts.get,args);
			},
			add_topic: function(f,title,post,cb) {
				if (!title) return alert("ERROR: New topic call requires title (second param)");
				if (!post)  return alert("ERROR: New topic call requires post body (third param)");
				var args = {
					forum: f,
					success: function(x) {
						// a crude way to create a topic
						x.querySelector("input#id_name").value = title;
						x.querySelector("textarea#id_body").value = post;
						x.querySelector("button").click();
						if (cb) cb(true);
					},
					fail: function(x) { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.topics.add,args);
			},
			add_post: function(t,post,cb) {
				if (!post) return alert("ERROR: New post call requires post body (second param)");
				var args = {
					topic: t,
					page: 1,
					success: function(x) {
						x.querySelector("textarea").value = post;
						x.querySelector("button[name=AddPostForm]").click();
						cb(true);
					},
					fail: function(x) { cb(false) }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.topics.get,args);
			},
			report: function(p,r,cb) {
				if (!r) return alert("ERROR: Report call requires a reason for reporting");
				var args = {
					post: p,
					success: function(x) {
						x.querySelector("textarea").value = r;
						x.querySelector("button").click();
						cb(true);
					},
					fail: function(x) { cb(false); }
				};
				ScratchAPI.request(ScratchAPI.hrefs.discuss.posts.report,args);
			}
		}
	}
};
