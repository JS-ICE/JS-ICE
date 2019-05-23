//The symmetry tab enables visualization and manipulation of file according to various symmetry operations. Compatible with
//crystal and .cif files. 
//A. Salij 5.23.2018 (andrewsalij@gmail.com) 

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
	_symmetry = {
			intervalID : "",
			symInvariantCache : [],
			symopInvariantAlreadyCalculated : [], //collection of points for which symop invariants are already calculated
		}; 
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
	$('.japplet').on('mouseenter', function( event ) {
		  console.log('Applet Entered');
		  onSymmetryHoverStart();
	});
	$('.japplet').on('mouseleave', function( event ) {
		  console.log('Applet Left');
		  onSymmetryHoverEnd();
	});
}

//upon exiting symmetry tab-currently blank 
function exitSymmetry() {
}



//todo upon clicking on the japplet

function onSymmetryHover(){
	console.log("hov check");
	var clickedPoint = Jmol.evaluateVar(jmolApplet0,"clickedPoint");
	var symClickStatus = Jmol.evaluateVar(jmolApplet0,"symClickStatus");
	switch(symClickStatus){
		case "corePointDragging":
			var cP = getValue("centerPoint");
				var rA = getValue("radiusAngstroms");
				if(!rA){
					rA = 1; //default value 
				} 
			runJmolScriptWait("clickedPoint = bindToSphereConstraint("+cP+","+rA+",clickedPoint)");
			clickedPoint = Jmol.evaluateVar(jmolApplet0,"clickedPoint");
			doActivateSymmetry(clickedPoint);
			break;
		default:
			break;
	}
} 

function onSymmetryHoverStart(){
	if (! _symmetry.intervalID){
		_symmetry.intervalID = window.setInterval(function(){onSymmetryHover();},200);
	}
}

function onSymmetryHoverEnd(){
	window.clearInterval(_symmetry.intervalID);
	_symmetry.intervalID = "";
}

function onSymmetryClick(){
	var currentSelection = Jmol.evaluateVar(jmolApplet0,"{selected}")
	var selectionFoundIndex = -1;
	for (i = 0;i<_symmetry.symopInvariantAlreadyCalculated.length;i++){
		if (currentSelection == _symmetry.symopInvariantAlreadyCalculated[i]){
			selectionFoundIndex = i; 
		}
	}
	updateSymInvariants(selectionFoundIndex);
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
			var cP = getValue("centerPoint");
				var rA = getValue("radiusAngstroms");
				if(!rA){
					rA = 1; //default value 
				} 
			runJmolScriptWait("clickedPoint = bindToSphereConstraint("+cP+","+rA+",clickedPoint)");
			clickedPoint = Jmol.evaluateVar(jmolApplet0,"clickedPoint");
			doActivateSymmetry(clickedPoint);
			break;
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
function updateSymInvariants(cacheValue){ //-1 means that symInvariant is not yet cached
	if (cacheValue == -1){
		runJmolScript("symopInvariantListJmol = findInvariantSymOps({selected},readSymmetryVectors().size)");
		if (_file.symmetry){
			_file.symmetry.symopInvariantList = Jmol.evaluateVar(jmolApplet0,"symopInvariantListJmol");
			addSymInvariantsSymop.length = _file.symmetry.symopInvariantList.size; 
			_symmetry.symInvariantCache.push(_file.symmetry.symopInvariantList);
			var currentSelection = Jmol.evaluateVar(jmolApplet0,"{selected}");
			_symmetry.symopInvariantAlreadyCalculated.push(currentSelection);
		}
	}
	else{
		if (_file.symmetry){
			_file.symmetry.symopInvariantList = _symmetry.symInvariantCache[cacheValue];
			addSymInvariantsSymop.length = _file.symmetry.symopInvariantList.size; 
		}
	}
}

//Changes 
function updateInputValues(){
	var selectionPoint = Jmol.evaluateVar(jmolApplet0,"{selected}.xyz");
	if (selectionPoint != -1){
		initPoint.value = selectionPoint;
		centerPoint.value = selectionPoint; 
	}
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
	if (!cP || cP == "{}"){
		alert("No center point selected");
	}
	var rA = getValue("radiusAngstroms");
	if(!rA){
		rA = 1; //default value 
	}
	runJmolScriptWait("unbind"); //resets jmol to default mouse config
	runJmolScriptWait("bind 'LEFT+click' 'clickedPoint = clickToPoint("+cP+","+rA+",_X,_Y)'");
	if (cP != "{}"){
		runJmolScriptWait("sphereClickShow = 'sphereClickShow'; draw ID @sphereClickShow radius "+rA+" "+cP+" translucent"); 
	}
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



// draws the axis lines for rotation axes and mirror planes for mirror symops
function displaySymmetryDrawObjects(symop,pointt){
	if (pointt == ""){
		var pointt = "";
	}
	else{
		var pointt = "{"+pointt+"}";
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
	if (xSymopValue){
		var xOffsetUpdated = xOffsetValue+xSymopValue;}
	else{ var xOffsetUpdated = xOffsetValue;}
	if (ySymopValue){
		var yOffsetUpdated = yOffsetValue+ySymopValue;}
	else{ var yOffsetUpdated = yOffsetValue;}
	if (zSymopValue){
		var zOffsetUpdated = zOffsetValue+zSymopValue;}
	else{ var zOffsetUpdated = zOffsetValue;}	
	var symopWithOffset = symopArray[0].substring(0,1)+"+"+xOffsetUpdated+"/1,"+symopArray[1].substring(0,1)+"+"+yOffsetUpdated+"/1,"+symopArray[2].substring(0,1)+"+"+zOffsetUpdated+"/1";
	console.log("finalSymop:"+symopWithOffset);
	runJmolScriptWait("draw symop '"+symopWithOffset+"' "+pointt+"");
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
		runJmolScriptWait("appendNewAtomPoint('corePoint','"+elementName+"',"+point+")");
		var newAtomArray = Jmol.evaluateVar(jmolApplet0,"getSymmetricAtomArray('"+symopSelected+"', "+point+","+iterations+")") ;
		var numberOfNewAtoms = newAtomArray.length; 
		for (i = 1; i <= numberOfNewAtoms; i++){
			runJmolScriptWait("appendNewAtomPoint('"+elementName+i+"','"+elementName+"', {"+newAtomArray[i-1]+"})"); //this is a jmol script in functions.spt
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

function resetSymmetryPage(){
	enterSymmetry();
	document.getElementById('symmetryGroup').reset();
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
