//console

console.log=function(str){
//alert("console.log: "+str);
};
console.warn=function(str){
alert("console.warn: "+str);
};
console.error=function(str){
alert("console.error: "+str);
};
console.info=function(str){
alert("console.info: "+str);
};
console.debug=function(str){
alert("console.debug: "+str);
};


//alert
//window.alert=console.log;

//try{
//(function(){

var formulas={};
formulas.sort_by_time=function(a,b){
if(a.time<b.time){
return -1;
}else if(a.time>b.time){
return 1;
}
return 0;
};

formulas.linear_interpolation=function(st,sv,et,ev,tt){
return sv+(ev-sv)*(tt-st)/(et-st);
};

formulas.width=(50/3);

var notes={};
notes.line=function(){
this._bpm=-1;
this._offset=0;
this._mul=-1;
this.notes=[];
this.keyframes=[];
this.speeds=[];
};

notes.line.prototype.bpm=function(b){
b=Number(b);
if(this._bpm===-1){
if((!isNaN(b))&&b>0){
this._bpm=Number(b);
this._mul=this._bpm*game.time_base/60;
}else{
console.warn("line.bpm(): Error: illegal bpm.");
}
}else{
console.warn("line.bpm(): Warning: bpm is already set.");
}
};

notes.line.prototype.finalize=function(){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.finalize(): Error: this line has been finalized().");
return;
}
delete this._offset;
this.notes.sort(formulas.sort_by_time);
this.speeds.sort(formulas.sort_by_time);
this.keyframes.sort(formulas.sort_by_time);

var lasttime=-1;
for(var a=0;a<this.keyframes.length;a++){
if(lasttime==this.keyframes[a].time){
var o=this.keyframes[a].value;
var b=this.keyframes[a-1];
if("x" in o&&o.x!==null){
b.value.x=o.x;
}
if("y" in o&&o.y!==null){
b.value.y=o.y*-1;
}
if("r" in o&&o.r!==null){
b.value.r=o.r;
}
if("o" in o&&o.o!==null){
b.value.o=o.o;
}
this.keyframes.splice(a,1);
a--;
continue;
}
lasttime=this.keyframes[a].time;
}

if(this.keyframes.length>2){
for(var a=1;a<this.keyframes.length-1;a++){
if(api.lib.keyframe_isequal(this.keyframes[a],this.keyframes[a-1])&&api.lib.keyframe_isequal(this.keyframes[a],this.keyframes[a+1])){
this.keyframes.splice(a,1);
a--;
continue;
}
}
}

lasttime=-1;
for(var a=0;a<this.speeds.length;a++){
if(lasttime==this.speeds[a].time){
if(this.speeds[a].v!==null){
this.speeds[a-1].v=this.speeds[a].v;
}
this.speeds.splice(a,1);
a--;
continue;
}
lasttime=this.speeds[a].time;
}


if(this.speeds.length>2){
for(var a=1;a<this.speeds.length-1;a++){
if(api.lib.keyframe_isequal(this.speeds[a],this.speeds[a-1])&&api.lib.keyframe_isequal(this.speeds[a],this.speeds[a+1])){
this.speeds.splice(a,1);
a--;
continue;
}
}
}
/*
this.speeds.sort(formulas.sort_by_time);
this.keyframes.sort(formulas.sort_by_time);
*/
this.isfinalized=true;
};

notes.line.prototype.offset=function(o){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.offset(): Error: this line has been finalized().");
return;
}
o=Number(o);
if(!isNaN(o)){
this._offset+=Number(o);
}else{
console.warn("line.offset(): Error: illegal offset.");
}
};

