
var _measure = {
	kindCoord: "",
	coord : false,
	unit : "",
	count : 0
}

function enter() {

}

function exit() {
	_measure.coord = false;
}

_measure.viewCoord = function(value) {
	_measure.kindCoord = value;
	_measure.coord = true;
	messageMsg("Pick the atom you are interested in, please.");
	setPickingCallbackFunction(_measure.showCoord);
	runJmolScriptWait("select *; label off;"
			+ 'set defaultDistanceLabel "%2.7VALUE %UNITS";'
			+ 'showSelections TRUE; select none; set picking ON;set picking LABEL; set picking SELECT atom; halos on; set LABEL on;');
}

_measure.showCoord = function() {
	if (_measure.coord) {
		if (_measure.kindCoord == "fractional") {
			runJmolScriptWait('Label "%a: %.2[fX] %.2[fY] %.2[fZ]"');
		} else {
			runJmolScriptWait('Label "%a: %1.2[atomX] %1.2[atomY] %1.2[atomZ]"');
		}
	}
}

_measure.setUnit = function(value) {
	_measure.unit = value;
	runJmolScriptWait("set measurements " + value);
}

_measure.set = function() {
	runJmolScriptWait("set measurements ON");
}

_measure.check = function(value) {
	var radiobutton = value;
	var unit = getbyID('measureDist').value;
	_measure.reset();
	runJmolScriptWait('set pickingStyle MEASURE ON;');
	if (radiobutton == "distance") {
		if (unit == 'select') {
			_measure.hint('Select the desired measure unit.');
			uncheckRadio("distance");
			return false;
		}
		_measure.hint('Pick two atoms');
		runJmolScriptWait('set defaultDistanceLabel "%2.3VALUE %UNITS";'
				+ 'showSelections TRUE; select none;  label on ; set picking on; set picking LABEL; set picking SELECT atom; set picking DISTANCE;'
				+ "measure ON; set measurements ON; set showments ON; set measurements ON; set measurementUnits "
				+ unit + ";set picking MEASURE DISTANCE;" + "set measurements "
				+ unit + ";" + 'label ON;');

	} else if (radiobutton == "angle") {
		_measure.hint('Pick three atoms');
		runJmolScriptWait('set defaultAngleLabel "%2.3VALUE %UNITS";'
				+ 'showSelections TRUE; select none;  label on ; set picking on; set picking LABEL; set picking SELECT atom; set picking ANGLE;'
				+ "measure ON; set measurements ON; set showments ON; set picking MEASURE ANGLE;"
				+ 'set measurements ' + unit + ';label ON');
	} else if (radiobutton == "torsional") {
		_measure.hint('Pick four atoms');
		runJmolScriptWait('set defaultTorsionLabel "%2.3VALUE %UNITS";'
				+ 'showSelections TRUE; select none;  label on ; set picking on; set picking TORSION; set picking SELECT atom; set picking ANGLE;'
				+ 'measure ON; set measurements ON; set showments ON; set picking MEASURE TORSION;label ON');
	}
	_measure.setText()

}

_measure.hint = function(msg) {
	// BH 2018
	document.measureGroup.text.value = msg + "...";
}

_measure.setSize = function(value) {
	runJmolScriptWait("select *; font label " + value + " ; font measure "
			+ value + " ; select none;");
}

_measure.setText = function(value) {
	runJmolScriptWait("show measurements");
	var init = "\n";
	// BH 2018
	if (_measure.count == 0)
		document.measureGroup.text.value = init = '';
	document.measureGroup.text.value += init + ++_measure.count + " " + value;
}

_measure.reset = function() {
	_measure.count = 0;
	getbyID("text").value = "";
	runJmolScriptWait('set pickingStyle MEASURE OFF; select *; label off; halos OFF; selectionHalos OFF; measure OFF; set measurements OFF; set showments OFF;  measure DELETE;');
}

var createMeasureGrp = function() {
	var measureName = new Array("select", "Angstroms", "Bohr", "nanometers",
	"picometers");
	var measureValue = new Array("select", "angstroms", "BOHR", "nm", "pm");
	var textValue = new Array("0", "6", "8", "10", "12", "16", "20", "24", "30");
	var textText = new Array("select", "6 pt", "8 pt", "10 pt", "12 pt",
			"16 pt", "20 pt", "24 pt", "30 pt");
	
	var str = "<form autocomplete='nope'  id='measureGroup' name='measureGroup' style='display:none'>";
	str += "<table class='contents'><tr><td > \n";
	str += "<h2> and _file.info</h2>\n";
	str += "</td></tr>\n";
	str += "<tr><td colspan='2'>\n";
	str += "<br>\n";
	str += createRadio("distance", "distance", '_measure.check(value)', '',
			0, "", "distance");
	str += createSelectFunc('measureDist', '_measure.setUnit(value)',
			'setTimeout(function(){_measure.setUnit(value)},50)', 0, 1, measureValue,
			measureName)
			+ " ";
	str += createRadio("distance", "angle", '_measure.check(value)', '', 0,
			"", "angle");
	str += createRadio("distance", "torsional", '_measure.check(value)', '',
			0, "", "torsional");
	str += "<br><br>  value: <br>"
		+ createTextArea("text", "", 10, 60, "");
	str += "<br>"
		+ createButton('reset', 'Delete /s', '_measure.reset()', '')
		+ "<br>";
	str += "</td></tr>\n";
	str += "<tr><td> colour: "
		+ createButton("color", "Default colour",
				'runJmolScriptWait("color measures none")', 0) + "</td><td >\n";
	str += "<script align='left'>jmolColorPickerBox([setColorWhat, 'measures'],[255,255,255],'measureColorPicker')</script>";
	str += "</td></tr>";
	str += "<tr><td colspan='2'>";
	str += createLine('blue', '');
	str += "</td></tr>";
	str += "<tr><td colspan='2'>";
	str += "View coordinates: ";
	str += createRadio("coord", "fractional", '_measure.viewCoord(value)', '', 0, "", "fractional");
	str += createRadio("coord", "cartesian", '_measure.viewCoord(value)', '', 0, "", "cartesian");
	str += createLine('blue', '');
	str += "</td></tr>";
	str += "<tr><td colspan='2'>";
	str += "Font size ";
	str += createSelect("fSize", "_measure.setSize(value)", 0, 1,
			textValue, textText);
	str += createLine('blue', '');
	str += "</td></tr>";
	str += "</table></FORM>  \n";
	return str;
}

