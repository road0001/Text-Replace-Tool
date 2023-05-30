let defaultStorageData={
	replaceRuleList:[],
	currentSelectRule:-1,
	originText:``,
}
let replaceTypeList=[
	{name:`插入`,key:`insert`},
	{name:`替换`,key:`replace`},
]
let storageData={}
let storageRuleMap=new Map();
function applyRuleList(){
	let ruleListDOM=[
		// {tag:`button`,attr:{id:`replaceRuleBu_add`,class:`replaceRuleBu replaceAddBu`,html:`添加新规则`,bind:{click(){addNewRule()}}}},
	];
	storageRuleMap=new Map();
	for(let i=0; i<storageData.replaceRuleList.length; i++){
		let curRule=storageData.replaceRuleList[i];
		ruleListDOM.push({tag:`li`,attr:{id:`replaceRuleLi_${i}`,dragIndex:i,children:[
			{tag:`div`,attr:{id:`replaceRuleDiv_${i}`,class:`replaceRuleDiv`,children:[
				{tag:`button`,attr:{id:`replaceRuleBu_${i}`,class:`replaceRuleBu ${i==storageData.currentSelectRule?`selected`:``}`,html:curRule.name,bind:{click:{data:{i:i},function(e){changeRule(e.data.i)}}}}},
				{tag:`button`,attr:{id:`replaceRuleEditBu_${i}`,class:`replaceRuleEditBu replaceRuleCtrlBu`,bind:{click:{data:{i:i},function(e){editRule(e.data.i)}}}}},
				{tag:`button`,attr:{id:`replaceRuleDelBu_${i}`,class:`replaceRuleDelBu replaceRuleCtrlBu`,bind:{click:{data:{i:i},function(e){delRule(e.data.i)}}}}},
			]}},
		]}});
		storageRuleMap.set(curRule.name,curRule.rules);
	}
	$(`#replaceRuleList`).html(``);
	$(`#replaceRuleList`).appendDOM(ruleListDOM);

	Sortable.create(document.getElementById(`replaceRuleList`), {
		animation: 300,
		onEnd: function(evt){ //拖拽完毕之后发生该事件
			// rebuildOrder(evt.from);
			let sortArray=new Array();
			let sortSelect;
			for(let i=0; i<evt.to.children.length; i++){
				sortArray.push(storageData.replaceRuleList[parseInt(evt.to.children[i].getAttribute(`dragIndex`))]);
				if(parseInt(evt.to.children[i].getAttribute(`dragIndex`)) == storageData.currentSelectRule){
					console.log(`CS: ${parseInt(evt.to.children[i].getAttribute(`dragIndex`))} TG: ${i}`);
					sortSelect=i;
				}
			}
			storageData.replaceRuleList=sortArray;
			applyRuleList();
			changeRule(sortSelect,false);
			applyReplaceText();
			saveStorageData();
		}
	});

	// function rebuildOrder(evt){
	// 	let sortArray=new Array();
	// 	for(let i=0; i<evt.children.length; i++){
	// 		sortArray.push(storageData.replaceRuleList[parseInt(evt.children[i].getAttribute(`dragIndex`))]);
	// 		// if(parseInt(evt.children[i].getAttribute(`dragIndex`)) == storageData.currentSelectRule){
	// 		// 	console.log(`CS: ${parseInt(evt.children[i].getAttribute(`dragIndex`))} TG: ${i}`);
	// 		// 	changeRule(i);
	// 		// }
	// 	}
	// 	storageData.replaceRuleList=sortArray;
	// 	applyRuleList();
	// 	applyReplaceText();
	// 	saveStorageData();
	// 	// global.debugLog('rebuildOrder',evt);
	// }
}

function addNewRule(){
	showRuleEditForm();
	// storageData.replaceRuleList.push({
	// 	name:`一二三四五六七八九十`,rules:[
	// 		{type:`insert`,location:`head`,pos:0,text:`前置插入`},
	// 		{type:`insert`,location:`tail`,pos:1,text:`后置插入`},
	// 		{type:`replace`,all:true,origin:`鹅鹅鹅`,text:`我鸟我鸟我鸟`},
	// 		{type:`replace`,all:false,count:2,origin:`红掌拨青波`,text:`我鸟拨清波`},
	// 	]
	// });
	// applyRuleList();
	// saveStorageData();
}

