<?php
set_time_limit(0);
header("X-Accel-Buffering: no");
ob_end_clean();
ob_implicit_flush();
ignore_user_abort(true);


$jo=file_get_contents("1.json");
$jo=json_decode($jo,true);
if($jo===null){
echo "error: cannot parse json file.";
sleep(5);
exit;
}
$jo_ver=$jo["formatVersion"];

//metadata
$bpm=[];
$offset="undefined";
$noteCount=0;
$judgeLineCount=0;


$ou="";
$offset=$jo["offset"];
$numOfNotes=$jo["numOfNotes"];
$judgeLineCount=count($jo["judgeLineList"]);
function scb($a,$b){
if($a["st"]<$b["st"]){
return -1;
}else if($a["st"]>$b["st"]){
return 1;
}
if($a["type"]=="speed"){
return -1;
}
if($b["type"]=="speed"){
return 1;
}
return 0;
}
if($judgeLineCount>0){
$oua=[];
for($a=0;$a<$judgeLineCount;$a++){
$b=$jo["judgeLineList"][$a];
$noteCount+=$b["numOfNotes"];
//$b["numOfNotesAbove"]
//$b["numOfNotesBelow"]
$bpm[]=$b["bpm"];
$ou.="\r\n\r\n";
$ou.="line".$a." = Line(0.5, 0.5, angle = 0, opacity = 255)\r\n";
$ou.="spd = global_speed\r\n";
$ou.="with Multiplier(1 / (".$b["bpm"]." * 32 / 60)):\r\n";
$ou.="    "."with line".$a.":\r\n";
$oul=[];
// ["type": string, "start-time": float, "code": string]
for($c=0;$c<count($b["speedEvents"]);$c++){
$d=$b["speedEvents"][$c];
/*
$d["startTime"]
$d["endTime"]
//$d["floorPosition"]
$d["value"]
*/
$e=[];
$e["type"]="speed";
$e["code"]="    "."    ";
$e["code"].="spd = ".$d["value"]."";
$e["st"]=$d["startTime"];
$oul[]=$e;
unset($e);
$e=[];
$e["type"]="speed";
$e["code"]="    "."    ";
$e["code"].="spd = global_speed";
$e["st"]=$d["endTime"];
$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

for($c=0;$c<count($b["notesAbove"]);$c++){
$d=$b["notesAbove"][$c];
/*
$d["type"]
$d["time"]
$d["positionX"]/10
$d["holdTime"]
$d["speed"]
//$d["floorPosition"]
*/
$e=[];
$e["type"]="note";
$e["code"]="    "."    ";
if($d["type"]==1){
$e["code"].="Click(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else if($d["type"]==2){
$e["code"].="Drag(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else if($d["type"]==3){
$e["code"].="Hold(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd, duration = ".$d["holdTime"].", line = "."None".", show_sec = "."None".")";
}else if($d["type"]==4){
$e["code"].="Flick(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else{
echo "Warning: note type '".$d["type"]."' is not supported.\r\n";
continue;
}
$e["st"]=$d["time"];
$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

for($c=0;$c<count($b["notesBelow"]);$c++){
$d=$b["notesBelow"][$c];
/*
$d["type"]
$d["time"]
$d["positionX"]
$d["holdTime"]
$d["speed"]
//$d["floorPosition"]
*/
$e=[];
$e["type"]="note";
$e["code"]="    "."    ";
if($d["type"]==1){
$e["code"].="Click(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else if($d["type"]==2){
$e["code"].="Drag(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else if($d["type"]==3){
$e["code"].="Hold(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd, duration = ".$d["holdTime"].", line = "."None".", show_sec = "."None".")";
}else if($d["type"]==4){
$e["code"].="Flick(sec = ".$d["time"].", pos = ".($d["positionX"]/10).", speed = ".$d["speed"]." * spd)";
}else{
echo "Warning: note type '".$d["type"]."' is not supported.\r\n";
continue;
}
$e["st"]=$d["time"];
$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

for($c=0;$c<count($b["judgeLineDisappearEvents"]);$c++){
$d=$b["judgeLineDisappearEvents"][$c];
/*
$d["startTime"]
$d["endTime"]
$d["start"]*255 //opacity
$d["end"]*255 //opacity
//$d["start2"] fixed: 0.0
//$d["end2"] fixed: 0.0
*/
$e=[];
$e["type"]="line";
$e["st"]=$d["startTime"];

if($jo_ver==1){
//$e["code"]=["line".$a.".set(sec = ".($d["startTime"]).", opacity = ".($d["start"]*255).")"];
$e["code"]=[];
$e["code"]["line"]=$a;
$e["code"]["opacity"]=($d["start"]*255);
}else if($jo_ver==3){
$e["code"]=[];
$e["code"]["line"]=$a;
$e["code"]["opacity"]=($d["start"]*255);
}else{
$e["code"]="#ERROR: map version not supported.";
}
$oul[]=$e;
unset($e);

$e=[];
$e["type"]="line";
$e["st"]=$d["endTime"];
$e["code"]=[];
$e["code"]["line"]=$a;
$e["code"]["opacity"]=($d["end"]*255);

$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

for($c=0;$c<count($b["judgeLineMoveEvents"]);$c++){
$d=$b["judgeLineMoveEvents"][$c];
/*
$d["startTime"]
$d["endTime"]
$d["start"] // start-x
$d["end"] // end-x
$d["start2"] // start-y
$d["end2"] // end-y
*/
if($jo_ver==1){
$d["start2"]=((int)substr((string)$d["start"],3,3))/520;
$d["end2"]=((int)substr((string)$d["end"],3,3))/520;
$d["start"]=((int)substr((string)$d["start"],0,3))/880;
$d["end"]=((int)substr((string)$d["end"],0,3))/880;
}
$e=[];
$e["type"]="line";
$e["st"]=$d["startTime"];

$e["code"]=[];
$e["code"]["line"]=$a;
$e["code"]["x"]=($d["start"]);
$e["code"]["y"]=($d["start2"]);

$oul[]=$e;
unset($e);

$e=[];
$e["type"]="line";
$e["st"]=$d["endTime"];
$e["code"]=[];
$e["code"]["line"]=$a;
$e["code"]["x"]=($d["end"]);
$e["code"]["y"]=($d["end2"]);
$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

for($c=0;$c<count($b["judgeLineRotateEvents"]);$c++){
$d=$b["judgeLineRotateEvents"][$c];
/*
$d["startTime"]
$d["endTime"]
$d["start"]
$d["end"]
//$d["start2"] fixed: 0.0
//$d["end2"] fixed: 0.0
*/
$e=[];
$e["type"]="line";
$e["st"]=$d["startTime"];
$e["code"]=[];
$e["code"]["line"]=$a;
if($jo_ver==1){
$e["code"]["angle"]=$d["start"];
}else if($jo_ver==3){
$e["code"]["angle"]=$d["start"]*2*pi()/360;
}else{
$e["code"].="#ERROR: map version not supported.";
}
$oul[]=$e;
unset($e);

$e=[];
$e["type"]="line";
$e["st"]=$d["endTime"];
if($jo_ver==1){
$e["code"]["angle"]=$d["end"];
}else if($jo_ver==3){
$e["code"]["angle"]=$d["end"]*2*pi()/360;
}else{
$e["code"].="#ERROR: map version not supported.";
}
$oul[]=$e;
unset($e);
unset($d);
}
unset($c);

unset($b);

usort($oul,"scb");
$ts=0;
$lc=[];
$lc["x"]="None";
$lc["y"]="None";
$lc["angle"]="None";
$lc["opacity"]="None";
$lc["valid"]=false;
$lc["pco"]="";
for($t=0;$t<count($oul);$t++){
$b=$oul[$t];
if($ts!=$b["st"]){
if($lc["valid"]==true){
$c=[];
$c["st"]=$ts;
$c["type"]="line";
$c["code"]=$lc["pco"]."    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")";
$oua[]=$c;
unset($c);
}

$ts=$b["st"];
$lc=[];
$lc["x"]="None";
$lc["y"]="None";
$lc["angle"]="None";
$lc["opacity"]="None";
$lc["valid"]=false;
$lc["pco"]="";
}

//merge single line commands
if($b["type"]=="line"){
//x,y,angle,opacity
if(array_key_exists("x",$b["code"])){
if($lc["x"]!=="None"){
$lc["pco"].="    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")\r\n";
}
$lc["x"]=$b["code"]["x"];
$lc["valid"]=true;
}
if(array_key_exists("y",$b["code"])){
if($lc["y"]!=="None"){
$lc["pco"].="    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")\r\n";
}
$lc["y"]=$b["code"]["y"];
$lc["valid"]=true;
}
if(array_key_exists("angle",$b["code"])){
if($lc["angle"]!=="None"){
$lc["pco"].="    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")\r\n";
}
$lc["angle"]=$b["code"]["angle"]*(-1);
$lc["valid"]=true;
}
if(array_key_exists("opacity",$b["code"])){
if($lc["opacity"]!=="None"){
$lc["pco"].="    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")\r\n";
}
$lc["opacity"]=$b["code"]["opacity"];
$lc["valid"]=true;
}
continue;
}

$oua[]=$b;
}
unset($t);
if($lc["valid"]){
$c=[];
$c["st"]=$ts;
$c["type"]="line";
$c["code"]=$lc["pco"]."    "."    "."line".$a.".set(sec = ".$ts.", x = ".$lc["x"].", y = ".$lc["y"].", angle = ".$lc["angle"].", opacity = ".$lc["opacity"].")";
$oua[]=$c;
unset($c);
}
unset($ts);
unset($lc);
unset($b);
unset($oul);
}

unset($a);
usort($oua,"scb");
foreach($oua as $a){
$ou.=$a["code"]."\r\n";
}
unset($a);
unset($oua);
}


