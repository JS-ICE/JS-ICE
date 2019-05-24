//The symmetry tab enables visualization and manipulation of file according to various symmetry operations. Compatible with
//crystal and .cif files. 
//A. Salij 5.23.2018 (andrewsalij@gmail.com) 

var _symmetry = {
		CLICK_ENABLE :      "Enable Editing",		  
		CLICK_DISABLE :     "Disable Editing", 
		ATOM_TIP :  "Click on atom to fill",
		CENTER_TIP :        "Click on a ref. atom",
	    CLICK_POINT_TIP :   "Click on the sphere to add a point",
		UPDATE_VIEW :       "updateView",
		UPDATE_EDIT :       "updateEdit",
	    SYM_NONE :          "clear",
		intervalID : ""
};

//initialization upon entry into symmetry tab 
function enterSymmetry() {
	if (!_file.symmetry){
		_file.symmetry = {
			operationList     : [],
			xyz2optionMap      : {},
			symInvariantCache : {},
			symopInvariantList  : [],
			chosenSymElement  : "", 
			chosenSymop       : "",
			symOffset         : "{0/1,0/1,0/1}",
			errorDistance     : 0.1 
		}; 
		getbyID('symmetryGroup').reset();
		_symmetry.createSymopSet();
	}
	runJmolScriptWait("select none;set picking select atom; selectionhalos on");
	_symmetry.updateFields();
	_symmetry.addJmolEvents();
}

function exitSymmetry() {
	runJmolScriptWait("select none;set picking select atom; selectionhalos off");
	_symmetry.onHoverEnd();
}

//_symmetry.resetPage = function(){
//	_symmetry.doSelectNone();
//}

_symmetry.addJmolEvents = function() {
	if (_symmetry.hasEvents)
		return;
	_symmetry.hasEvents = true;
	$('.japplet').on('click', function( event ) {
		  console.log('Applet Clicked');
			  _symmetry.onClick();
	});
	$('.japplet').on('mouseenter', function( event ) {
		  console.log('Applet Entered');
		  _symmetry.onHoverStart();
	});
	$('.japplet').on('mouseleave', function( event ) {
		  console.log('Applet Left');
		  _symmetry.onHoverEnd();
	});
	$('.rightframe').on('mouseenter', function( event ) {
		  console.log('Right Frame Entered');
		  _symmetry.onHoverEnd();
	});
}

_symmetry.doSymBtnClick = function(btn) {
	var text = (btn.value || btn);
	switch(text) {
	case _symmetry.SYM_NONE:
		_symmetry.doSelectNone();
		break;
	case _symmetry.UPDATE_VIEW:
		_symmetry.updateFields();
		break;
	case _symmetry.UPDATE_EDIT:
		break;
	case _symmetry.CLICK_ENABLE:
		_symmetry.doEnableVoidClicking();
		_symmetry.doEnableVoidDragging();
		btn.value = _symmetry.CLICK_DISABLE;
		break;
	case _symmetry.CLICK_DISABLE:
		_symmetry.doDisableVoidClicking();
		_symmetry.doDisableVoidDragging();
		btn.value = _symmetry.CLICK_ENABLE;
		break;
	}	
}

_symmetry.updateFields = function() {
	_symmetry.updateSymInvariantSelect();
	_symmetry.setOpacity();
//	var activateSymmetry = createButton("activateSymmetryButton", "Activate applied symmetry:", 'setSymClickStatus("radiusBindAdd")', 0);
//	getbyID("activateSymmetryDiv").innerHTML = activateSymmetry;
//	var activateAllSymmetry = createButton("activateAllSymmetryButton", "Activate all symmetry:", 'setSymClickStatus("radiusBindAddAll")', 0); 
//	getbyID("activateAllSymmetryDiv").innerHTML = activateAllSymmetry;
	//var symInvariantsSelect = createSelect('addSymInvariantsSymop', '_symmetry.doSymopSelection(value)', 0, _file.symmetry.symopInvariantList.length , _file.symmetry.symopInvariantList);
	//getbyID("symInvariantsDiv").innerHTML = symInvariantsSelect; 
//	var voidClicking = createButton("enableVoidClickingButton", "Enable Clicking", '_symmetry.doEnableVoidClicking()', 0)+"\n"+
//						createButton("disableVoidClickingButton", "Disable Clicking", '_symmetry.doDisableVoidClicking()', 0);
//	getbyID("voidClickingDiv").innerHTML = voidClicking; 
//	var corePointDragging = createButton("corePointDraggingButton", "Enable Dragging", 'doEnableCorePointDragging()', 0)
//	getbyID("corePointDraggingDiv").innerHTML = corePointDragging; 
	//$('.japplet').on('click', function( event ) {
	//	  console.log('Applet Clicked');
	//	  onSymmetryClick();
	//});

}