async function changeRule(index,anim){
	console.log(`ChangeRule: ${index}`);
	storageData.currentSelectRule=index;
	$(`.replaceRuleBu`).removeClass(`selected`);
	$(`#replaceRuleBu_${index}`).addClass(`selected`);
	
	saveStorageData();
	if(anim!=false){
		$(`.textDisplayZone`).anim({opacity:0,transform:`translate(-4px)`},125).then(()=>{
			$(`.textDisplayZone`).anim({opacity:0,transform:`translate(4px)`},0).then(()=>{
				applyReplaceText();
				$(`.textDisplayZone`).anim({opacity:1,transform:`translate(0px)`},250);
			});
		});
	}
}

function editRule(index){
	showRuleEditForm(index);
}

function copyRule(index){
	let curRule=cloneObject(storageData.replaceRuleList[index]);
	storageData.replaceRuleList.splice(index+1,0,curRule);
	applyRuleList();
	applyReplaceText();
	saveStorageData();
}

function delRule(index){
	if(confirm(`确定删除规则【${storageData.replaceRuleList[index].name}】？`)){
		storageData.replaceRuleList.splice(index,1);
		if(storageData.currentSelectRule>storageData.replaceRuleList.length-1){
			storageData.currentSelectRule=storageData.replaceRuleList.length-1;
		}
		applyRuleList();
		applyReplaceText();
		saveStorageData();
	}
}

