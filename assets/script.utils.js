function saveStorageData(){
	localStorage.setItem(`storageData`,JSON.stringify(storageData));
}
function loadStorageData(){
	storageData=JSON.parse(localStorage.getItem(`storageData`));
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