$out="import sys\r\nimport os\r\n\r\ntry:\r\n    from phigros import *\r\nexcept ImportError:\r\n    try:\r\n        sys.path.append(os.path.abspath(\"../\"))\r\n        from phigros import *\r\n    except ImportError:\r\n        try:\r\n            sys.path.append(os.path.abspath(\"../../\"))\r\n            from phigros import *\r\n        except ImportError:\r\n            try:\r\n                sys.path.append(os.path.abspath(\"../../../\"))\r\n                from phigros import *\r\n            except ImportError:\r\n                sys.exit('module \'phigros\' is not found.')\r\n\r\n";
$out.="#-----metadata-----\r\n";

//metadata
$out.="#bpm = ".json_encode($bpm)."\r\n";
$out.="#offset = ".$offset."\r\n";
$out.="#noteCount = ".$noteCount."\r\n";
$out.="#judgeLineCount = ".$judgeLineCount."\r\n";

$out.="\r\n";
$out.="#-----settings-----\r\n";

//settings
$out.="global_speed = 0.5\r\n";

//main
$out.=$ou;

$out.="\r\n\r\n\r\npreview('name', 'level', 'music.wav', 'IllustrationBlur.png', height=630, width=1120, size=830)\r\n";

file_put_contents("start.py",$out);
echo "\r\n";
echo "\r\n";
echo "----finished----";
sleep(999);

?>