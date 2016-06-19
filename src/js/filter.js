var regex = {
	// TODO: Patch almost every case of AE-related titles
	filter:/\Wae\W|add|follow|manage|curat(e|or)|invite|f4f|fan(s| ?club)|random|untitled|^projects$|(big(gest)?|large(st)?|huge(st)?) (studio|gallery)|(as|how) (many|much)|feed (me|us)|(can (i|we)|help (me|us)) (get( to)?|reach|add)|(get( to)?|reach|add|need) (\d+|every|any|all)? ?(thing|body|one|projects)|(every|any)thing|\d+ project/gi,
	whitelist: /only|quality|simple|good|awesome|fantastic|great|amazing|interesting|test|science|math|programming|computer|data|tech|info|advice|tutor/gi,
	extras:null,
	set:function(r){
		if (r) this.extras=new RegExp(r,"gi");
	},
	test:function(str){
		if (this.whitelist.test(str))
			return 0;
		if (this.filter.test(str))
			return 1;
		if (this.extras && regex.extras.test(str))
			return 2;
		return 0;
	}
};
