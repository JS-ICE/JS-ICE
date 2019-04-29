//The symmetry tab enables visualization and manipulation of file according to various symmetry operations. Compatible with
//crystal and .cif files. 
//A. Salij 4.7.2018 (salij1@stolaf.edu-->andrewsalij@gmail.com) 

//initialization upon entry into symmetry tab 
function enterSymmetry() {
	if (! _file.symmetry){
		_file.symmetry = {
			operationList     : createSymopSet(),
			symopInvariantList  : [],
			chosenSymElement  : "", 
			chosenSymop       : "",
			symOffset         : "{0/1,0/1,0/1}",
			errorDistance     : 0.1 
		}; 
	 	var symopSelection = createSelect('addSymSymop', 'doSymopSelection(value)', 0, 1, _file.symmetry.operationList);
		getbyID("symmetryOperationSet").innerHTML = symopSelection;
	}
	runJmolScriptWait("select {};set picking select atom; selectionhalos on");
	var activateSymmetry = createButton("activateSymmetryButton", "Activate applied symmetry:", 'setSymClickStatus("radiusBindAdd")', 0);
	getbyID("activateSymmetryDiv").innerHTML = activateSymmetry;
	var activateAllSymmetry = createButton("activateAllSymmetryButton", "Activate all symmetry:", 'setSymClickStatus("radiusBindAddAll")', 0); 
	getbyID("activateAllSymmetryDiv").innerHTML = activateAllSymmetry;
	var symInvariantsSelect = createSelect('addSymInvariantsSymop', 'doSymopSelection(value)', 0, _file.symmetry.symopInvariantList.length , _file.symmetry.symopInvariantList);
	getbyID("symInvariantsDiv").innerHTML = symInvariantsSelect; 
	var voidClicking = createButton("enableVoidClickingButton", "Enable Clicking", 'doEnableVoidClicking()', 0)+"\n"+
						createButton("disableVoidClickingButton", "Disable Clicking", 'doDisableVoidClicking()', 0);
	getbyID("voidClickingDiv").innerHTML = voidClicking; 
	var corePointDragging = createButton("corePointDraggingButton", "Enable Dragging", 'doEnableCorePointDragging()', 0)
	getbyID("corePointDraggingDiv").innerHTML = corePointDragging; 
	//$('.japplet').on('click', function( event ) {
	//	  console.log('Applet Clicked');
	//	  onSymmetryClick();
	//});
	document.getElementById("jmolApplet0_appletinfotablediv").addEventListener('click', function( event ) {
		  console.log('Applet Clicked');
		  onSymmetryClick();
	});
	//messageCallback = "print 'params'";
}	

//upon exiting symmetry tab-currently blank 
function exitSymmetry() {
}



//todo upon clicking on the japplet 
function onSymmetryClick(){
	updateSymInvariants();
	updateInputValues();
	if (_file.symmetry){
	var symInvariantsSelect = createSelect('addSymInvariantsSymop', 'doSymopSelection(value)', 0,_file.symmetry.symopInvariantList.length, _file.symmetry.symopInvariantList);
	getbyID("symInvariantsDiv").innerHTML = symInvariantsSelect;
	createSymmetryGrp();
	var messageCallback = "";//how do I get message from Jmol? 
	var symClickStatus = Jmol.evaluateVar(jmolApplet0,"symClickStatus");
	var clickedPoint = Jmol.evaluateVar(jmolApplet0,"clickedPoint");
	}
	switch(symClickStatus){
		case "radiusBindAdd":
			doActivateSymmetry(getValue("voidClickPoint")); 
			break;
		case "radiusBindAddAll":
			doActivateAllSymmetry(); 
			break;
		//case "vectorBindAdd": //to test 
			//var newClickedPoint = bindToVectorConstraint("sym_axis1",
			//											clickedPoint,
			//											_file.symmetry.errorDistance);
			//clickedPoint = newClickedPoint;
			//doActivateSymmetry(getValue("voidClickPoint"));
			//break; 
		case "corePointDragging":
			doActivateSymmetry(clickedPoint);
		case "showAllInvariantSymops":
			var centerPoint = getValue("initPoint");
			if (centerPoint[0] != "{"){
				centerPoint = "{"+centerPoint+"}";
			}
			runJmolScript("drawAllSymops(symopInvariantListJmol,"+centerPoint+")")
			break;
		default: 
			break;
	}
}