notes.line.prototype.set=function(time,o){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.set(): Error: this line has been finalized().");
return;
}
if(arguments.length<2){
console.warn("line.set(): Error: this function requires at least 2 arguments, "+arguments.length+" is provided.");
return;
}
if(!(o instanceof Object)){
console.warn("line.set(): Error: param 2 is not an Object.");
return;
}
if(Number(time)<0){
time=0;
}
var a={};
a.time=Number(time)+this._offset;
a.value={};
if("x" in o&&o.x!==null){
a.value.x=o.x;
}
if("y" in o&&o.y!==null){
a.value.y=o.y*-1;
}
if("r" in o&&o.r!==null){
a.value.r=o.r*-1;
}
if("rotate" in o&&o.rotate!==null){
a.value.r=o.rotate*-1;
}
if("o" in o&&o.o!==null){
a.value.o=o.o;
}
if("opacity" in o&&o.opacity!==null){
a.value.o=o.opacity;
}
this.keyframes.push(a);
if("speed" in o&&o.speed!==null){
var b={};
b.time=time;
b.v=o.speed*2;
this.speeds.push(b);
}else if("s" in o&&o.s!==null){
var b={};
b.time=time;
b.v=o.s*2;
this.speeds.push(b);
}
};

notes.line.prototype.tap=function(time,positionX,reversed){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.tap(): Error: this line has been finalized().");
return;
}
if(arguments.length<2){
console.warn("line.tap(): Error: this function requires at least 2 arguments, "+arguments.length+" is provided.");
return;
}
var a={};
a.type="tap";
a.time=Number(time)+this._offset;
a.px=positionX;
a.re=reversed||false;
this.notes.push(a);
};

notes.line.prototype.drag=function(time,positionX,reversed){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.drag(): Error: this line has been finalized().");
return;
}
if(arguments.length<2){
console.warn("line.drag(): Error: this function requires at least 2 arguments, "+arguments.length+" is provided.");
return;
}
var a={};
a.type="drag";
a.time=Number(time)+this._offset;
a.px=positionX;
a.re=reversed||false;
this.notes.push(a);
};

notes.line.prototype.flick=function(time,positionX,reversed){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.flick(): Error: this line has been finalized().");
return;
}
if(arguments.length<2){
console.warn("line.flick(): Error: this function requires at least 2 arguments, "+arguments.length+" is provided.");
return;
}
var a={};
a.type="flick";
a.time=Number(time)+this._offset;
a.px=positionX;
a.re=reversed||false;
this.notes.push(a);
};

notes.line.prototype.hold=function(time,positionX,holdTime,speedOnHold,reversed){
if("isfinalized" in this&&this.isfinalized){
console.warn("line.hold(): Error: this line has been finalized().");
return;
}
if(arguments.length<3){
console.warn("line.hold(): Error: this function requires at least 3 arguments, "+arguments.length+" is provided.");
return;
}
var a={};
a.type="hold";
a.time=Number(time)+this._offset;
a.ht=holdTime;
a.px=positionX;
a.re=reversed||false;
a.sp=speedOnHold*2;
this.notes.push(a);
};

notes.line.prototype.getKeyframeAfter=function(time,type){
for(var a=0;a<this.keyframes.length;a++){
var b=this.keyframes[a];
if(b.time<=time){
continue;
}
if(!(type in b)){
continue;
}
return b;
}
return false;
};

notes.line.prototype.create_elem=function(){
if(!("isInstance" in this&&this.isInstance)){
console.warn("note.create_elem(): this line is not a instance.");
return false;
}
var a=document.createElement("div");
a.className="line";
var b=document.createElement("div");
b.className="line_body";
a.appendChild(b);
return [a,b];
};

