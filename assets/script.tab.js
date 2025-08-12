let defaultTab={
	name:`新标签`,
	currentSelectRule:0,
	originText:``,
	fullScreenZone:``,
}

function applyTab(){
	let tabElList=[];
	for(let [i,tab] of storageData.tabList.entries()){
		let selected=(storageData.currentSelectTab==i)?`selected`:``;
		tabElList.push(
			{tag:`li`,id:`tabLi_${i}`,class:`tabLi`,dragIndex:i,children:[
				{tag:`div`,id:`tabDiv_${i}`,class:`tabDiv`,children:[
					{tag:`button`, id:`tabBu_${i}`, class:`tabBu tab ${selected}`,html:tab.name,bind:{
						click:{
							data:{index:i,...tab},
							function(e){
								changeTab(e.data.index);
							}
						},
						contextmenu:{
							data:{index:i,...tab},
							function(e){
								let tabMenu=new nw.Menu();
								let tabMenu_rename=new nw.MenuItem({
									label:`重命名`,
									click:function(){
										let tabName=prompt(`请输入标签名：`).trim();
										if(!tabName || typeof tabName!=`string`){
											return;
										}
										setTabName(e.data.index, tabName);
									}
								});
								let tabMenu_copy=new nw.MenuItem({
									label:`复制`,
									click:function(){
										let tabName=`${e.data.name} (副本)`;
										addTab(tabName, true, e.data.index+1);
									}
								});
								let tabMenu_close=new nw.MenuItem({
									label:`关闭`,
									click:function(){
										removeTab(e.data.index);
									}
								});
								tabMenu.append(tabMenu_rename);
								tabMenu.append(tabMenu_copy);
								tabMenu.append(tabMenu_close);
								e.preventDefault();
								let ev=e.originalEvent;
								tabMenu.popup(ev.clientX,ev.clientY);
								return false;
							}
						}
					}},
					{tag:`button`, id:`tabRemBu_${i}`, class:`tabBu remove`,html:`×`,bind:{
						click:{
							data:{index:i,...tab},
							function(e){
								removeTab(e.data.index);
							}
						}
					}},
				]}
			]}
		);
	}
	$(`#tabUl`).html(``);
	$(`#tabUl`).appendDOM(tabElList);

	Sortable.create(document.getElementById(`tabUl`), {
		animation: 300,
		onEnd: function(evt){ //拖拽完毕之后发生该事件
			// rebuildOrder(evt.from);
			let sortArray=new Array();
			let sortSelect;
			for(let i=0; i<evt.to.children.length; i++){
				sortArray.push(storageData.tabList[parseInt(evt.to.children[i].getAttribute(`drag-index`))]);
				if(parseInt(evt.to.children[i].getAttribute(`drag-index`)) == storageData.currentSelectTab){
					console.log(`CS: ${parseInt(evt.to.children[i].getAttribute(`drag-index`))} TG: ${i}`);
					sortSelect=i;
				}
			}
			storageData.tabList=sortArray;
			storageData.currentSelectTab=sortSelect;
			applyStorageData();
			saveStorageDataDelay();
		}
	});
}

