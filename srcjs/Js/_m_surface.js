/*  J-ICE library 

    based on:
 *
 * Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 * Contact: pierocanepa@sourceforge.net
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 *
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this library; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 *  02111-1307  USA.
 */

var _surface = {		
	SURFACE_VDW   			 : "isosurface VDW", // BH Q: Why was this VDW + 2.0 ?
	SURFACE_VDW_PERIODIC     : "isosurface lattice _CELL_ VDW"
	//SURFACE_VDW_MEP			 = "isosurface resolution 7 VDW map MEP"; // why SOLVENT, which is VDW + 1.2?
	//SURFACE_VDW_MEP_PERIODIC = "isosurface lattice _CELL_ resolution 7 VDW map MEP";
};


function enterSurface() {
	selectListItem(document.isoGroup.createIso, '');
}

function exitSurface() {
	cancelPicking();
}

_surface.onClickCreateIso = function(value) {
	if (!value)
		return;
	if (value.indexOf("?") >= 0)
		messageMsg("Select or drag-drop your density cube or JVXL file onto the 'browse' button, then press the 'load' button.");
	_surface.createSurface(value, true);
}

_surface.canMapIsosurface = function() {
	if (jmolEvaluate("isosurface list").trim())
		return true;	
	messageMsg("First create an isosurface.")
	return false;
}

_surface.onClickMapCube = function() {
	if (!_surface.canMapIsosurface())
		return;
	messageMsg("Select or drag-drop your potential cube file onto the 'browse' button, then press the 'load' button.");
	_surface.createSurface("isosurface map '?'", false);	
}

_surface.onClickMapMEP = function() {
	if (!_surface.canMapIsosurface())
		return;
	_surface.createSurface("isosurface map mep;isosurface cache;", false)
}

_surface.surfacePickPlaneCallback = function() {
	_surface.createSurface('isosurface PLANE $plane1 MAP color range 0.0 2.0 "?";', true);
}

_surface.createSurface = function(cmd, doClear) {
	if (cmd.indexOf("_CELL_") >= 0)
		cmd = cmd.replace("_CELL_", getCurrentUnitCell()); 
	runJmolScript((doClear ? "isosurface delete;" : "") 
			+ "set echo top left; echo creating ISOSURFACE...; refresh;" + cmd + '; echo;javascript _surface.getIsoInfo()');
}

//function sendSurfaceMessage() {
//	warningMsg("If the surface doesn't look like what you were expected, go to the menu' voice Isosur. for more options.");
//}
//
//function saveIsoJVXL() {
//	messageMsg("Now, save your surface in a compact format *.JVXL");	
//	runJmolScript("write crystal_map.jvxl;");
//}

_surface.getIsoInfo = function() {
	if (!jmolEvaluate("isosurface list").trim())
		return;
	
	// generate JVXL equivalent immediately
//	runJmolScriptWait("isosurface cache");
	
	// Extract the maximum and minimum of the color range
	
	var isoInfo = jmolGetPropertyAsString("shapeinfo.isosurface[1].jvxlinfo");
	var dataMinimum = parseFloat(isoInfo.substring(
			isoInfo.indexOf("data") + 14, isoInfo.indexOf("data") + 26)); // dataMinimum
	var dataMaximum = parseFloat(isoInfo.substring(
			isoInfo.indexOf("dataMax") + 14, isoInfo.indexOf("dataMax") + 26)); // dataMaximum
	setValue("dataMin", dataMinimum);
	setValue("dataMax", dataMaximum);
}

_surface.setIsoColorscheme = function() {
	runJmolScriptWait('color $isosurface1 "' + getValue("isoColorScheme") + '"');
}

_surface.setIsoColorRange = function() {
	if (getbyID("dataMin") == "" || getbyID("dataMax") == "") {
		errorMsg("Please, check values entered in the textboxes");
		return false;
	}
	var min = getValue("dataMin");
	var max = getValue("dataMax");
	var colorScheme = getValue("isoColorScheme");
	if (colorScheme != "bw") {
		runJmolScriptWait('color $isosurface1 "' + colorScheme + '" range ' + min + ' '
				+ max);
	} else {
		warningMsg("Colorscheme not available for CUBE files!");
	}
}

_surface.setIsoColorReverse = function() {
	if (getbyID("dataMin") == "" || getbyID("dataMax") == "") {
		errorMsg("Please, check values entered in the textboxes");
		return false;
	}

	var min = getValue("dataMin");
	var max = getValue("dataMax");
	var colorScheme = getValue("isoColorScheme");

	runJmolScriptWait('color $isosurface1 reversecolor "' + colorScheme + '" range ' + min
			+ ' ' + max);
}

_surface.pickIsoValue = function() {
	var check = isChecked("measureIso");
	if (check) {
		messageMsg("Value are shown by hovering on the surface. Values are in e- *bohr^-3. Make sure your isosurface is completely opaque.");
		runJmolScriptWait("set drawHover TRUE");
	} else {
		runJmolScriptWait("set drawHover OFF");
	}
}

_surface.removeStructure = function() {
	var check = isChecked("removeStr");
	if (!check) {
		runJmolScriptWait("select *; hide selected");
	} else {
		runJmolScriptWait("display *");
	}
}

_surface.removeCellIso = function() {
	var check = isChecked("removeCellI");
	if (!check) {
		runJmolScriptWait("unitcell OFF");
	} else {
		runJmolScriptWait("unitcell ON");
	}
}

_surface.setIsoPack = function() {
	if (getValue("iso_a") == "" || getValue("iso_b") == ""
			|| getValue("iso_c") == "") {
		errorMsg("Please, check values entered in the textboxes");
		return false;
	}

	runJmolScriptWait('isosurface LATTICE {' + getValue("iso_a") + ' ' + getValue("iso_b")
			+ ' ' + getValue("iso_c") + '}');
}