notes.line.prototype.getInstance=function(){
if(!("isfinalized" in this&&this.isfinalized)){
console.warn("line.getInstance(): Error: this line has not been finalized().");
return false;
}
var a=new notes.line();
a._bpm=this._bpm;
a._mul=this._mul;
a.isInstance=true;
a.keyframes=[];
if(this.keyframes.length>0){
var lastframe={};
lastframe.x=0;
lastframe.y=0;
lastframe.r=0;
lastframe.o=1;
var lastframeindex={};
lastframeindex.x=-1;
lastframeindex.y=-1;
lastframeindex.r=-1;
lastframeindex.o=-1;
for(var b=0;b<this.keyframes.length;b++){
var c=this.keyframes[b];
var d=c.value;
var frame={};
frame.x=false;
frame.y=false;
frame.r=false;
frame.o=false;
if(a.keyframes.length==0&&c.time>0){
a.keyframes.push({"time":0,"value":lastframe});
lastframe={};
lastframe.x=0;
lastframe.y=0;
lastframe.r=0;
lastframe.o=1;
}
if("x" in d){
lastframe.x=d.x;
lastframeindex.x=b;
frame.x=d.x;
}
if("y" in d){
lastframe.y=d.y;
lastframeindex.y=b;
frame.y=d.y;
}
if("r" in d){
lastframe.r=d.r;
lastframeindex.r=b;
frame.r=d.r;
}
if("o" in d){
lastframe.o=d.o;
lastframeindex.o=b;
frame.o=d.o;
}
if(this.keyframes.length==1){
a.keyframes.push({"time":0,"value":lastframe});
break;
}
if(c.time<=0&&a.keyframes.length==0){
continue;
}
if(frame.x===false){
var next=this.getKeyframeAfter(c.time,"x");
if(lastframeindex.x<0||next===false){
frame.x=lastframe.x;
}else{
frame.x=formulas.linear_interpolation(this.keyframes[lastframeindex.x].time,lastframe.x,next.time,next.x,c.time);
}
}
if(frame.y===false){
var next=this.getKeyframeAfter(c.time,"y");
if(lastframeindex.y<0||next===false){
frame.y=lastframe.y;
}else{
frame.y=formulas.linear_interpolation(this.keyframes[lastframeindex.y].time,lastframe.y,next.time,next.y,c.time);
}
}
if(frame.r===false){
var next=this.getKeyframeAfter(c.time,"r");
if(lastframeindex.r<0||next===false){
frame.r=lastframe.r;
}else{
frame.r=formulas.linear_interpolation(this.keyframes[lastframeindex.r].time,lastframe.r,next.time,next.r,c.time);
}
}
if(frame.o===false){
var next=this.getKeyframeAfter(c.time,"o");
if(lastframeindex.o<0||next===false){
frame.o=lastframe.o;
}else{
frame.o=formulas.linear_interpolation(this.keyframes[lastframeindex.o].time,lastframe.o,next.time,next.o,c.time);
}
}
a.keyframes.push({"time":c.time,"value":frame});
}
}else{
a.keyframes.push({"time":0,"value":{"x":0,"y":0,"r":0,"o":1}});
}
a.speeds=[];
if(this.speeds.length>0){
a.speeds=this.speeds;
}else{
a.speeds.push({"time":0,"v":2});
}
var time=-1;
for(var b=0;b<this.notes.length;b++){
var c=this.notes[b];
var noteInstance;
var ishl=false;
if(time==c.time){
if(a.notes.length>0){
a.notes[a.notes.length-1].ishl=true;
}
ishl=true;
}
time=c.time;
if(c.type=="tap"){
noteInstance=new notes.tap(c.time,c.px,c.re).getInstance(a,api.linelist.length,ishl);
}else if(c.type=="drag"){
noteInstance=new notes.drag(c.time,c.px,c.re).getInstance(a,api.linelist.length,ishl);
}else if(c.type=="flick"){
noteInstance=new notes.flick(c.time,c.px,c.re).getInstance(a,api.linelist.length,ishl);
}else if(c.type=="hold"){
noteInstance=new notes.hold(c.time,c.px,c.ht,c.sp,c.re).getInstance(a,api.linelist.length,ishl);
}else{
console.warning("line.getInstance(): Error: note type '"+c.type+"' is not supported.");
continue;
}
a.notes.push(noteInstance);
}
a.finalize();
var b=a.create_elem();
a.container=b[0];
a.linebody=b[1];
a._keyframeindex=0;
return a;
};

