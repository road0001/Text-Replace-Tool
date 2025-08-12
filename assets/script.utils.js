// function saveStorageData(){
// 	syncDataToTab();
// 	let storageJson=JSON.stringify({
// 		...defaultStorageData,
// 		...storageData,
// 	});
// 	let curDate=new Date().format(`yyyyMMdd`);
// 	localStorage.setItem(`storageData`,storageJson);
// 	localStorage.setItem(`storageData_${curDate}`,storageJson);
// }
// function loadStorageData(){
// 	storageData=JSON.parse(localStorage.getItem(`storageData`));
// 	storageData={
// 		...defaultStorageData,
// 		...storageData,
// 	}
// 	syncTabToData();
// }

let delaySecond=1;
let delayTimeout;
function saveStorageDataDelay(){
	clearTimeout(delayTimeout);
	let title=$(`title`).attr(`title`);
	$(`title`).html(`${title} *`);
	delayTimeout=setTimeout(()=>{
		saveStorageData();
		$(`title`).html(title);
	},delaySecond*1000);
}

async function saveStorageData(){
	syncDataToTab();
	let curDate=new Date().format(`yyyyMMdd`);
	let curStorage={
		...defaultStorageData,
		...storageData,
	};
	await Promise.all([
		saveLDB(`storageData`,curStorage),
		saveLDB(`storageData_${curDate}`,curStorage)
	]);
}

async function loadStorageData(){
	let curStorage=await loadLDB(`storageData`);
	storageData={
		...defaultStorageData,
		...curStorage,
	}
	syncTabToData();
}

async function loadLDB(key){
	return new Promise(resolve=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key`});
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readonly`);
			let store = tx.objectStore(`content`);

			let getRequest = store.get(key);
			getRequest.onsuccess = async (event) => {
				if (event.target.result) {
					resolve(event.target.result.data);
				}else{
					resolve();
				}
			};
		};
	});
}

async function saveLDB(key,data){
	return new Promise((resolve,reject)=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key` });
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readwrite`);
			let store = tx.objectStore(`content`);
			store.put({key:key,data});

			tx.oncomplete = () => resolve(data);
			tx.onerror = (e) => reject(e);
		};
	});
}

async function delLDB(key){
	return new Promise((resolve,reject)=>{
		const dbRequest = indexedDB.open(`localDB`, 1);
		dbRequest.onupgradeneeded = (event) => {
			let db = event.target.result;
			if (!db.objectStoreNames.contains(`content`)) {
				db.createObjectStore(`content`, { keyPath: `key` });
			}
		};
		dbRequest.onsuccess = (event) => {
			let db = event.target.result;
			let tx = db.transaction(`content`, `readwrite`);
			let store = tx.objectStore(`content`);
			store.delete(key);
			tx.oncomplete = () => resolve();
			tx.onerror = (e) => reject(e);
		};
	});
}

function cloneObject(obj){
	return JSON.parse(JSON.stringify(obj));
}

String.prototype.replaceAll=function(org,tgt){
	return this.split(org).join(tgt);
}

String.prototype.count=function(str){
	return this.split(str).length-1;
}

//动画功能扩展
$.fn.anim=async function(properties, duration, easing){
	let self=this;
	return new Promise((resolve)=>{
		if(duration==undefined){
			self.transition(properties, resolve);
		}else if(easing==undefined){
			self.transition(properties, duration, resolve);
		}else{
			self.transition(properties, duration, easing, resolve);
		}
	});
}

Date.prototype.format = function(fmt) {
	function getYearWeek(date) {
		var date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var date2 = new Date(date.getFullYear(), 0, 1);
	
		//获取1月1号星期（以周一为第一天，0周一~6周日）
		var dateWeekNum = date2.getDay() - 1;
		if (dateWeekNum < 0) {
			dateWeekNum = 6;
		}
		if (dateWeekNum < 4) {
			//前移日期
			date2.setDate(date2.getDate() - dateWeekNum);
		} else {
			//后移日期
			date2.setDate(date2.getDate() + 7 - dateWeekNum);
		}
		var d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);
		if (d < 0) {
			var date3 = new Date(date1.getFullYear() - 1, 11, 31);
			return getYearWeek(date3);
		} else {
			//得到年数周数
			var year = date1.getFullYear();
			var week = Math.ceil((d + 1) / 7);
			return week;
		}
	}
	
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds(), //毫秒
		"W+": getYearWeek(this), //周数
	};
	if (/(y+)/.test(fmt))
	fmt = fmt.replace(
		RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length)
	);
	for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt)) {
		fmt = fmt.replace(
		RegExp.$1,
		RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
		);
	}
	return fmt;
};

let toastTimeout;
function toast(msg, type=`normal`,time=3){
	if(msg==false){
		$(`.toast`).stop().animate({opacity:0},250,()=>{
			$(`.toast`).remove();
		});
		return;
	}
	$(`.toast`).remove();
	$(`body`).appendDOM({
		tag:`div`,class:`toast ${type}`,style:{opacity:0},html:msg
	});
	$(`.toast`).stop().animate({opacity:1},250);
	clearTimeout(toastTimeout);
	toastTimeout=setTimeout(()=>{
		toast(false);
	},time*1000);
}