_symmetry.onHover = function(){
	console.log("hov check");
	var symClickStatus = getJmolValue("symClickStatus");
	switch(symClickStatus){
	case "corePointDragging":
		return _symmetry.dragPoint();
	default:
		break;
	}
} 

_symmetry.onHoverStart = function(){
	if (! _symmetry.intervalID){
		_symmetry.intervalID = window.setInterval(_symmetry.onHover,200);
	}
}

_symmetry.onHoverEnd = function(){
	_symmetry.intervalID && window.clearInterval(_symmetry.intervalID);
	_symmetry.intervalID = "";
}

//todo upon clicking on the japplet
_symmetry.onClick = function(){
	_symmetry.updateSymInvariantSelect();
	var symClickStatus = getJmolValue("symClickStatus");
	var clickedPoint = getJmolValue("clickedPoint");
	switch(symClickStatus){
	case "corePointDragging":
		return _symmetry.dragPoint();
	case "radiusBindAdd":
		_symmetry.doActivate(_symmetry.getJmolPoint("voidClickPoint", false)); 
		break;
	case "radiusBindAddAll":
		_symmetry.doActivateAll(); 
		break;
	//case "vectorBindAdd": //to test 
		//var newClickedPoint = bindToVectorConstraint("sym_axis1",
		//											clickedPoint,
		//											_file.symmetry.errorDistance);
		//clickedPoint = newClickedPoint;
		//doActivate(getValue("voidClickPoint"));
		//break; 
	case "showAllInvariantSymops":
		runJmolScript("drawAllSymops(symopInvariantListJmol,"+ _symmetry.getJmolPoint("initPoint", false)+")")
		break;
	default: 
		break;
	}
}

_symmetry.dragPoint = function() {
	var symop = _file.symmetry.chosenSymElement;
	var cP = _symmetry.getJmolPoint("centerPoint");
	if (!symop || cP == "{}")
		return; // BH cP can be null if no selection has been made
	var rA = getValue("radiusAngstroms") || 1;
	runJmolScriptWait("clickedPoint = bindToSphereConstraint("+cP+","+rA+",clickedPoint)");
	runJmolScriptWait("appendNewAtomPoint('corepoint',"+symop+", clickedPoint)");
	_symmetry.doActivate(getJmolValue("clickedPoint"));
}

//Updates global sym invariant list with current  symops of selection 
_symmetry.updateSymInvariantSelect = function(){
	if (!_file.symmetry)
		return;	
	var atoms = getJmolValue("{selected}");
	var list;
	if (atoms.length) {
		list = _file.symmetry.symInvariantCache[atoms];
		if (!list) {
			runJmolScriptWait("symopInvariantListJmol = findInvariantSymOps({selected},readSymmetryVectors().size)");
			list= getJmolValue("symopInvariantListJmol");
			_file.symmetry.symInvariantCache[atoms] = list;
		}
	} else {
		list = [];
	}
	_file.symmetry.symopInvariantList = list;
	var len = list.length;
	var map = _file.symmetry.xyz2optionMap;
	var d = getbyID('addSymSymop');
	for (var i = d.options.length; --i >= 0;) {
		if (len == 0)
			enableElement(d.options[i]);
		else
			disableElement(d.options[i]);
	}
	if (len == 0) {
		setValue("initPoint", "");
		setValue("centerPoint", "");
		setValue("voidClickPoint", "");		
	} else {
		for (var i = 0; i < len; i++)
			enableElement(map[list[i]]);
		//Changes input tables to current selection in JSmol
		var selectionPoint = getJmolValue("{selected}.xyz");
		if (selectionPoint != -1){
			setValue("initPoint", pointStringToFixed(selectionPoint,4));
			setValue("centerPoint", pointStringToFixed(selectionPoint,4));
		}
		var clickedPointString = getJmolValue("clickedPoint");
		if (clickedPointString){
			setValue("voidClickPoint", pointStringToFixed(clickedPointString,4));
		}
	}
}