function createIsoGrp() {
	var isoName = new Array("select a surface type",
			"from CUBE or JVXL file",
			"isosurface OFF",
			"isosurface ON",
			"Van der Waals", 
			"periodic VdW",
			"solvent accessible", 
			"molecular"
			// BH: TODO: Note that these do not allow mapping
//			,"geodesic VdW", "geodesic IONIC", "dots VdW", "dots IONIC"
			);
	var isoValue = new Array('',
			'isosurface "?"',
			'isosurface OFF',
			'isosurface ON',
			_surface.SURFACE_VDW, 
			_surface.SURFACE_VDW_PERIODIC,
//			SURFACE_VDW_MEP,
//			SURFACE_VDW_MEP_PERIODIC,
			'isosurface SASURFACE',
			'isosurface MOLSURFACE resolution 0 molecular'
//			,
//			'geoSurface VANDERWAALS', 
//			'geoSurface IONIC',
//			'dots VANDERWAALS', 
//			'dots IONIC'
			);
	var colSchemeName = new Array("Rainbow (default)", "Black & White",
			"Blue-White-Red", "Red-Green", "Green-Blue");
	var colSchemeValue = new Array("roygb", "bw", "bwr", "low", "high");
	/*
	 * TODO slab unitcell. /
	 * http://chemapps.stolaf.edu/jmol/docs/examples-11/new.htm isosurface /
	 * lattice {a b c}
	 */
	var str = "<form autocomplete='nope'  id='isoGroup' name='isoGroup' style='display:none'>\n";
	str += "<table class='contents'>\n";
	str += "<tr><td colspan='2'>\n";
	str += "<h2>IsoSurface</h2>\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	//str += "Molecular (classic) isoSurfaces: \n <br>";
	str += createSelect('createIso', '_surface.onClickCreateIso(this.value)', 0, 0,
			isoValue, isoName)
			+ "&nbsp;";
	str += createButton('removeIso', 'remove iso', 'runJmolScriptWait("isosurface OFF")','');
	str += createLine('blue', '');
	str += "</td></tr><tr><td colspan='2'>\n";
	str += createButton('mapMEP', 'map charges', '_surface.onClickMapMEP()','');
	str += createButton('mapCube', 'map from CUBE file', '_surface.onClickMapCube()','');
	str += createButton('mapPlane', 'map plane', 'onClickPickPlane(null, _surface.surfacePickPlaneCallback)','');
	str += "<br>Color map settings<br>\n ";
	str += "<img src='images/band.png'><br><br>";
	str += "- " + createText2("dataMin", "", "12", 0) + " + "
	+ createText2("dataMax", "", "12", 0) + " e- *bohr^-3<br>";
	str += "<br> Colour-scheme "
		+ createSelect('isoColorScheme', '_surface.setIsoColorscheme()', 0, 0,
				colSchemeValue, colSchemeName) + "&nbsp<br>";
	str += createButton('up', 'Update map', '_surface.setIsoColorRange()', '');
	// + createButton('reverseColor', 'Reverse colour', '_surface.setIsoColorReverse()',
	// '');
	str += createLine('blue', '');
	str += "<td><tr>\n";
	// str+="Volume isoSurface<br>"
	// str+=createButton('volIso', 'calculate', 'runJmolScriptWait('isosurface
	// VOLUME')', '') + " \n";
	// str+=createText3('isoVol','','','',"");
	// str+=createLine('blue' , '');
	// str+="</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "Expand isoSurface periodically <br>";
	str += "<i>a: </i>";
	str += "<input type='text'  name='iso_a' id='iso_a' size='1' class='text'>";
	str += "<i> b: </i>";
	str += "<input type='text'  name='iso_b' id='iso_b' size='1' class='text'>";
	str += "<i> c: </i>";
	str += "<input type='text'  name='iso_c' id='iso_c' size='1' class='text'>";
	str += createButton('set_Isopack', 'packIso', '_surface.setIsoPack()', '')
	+ " \n";
	str += createLine('blue', '');
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "Style isoSurface:<br>";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += createRadio("isofashion", "opaque",
			'runJmolScriptWait("color isosurface opaque") ', 0, 1, "", "");
	str += createRadio("isofashion", "translucent",
			'runJmolScriptWait("color isosurface translucent") ', 0, 0, "", "")
			+ "<br>";
	str += createRadio("isofashion", "dots", 'runJmolScriptWait("isosurface  dots;") ',
			0, 0, "", "");
	str += createRadio("isofashion", "no-fill mesh",
			'runJmolScriptWait("isosurface nofill mesh") ', 0, 0, "", "");
	str += "</td></tr>\n";
	str += "<tr><td>\n";
	str += "Color Isosurface:\n";
	str += "</td><td><script>\n";
	str += "jmolColorPickerBox([setColorWhat,'isosurface'], '','surfaceColorPicker');";
	str += "</script>";
	str += "</td></tr>";
	str += "<tr><td>\n";
	str += createLine('blue', '');
	str += createCheck("measureIso", "Measure value", "_surface.pickIsoValue()", 0,
			0, "measureIso")
			+ "\n";
	// str += "<input type='text' name='isoMeasure' id='isoMeasure' size='5'
	// class='text'> a.u.\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += createCheck("removeStr", "Show structure beneath",
			"_surface.removeStructure()", 0, 1, "")
			+ " \n";
	str += createCheck("removeCellI", "Show cell", "_surface.removeCellIso()", 0, 1,
	"")
	+ " \n";
	str += createLine('blue', '');
	str += "</td></tr>\n";
	str += "</table>\n";
	str += "</FORM>\n";
	return str;
}