//Updates global sym invariant list with current  symops of selection 
function updateSymInvariants(){
	runJmolScript("symopInvariantListJmol = findInvariantSymOps({selected},readSymmetryVectors().size)");
	if (_file.symmetry){
		_file.symmetry.symopInvariantList = Jmol.evaluateVar(jmolApplet0,"symopInvariantListJmol");
		addSymInvariantsSymop.length = _file.symmetry.symopInvariantList.size; 
	}
}

//Changes 
function updateInputValues(){
	var selectionPoint = Jmol.evaluateVar(jmolApplet0,"{selected}.xyz");
	initPoint.value = selectionPoint;
	centerPoint.value = selectionPoint; 
	var clickedPointString = Jmol.evaluateVar(jmolApplet0,"clickedPoint");
	if (clickedPointString){
		voidClickPoint.value = clickedPointString[0].toFixed(4)+","+clickedPointString[1].toFixed(4)+","+clickedPointString[2].toFixed(4);
	}
}

function toFixedPointArray(pointArray,decimalPlaces){
}

//this appends new atoms by chosen symop
function doActivateSymmetry(clickedPoint){
	if (clickedPoint[0] != "{"){
		clickedPoint = "{"+clickedPoint+"}";
	}
	if (_file.symmetry){
		appendSymmetricAtoms(_file.symmetry.chosenSymElement,clickedPoint,_file.symmetry.chosenSymop,getValue("symIterations"));
	}
}

//this only shows every point for a given point for all symops 
function doActivateAllSymmetry(){
	var clickedPoint =  getValue("voidClickPoint");
	if (clickedPoint[0] != "{"){
		clickedPoint = "{"+clickedPoint+"}";
	}
	drawAllSymmetricPoints(clickedPoint);
}


function doSymopSelection(symop){
	setSymop(symop);
	displaySymmetryDrawObjects(symop,getValue("initPoint"));
}

//Enables clicking upon blank space in java applet 
function doEnableVoidClicking(){
	var cP = getValue("centerPoint");
	if (cP[0] != "{"){
		cP = "{"+cP+"}";
	}
	if(!cP){
		cP = Jmol.evaluateVar(jmolApplet0,{selected}.xyz);
	}
	if (!cP){
		alert("No center point selected");
	}
	var rA = getValue("radiusAngstroms");
	if(!rA){
		rA = 1; //default value 
	}
	runJmolScriptWait("unbind"); //resets jmol to default mouse config
	runJmolScriptWait("bind 'LEFT+click' 'clickedPoint = clickToPoint("+cP+","+rA+",_X,_Y)'");
	runJmolScriptWait("sphereClickShow = 'sphereClickShow'; bind 'enter' 'draw ID @sphereClickShow radius "+rA+" "+cP+" translucent'"); 
}

function doDisableVoidClicking(){
	runJmolScriptWait("unbind");
	runJmolScriptWait("symClickStatus = 'default'");
	runJmolScriptWait("draw 'symClickShow' delete");
}

function doEnableCorePointDragging(){
	runJmolScriptWait("set picking draw");
	runJmolScriptWait("bind 'LEFT+drag+shift' '+:clickedPoint = $corePoint'");
	runJmolScriptWait("symClickStatus = 'corePointDragging'");
}

function setSymClickStatus(status){
	runJmolScript("symClickStatus = '"+status+"'");
}

function setSymElement(elementName){
	_file.symmetry.chosenSymElement = elementName;
}

function setSymop(symop){
	_file.symmetry.chosenSymop = symop;
}

//figures out from file data all of the symmetry operations as Jones faithful representations 
function createSymopSet(){
	var symopSet = [];
	runJmolScriptWait("getProperty spacegroupInfo.symmetryInfo");
	runJmolScriptWait("symVectors = readSymmetryVectors()");
	symopSet = Jmol.evaluateVar(jmolApplet0,"symVectors"); 
	return symopSet
}