//this appends new atoms by chosen symop
_symmetry.doActivate = function(clickedPoint){
	if (clickedPoint[0] != "{"){
		clickedPoint = "{"+clickedPoint+"}";
	}
	if (_file.symmetry){
		var niter = 1;//TODO getValue("symIterations");
		_symmetry.appendSymmetricAtoms(_file.symmetry.chosenSymElement,clickedPoint,_file.symmetry.chosenSymop,niter);
	}
}

//this only shows every point for a given point for all symops 
_symmetry.doActivateAll = function(){
	_symmetry.drawAllSymmetricPoints(_symmetry.getJmolPoint("voidClickPoint"));
}


_symmetry.doSymopSelection = function(symop){
	_symmetry.setSymop(symop);
	_symmetry.displayDrawObjects(symop,_symmetry.getJmolPoint("initPoint", false));
}

//Enables clicking upon blank space in java applet 
_symmetry.doEnableVoidClicking = function(){
	var cP = _symmetry.getJmolPoint("centerPoint", true);
	if (cP == "{}"){
		alert("No center point selected");
		return;
	}
	var rA = getValue("radiusAngstroms");
	if(!rA){
		rA = 1; //default value 
	}
	runJmolScriptWait("unbind"); //resets jmol to default mouse config
	runJmolScriptWait("bind 'LEFT+click' 'clickedPoint = clickToPoint("+cP+","+rA+",_X,_Y)'");
	runJmolScriptWait("sphereClickShow = 'sphereClickShow'; draw ID @sphereClickShow radius "+rA+" "+cP+" translucent"); 
}

_symmetry.getJmolPoint = function(id, orSelected) {	
	var cP = getValue(id);
	if(!cP && orSelected){
		cP = getJmolValue("{selected}.xyz");// BH needed quotes
	}
	return (cP[0] == "{" ? cP : "{"+cP+"}");
}

_symmetry.doDisableVoidClicking = function(){
	runJmolScriptWait("unbind");
	runJmolScriptWait("symClickStatus = 'default'");
	runJmolScriptWait("draw 'symClickShow' delete");
}

_symmetry.doEnableVoidDragging = function(){
	runJmolScriptWait("set picking draw");
	runJmolScriptWait("bind 'LEFT+drag+shift' '+:clickedPoint = $corePoint'");
	runJmolScriptWait("symClickStatus = 'corePointDragging'");
}

_symmetry.doDisableVoidDragging = function(){
	runJmolScriptWait("unbind");
	runJmolScriptWait("set picking identify");
	runJmolScriptWait("symClickStatus = 'default'");
}

_symmetry.setSymClickStatus = function(status){
	runJmolScript("symClickStatus = '"+status+"'");
}

_symmetry.setSymElement = function(elementName){
	_file.symmetry.chosenSymElement = elementName;
}

_symmetry.setSymop = function(symop){
	_file.symmetry.chosenSymop = symop;
}

//figures out from file data all of the symmetry operations as Jones faithful representations 
_symmetry.createSymopSet = function(){
	var list = [];
	runJmolScriptWait("getProperty spacegroupInfo.symmetryInfo");
	runJmolScriptWait("symVectors = readSymmetryVectors()");
	_file.symmetry.operationList = list = getJmolValue("symVectors"); 
	var d = getbyID("symmetryOperationSet");
	d.innerHTML = createSelect('addSymSymop', '_symmetry.doSymopSelection(value)', 0, Math.min(20, list.length), list);
	var options = d.firstChild.options;
	for (var i = list.length; --i >= 0;)
		_file.symmetry.xyz2optionMap[list[i]] = options[i];		
}

