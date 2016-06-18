var regex = {
	AE:/\Wae\W|add|follow|manage|curat(e|or)|invite|f4f|^projects$|(big(gest)?|large(st)?|huge(st)?) (studio|gallery)|(as|how) (many|much)|feed (me|us)|(can (i|we)|help (me|us)) (get( to)?|reach|add)|(get( to)?|reach|add|need) (\d+|every|any|all)? ?(thing|body|one|projects)|(every|any)thing|\d+ project/gi,
	notAE:/only|quality|good|awesome|fantastic|great|amazing|test|science|math|programming|computer|tech|info|advice/gi,
	extras:null,
	set:function(r){this.extras=new RegExp(r,"gi");},
	test:function(str){if(this.notAE.test(str))return 0;if(this.AE.test(str))return 1;if(this.extras && regex.extras.test(str))return 2;return 0;}
};
