function enterPolyhedra() {
	
}
function exitPolyhedra() {
}

function createPolyedra() {

	var vertNo = getValue("polyEdge");
	var from = getValue('polybyElementList');
	var to = getValue("poly2byElementList");
	var style = getValue("polyVert");
	var face =  getValue("polyFace");
	if (face.equals("0.0") && !style.equals("collapsed"))
		face = "";
	runJmolScriptWait("polyhedra DELETE");

	// if( from == to){
	// errorMsg("Use a different atom as Vertex");
	// return false;
	// }

	var distance = getValue("polyDistance");

	if (distance == "") {
		runJmolScriptWait("polyhedra 4, 6" + face + " " + style);
		return;
	}

	/*
	 * if(isChecked("byselectionPoly")){ runJmolScriptWait("polyhedra " + vertNo + " BOND { "+
	 * selected +" } faceCenterOffset " + face + " " + style); }
	 */

	if (isChecked("centralPoly")) {
		runJmolScriptWait("polyhedra BOND " + "{ " + from + " } " + face
				+ " " + style);
	} else {

		if (isChecked("bondPoly")) {
			runJmolScriptWait("polyhedra " + vertNo + " BOND " + face + " "
					+ style);		}
		if (isChecked("bondPoly1")) {
			runJmolScriptWait("polyhedra " + vertNo + " " + distance + " (" + from + ") to "
					+ "(" + to + ") " + face + " " + style);
		}

	}

}

function checkPolyValue(value) {
	(value == "collapsed") ? (enableElement("polyFace"))
			: (disableElement("polyFace"));
}

//function setPolyString(face, value) {
//	runJmolScriptWait("polyhedra 4, 6" + "  faceCenterOffset " + face + " " + value);
//}

function setPolybyPicking(element) {
	setPicking(element);
	checkBoxStatus(element, 'polybyElementList');
	checkBoxStatus(element, "poly2byElementList");
}


function createPolyGrp() {
	var polyEdgeName = new Array("select", "4, 6", "4 ", "6", "8", "10", "12");
	var polyStyleName = new Array("select", "flat", "collapsed edges",
			"no edges", "edges", "frontedges");
	var polyStyleValue = new Array("NOEDGES", "noedges", "collapsed",
			"noedges", "edges", "frontedges");
	var polyFaceName = new Array("0.0", "0.25", "0.5", "0.9", "1.2");
	var str = "<form autocomplete='nope'  id='polyGroup' name='polyGroup' style='display:none'>\n";
	str += "<table class='contents'>\n";
	str += "<tr><td>\n";
	str += "<h2>Polyhedron</h2>\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "Make polyhedra: \n";
	str += "</td></tr>\n";
	str += "<tr><td  colspan='2'>\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "&nbsp;a) Select central atom:  <br>\n";
	str += "&nbsp;&nbsp;  by element "
		+ createSelect2('polybyElementList', "", false, 0);
	// str+=createCheck("byselectionPoly", "&nbsp;by picking &nbsp;",
	// 'setPolybyPicking(this)', 0, 0, "set picking") + "<br>\n";
	str += "<br>&nbsp;&nbsp;just central atom"
		+ createCheck("centralPoly", "",
				'checkBoxStatus(this, "poly2byElementList")', 0, 0, "");
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "&nbsp; b) select vertex atoms:  <br>\n";
	str += "&nbsp;&nbsp;  by element "
		+ createSelect2('poly2byElementList', "", false, 0) + "\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "&nbsp; c) based on <br>";
	str += "&nbsp;"
		+ createRadio("bondPoly", "bond", 'disableElement("polyDistance") ',
				0, 0, "bondPoly", "off");
	str += createRadio("bondPoly", " max distance ",
			' enableElement("polyDistance")', 0, 0, "bondPoly1", "on");
	str += createText2("polyDistance", "2.0", "3", "") + " &#197;";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "&nbsp;d) number of vertices "
		+ createSelect('polyEdge', '', 0, 0, polyEdgeName) + "\n";
	str += createLine('blue', '');
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "Polyedra style:<br>\n";
	str += "</td></tr><tr><td > &nbsp;a) colour polyhedra\n";
	str += createButton("polyColor", "Default colour",
			'runJmolScriptWait("set defaultColors Jmol")', 0);
	str += "</td><td align='left'><script>\n";
	str += "jmolColorPickerBox([setColorWhat,'polyhedra'],'','polyColorPicker');";
	str += "</script> </td></tr>";
	str += "<tr><td colspan='2'>\n";
	str += createButton('advancePoly', '+',
			'toggleDivValue(true,"advancePolyDiv",this)', '')
			+ " Advanced style options"
			str += "<div id='advancePolyDiv' style='display:none; margin-top:20px'>"
				str += "<br> &nbsp;b)"
					+ createRadio("polyFashion", "opaque",
							'runJmolScriptWait("color polyhedra opaque") ', 0, 1, "opaque", "opaque")
							+ "\n";
	str += createRadio("polyFashion", "translucent",
			'runJmolScriptWait("color polyhedra translucent") ', 0, 0, "translucent",
	"translucent")
	+ "\n<br><br>";
	str += "&nbsp;c) style edges\n"
		+ createSelect('polyVert', 'checkPolyValue(this.value)', 0, 0,
				polyStyleValue, polyStyleName) + "\n";
	str += "<br>"
		str += "&nbsp;&nbsp;collapsed faces Offset \n"
			+ createSelect('polyFace', '', 0, 0, polyFaceName) + "\n";
	str += "</div>";
	str += createLine('blue', '');
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += createButton('createPoly', 'create', 'createPolyedra()', '');
	str += createButton('createpoly', 'create auto',
			'runJmolScriptWait("polyhedra 4,6 " + getValue("polyVert"))', '');
	str += createButton('deletePoly', 'delete', 'runJmolScriptWait("polyhedra DELETE")',
	'');
	str += "</td></tr>\n";
	str += "</table>\n";
	str += "</FORM>\n";
	return str;
}

