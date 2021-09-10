!function(){
var cclick={};
cclick.bind=function(elem,func){
elem.cclick={};
elem.cclick.trigger=false;
elem.cclick.enabled=true;
if(typeof func=="string"){
if(elem.hasOwnProperty(func)){
elem.cclick.func=function(){
eval(elem.getAttribute(func));
};
}else{
elem.cclick.func=function(){
eval(func);
};
}
}else if(typeof func=="function"){
elem.cclick.func=func;
}else{
try{
delete elem.cclick;
}catch(e){
}
console.error("cclick.bind(): unsupported type of arguments[1].");
return;
}
elem.cclick.fstart=function(e){
if(!elem.cclick.enabled){
return;
}
elem.cclick.trigger=true;
};

elem.cclick.fmove=function(e){
if(!elem.cclick.enabled){
return;
}
elem.cclick.trigger=false;
};

elem.cclick.fend=function(e){
if(!elem.cclick.enabled){
return;
}
if(!elem.cclick.trigger){
return;
}
try{
elem.cclick.func();
}catch(e){
console.error(e);
}
elem.cclick.trigger=false;
};

elem.addEventListener("touchstart",elem.cclick.fstart);
elem.addEventListener("touchmove",elem.cclick.fmove);
elem.addEventListener("touchend",elem.cclick.fend);
elem.addEventListener("touchcancel",elem.cclick.fend);
};

cclick.unbind=function(elem){
try{
elem.removeEventListener("touchstart",elem.cclick.fstart);
elem.removeEventListener("touchmove",elem.cclick.fmove);
elem.removeEventListener("touchend",elem.cclick.fend);
elem.removeEventListener("touchcancel",elem.cclick.fend);
delete elem.cclick;
}catch(e){
}
}
window.cclick=cclick;
}();