function setOpacity(){
	var opacityString = getbyID("selopacity2");
	var opacity = parseFloat(opacityString[opacityString.selectedIndex].value);
	if (opacity < 0){
		opacity = 1;
	}
	opacityScript = "select *;color atoms translucent " + (1 - opacity)
	runJmolScript(opacityScript);
}

//Changes global variable offset added to symmetry operation
function updateSymOffset(dimension,offset){
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
	displaySymmetryDrawObjects(_file.symmetry.chosenSymop,getValue("initPoint"));
}

//creates symmetry menu 
//HTML is here 
function createSymmetryGrp() {
	var strSymmetry = "<form autocomplete='nope'  id='symmetryGroup' name='symmetryGroup' style='display:none'>\n";
	strSymmetry += "<tr><td>\n";
	//strSymmetry += "Write points in the form '{x y z}'";
	strSymmetry += "Symmetry Visualization:"; 
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "Selected point:";
	strSymmetry += "<input type='text' name='initPoint' placeholder='Click on atom to fill' id='initPoint' size='25' class='text'>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "Choose symmetry operation:";
	strSymmetry += "<div id='symmetryOperationSet'></div>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "&nbsp&nbsp&nbsp-1 &nbsp&nbsp&nbsp&nbsp&nbsp 0 &nbsp&nbsp&nbsp&nbsp +1&nbsp&nbsp&nbsp(Offset)";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "a";
	strSymmetry += createRadio("xOffset"," ",'updateSymOffset("x",-1)',0,0,"x-1","x-1");
	strSymmetry += createRadio("xOffset"," ",'updateSymOffset("x",0)',0,1,"x+0","x+0");
	strSymmetry += createRadio("xOffset"," ",'updateSymOffset("x",1)',0,0,"x+1","x+1");
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "b";
	strSymmetry += createRadio("yOffset"," ",'updateSymOffset("y",-1)',0,0,"y-1","z-1");
	strSymmetry += createRadio("yOffset"," ",'updateSymOffset("y",0)',0,1,"y+0","z+0");
	strSymmetry += createRadio("yOffset"," ",'updateSymOffset("y",1)',0,0,"y+1","z+1");
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "c";
	strSymmetry += createRadio("zOffset"," ",'updateSymOffset("z",-1)',0,0,"z-1","z-1");
	strSymmetry += createRadio("zOffset"," ",'updateSymOffset("z",0)',0,1,"z+0","z+0");
	strSymmetry += createRadio("zOffset"," ",'updateSymOffset("z",1)',0,0,"z+1","z+1");
	strSymmetry += "</td></tr>\n";
	strSymmetry += createLine('blue', '');
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "Add element:"
	strSymmetry += createSelect('addSymEle', 'setSymElement(value)', 0, 1,
			eleSymb);
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "Symmetry Iterations:"; 
	strSymmetry += "<input type='text'  name='symIterations' id='symIterations'  value = '1' size='2' class='text'>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<div id='activateSymmetryDiv'></div>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<div id='activateAllSymmetryDiv'></div>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "set opacity:<select id=selopacity2 onchange=setOpacity() onkeypress=\"setTimeout('setOpacity()',50)\"  class='select'>"
			+ "<option value=0.2 selected>20%</option>"
			+ "<option value=0.4>40%</option>"
			+ "<option value=0.6>60%</option>"
			+ "<option value=1.0>100%</option>" + "</select>";
	strSymmetry += "<BR>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<div id='activateSymmetryDiv'></div>";
	strSymmetry += "</td></tr>\n";	
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "Enter center point:";
	strSymmetry += "<input type='text'  name='centerPoint'  placeholder='Click on atom to fill' id='centerPoint'   size='25' class='text'>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<tr><td>\n";	
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "Enter radius (angstroms):";
	strSymmetry += "<input type='text'  name='radiusAngstroms' id='radiusAngstroms' size='10' class='text'>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";	
	strSymmetry += "<div id='voidClickingDiv'></div>";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "Clicked Point:";
	strSymmetry +=  "<input type='text'  name='voidClickPoint'  placeholder='Click on position close to center point to fill' id='voidClickPoint'   size='40' class='text'>";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "Invariant Symmetry Operations of Selection:";		
	strSymmetry += "<div id='symInvariantsDiv'></div>";//currently shows all symops, will soon only show invariant symops 
	strSymmetry += "</td></tr>\n";
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += createCheck('setStatusAllInvariantSymops', 'Show All Invariants', 'setSymClickStatus("showAllInvariantSymops")', 0,0,0);
	strSymmetry += "</td></tr>\n";	
	strSymmetry += "<tr><td>\n";
	strSymmetry += "<BR>\n";
	strSymmetry += "<div id='corePointDraggingDiv'></div>"
	strSymmetry += "</td></tr>\n";	
	strSymmetry += "</form>\n";
	return strSymmetry
}