_symmetry.setOpacity = function(){
	var opacityString = getbyID("selopacity2");
	var opacity = parseFloat(opacityString[opacityString.selectedIndex].value);
	if (opacity < 0){
		opacity = 1;
	}
	var opacityScript = "color {*} translucent " + (1 - opacity)
	runJmolScript(opacityScript);
}

//Changes global variable offset added to symmetry operation
_symmetry.updateSymOffset = function(dimension,offset){
	var symOffsetString = _file.symmetry.symOffset;
	symOffsetString = symOffsetString.substring(1);
	var symOffsetArray = symOffsetString.split(",");
	var xValue = parseInt(symOffsetArray[0])+"/1";
	var yValue = parseInt(symOffsetArray[1])+"/1";
	var zValue = parseInt(symOffsetArray[2])+"/1";
	if (dimension == "x"){
		xValue = offset+"/1";
	}
	if (dimension == "y"){
		yValue = offset+"/1";
	}
	if (dimension == "z"){
		zValue = offset+"/1";
	}
	_file.symmetry.symOffset = "{"+xValue+","+yValue+","+zValue+"}"; 
	_symmetry.displayDrawObjects(_file.symmetry.chosenSymop,_symmetry.getJmolPoint("initPoint", false));
}

// draws the axis lines for rotation axes and mirror planes for mirror symops
_symmetry.displayDrawObjects = function(symop,pointt){
	if (pointt == "{}"){
	   pointt = "";
	} 
	var symOffsetString = _file.symmetry.symOffset;
	symOffsetString = symOffsetString.substring(1);
	var symOffsetArray = symOffsetString.split(",");
	var xOffsetValue = parseInt(symOffsetArray[0]);
	var yOffsetValue = parseInt(symOffsetArray[1]);
	var zOffsetValue = parseInt(symOffsetArray[2]);
	var symopString = ""+symop+"";
	var symopArray = symopString.split(",");
	console.log(symopArray)
	var xSymopValue = eval(symopArray[0].substring(1));
	var ySymopValue = eval(symopArray[1].substring(1));
	var zSymopValue = eval(symopArray[2].substring(1));
	var xOffsetUpdated = xOffsetValue + (xSymopValue ? xSymopValue : 0);
	var yOffsetUpdated = yOffsetValue + (ySymopValue ? ySymopValue : 0);
	var zOffsetUpdated = zOffsetValue + (zSymopValue ? zSymopValue : 0);
	var symopWithOffset = symopArray[0].substring(0,1)+"+"+xOffsetUpdated
			+","+symopArray[1].substring(0,1)+"+"+yOffsetUpdated
			+","+symopArray[2].substring(0,1)+"+"+zOffsetUpdated+"/1";
	console.log("finalSymop:"+symopWithOffset);
	runJmolScriptWait("draw symop '"+symopWithOffset+"' "+pointt+"");
	var axisFactor = 3;
	runJmolScriptWait("drawCleanSymmetryAxisVectors("+axisFactor+")");
} 

// takes a given point and add the elements provided to it by a symmetry operation
// symmetry operations with multiple outputs (e.g. C3) will produce multiple symmetry atoms 

_symmetry.appendSymmetricAtoms = function(elementName,point,symopSelected,iterations){
	if (elementName == ""){
		console.log("ERROR: empty element name");
	}
	if (symopSelected == ""){
		console.log("ERROR: empty symmetry operation");
	}
	if (point[0] != "{"){
		point = "{"+point+"}";
	}
	else {
		runJmolScriptWait("appendNewAtomPoint('corePoint','"+elementName+"',"+point+")");
		var newAtomArray = getJmolValue("getSymmetricAtomArray('"+symopSelected+"', "+point+","+iterations+")") ;
		var numberOfNewAtoms = newAtomArray.length; 
		for (i = 1; i <= numberOfNewAtoms; i++){
			runJmolScriptWait("appendNewAtomPoint('"+elementName+i+"','"+elementName+"', {"+newAtomArray[i-1]+"})"); //this is a jmol script in functions.spt
		}
	}
}

