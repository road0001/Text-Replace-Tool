String.prototype.toKebabCase=function(){
	let fix=this.replace(/([A-Z])/g,"-$1").toLowerCase();
	if(fix[0]==`-`){
		return fix.slice(1);
	}else{
		return fix;
	}
}
String.prototype.toPascalCase=function(){
	let fixs=this.split(`-`);
	for(let i=1; i<fixs.length; i++){
		let f=fixs[i].split(``);
		f[0]=f[0].toUpperCase();
		fixs[i]=f.join(``);
	}
	return fixs.join(``);
}
String.prototype.replaceAll=function(org,tgt){
	return this.split(org).join(tgt);
}

const generalStrSymbol=`*%*`;

getDOMHtml=DOMHtml=function(dom_tag,dom_attr,dom_html,dom_fix={}){
	let domFullHtml=[];
	//dom_tag为数组时，批量为母元素添加元素
	if(typeof dom_tag==`object` && dom_tag.length!=undefined){
		let default_children={
			tag:undefined,attr:undefined,html:undefined,attachType:`append`
		};
		for(let cur of dom_tag){
			cur=JSON.parse(JSON.stringify({
				...default_children,
				...cur,
			}));
			domFullHtml.push(getDOMHtml(cur,undefined,undefined,dom_fix));
		}
		return domFullHtml.join(``);
	}

	//dom_tag为对象时，和普通情况一样
	if(typeof dom_tag==`object` && dom_tag.length==undefined){
		dom_tag=JSON.parse(JSON.stringify(dom_tag));
		dom_attr=dom_tag.attr || dom_tag;
		dom_html=dom_attr.html || dom_tag.html;
		dom_tag=dom_tag.tag;
	}

	let dom_attr_fix_blacklist=[
		`tag`,`attachType`,
	]
	let dom_attr_fix_replace={
		...{tagName:`tag`, attrName:`attr`},
		...dom_fix.attr,
	}
	let dom_attr_value_fix_keywords=[
		...dom_fix.attrKeywords,
	]
	let dom_attr_value_fix_replace=[
		...dom_fix.attrValue,
	]
	let dom_attr_fix={};
	for(let key in dom_attr){
		if(!dom_attr_fix_blacklist.includes(key)){
			let key_fix=key;
			let val_fix=dom_attr[key];
			for(let origin in dom_attr_fix_replace){
				key_fix=key_fix.replace(origin,dom_attr_fix_replace[origin]);
			}
			if(!key_fix.includes(`:`)){
				key_fix=key_fix.toKebabCase();
			}else{
				key_fix=key_fix.toLowerCase();
			}

			for(let rep of dom_attr_value_fix_replace){
				for(let fk of dom_attr_value_fix_keywords){
					if(key_fix.includes(fk) && key_fix!=`tag` && key_fix!=`html`){
						// if(rep.origin==generalStrSymbol){
						if(typeof rep.origin!=`string`){
							let val_fix_match=val_fix.match(rep.origin);
							if(val_fix_match){
								for(let m of val_fix_match){
									val_fix=val_fix.replace(m, rep.target.replaceAll(generalStrSymbol,m));
								}
							}
							// val_fix=val_fix.replace(rep.origin,rep.target.replace(generalStrSymbol,val_fix));
							// val_fix=rep.target.replace(generalStrSymbol,val_fix);
							// if(!val_fix.includes(rep.target.split(generalStrSymbol)[0]) && !val_fix.includes(rep.target.split(generalStrSymbol)[1])){
							// 	val_fix=rep.target.replace(generalStrSymbol,val_fix);
							// }
						}else{
							val_fix=val_fix.replaceAll(rep.origin,rep.target);
						}
					}
				}
				
			}
			dom_attr_fix[key_fix]=val_fix;
		}
	}
	dom_attr=dom_attr_fix;

	dom_tag=dom_tag.toKebabCase();
	if(typeof dom_attr==`object`){
		if(typeof dom_attr.class==`object` && dom_attr.class.length){
			dom_attr.class=dom_attr.class.join(` `);
		}
		if(typeof dom_attr.style==`object`){
			let styleList=[];
			for(let key in dom_attr.style){
				styleList.push(`${key.toKebabCase()}: ${dom_attr.style[key]}`);
			}
			dom_attr.style=styleList.join(`;`);
		}
	}

	let attr_blacklist=[
		`bind`,`children`,`html`,`tbody`,`tr`,`td`,
	]
	let domElement=document.createElement(dom_tag);
	if(typeof dom_attr==`object`){
		for(let key in dom_attr){
			if(!attr_blacklist.includes(key)){
				domElement.setAttribute(key, dom_attr[key]);
			}
		}
	}else if(typeof dom_attr==`string`){
		domFullHtml.push(dom_attr);
	}
	if(dom_html){
		domFullHtml.push(dom_html);
	}

	if(typeof dom_attr==`object` && typeof dom_attr.children==`object`){
		let default_children={
			tag:undefined,attr:undefined,html:undefined,
		};

		if(dom_attr.children.length==undefined){
			/*仅一个子项时，可以直接使用Object
			{
				tag:`html`,attr:{id:`id`},html:`Test`,attachType:`append`
			}
			*/
			let children={
				...JSON.parse(JSON.stringify(default_children)),
				...dom_attr.children,
			}
			domFullHtml.push(getDOMHtml(children,undefined,undefined,dom_fix));
		}else{
			/*多个子项时，采用数组形式
			[
				{
					tag:`html`,attr:{id:`id1`},html:`Test1`,attachType:`append`
				},
				{
					tag:`html`,attr:{id:`id2`},html:`Test2`,attachType:`append`
				},
			]
			*/
			for(let i=0; i<dom_attr.children.length; i++){
				let children={
					...JSON.parse(JSON.stringify(default_children)),
					...dom_attr.children[i],
				}
				domFullHtml.push(getDOMHtml(children,undefined,undefined,dom_fix));
			}
		}
	}

	if(typeof dom_attr==`object` && (typeof dom_attr.tbody==`object` || typeof dom_attr.tr==`object`)){
		let default_tr={
			tag:`tr`,attr:undefined,html:undefined,children:[],
		};
		let default_td={
			tag:`td`,attr:undefined,html:undefined,children:[],
		}
		let trList=dom_attr.tbody || dom_attr.tr;
		let domTrHtml=[];
		for(let i=0; i<trList.length; i++){
			let curTr=trList[i];
			let tr={
				...JSON.parse(JSON.stringify(default_tr)),
				...curTr
			}
			for(let j=0; j<curTr.td.length; j++){
				let curTd=curTr.td[j];
				if(typeof curTd==`string`){
					curTd={html:curTd};
				}
				let td={
					...JSON.parse(JSON.stringify(default_td)),
					...curTd,
				}
				tr.children.push(td);
			}
			domTrHtml.push(tr);
		}
		domFullHtml.push(getDOMHtml(domTrHtml,undefined,undefined,dom_fix));
	}

	domElement.innerHTML=domFullHtml.join(``);
	return domElement.outerHTML;
}

vueDOMHtml=vHtml=function(dom_tag,dom_attr,dom_html){
	let vueFix={
		attr:{
			// vBind:`v-bind:`,
			vOn:`v-on:`,
			'@':`v-on:`,
			V:`:`,
		},
		attrKeywords:[
			`v-bind`,`V`,`:`,`v-if`,`v-else-if`,`v-else`,`v-show`,`v-for`,`v-model`,`v-on`,`@`,`v-html`,
		],
		attrValue:[
			{origin:/\S*{{2}\S*}{2}\S*/g,target:`\`${generalStrSymbol}\``}, //*%*为通配符
			{origin:`{{`,target:'${'},
			{origin:`}}`,target:'}'},
			{origin:`&nbsp;`,target:' '},
		]
	};
	return DOMHtml(dom_tag, dom_attr, dom_html, vueFix);
}