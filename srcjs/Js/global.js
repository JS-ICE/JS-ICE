// global variables used in JS-ICE
// Geoff van Dover 2018.10.26

version = "3.0.0"; // BH 2018


// _m_file.js

_file = {
		specData: null,
		plotFreq: null
};

_fileIsReload = false;

// pick.js

_pick = {};

// plotgraph.js

_plot = {};

// for citations:

_global = {
	citations : [
	   { title:				
		'J-ICE: a new Jmol interface for handling and visualizing crystallographic and electronic properties' 
		, authors: ['P. Canepa', 'R.M. Hanson', 'P. Ugliengo', '& M. Alfredsson']
		, journal: 'J.Appl. Cryst. 44, 225 (2011)' 
		, link: 'http://dx.doi.org/10.1107/S0021889810049411'
	   }
	   
	 ]  
};

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
	strSymmetry += "<tr><td>\n";
	strSymmetry += createButton("resetSymmetryButton", "Reset Symmetry Page:", 'resetSymmetryPage()', 0); 
	strSymmetry += "</td></tr>\n"
	strSymmetry += "</form>\n";
	return strSymmetry
}