//For a given point, applies all symmetry operations to that point and draws points (small yellow dots) for each symop
_symmetry.drawAllSymmetricPoints = function(point){
	var pointValue = point;
	runJmolScriptWait("draw pointValue"); //check
	runJmolScriptWait("allSymPoints = getSymmetryAtomArrayAllSymops("+pointValue+")");
	runJmolScriptWait("allSymPoints = allSymPoints");
	runJmolScriptWait("draw points @allSymPoints");
}

//Additional functions: yet unused 

//checks to see if there is a symmetry axis currently drawn
//function hasAxis(symop){
//	runJmolScriptWait("firstPoint = $sym_rotvector1[0]");
//	if (getJmolValue("firstPoint")){
//		runJmolScriptwait("secondPoint = $sym_rotvector2[0]");
//		if (getJmolValue("secondPoint")){
//			return true 
//		}
//		else { 
//			return false
//		}
//	}
//	else {
//		return false
//	}
//}

//creates symmetry menu 
//HTML is here 
var createSymmetryGrp = function() {

	
	//  + "Write points in the form '{x y z}'"
	
	var topleft =  "<table><tr><td valign='top'><h2>Symmtry Visualization</h2>" 
		  + "</td></tr><tr><td>1) Select an atom:"
		  + "<br>" + createText2('initPoint',"", 20, "", "_symmetry.doSymBtnClick('"+_symmetry.UPDATE_VIEW+"')",_symmetry.ATOM_TIP)
		  + createButton("none", _symmetry.SYM_NONE, '_symmetry.doSymBtnClick(this)', 0) 
		  + "</td></tr><tr><td>2) Choose an operation"
		  + "</td></tr><tr><td>3) Set an offset:<br>"
			  + "<table><tr><td></td><td>&nbsp;&nbsp;&nbsp;&nbsp;-1</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+1"
			  + "</td></tr><tr><td>a"
			  + "</td><td>" + createRadio("xOffset"," ",'_symmetry.updateSymOffset("x",-1)',0,0,"x-1","x-1")
			  + "</td><td>" + createRadio("xOffset"," ",'_symmetry.updateSymOffset("x",0)',0,1,"x+0","x+0")
			  + "</td><td>" + createRadio("xOffset"," ",'_symmetry.updateSymOffset("x",1)',0,0,"x+1","x+1")
			  + "</td></tr><tr><td>b"
			  + "</td><td>" + createRadio("yOffset"," ",'_symmetry.updateSymOffset("y",-1)',0,0,"y-1","z-1")
			  + "</td><td>" + createRadio("yOffset"," ",'_symmetry.updateSymOffset("y",0)',0,1,"y+0","z+0")
			  + "</td><td>" + createRadio("yOffset"," ",'_symmetry.updateSymOffset("y",1)',0,0,"y+1","z+1")
			  + "</td></tr><tr><td>c"
			  + "</td><td>" + createRadio("zOffset"," ",'_symmetry.updateSymOffset("z",-1)',0,0,"z-1","z-1")
			  + "</td><td>" + createRadio("zOffset"," ",'_symmetry.updateSymOffset("z",0)',0,1,"z+0","z+0")
			  + "</td><td>" + createRadio("zOffset"," ",'_symmetry.updateSymOffset("z",1)',0,0,"z+1","z+1")
			  + "</td></tr></table>"
			  + "</td></tr><tr><td>set opacity <select id=selopacity2 onchange=_symmetry.setOpacity() onkeypress=\"setTimeout('_symmetry.setOpacity()',50)\"  class='select'>"
				+ "<option value=0.2>20%</option>"
				+ "<option value=0.4>40%</option>"
				+ "<option value=0.6>60%</option>"
				+ "<option value=1.0 selected>100%</option></select>"
				
		  + "</td></tr></table>";

	var right = "<div id='symmetryOperationSet'></div>";

	var bottomleft =  "<table><tr><td valign='top'><h2>Symmetry-Based Editing</h2>" 
	  + "</td></tr><tr><td>1) Select a center point: "
	  + "<br>" + createText2('centerPoint',"", 20, "", "_symmetry.doSymBtnClick('"+_symmetry.UPDATE_EDIT+"')",_symmetry.CENTER_TIP)
	  + "</td></tr><tr><td>2) Enter a radius constraint (Angstroms):"
	  + createText2('radiusAngstroms',"1.0", 3, "", "_symmetry.doSymBtnClick('"+_symmetry.UPDATE_EDIT+"')")
	  + "</td></tr><tr><td>3) Select an element:"
	  + createSelect('addSymEle', '_symmetry.setSymElement(value)', 0, 1, _constant.ELEM_SYM)
	  + "</td></tr><tr><td>" + createButton("enableVoidClickingButton", _symmetry.CLICK_ENABLE, '_symmetry.doSymBtnClick(this)', 0)
	  + "</td></tr><tr><td>4) Select a center atom invariant operation"		
	  + "</td></tr><tr><td>5) Click and drag on the sphere:"
	  + "</td></tr><tr><td>" + createText2('voidClickPoint',"", 40, "", "_symmetry.doSymBtnClick('"+_symmetry.UPDATE_EDIT+"')",_symmetry.CLICK_POINT_TIP)
	  + "</td></tr></table>";	
//	  + "</td></tr></tr><td>Symmetry Iterations:" 
//	  + "</td></tr></tr><td><input style='display:none' type='text'  name='symIterations' id='symIterations'  value = '1' size='2' class='text'>"
//	  + "</td></tr></tr><td><div id='activateSymmetryDiv'></div>"
//	  + "</td></tr></tr><td><div id='activateAllSymmetryDiv'></div>"
//	  + "</td></tr></tr><td>" + createButton("resetSymmetryButton", "Reset Symmetry Page	", '_symmetry.resetPage()', 0) 

	//		var activateSymmetry = createButton("activateSymmetryButton", "Activate applied symmetry:", 'setSymClickStatus("radiusBindAdd")', 0);
//		getbyID("activateSymmetryDiv").innerHTML = activateSymmetry;
//		var activateAllSymmetry = createButton("activateAllSymmetryButton", "Activate all symmetry:", 'setSymClickStatus("radiusBindAddAll")', 0); 
//		getbyID("activateAllSymmetryDiv").innerHTML = activateAllSymmetry;
//		var symInvariantsSelect = createSelect('addSymInvariantsSymop', 'doSymopSelection(value)', 0, _file.symmetry.symopInvariantList.length , _file.symmetry.symopInvariantList);
//		getbyID("symInvariantsDiv").innerHTML = symInvariantsSelect; 

//		var corePointDragging = createButton("corePointDraggingButton", "Enable Dragging", 'doEnableCorePointDragging()', 0)
//		getbyID("corePointDraggingDiv").innerHTML = corePointDragging; 
		//$('.japplet').on('click', function( event ) {
		//	  console.log('Applet Clicked');
		//	  onSymmetryClick();
		//});


	  //	  + "</td></tr>\n"
//	+ "<tr><td>\n"
//	+ "<BR>\n"
//	+ createCheck('setStatusAllInvariantSymops', 'Show All Invariants', 'setSymClickStatus("showAllInvariantSymops")', 0,0,0)
//	+ "</td></tr>\n"	
//	+ "<tr><td>\n"
//	+ "<BR>\n"
//	+ "<div id='corePointDraggingDiv'></div>"
//	+ "</td></tr>\n"
//		+ "<tr><td>\n"
	
	var str = "<form autocomplete='nope'  id='symmetryGroup' name='symmetryGroup' style='display:none'>\n";
	str += "<table class='contents'>";
	str += "<tr><td valign=top>" + topleft + "<br>" + bottomleft + "</td><td valign=top>" + right + "</td></tr>"
	str += "</table></form>\n";

	return str
}

_symmetry.doSelectNone = function() {
	getbyID('symmetryGroup').reset();
	runJmolScriptWait("select none;draw delete;");
	_symmetry.updateSymInvariantSelect();
	enterSymmetry();
}

function pointStringToFixed(pointString,decimalPlaces){
	if (!pointString){
		return "";
	}
	var pointStringUpdated = pointString[0].toFixed(decimalPlaces)
		+","+pointString[1].toFixed(decimalPlaces)
		+","+pointString[2].toFixed(decimalPlaces);
	return pointStringUpdated
}

