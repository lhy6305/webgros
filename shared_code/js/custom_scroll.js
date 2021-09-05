!function(){
var cscroll={};
cscroll.curelem=null;
cscroll.bind=function(elem,towards){
elem.cscroll={};
elem.cscroll.towards=towards;
if(elem.cscroll.towards===undefined){
elem.cscroll.towards=2;
}
elem.cscroll.tdsX=0;
elem.cscroll.tdsY=0;
elem.cscroll.startX=0;
elem.cscroll.startY=0;
elem.cscroll.lastmoveX=0;
elem.cscroll.lastmoveY=0;
elem.cscroll.lastmovetime=0;
elem.cscroll.enabled=true;
/*
var maxDown=50;
var maxUp=-(elem.offsetHeight-container.offsetHeight+maxDown);
*/

elem.cscroll.fstart=function(e){
if(!elem.cscroll.enabled){
return;
}
cscroll.curelem=elem;
elem.cscroll.startX=e.changedTouches[0].clientX;
elem.cscroll.startY=e.changedTouches[0].clientY;
elem.style.transition="";
elem.cscroll.lastmovetime=0;
elem.cscroll.lastmoveX=elem.cscroll.startX;
elem.cscroll.lastmoveY=elem.cscroll.startY;
};

elem.cscroll.fmove=function(e){
if(cscroll.curelem===null){
return;
}
var elem=cscroll.curelem;
var container=elem.parentNode;
var dsX=e.changedTouches[0].clientX-elem.cscroll.startX;
elem.cscroll.lastmoveX=dsX+elem.cscroll.tdsX;
var dsY=e.changedTouches[0].clientY-elem.cscroll.startY;
elem.cscroll.lastmoveY=dsY+elem.cscroll.tdsY;
/*
tmp=Math.min(tmp,maxDown);
tmp=Math.max(tmp,maxUp);
*/
var oleft=0;
var oright=container.offsetWidth-elem.offsetWidth;
var otop=0;
var obottom=container.offsetHeight-elem.offsetHeight;
e.preventDefault();
if(elem.cscroll.towards==0){
elem.style.transform="translate("+elem.cscroll.lastmoveX+"px,0)";
}else if(elem.cscroll.towards==1){
elem.style.transform="translate(0,"+elem.cscroll.lastmoveY+"px)";
}else if(elem.cscroll.towards==2){
elem.style.transform="translate("+elem.cscroll.lastmoveX+"px,"+elem.cscroll.lastmoveY+"px)";
}
elem.cscroll.lastmovetime=Date.now();
};

elem.cscroll.fend=function(e){
if(cscroll.curelem===null){
return;
}
var elem=cscroll.curelem;
var container=elem.parentNode;
var dsX=e.changedTouches[0].clientX-elem.cscroll.startX;
var ldsX=e.changedTouches[0].clientX-elem.cscroll.lastmoveX;
var dsY=e.changedTouches[0].clientY-elem.cscroll.startY;
var ldsY=e.changedTouches[0].clientY-elem.cscroll.lastmoveY;
var tt=Date.now()-elem.cscroll.lastmovetime;
tt=Math.max(tt,1);
if(ldsX>2){
dsX*=1+2/tt;
}
if(ldsY>2){
dsY*=1+2/tt;
}
elem.cscroll.tdsX+=dsX;
elem.cscroll.tdsY+=dsY;
var oleft=0;
var oright=container.offsetWidth-elem.offsetWidth;
var otop=0;
var obottom=container.offsetHeight-elem.offsetHeight;
elem.cscroll.tdsX=Math.min(elem.cscroll.tdsX,oleft);
elem.cscroll.tdsX=Math.max(elem.cscroll.tdsX,oright);
elem.cscroll.tdsY=Math.min(elem.cscroll.tdsY,otop);
elem.cscroll.tdsY=Math.max(elem.cscroll.tdsY,obottom);
elem.style.transition="transform .6s cubic-bezier(.17,.89,.45,1)";
if(elem.cscroll.towards==0){
elem.style.transform="translate("+elem.cscroll.tdsX+"px,0)";
}else if(elem.cscroll.towards==1){
elem.style.transform="translate(0,"+elem.cscroll.tdsY+"px)";
}else if(elem.cscroll.towards==2){
elem.style.transform="translate("+elem.cscroll.tdsX+"px,"+elem.cscroll.tdsY+"px)";
}
elem.cscroll.lastmovetime=0;
cscroll.curelem=null;
};

elem.addEventListener("touchstart",elem.cscroll.fstart);
elem.addEventListener("touchmove",elem.cscroll.fmove);
window.addEventListener("touchend",elem.cscroll.fend);
window.addEventListener("touchcancel",elem.cscroll.fend);
};

cscroll.unbind=function(elem){
try{
elem.removeEventListener("touchstart",elem.cscroll.fstart);
elem.removeEventListener("touchmove",elem.cscroll.fmove);
window.removeEventListener("touchend",elem.cscroll.fend);
window.removeEventListener("touchcancel",elem.cscroll.fend);
delete elem.cscroll;
}catch(e){
}
}
window.cscroll=cscroll;
}();