// draws the axis lines for rotation axes and mirror planes for mirror symops
function displaySymmetryDrawObjects(symop,pointt){
	var symOffsetString = _file.symmetry.symOffset;
	symOffsetString = symOffsetString.substring(1);
	var symOffsetArray = symOffsetString.split(",");
	var xOffsetValue = parseInt(symOffsetArray[0])+"/1";
	var yOffsetValue = parseInt(symOffsetArray[1])+"/1";
	var zOffsetValue = parseInt(symOffsetArray[2])+"/1";
	var symopString = ""+symop+"";
	var symopArray = symopString.split(",");
	console.log(symopArray)
	var xSymopValue = symopArray[0];
	var ySymopValue = symopArray[1];
	var zSymopValue = symopArray[2];
	symopWithOffset = xSymopValue+"+"+xOffsetValue+","+ySymopValue+"+"+yOffsetValue+","+zSymopValue+"+"+zOffsetValue
	runJmolScriptWait("draw symop '"+symopWithOffset+"' {"+pointt+"}");
	axisFactor = 3;
	runJmolScriptWait("drawCleanSymmetryAxisVectors("+axisFactor+")");
} 

// takes a given point and add the elements provided to it by a symmetry operation
// symmetry operations with multiple outputs (e.g. C3) will produce multiple symmetry atoms 

function appendSymmetricAtoms(elementName,point,symopSelected,iterations){
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
		runJmolScriptWait("appendNewAtomPoint('corePoint', "+point+")");
		var newAtomArray = Jmol.evaluateVar(jmolApplet0,"getSymmetricAtomArray('"+symopSelected+"', "+point+","+iterations+")") ;
		var numberOfNewAtoms = newAtomArray.length; 
		for (i = 1; i <= numberOfNewAtoms; i++){
			runJmolScriptWait("appendNewAtomPoint('"+elementName+i+"', {"+newAtomArray[i-1]+"})"); //this is a jmol script in functions.spt
		}
	}
}
function drawAllSymmetricPoints(point){
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
//	if (Jmol.evaluateVar(jmolApplet0,"firstPoint")){
//		runJmolScriptwait("secondPoint = $sym_rotvector2[0]");
//		if (Jmol.evaluateVar(jmolApplet0,"secondPoint")){
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

//function displaySymmetryDrawObjects(symop){
//	centerPoint = 	getValue("symCenterPoint") ;
//	if (! centerPoint){
//		centerPoint= "{0 0 0}"; 
//	}
//	runJmolScriptWait("draw symop '"+symop+"' "+centerPoint); 
//	if(hasAxis(symop)){
//		runJmolScriptWait("select *;color opaque;draw sym_* delete");
//		runJmolScriptWait("drawCleanSymmetryAxisVectors('"+symop+"', 3)");
//	}
//} 
//function createSymopSet(){
//	var symopSet = [];
//	var allSymopsString = jmolEvaluate('script("print readSymmetryVectors()")'); 
//	var totalSymops = allSymopsString.match(/\n/g).length-1; //this should work in all cases
//	for (var i = 1; i<= totalSymops;i++){
//		var symopInt = parseInt(i)+"";
//		var scriptToRun = 'script("var infor = readSymmetryVectors();print infor['+symopInt+']")';
//		var symopString = jmolEvaluate(scriptToRun);
//		symopString = symopString.trim();
//		symopSet[i-1] = symopString;
//	}
//	return symopSet
//}

