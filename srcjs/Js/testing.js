function selectNone() {
	JmolScriptWait("select none");
}



_constant.SYM_CLICK_ENABLE = "Enable Clicking";		  
_constant.SYM_CLICK_DISABLE = "Disable Clicking";		  
	  

function doSymBtnClick(btn) {
	var text = btn.value;
	console.log(">>" + text + "<<");
	switch(text) {
	case _constant.SYM_CLICK_ENABLE:
		doEnableVoidClicking();
		doEnableVoidDragging();
		btn.value = _constant.SYM_CLICK_DISABLE;
		break;
	case _constant.SYM_CLICK_DISABLE:
		doDisableVoidClicking();
		doDisableVoidDragging();
		btn.value = _constant.SYM_CLICK_ENABLE;
		break;
	}	
}

//creates symmetry menu 
//HTML is here 
function createSymmetryGrp() {

	//  + "Write points in the form '{x y z}'"
	
	var topleft =  "<table><tr><td valign='top'><h2>Symmtry Visualization</h2>" 
		  + "</td></tr><tr><td>1) Select an atom:"
		  + "<br><input type='text' name='initPoint' placeholder='Click on atom to fill' id='initPoint' size='15' class='text'/>"
		  
		  
		  + createButton("none", "", 'selectNone()', 0) 
		  + "</td></tr><tr><td>2) Choose an operation:"
		  + "<br><div id='symmetryOperationSet'></div>"
		  + "</td></tr><tr><td>3) Set an offset:<br>"
			  + "<table><tr><td></td><td>&nbsp;&nbsp;&nbsp;&nbsp;-1</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+1"
			  + "</td></tr><tr><td>a"
			  + "</td><td>" + createRadio("xOffset"," ",'updateSymOffset("x",-1)',0,0,"x-1","x-1")
			  + "</td><td>" + createRadio("xOffset"," ",'updateSymOffset("x",0)',0,1,"x+0","x+0")
			  + "</td><td>" + createRadio("xOffset"," ",'updateSymOffset("x",1)',0,0,"x+1","x+1")
			  + "</td></tr><tr><td>b"
			  + "</td><td>" + createRadio("yOffset"," ",'updateSymOffset("y",-1)',0,0,"y-1","z-1")
			  + "</td><td>" + createRadio("yOffset"," ",'updateSymOffset("y",0)',0,1,"y+0","z+0")
			  + "</td><td>" + createRadio("yOffset"," ",'updateSymOffset("y",1)',0,0,"y+1","z+1")
			  + "</td></tr><tr><td>c"
			  + "</td><td>" + createRadio("zOffset"," ",'updateSymOffset("z",-1)',0,0,"z-1","z-1")
			  + "</td><td>" + createRadio("zOffset"," ",'updateSymOffset("z",0)',0,1,"z+0","z+0")
			  + "</td><td>" + createRadio("zOffset"," ",'updateSymOffset("z",1)',0,0,"z+1","z+1")
			  + "</td></tr></table>"
			  + "</td></tr><tr><td>set opacity <select id=selopacity2 onchange=setOpacity() onkeypress=\"setTimeout('setOpacity()',50)\"  class='select'>"
				+ "<option value=0.2 selected>20%</option>"
				+ "<option value=0.4>40%</option>"
				+ "<option value=0.6>60%</option>"
				+ "<option value=1.0>100%</option></select>"
				
		  + "</td></tr></table>";

		  
	var topright =  "<table><tr><td valign='top'><h2>Symmetry-Based Editing</h2>" 
	  + "</td></tr><tr><td>1) Select a center point: "
	  + "<input type='text'  name='centerPoint'  placeholder='Click on a ref. atom' id='centerPoint'   size='20' class='text'>"
	  + "</td></tr></tr><td>2) Enter a radius constraint (Angstroms):"
	  + "<input type='text'  name='radiusAngstroms' id='radiusAngstroms' size='3' class='text' value='1.0'>"
	  + "</td></tr></tr><td>3) Select an element:"
	  + createSelect('addSymEle', 'setSymElement(value)', 0, 1, eleSymb)
	  + "</td></tr></tr><td>" + createButton("enableVoidClickingButton", _constant.SYM_CLICK_ENABLE, 'doSymBtnClick(this)', 0)
	  + "</td></tr></tr><td>4) Select a center atom invariant operation:"		
	  + "</td></tr></tr><td><div id='symInvariantsDiv'></div>" 
	  + "</td></tr></tr><td>5) Click and drag on the sphere:"
	  + "</td></tr></tr><td><input type='text'  name='voidClickPoint'  placeholder='Click on the sphere to add a point' id='voidClickPoint'   size='40' class='text'>"

	  
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
	+ "</td></tr></tr><td>Symmetry Iterations:" 
	+ "</td></tr></tr><td><input style='display:none' type='text'  name='symIterations' id='symIterations'  value = '1' size='2' class='text'>"
	+ "</td></tr></tr><td><div id='activateSymmetryDiv'></div>"
	+ "</td></tr></tr><td><div id='activateAllSymmetryDiv'></div>"
	+ "</td></tr></tr><td>" + createButton("resetSymmetryButton", "Reset Symmetry Page:", 'resetSymmetryPage()', 0) 
	+ "</td></tr></table>"
	;	
//	topright = "";	
	
	var bottom = "[bottom]";
	var strSymmetry = "<form autocomplete='nope'  id='symmetryGroup' name='symmetryGroup' style='display:none'>\n";
	strSymmetry += "<table class='contents'>";
	strSymmetry += "<tr><td>" + topleft + "</td><td>" + topright + "</td></tr>"
	strSymmetry += "<tr><td colspan=2>" + bottom + "</td></tr>";
	strSymmetry += "</table></form>\n";

	return strSymmetry
}