function addTab(name,isCopy, index){
	let newTab={
		...defaultTab,
		name:name,
		currentSelectRule:storageData.currentSelectRule,
		originText:``,
	};
	if(isCopy){
		newTab={
			...defaultTab,
			name:name,
			currentSelectRule:storageData.currentSelectRule,
			originText:storageData.originText,
		};
	}
	if(index==undefined){
		storageData.tabList.push(newTab);
	}else{
		storageData.tabList.splice(index, 0, newTab);
	}
	applyTab();
	let tabEl=$(`#tabDiv_${storageData.tabList.length-1}`);
	tabEl.anim({marginLeft:-128,opacity:0},0).then(()=>{
		tabEl.anim({marginLeft:0,opacity:1},250).then(()=>{
			tabEl[0].scrollIntoView({
				behavior: `smooth`, // 平滑滚动
				block: `nearest`,    // 垂直方向居中对齐
				inline: `center`,   // 水平方向最靠近视口边缘的对齐方式
			});
		});
	});

	// tabEl.animate({marginLeft:-128,opacity:0},0).animate({marginLeft:0,opacity:1},250,function(){
	// 	tabEl[0].scrollIntoView({
	// 		behavior: `smooth`, // 平滑滚动
	// 		block: `nearest`,    // 垂直方向居中对齐
	// 		inline: `center`,   // 水平方向最靠近视口边缘的对齐方式
	// 	});
	// });
	if(index==undefined){
		changeTab(storageData.tabList.length-1);
	}else{
		changeTab(index);
	}
	saveStorageDataDelay();
}

function setTabName(index,name){
	if(storageData && storageData.tabList && storageData.tabList[index]){
		storageData.tabList[index].name=name;
		applyTab();
		saveStorageDataDelay();
	}
}

function changeTab(i){
	storageData.currentSelectTab=i;
	$(`.tabBu`).removeClass(`selected`);
	$(`#tabBu_${i}`).addClass(`selected`);
	syncTabToData();
	let ruleEl=$(`#replaceRuleBu_${storageData.currentSelectRule}`);
	if(ruleEl[0]){
		ruleEl[0].scrollIntoView({
			behavior: `smooth`, // 平滑滚动
			block: `center`,    // 垂直方向居中对齐
			inline: `nearest`,   // 水平方向最靠近视口边缘的对齐方式
		});
	}
}

function removeTab(i){
	// if(i==0 && storageData.tabList.length==1) return;
	if(!confirm(`确定关闭标签【${storageData.tabList[i].name}】？这将删除此标签中的所有内容！`)) return;
	storageData.tabList.splice(i,1);

	if(storageData.currentSelectTab == i){ // 删除当前标签，切换到左边
		let back=i-1;
		if(back<0) back=0;
		changeTab(back);
	}else if(storageData.currentSelectTab > i){ // 删除左边标签，当前选定-1
		let back=storageData.currentSelectTab-1;
		if(back<0) back=0;
		changeTab(back);
	}else{ // 删除右边标签，不变
		changeTab(storageData.currentSelectTab);
	}
	if(!storageData.tabList[storageData.currentSelectTab]){
		changeTab(storageData.tabList.length-1);
	}

	let tabEl=$(`#tabDiv_${i}`);
	tabEl.animate({marginLeft:-128,opacity:0},250,function(){
		applyTab();
	});
	saveStorageDataDelay();
}

function syncDataToTab(){
	if(storageData.tabList.length<1){
		storageData.currentSelectTab=0;
		storageData.tabList.push({
			...defaultTab,
		});
	}
	let sto=storageData.tabList[storageData.currentSelectTab];
	if(sto){
		storageData.tabList[storageData.currentSelectTab]={
			...defaultTab,
			...sto,
			currentSelectRule:storageData.currentSelectRule,
			originText:storageData.originText,
			fullScreenZone:fullScreenZone,
		}
	}
}

function syncTabToData(){
	let sto=storageData.tabList[storageData.currentSelectTab];
	if(sto){
		storageData.originText=sto.originText;
		changeRule(sto.currentSelectRule, false);
		$(`.textDisplayZone`).anim({opacity:0,transform:`translateY(-4px)`},125).then(()=>{
		$(`.textDisplayZone`).anim({opacity:0,transform:`translateY(4px)`},0).then(()=>{
			applyOriginText();
			applyReplaceText();
			$(`.textDisplayZone`).anim({opacity:1,transform:`translateY(0px)`},250);
		});
		if(sto.fullScreenZone){
			showFullScreen(sto.fullScreenZone, true);
		}else{
			showFullScreen(sto.fullScreenZone, false);
		}
	});
	}
}