function showRuleEditForm(index){
	console.log(index);
	if(index===false){
		//动画
		$(`#editWindow`).anim({scale:0.9},250);
		$(`#editForm`).anim({opacity:0},250).then(()=>{
			$(`#editForm`).remove();
		});
		return;
	}
	//index为空时，视为添加新规则，初始化规则数据。否则加载当前选定编辑的规则数据
	let ruleList;
	if(index==undefined){
		ruleList={name:``,rules:[]};
	}else{
		ruleList={...storageData.replaceRuleList[index]};
	}
	$(`body`).appendDOM(`div`,{id:`editForm`,class:`editForm`,children:[
		{tag:`div`,attr:{id:`editWindow`,class:`editWindow`,children:[
			{tag:`div`,attr:{id:`editTitle`,class:`editTitle`,html:`<button class="editTitleBu">${index==undefined?`添加新规则`:`编辑规则【${ruleList.name}】`}</button>`}},
			{tag:`div`,attr:{id:`editContent`,class:`editContent`,children:[
				// {tag:`table`,attr:{class:`editTable`,html:`
				// 	<tr><td class="tableTitle">规则名称</td><td class="tableContent"><input id="ruleName" class="ruleName"></td></tr>
				// 	<tr><td class="tableTitle">规则详情</td><td class="tableContent"><select id="ruleTypeSelect" class="ruleTypeSelect"></select><ul id="ruleDetail"></ul></td></tr>
				// `}},
				{tag:`table`,attr:{class:`editTable`,html:`
					<tr><td class="tableTitle">规则名称</td><td class="tableContent"><input id="ruleName" class="ruleName"></td></tr>
					<tr><td class="tableTitle">规则详情</td><td class="tableContent"><textarea id="ruleContent" class="ruleContent"></textarea></td></tr>
				`}},
			]}},
			{tag:`div`,attr:{id:`contentCtrl`,class:`contentCtrl`,children:[
				{tag:`button`,attr:{id:`contentFormatBu`,class:`contentFormatBu contentCtrlBu lighting`,html:`格式化`,bind:{click(){applyRuleContent();}}}},
				{tag:`button`,attr:{id:`contentInsertBu`,class:`contentInsertBu contentCtrlBu`,html:`插入`,bind:{click(){applyRuleContent(`insert`);}}}},
				{tag:`button`,attr:{id:`contentReplaceBu`,class:`contentReplaceBu contentCtrlBu`,html:`单替`,bind:{click(){applyRuleContent(`replace`);}}}},
				{tag:`button`,attr:{id:`contentReplaceBu`,class:`contentReplaceBu contentCtrlBu`,html:`全替`,bind:{click(){applyRuleContent(`replaceAll`);}}}},
				{tag:`button`,attr:{id:`contentTrimBu`,class:`contentReplaceBu contentCtrlBu`,html:`TRIM`,bind:{click(){applyRuleContent(`trim`);}}}},
				{tag:`button`,attr:{id:`contentTrimBu`,class:`contentReplaceBu contentCtrlBu`,html:`@引用`,bind:{click(){applyRuleContent(`@`);}}}},
				{tag:`button`,attr:{id:`contentConditionBu`,class:`contentConditionBu contentCtrlBu`,html:`判断`,bind:{click(){applyRuleContent(`condition`);}}}},
				{tag:`button`,attr:{id:`contentConditionBlockBu`,class:`contentConditionBlockBu contentCtrlBu`,html:`判断块`,bind:{click(){applyRuleContent(`conditionBlock`);}}}},
				{tag:`button`,attr:{id:`contentWhileBlockBu`,class:`contentWhileBlockBu contentCtrlBu`,html:`循环块`,bind:{click(){applyRuleContent(`whileBlock`);}}}},
				{tag:`button`,attr:{id:`contentFunctionBu`,class:`contentFunctionBu contentCtrlBu`,html:`函数`,bind:{click(){applyRuleContent(`function`);}}}},
			]}},
			{tag:`div`,attr:{id:`editCtrl`,class:`editCtrl`,children:[
				{tag:`button`,attr:{id:`editSaveBu`,class:`editSaveBu default`,html:`保存`,bind:{click:{data:{index:index},function(e){saveCurrentRule(e.data.index)}}}}},
				{tag:`html`,html:`&nbsp;&nbsp;`},
				{tag:`button`,attr:{id:`editCopyBu`,class:`editCopyBu lighting`,html:`复制`,bind:{click:{data:{index:index},function(e){copyRule(e.data.index)}}}}},
				{tag:`span`,attr:{class:`editCopyBuSpace`,html:`&nbsp;&nbsp;`}},
				{tag:`button`,attr:{id:`editCancelBu`,class:`editCancelBu`,html:`取消`,bind:{click(){showRuleEditForm(false)}}}},
			]}},
		]}},
	]});

	if(index==undefined){
		$(`#editCopyBu, .editCopyBuSpace`).remove();
	}
	
	$(`#ruleName`).val(ruleList.name);
	$(`#ruleContent`).val(JSON.stringify(ruleList.rules, undefined, 4));

	let ruleInfo =`规则序列说明：\n`;
		ruleInfo+=`插入：{\n    "type": "insert",\n    "location":"insert插入位置，可选head/tail",\n    "pos":"insert插入偏移，整数",\n    "target":"文字内容"\n},\n`;
		ruleInfo+=`替换：{\n    "type": "replace",\n    "all":"是否全部替换，可选true/false",\n    "count":"非全部替换时替换数量，整数",\n    "begin":"非全部替换时从第几个开始替换，整数",\n    "origin":"替换前文字内容1||替换前文字内容2",\n    "target":"替换后文字内容"\n}\n`;
		ruleInfo+=`去除首尾空格：{\n    "type": "trim",\n}\n`;
		ruleInfo+=`引用其他规则：{\n    "type": "@规则名",\n}\n`;
		ruleInfo+=`条件判断：{\n    "if":"text|origin|target.includes('查找条件')",\n    "type": "replace",\n    "origin":"替换前文字内容",\n    "target":"替换后文字内容"\n}\n`;
		ruleInfo+=`块级条件判断：{\n    "type":"condition",\n    "if":"text|origin|target.includes('查找条件')",\n    "rules": [规则序列嵌套]\n}\n`;
		ruleInfo+=`块级条件循环：{\n    "type":"condition",\n    "while":"text|origin|target.count('查找条件') && count<10",\n    "rules": [规则序列嵌套]\n}\n`;
		ruleInfo+=`自定义函数：{\n    "type":"function",\n    "function":"{\n        自定义函数\n    }"\n}\n`;

	$(`#ruleContent`).attr(`title`,ruleInfo);

	//动画
	$(`#editForm`).anim({opacity:0},0).then(()=>{
		$(`#editForm`).anim({opacity:1},250);
	});
	$(`#editWindow`).anim({scale:0.9},0).then(()=>{
		$(`#editWindow`).anim({scale:1},250);
	});

	function saveCurrentRule(id){
		let tempRule;
		try{
			tempRule={
				name:$(`#ruleName`).val(),
				rules:eval(`(${$(`#ruleContent`).val()})`),
			}
		}catch(e){
			console.error(e);
			alert(`规则详情格式错误！错误码：${e}`);
			return;
		}
		// console.log(tempRule);
		if(tempRule==undefined){
			alert(`规则数据为空，请重新输入！`);
			return;
		}
		let optSuccess=false;
		if(id==undefined){
			//插入新规则
			storageData.replaceRuleList.unshift(tempRule);
			optSuccess=true;
		}else{
			storageData.replaceRuleList[id]=tempRule;
			optSuccess=true;
		}

		if(optSuccess==true){
			applyRuleList();
			applyReplaceText();
			saveStorageData();
			showRuleEditForm(false);
		}
	}
	// $(`#ruleTypeSelect`).appendDOM(`option`,{value:``,html:`插入新规则`});
	// for(let i=0; i<replaceTypeList.length; i++){
	// 	$(`#ruleTypeSelect`).appendDOM(`option`,{value:replaceTypeList[i].key,html:replaceTypeList[i].name});
	// }
	// for(let i=0; i<ruleList.rules.length; i++){
	// 	let rule=ruleList.rules[i];
	// 	console.log(rule);
	// }
}

function applyOriginText(){
	$(`#textOriginInput`).val(storageData.originText || ``);
}

function applyReplaceText(){
	let makeText=storageData.originText;
	if(storageData.currentSelectRule>=0){
		let curSelectedRule=storageData.replaceRuleList[storageData.currentSelectRule];
		if(typeof curSelectedRule.rules==`object` && !isNaN(curSelectedRule.rules.length)){
			makeText=applyRules(makeText,curSelectedRule.rules);
		}
	}
	$(`#textReplaceInput`).val(makeText);
}

function applyRuleContent(model){
	try{
		let inputedContent=JSON.parse($(`#ruleContent`).val());
		switch(model){
			case `insert`:
				inputedContent.push({
					type:`insert`,
					location:`head`,
					pos:0,
					target:``,
				});
			break;
			case `replace`:
				inputedContent.push({
					type:`replace`,
					all:false,
					count:1,
					begin:1,
					origin:``,
					target:``,
				});
			break;
			case `replaceAll`:
				inputedContent.push({
					origin:``,
					target:``,
				});
			break;
			case `trim`:
				inputedContent.push({
					type:`trim`,
				});
			break;
			case `function`:
				inputedContent.push({
					type:`function`,
					function:`{}`,
				});
			break;
			case `@`:
				inputedContent.push({
					type:`@`,
				});
			break;
			case `condition`:
				inputedContent.push({
					if:``,
					type:`replace`,
					origin:``,
					target:``,
				});
			break;
			case `conditionBlock`:
				inputedContent.push({
					type:`condition`,
					if:``,
					rules:[
						{
							type:`replace`,
							origin:``,
							target:``,
						}
					],
				});
			break;
			case `whileBlock`:
				inputedContent.push({
					type:`condition`,
					while:``,
					rules:[
						{
							type:`replace`,
							origin:``,
							target:``,
						}
					],
				});
			break;
		}
		$(`#ruleContent`).val(JSON.stringify(inputedContent, undefined, 4));
	}catch(e){
		console.error(e);
		alert(`规则详情格式错误！错误码：${e}`);
	}
}

let whileMaxCount=9999;
function applyRules(makeText, rules){
	//rules必须为数组
	for(let i=0; i<rules.length; i++){
		let curRule=rules[i];
		if(curRule.if==undefined || (typeof curRule.if==`string` && conditionJudge(curRule.if,makeText))){
			//条件判断if字段，如果无此字段，或此字段为字符串、执行条件判断函数并返回结果为true时，才会执行下面的操作。
			let curRuleType=curRule.type;
			if(curRuleType==undefined && typeof curRule.origin==`string` && typeof curRule.target==`string`){
				//type: `replace`省略时，默认执行replace替换。必须同时存在origin和target两个字段才可满足。
				curRuleType=`replace`;
			}

			switch(true){
				case curRuleType[0]==`@`:
					makeText=applyRules(makeText,storageRuleMap.get(curRuleType.slice(1)));
				break;

				case curRuleType==`condition`:
					if(typeof curRule.if==`string` && conditionJudge(curRule.if,makeText)){
						makeText=applyRules(makeText,curRule.rules); //块级条件判断直接将rules交给applyRules进行递归操作，完成后返回。通过此方法，可实现多层块级行为。
					}else if(typeof curRule.while==`string`){
						let _maxCount=0;
						while(conditionJudge(curRule.while,makeText,_maxCount)){
							makeText=applyRules(makeText,curRule.rules);
							_maxCount++;
							if(_maxCount>whileMaxCount){ //加入最大循环执行次数，防止死循环
								break;
							}
						}
					}
				break;

				case curRuleType==`insert`:
					switch(curRule.location){
						case `head`:
							makeText=makeText.slice(0,curRule.pos || 0)+curRule.target+makeText.slice(curRule.pos || 0);
						break;
						case `tail`: default:
							makeText=makeText.slice(0,makeText.length-(curRule.pos || 0))+curRule.target+makeText.slice(makeText.length-(curRule.pos || 0));
						break;
					}
				break;

				case curRuleType==`replace`:
					if(curRule.origin.includes(`||`)){
						let originSplit=curRule.origin.split(`||`);
						let oRuleList=[];
						for(let o of originSplit){
							let oRule=cloneObject(curRule);
							oRule.origin=o;
							oRuleList.push(oRule);
						}
						makeText=applyRules(makeText,oRuleList);
					}else{
						if(curRule.all==undefined || curRule.all==true){
							makeText=makeText.replaceAll(curRule.origin,curRule.target);
						}else{
							if(!isNaN(curRule.count)){
								let curRuleBegin=isNaN(curRule.begin)?0:curRule.begin-1; //此处c从0开始，但begin从第1次开始，因此-1
								if(curRuleBegin<0)curRuleBegin=0;
								for(let c=0; c<curRule.count+curRuleBegin; c++){
									if(c>=curRuleBegin){
										makeText=makeText.replace(curRule.origin,`%%MAKE_TEXT_TARGET_TEMP%%`);
									}else{
										makeText=makeText.replace(curRule.origin,`%%MAKE_TEXT_ORIGIN_TEMP%%`);
									}
								}
								//由于replace每次都是从开头查找并替换的，如果target中包含origin，那么就会出现重复替换的现象。
								//因此采用先按照规则将origin、target替换成临时字符串，处理完后再统一将此字符串分别替换。
								makeText=makeText.replaceAll(`%%MAKE_TEXT_ORIGIN_TEMP%%`, curRule.origin);
								makeText=makeText.replaceAll(`%%MAKE_TEXT_TARGET_TEMP%%`, curRule.target);
							}else{
								makeText=makeText.replace(curRule.origin,curRule.target);
							}
						}
					}
				break;

				case curRuleType==`function`:
					if(typeof curRule.function==`string`){
						makeText=execFunction(makeText,curRule.function);
					}
				break;

				
				case curRuleType==`trim`:
					makeText=makeText.trim();
				break;
			}
		}
	}
	return makeText;
}

function conditionJudge(condition,itext,count){
	let text,origin;
	text=origin=itext || $(`#textOriginInput`).val();
	let target=$(`#textReplaceInput`).val();
	try{
		return eval(condition);
	}catch(e){
		console.error(e);
	}
}

function execFunction(itext,func){
	let text, origin;
	text=origin=itext || $(`#textOriginInput`).val();
	try{
		return eval(func);
	}catch(e){
		console.error(e);
	}

}

function copyContent(id){
	let textarea=document.getElementById(id);
	textarea.select();
	document.execCommand(`Copy`);
}

function clearContent(){
	$(`#textOriginInput`).val(``);
	storageData.originText=$(`#textOriginInput`).val();
	applyReplaceText();
	saveStorageData();
}

function showSaveRuleForm(bool){
	if(bool===false){
		//动画
		$(`#editWindow`).anim({scale:0.9},250);
		$(`#editForm`).anim({opacity:0},250).then(()=>{
			$(`#editForm`).remove();
		});
		return;
	}

	$(`body`).appendDOM(`div`,{id:`editForm`,class:`editForm`,children:[
		{tag:`div`,attr:{id:`editWindow`,class:`editWindow`,children:[
			{tag:`div`,attr:{id:`editTitle`,class:`editTitle`,html:`<button class="editTitleBu">规则数据</button>`}},
			{tag:`div`,attr:{id:`editContent`,class:`editContent`,children:[
				{tag:`table`,attr:{class:`editTable`,html:`
					<tr><td class="tableContent" style="text-align:center;"><textarea id="ruleSaveContent" class="ruleContent ruleSaveContent"></textarea></td></tr>
				`}},
			]}},
			{tag:`div`,attr:{id:`editCtrl`,class:`editCtrl`,children:[
				{tag:`button`,attr:{id:`editSaveBu`,class:`editSaveBu default`,html:`应用`,bind:{click:{data:{},function(e){saveStorageRule()}}}}},
				{tag:`html`,html:`&nbsp;&nbsp;`},
				{tag:`button`,attr:{id:`editCancelBu`,class:`editCancelBu`,html:`取消`,bind:{click(){showSaveRuleForm(false)}}}},
			]}},
		]}},
	]});

	$(`#ruleSaveContent`).val(JSON.stringify(storageData, undefined, 4));

	//动画
	$(`#editForm`).anim({opacity:0},0).then(()=>{
		$(`#editForm`).anim({opacity:1},250);
	});
	$(`#editWindow`).anim({scale:0.9},0).then(()=>{
		$(`#editWindow`).anim({scale:1},250);
	});

	function saveStorageRule(){
		let tempRule;
		try{
			tempRule={
				...defaultStorageData,
				...eval(`(${$(`#ruleSaveContent`).val() || `{}`})`),
			}
		}catch(e){
			console.error(e);
			alert(`规则数据格式错误！错误码：${e}`);
			return;
		}
		// console.log(tempRule);
		if(tempRule==undefined){
			alert(`规则数据为空，请重新输入！`);
			return;
		}
		storageData=tempRule;
		applyRuleList();
		applyReplaceText();
		saveStorageData();
		showSaveRuleForm(false);
	}
}


function applyStorageData(){
	applyRuleList();
	applyOriginText();
	applyReplaceText();
}

function main(){
	loadStorageData();
	storageData={
		...defaultStorageData,
		...storageData,
	};
	saveStorageData();
	applyStorageData();

	$(`#replaceRuleBu_add`).bind(`click`,function(){
		addNewRule();
	});
	$(`#replaceRuleBu_save`).bind(`click`,function(){
		showSaveRuleForm();
	});

	$(`#textOriginCopyBu`).bind(`click`,function(){
		copyContent(`textOriginInput`);
	});
	$(`#textReplaceCopyBu, #textReplaceCopyBu2`).bind(`click`,function(){
		copyContent(`textReplaceInput`);
	});

	$(`#textOriginClearBu`).bind(`click`,function(){
		clearContent(`textOriginInput`);
	});

	$(`#textOriginInput`).bind(`input`,function(){
		storageData.originText=$(`#textOriginInput`).val();
		applyReplaceText();
		saveStorageData();
	});
}

window.onload=function(){
	window.addEventListener(`dragover`,function(e){
		e = e || event;
		e.stopPropagation();
		e.preventDefault();
	},false);
	window.addEventListener(`drop`,function(e){
		e = e || event;
		e.stopPropagation();
		e.preventDefault();
	},false);
	document.addEventListener(`dragover`,function(e){
		e = e || event;
		e.stopPropagation();
		e.preventDefault();
	},false);
	document.addEventListener(`drop`,function(e){
		e = e || event;
		e.stopPropagation();
		e.preventDefault();
	},false);
	main();
}