notes.line.prototype.addToScene=function(){
if("isInstance" in this&&this.isInstance){
console.warn("line.addToScene(): Error: this line is already a instance.");
return;
}
var a=this.getInstance();
document.getElementById("gameplay").appendChild(a.container);
api.linelist.push(a);
};

notes.line.prototype.update=function(){
if(game.paused||!game.initlized){
return;
}
for(var a=0;a<this.notes.length;a++){
this.notes[a].update();
}
if(this._keyframeindex==0){
api.lib.immdapplykeyframe.call(this,this.keyframes[0].value);
}
if(this._keyframeindex>=this.keyframes.length-1){
return;
}
/*
if(this._keyframeindex==0){
api.lib.applykeyframe.call(this,this.keyframes[0],this.keyframes[1]);
this._keyframeindex=1;
}
*/
api.lib.objectupdate.call(this,["x","y","r","o"]);
};

notes.line.prototype.getTick=function(){
if(game.paused||!game.initlized){
return;
}
return (Date.now()-api.starttime)*this._mul/1000;
};

Object.defineProperty(notes.line.prototype,"constructor",{
"value":notes.line,"enumerable":false,"writable":false});






//notes.base
notes.base=function(){
this.type="";
this.time=-1;
this.reversed=false;
this.positionX=0;
};

notes.base.prototype.create_elem=function(){
if(!("isInstance" in this&&this.isInstance)){
return false;
}
var a=document.createElement("div");
a.className="note_container";
a.style.left=(this.positionX*formulas.width+3*formulas.width)+"%";
var b=document.createElement("div");
b.className="note_body_container_container";
var c=document.createElement("div");
c.className="note_body_container";
var d=document.createElement("img");
d.className="note_body";
if(this.type=="hold"){
b.className+=" note_body_clip";
d.className+=" note_body_hold";
d.src=game.resources.notes.hold_end;
}else{
d.src=eval("game.resources.notes."+this.type+(this.ishl?"hl":""));
}

a.appendChild(b);
b.appendChild(c);
c.appendChild(d);
if(this.type=="hold"){
var e=document.createElement("img");
e.src=game.resources.notes.hold_body;
e.className="note_body note_body_hold";
var f=document.createElement("img");
f.src=game.resources.notes.hold_start;
f.className="note_body note_body_hold";
c.appendChild(e);
c.appendChild(f);
return [a,c,e];
}else{
return [a,c];
}
};

notes.base.prototype.getInstance=function(line,lineindex,ishl){
var a=new notes.base();
a.isInstance=true;
a.time=this.time;
a.type=this.type;
a.positionX=this.positionX;
a.lineindex=lineindex;
a.ishl=ishl;
a.reversed=this.reversed;
a.isadded=false;
if(this.type=="hold"){
a.speed=this.speed;
a.holdTime=this.holdTime;
a.height=(a.holdTime/line._mul)*a.speed;
a.isholding=false;
a.missed=false;
a.lastanim=0;
}
a.keyframes=[];
var posi=0;
var lastkeyframetime=a.time;
var flag=false;
for(var b=line.speeds.length-1;b>=0;b--){
if(line.speeds[b].time>a.time){
continue;
}
if(!(this.type=="hold"||flag)){
//miss效果，note淡出130ms
a.keyframes.push({"time":a.time+0.13*line._mul,"value":{"y":0.13*line.speeds[b].v,"o":0}});
flag=true;
}
posi-=((lastkeyframetime-line.speeds[b].time)/line._mul)*line.speeds[b].v;
lastkeyframetime=line.speeds[b].time;
if(this.type=="hold"){
a.keyframes.push({"time":lastkeyframetime,"value":{"y":posi-a.height}});
}else{
a.keyframes.push({"time":lastkeyframetime,"value":{"y":posi,"o":1}});
}
}
if(this.type=="hold"){
a.keyframes.push({"time":a.time,"value":{"y":0-a.height}});
a.keyframes.push({"time":a.time+a.holdTime,"value":{"y":0}});
}else{
a.keyframes.push({"time":a.time,"value":{"y":0,"o":1}});
}
a.keyframes.sort(formulas.sort_by_time);

var b=a.create_elem();
a.container=b[0];
a.animelem=b[1];
if(this.type=="hold"){
a.holdbody=b[2];
}
/*
setTimeout(function(){
api.linelist[a.lineindex].container.appendChild(a.container);
},0);
*/
//a.id=null;
a._keyframeindex=0;
return a;
};

