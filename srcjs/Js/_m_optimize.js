function enterOptimize() {
	plotEnergies();		
}

function exitOptimize() {
}

function doConvertPlotUnits(unitEnergy) {
	switch (unitEnergy) {
	case "h": // Hartree
		switch (_file.energyUnits) {
		case _constant.ENERGY_RYDBERG:
			convertGeomData(fromRydbergToHartree, "Hartree");
			break;
		case _constant.ENERGY_EV:
			convertGeomData(fromEVToHartree, "Hartree");
			break;
		case _constant.ENERGY_HARTREE:
			convertGeomData(fromHartreeToHartree, "Hartree");
			break;
		}
		break;
	case "e": // eV
		switch (_file.energyUnits) {
		case _constant.ENERGY_RYDBERG:
			convertGeomData(fromRydbergToEV, "eV");
			break;
		case _constant.ENERGY_EV:
			convertGeomData(fromEVToEV, "eV");
			break;
		case _constant.ENERGY_HARTREE:
			convertGeomData(fromHartreeToEV, "eV");
			break;
		}
		break;

	case "r": // Rydberg
		switch (_file.energyUnits) {
		case _constant.ENERGY_RYDBERG:
			convertGeomData(fromRydbergToRydberg, "Ry");
			break;
		case _constant.ENERGY_EV:
			convertGeomData(fromEVToRydberg, "Ry");
			break;
		case _constant.ENERGY_HARTREE:
			convertGeomData(fromHartreeToRydberg, "Ry");
			break;
		}
		break;

	case "kj": // Kj/mol
			switch (_file.energyUnits) {
			case _constant.ENERGY_RYDBERG:
				convertGeomData(fromRydbergToKJ, "kJ/mol");
				break;
			case _constant.ENERGY_EV:
				convertGeomData(fromEVToKJ, "kJ/mol");
				break;
			case _constant.ENERGY_HARTREE:
				convertGeomData(fromHartreeToKJ, "kJ/mol");
				break;
			}
		break;

	case "kc": // Kcal*mol
		switch (_file.energyUnits) {
		case _constant.ENERGY_RYDBERG:
			convertGeomData(fromRydbergToKcalmol, "kcal/mol");
			break;
		case _constant.ENERGY_EV:
			convertGeomData(fromEVToKcalmol, "kcal/mol");
			break;
		case _constant.ENERGY_HARTREE:
			convertGeomData(fromHartreeToKcalmol, "kcal/mol");
			break;
		}
		break;
	}
}

var convertGeomData = function(f, toUnits) {
	
	var geom = getbyID('geom');
	if (geom != null)
		cleanList('geom');

	toUnits = " " + toUnits;
	
	var u = _file.unitGeomEnergy;
	switch (_file.energyUnits) {
	case _constant.ENERGY_RYDBERG:
		u = "R";
		break;
	case _constant.ENERGY_EV:
		u = "e";
		break;
	case _constant.ENERGY_HARTREE:
		u = "H";
		break;
//	case _constant.ENERGY_KJ_PER_MOLE:
//		u = "k";
//		break;
	}

	// The required value is the end of the string Energy = -123.456 Hartree.
	
	for (var i = (_file.hasInputModel ? 1 : 0); i < _file.geomData.length; i++) {
		var data = _file.geomData[i];
		var val = f(data.substring(data.indexOf('=') + 1, 
				data.indexOf(u) - 1));
		addOption(geom, i + " E = " + val + toUnits, i + 1);
	}

}


//function saveFrame() {
// TODO: Not something we can do in JavaScript -- too many files, unless we zip them up (which we can do)
//	messageMsg("This is to save frame by frame your geometry optimization.");
//	var value = checkBoxX("saveFrames");
//	if (value == "on")
//		runJmolScriptWait('write frames {*} "fileName.jpg"');
//}

function createOptimizeGrp() {
	var vecAnimValue = new Array("", "set animationFps 5",
			"set animationFps 10", "set animationFps 15",
			"set animationFps 20", "set animationFps 25",
			"set animationFps 30", "set animationFps 35");
	var vecAnimText = new Array("select", "5", "10", "15", "20", "25", "30", "35");
	var vecUnitEnergyVal = new Array("h", "e", "r", "kj", "kc");
	var vecUnitEnergyText = new Array("Hartree", "eV", "Rydberg", "kJ*mol-1", "kcal*mol-1");

	var graphdiv = "<table><tr><td>&#916E (kJ/mol)<br>"
		  + createDiv("plotarea", "width:170px;height:180px;background-color:#EFEFEF;", "")
		  + "</td><td>Force<br>"
		  + createDiv("plotarea1", "width:170px;height:180px;background-color:#efefEF;","")
		  + "</td></tr></table>";

	var strGeom = "<form autocomplete='nope'  id='geometryGroup' name='modelsGeom' style='display:none'>";
	strGeom += "<table class='contents'><tr><td>";
	strGeom += "<h2>Geometry optimization</h2>\n";
	strGeom += "</td></tr>"
		strGeom += "<tr><td>\n";
	strGeom += createButton("<<", "<<",
			'runJmolScriptWait("model FIRST");  selectListItem(document.modelsGeom.models, "0")', 0)
			+ "\n";
	strGeom += createButton(">", ">", 'runJmolScriptWait("animation ON")'/* + selectFrame'*/, 0) + "\n";
	// BH: note that "selectFrame()" does not exist in the Java, either
	strGeom += createButton("||", "||", 'runJmolScriptWait("frame PAUSE")', 0) + "\n";
	strGeom += createButton(">>", ">>", 'runJmolScriptWait("model LAST")', 0) + "\n";
	strGeom += createButton(
			"loop",
			"loop",
			'runJmolScriptWait("frame REWIND; animation off;animation mode loop;animation on")',
			0)
			+ "\n";
	strGeom += createButton(
			"palindrome",
			"palindrome",
			'runJmolScriptWait("frame REWIND; animation off;  animation mode palindrome;animation on")',
			0)
			+ "\n";
	strGeom += "<br>"
		+ createSelect("framepersec", "runJmolScriptWait(value)", 0, 1, vecAnimValue,
				vecAnimText) + " motion speed";
// this is problematic in JavaScript -- too many files created
//	strGeom += createCheck('saveFrames', ' save video frames', 'saveFrame()',
//			0, 0, "");
	strGeom += "<br> Energy unit measure: ";
	strGeom += createSelect("unitMeasureEnergy", "doConvertPlotUnits(value)", 0, 1,
			vecUnitEnergyVal, vecUnitEnergyText);
	strGeom += "</td></tr><tr><td>";
	strGeom += "<select id='geom' name='models' onchange='showFrame(value)'  class='selectmodels' size='10'></select>";
	strGeom += "</td></tr><tr><td style='margin=0px; padding=0px;'>\n";	
	strGeom += graphdiv;
	strGeom += "</td></tr></table></form>\n";
	return strGeom;
}