notes.base.prototype.dispose=function(){
if(!("isInstance" in this&&this.isInstance)){
return;
}
var a=api.linelist[this.lineindex].notes.indexOf(this);
this.container.parentNode.removeChild(this.container);
if(a!=-1){
api.linelist[this.lineindex].notes.splice(a,1);
}
};

notes.base.prototype.update=function(){
if(game.paused||!game.initlized){
return;
}
/*
if(this._keyframeindex==0){
api.lib.immdapplykeyframe.call(this,this.keyframes[0].value);
}
*/
if(!this.isadded){
if(this.type=="hold"){
var a=api.lib.get_keyframe_interpolation.call(this,this.getTick(),["y"]);
if((a[0].value.y+this.height*api.drawscale)>=-1*(game.settings.render_distance*2/api.drawscale)){
api.linelist[this.lineindex].container.appendChild(this.container);
this.isadded=true;
this._keyframeindex=a[1];
api.lib.immdapplykeyframe.call(this,a[0].value);
//api.lib.applykeyframe.call(this,a[0],this.keyframes[this._keyframeindex]);
return;
}
}else{
var a=api.lib.get_keyframe_interpolation.call(this,this.getTick(),["y","o"]);
if(a[0].value.y>=-1*(game.settings.render_distance*2/api.drawscale)){
api.linelist[this.lineindex].container.appendChild(this.container);
this.isadded=true;
this._keyframeindex=a[1];
api.lib.immdapplykeyframe.call(this,a[0].value);
//api.lib.applykeyframe.call(this,a[0],this.keyframes[this._keyframeindex]);
return;
}
}
}
if(this.type=="hold"){
if(this.keyframes[this.keyframes.length-2].time+0.13*api.linelist[this.lineindex]._mul<this.getTick()){
if(!this.isholding){
if(!this.missed){
this.missed=true;
api.combo.miss();
this.animelem.style.opacity=0.2;
}
}
}
if(this.keyframes[this.keyframes.length-1].time<this.getTick()){
this.dispose();
return;
}
}else{
if(this.keyframes[this.keyframes.length-1].time+0.2*api.linelist[this.lineindex]._mul<this.getTick()){
api.combo.miss();
this.dispose();
return;
}
}
/*
if(this._keyframeindex==0){
api.lib.applykeyframe.call(this,this.keyframes[0],this.keyframes[1]);
if(this.isadded){
this._keyframeindex=1;
}
return;
}
*/
if(this.type=="hold"){
api.lib.objectupdate.call(this,["y"]);
}else{
api.lib.objectupdate.call(this,["y","o"]);
}
};

notes.base.prototype.getTick=function(){
if(game.paused||!game.initlized){
return;
}
return (Date.now()-api.starttime)*api.linelist[this.lineindex]._mul/1000;
};

notes.tap=function(ti,px,re){
notes.base.call(this);
this.time=ti;
this.positionX=px;
this.reversed=re;
this.type="tap";
};

notes.drag=function(ti,px,re){
notes.base.call(this);
this.time=ti;
this.positionX=px;
this.reversed=re;
this.type="drag";
this.triggered=false;
};

notes.hold=function(ti,px,ht,sp,re){
notes.base.call(this);
this.time=ti;
this.positionX=px;
this.holdTime=ht;
this.speed=sp;
this.reversed=re;
this.type="hold";
};

notes.flick=function(ti,px){
notes.base.call(this);
this.time=ti;
this.positionX=px;
this.type="flick";
this.triggered=false;
};

notes.tap.prototype=Object.create(notes.base.prototype);
notes.drag.prototype=Object.create(notes.base.prototype);
notes.hold.prototype=Object.create(notes.base.prototype);
notes.flick.prototype=Object.create(notes.base.prototype);
Object.defineProperty(notes.tap.prototype,"constructor",{
"value":notes.tap,"enumerable":false,"writable":false});
Object.defineProperty(notes.drag.prototype,"constructor",{
"value":notes.drag,"enumerable":false,"writable":false});
Object.defineProperty(notes.hold.prototype,"constructor",{
"value":notes.hold,"enumerable":false,"writable":false});
Object.defineProperty(notes.flick.prototype,"constructor",{
"value":notes.flick,"enumerable":false,"writable":false});

//main
//game
var game={};
game.combo=0;
game.levelname="";
game.leveldiff="";
game.time_base=32;
game.settings={};
game.settings.render_distance=3;
game.paused=false;
game.initlized=false;
//game.autoplay=false;
game.autoplay=true;
game.audio=null;
game.resources={};
//game.resources.se=[null,null,null];
game.resources.se=["../resources/se/hitsound0.wav","../resources/se/hitsound1.wav","../resources/se/hitsound2.wav"];
game.resources.notes={};
//game.resources.notes.tap=null;
game.resources.notes.tap="../resources/img/tap.png";
//game.resources.notes.taphl=null;
game.resources.notes.taphl="../resources/img/taphl.png";
//game.resources.notes.drag=null;
game.resources.notes.drag="../resources/img/drag.png";
//game.resources.notes.draghl=null;
game.resources.notes.draghl="../resources/img/draghl.png";
//game.resources.notes.hold_start=null;
game.resources.notes.hold_start="../resources/img/hold_start.png";
//game.resources.notes.hold_body=null;
game.resources.notes.hold_body="../resources/img/hold_body.png";
//game.resources.notes.hold_end=null;
game.resources.notes.hold_end="../resources/img/hold_end.png";
//game.resources.notes.flick=null;
game.resources.notes.flick="../resources/img/flick.png";
//game.resources.notes.flickhl=null;
game.resources.notes.flickhl="../resources/img/flickhl.png";
game.resources.effects={};
//game.resources.effects.explode_perfect=null;
game.resources.effects.explode_perfect="../resources/img/explode_perfect.png";
//game.resources.effects.explode_good=null;
game.resources.effects.explode_good="../resources/img/explode_good.png";
//game.resources.effects.tap_bad=null;
game.resources.effects.tap_bad="../resources/img/tap_bad.png";
game.start=function(){
if(!game.initlized){
console.warn("game.start(): Warn: the game is not initlized.");
return;
}
api.starttime=Date.now();
window.requestAnimationFrame(api.update);
};


//api
var api={};
api.starttime=0;
api.notecount=0;
api.drawscale=1;
api.linelist=[];
api.lib={};
api.lib.notes=notes;
api.lib.formulas=formulas;

api.lib.objectupdate=function(list){
if(game.paused||!game.initlized){
return;
}

if(this._keyframeindex>=this.keyframes.length-1){
return;
}

/*
if(this.keyframes[this._keyframeindex].time>this.getTick()){
return;
}
*/
var a=api.lib.get_keyframe_interpolation.call(this,this.getTick(),list);
this._keyframeindex=a[1]-1;
api.lib.immdapplykeyframe.call(this,a[0].value);
/*
api.lib.applykeyframe.call(this,a[0],this.keyframes[this._keyframeindex]);
*/
};

api.lib.get_keyframe_interpolation=function(time,list){
if(game.paused||!game.initlized){
return;
}
if(this._keyframeindex>=this.keyframes.length-1||time>=this.keyframes[this.keyframes.length-1].time){
return [this.keyframes[this.keyframes.length-1],this.keyframes.length-1];
}
var lastframe,nextframe,nextframeindex;
for(var a=(this._keyframeindex-1<0?0:this._keyframeindex-1);a<this.keyframes.length-1;a++){
if(this.keyframes[a].time<=time&&this.keyframes[a+1].time>time){
lastframe=this.keyframes[a];
nextframe=this.keyframes[a+1];
nextframeindex=a+1;
break;
}
}
var frame={};
for(var a=0;a<list.length;a++){
frame[list[a]]=formulas.linear_interpolation(lastframe.time,lastframe.value[list[a]],nextframe.time,nextframe.value[list[a]],time);
}
return [{"time":time,"value":frame},nextframeindex];
};

api.lib.keyframe_isequal=function(a,b){
var c=a.value;
var d=b.value;
if(c.length!=d.length){
return false;
}
var list=["x","y","r","o","v"];
for(var e=0;e<list.length;e++){
if((list[e] in c)!==(list[e] in d)){
return false;
}
if(list[e] in c){
if(c[list[e]]!==d[list[e]]){
return false;
}
}
}
return true;
};

api.lib.immdapplykeyframe=function(frame){
if("x" in frame&&"y" in frame&&"r" in frame&&"o" in frame){
//line keyframe
this.container.style.transform="translate("+(frame.x*formulas.width)+"%"+","+(frame.y*formulas.width*api.drawscale)+"%"+") rotate("+frame.r+"deg)";
this.linebody.style.opacity=frame.o;
}else if("y" in frame){
//note keyframe
this.animelem.style.transform="translateY("+(frame.y*formulas.width*api.drawscale+100)+"%"+")";
if("o" in frame){
this.animelem.style.opacity=frame.o;
}
if(this.type=="hold"){
this.holdbody.style.height=this.height*formulas.width*api.drawscale+"%";
}
}else{
console.warn("api.lib.immdapplykeyframe.call(): invalid frame.");
return;
}
};

api.lib.applykeyframe=function(current,next){
if(this instanceof notes.line){
//line
var a=this.container;
var b=this;
var c=this.linebody;
a.style.transition="none";
c.style.transition="none";
setTimeout(function(){
api.lib.immdapplykeyframe.call(b,current.value);
setTimeout(function(){
a.style.transition="transform "+(next.time-current.time)/b._mul+"s linear";
c.style.transition="opacity "+(next.time-current.time)/b._mul+"s linear";
setTimeout(function(){
api.lib.immdapplykeyframe.call(b,next.value);
},0);
},0);
},0);
}else{
//note
var a=this.animelem;
var b=this;
a.style.transition="none";
setTimeout(function(){
api.lib.immdapplykeyframe.call(b,current.value);
setTimeout(function(){
a.style.transition="all "+(next.time-current.time)/api.linelist[b.lineindex]._mul+"s linear";
setTimeout(function(){
api.lib.immdapplykeyframe.call(b,next.value);
},0);
},0);
},0);
}
};

api.load=function(file,type){

};

api.update=function(){
if(game.paused||!game.initlized){
return;
}
for(var a=0;a<api.linelist.length;a++){
api.linelist[a].update();
}
window.requestAnimationFrame(api.update);
};

api.reset=function(){

};
api.combo={};

api.combo.perfect=function(){
console.log("prefect");
};

api.combo.good=function(){
console.log("good");
};

api.combo.bad=function(){
console.log("bad");
};

api.combo.miss=function(){
console.log("miss");
};

//settings
var resize=function(){
var w=window.innerWidth;
var h=window.innerHeight;
var scale=1;
if(w>h){
scale=1;
api.drawscale=h/w;
}else{
scale=w/h;
api.drawscale=1;
}
document.getElementById("gameplay").style.transform="translate(-50%,-50%) scale("+scale+")";
};
window.addEventListener("resize",resize);
window.addEventListener("load",resize);
//})();
document.write("succ");





//map_test
(function(){

//map.js


//map.js end
game.initlized=true;
setTimeout(function(){
game.start();
},1000);
})();
//}catch(e){alert(e)}
