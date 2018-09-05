function saveFractionalCoordinate() {
	warningMsg("Make sure you had selected the model you would like to export.");

	if (selectedFrame == null)
		getUnitcell(1);

	var x = "var cellp = [" + roundNumber(aCell) + ", " + roundNumber(bCell)
	+ ", " + roundNumber(cCell) + ", " + roundNumber(alpha) + ", "
	+ roundNumber(beta) + ", " + roundNumber(gamma) + "];"
	+ 'var cellparam = cellp.join(" ");' + 'var xyzfrac = '
	+ selectedFrame + '.label("%a %16.9[fxyz]");'
	+ 'var lista = [cellparam, xyzfrac];'
	+ 'WRITE VAR lista "?.XYZfrac" ';
	setV(x);
}

//This reads out cell parameters given astructure.
var aCell, bCell, cCell, alpha, beta, gamma, typeSystem;
function getUnitcell(i) {
	// document.cellGroup.reset();
	typeSystem = "";
	i || (i = 1);
	var StringUnitcell = "auxiliaryinfo.models[" + i + "].infoUnitCell";

	var cellparam = extractInfoJmol(StringUnitcell);

	aCell = roundNumber(cellparam[0]);
	bCell = roundNumber(cellparam[1]);
	cCell = roundNumber(cellparam[2]);
	dimensionality = parseFloat(cellparam[15]);
	volumeCell = roundNumber(cellparam[16]);

	var bOvera = roundNumber(parseFloat(bCell / cCell));
	var cOvera = roundNumber(parseFloat(cCell / aCell));

	if (dimensionality == 1) {
		bCell = 0.000;
		cCell = 0.000;
		makeEnable("par_a");
		setVbyID("par_a", "");
		makeDisable("par_b");
		setVbyID("par_b", "1");
		makeDisable("par_c");
		setVbyID("par_c", "1");
		setVbyID("bovera", "0");
		setVbyID("covera", "0");
		typeSystem = "polymer";
	} else if (dimensionality == 2) {
		cCell = 0.000;
		typeSystem = "slab";
		makeEnable("par_a");
		setVbyID("par_a", "");
		makeEnable("par_b");
		setVbyID("par_b", "");
		makeDisable("par_c");
		setVbyID("par_c", "1");
		setVbyID("bovera", bOvera);
		setVbyID("covera", "0");
	} else if (dimensionality == 3) {
		typeSystem = "crystal";
		alpha = cellparam[3];
		beta = cellparam[4];
		gamma = cellparam[5];
		makeEnable("par_a");
		setVbyID("par_a", "");
		makeEnable("par_b");
		setVbyID("par_b", "");
		makeEnable("par_c");
		setVbyID("par_c", "");
		setVbyID("bovera", bOvera);
		setVbyID("covera", cOvera);
	} else if (!cellparam[0] && !cellparam[1] && !cellparam[2] && !cellparam[4]) {
		aCell = 0.00;
		bCell = 0.00;
		cCell = 0.00;
		alpha = 0.00;
		beta = 0.00;
		gamma = 0.00;
		typeSystem = "molecule";
		setVbyID("bovera", "0");
		setVbyID("covera", "0");
	}
	setVbyID("aCell", roundNumber(aCell));
	setVbyID("bCell", roundNumber(bCell));
	setVbyID("cCell", roundNumber(cCell));
	setVbyID("alphaCell", roundNumber(alpha));
	setVbyID("betaCell", roundNumber(beta));
	setVbyID("gammaCell", roundNumber(gamma));
	setVbyID("volumeCell", roundNumber(volumeCell));

}

function setUnitCell() {
	getUnitcell(frameValue);
	if (selectedFrame == null || selectedFrame == "" || frameValue == ""
		|| frameValue == null) {
		selectedFrame = "{1.1}";
		frameNum = 1.1;
		getUnitcell("1");
	}
}
////END OPEN SAVE FUNCTIONS

///////////////
//////////////CELL AND ORIENTATION FUNCTION
/////////////

function setCellMeasure(value) {
	typeSystem = "";
	var StringUnitcell = "auxiliaryinfo.models[" + i + "].infoUnitCell";

	if (i == null || i == "")
		StringUnitcell = " auxiliaryInfo.models[1].infoUnitCell ";

	var cellparam = extractInfoJmol(StringUnitcell);
	aCell = cellparam[0];
	bCell = cellparam[1];
	cCell = cellparam[2];
	if (value == "a") {
		setVbyID("aCell", roundNumber(aCell));
		setVbyID("bCell", roundNumber(bCell));
		setVbyID("cCell", roundNumber(cCell));
	} else {
		aCell = aCell * 1.889725989;
		bCell = bCell * 1.889725989;
		cCell = cCell * 1.889725989;
		setVbyID("aCell", roundNumber(aCell));
		setVbyID("bCell", roundNumber(bCell));
		setVbyID("cCell", roundNumber(cCell));
	}

}
function setCellDotted() {
	var cella = checkBoxX('cellDott');
	if (cella == "on") {
		setV("unitcell DOTTED ;");
	} else {
		setV("unitcell ON;");
	}
}

//This gets values from textboxes using them to build supercells
function setPackaging(packMode) {
	var typePack = packMode + getKindCell(false);
	
	// BH 2018
	getValue("par_a") || setVbyID("par_a", 1);
	getValue("par_b") || setVbyID("par_b", 1);
	getValue("par_c") || setVbyID("par_c", 1);
	
	// BH 2018 adds save/restore orientation
	var checkboxSuper = checkBoxX("supercellForce");
	if (checkboxSuper == "on") {
		warningMsg("You decided to constrain your original supercell to form a supercell. \n The symmetry was reduced to P1.");
		runJmolScriptWait('save orientation o;load "" {1 1 1} SUPERCELL {' + getValue("par_a") + ' '
				+ getValue("par_b") + ' ' + getValue("par_c") + '}' + typePack + ";restore orientation o;");
		setUnitCell();
	} else {
		runJmolScriptWait('save orientation o;load "" {' + getValue("par_a") + ' ' + getValue("par_b") + ' '
				+ getValue("par_c") + '}' + typePack + ";restore orientation o;");
	}
}


getKindCell = function(isRaw) {
	var kindCell = getbyName("cella");
	var kindCellfinal = null;
	for ( var i = 0; i < kindCell.length; i++) {
		if (kindCell[i].checked) {
			return (isRaw ? kindCell[i].value : " FILTER '" + kindCell[i].value + "';");
		}
	}
	return "";
}

function setPackRangeAndReload(val) {
	packRange = val;
	runJmolScriptWait("load '' {1 1 1} RANGE " + val + getKindCell(false));
	cellOperation();
}

function checkPack() {
	uncheckBox("superPack");
	// This initialize the bar
	getbyID("packMsg").innerHTML = 0 + " &#197";
}

function uncheckPack() {
	uncheckBox("chPack");
	getbyID("packDiv").style.display = "none";
	setCellType(getKindCell(true));
}

function setCellType(value) {
	// BH 2018 Q: logic here?
	var valueConv = checkBoxX("superPack");
	var checkBoxchPack = checkBoxX("chPack");
	var stringa = "load '' FILTER '" + value + "'";
	if (valueConv == "on" && checkBoxchPack == "off") {
		stringa = "load '' FILTER '" + value+ "'";	
	} else if (valueConv == "off" && checkBoxchPack == "on") {
		stringa = "load '' {1 1 1} RANGE " + packRange + " FILTER '" + value + "'";
	}
	runJmolScriptWait(stringa);
	cellOperation();
}

function setManualOrigin() {

	var x = getValue("par_x");
	var y = getValue("par_y");
	var z = getValue("par_z");

	if (x == "" || y == "" || z == "") {
		errorMsg("Please, check values entered in the textboxes");
		return false;
	}
	runJmolScriptWait("unitcell { " + x + " " + y + " " + z + " };");
	cellOperation();
}

//This controls the refined motion of the structure
var motion = "";
function setKindMotion(valueList) {
	motion = valueList;
	if (motion == "select")
		errorMsg("Please select the motion");
	return motion;
}

function setMotion(axis) {
	var magnitudeMotion = getbyID("fineOrientMagn").value;

	if (motion == "select" || motion == "") {
		errorMsg("Please select the motion");
		return false;
	}

	// /(motion == "translate" )? (makeDisable("-z") + makeDisable("z")) :
	// (makeEnable("-z") + makeEnable("z"))

	if (magnitudeMotion == "") {
		errorMsg("Please, check value entered in the textbox");
		return false;
	}

	var stringa = "Selected" + " " + axis + " " + magnitudeMotion;
	if (motion == "translate" && (axis == "-x" || axis == "-y" || axis == "-z")) {
		axis = axis.replace("-", "");
		stringa = "Selected" + " " + axis + " -" + magnitudeMotion;
	}

	(!getbyID("moveByselection").checked) ? setV(motion + " " + axis + " "
			+ magnitudeMotion) : setV(motion + stringa);

}

function setFashionAB(valueList) {

	var radio = getbyName("abFashion");
	for ( var i = 0; i < radio.length; i++) {
		if (radio[i].checked == true)
			var radioValue = radio[i].value;
	}

	var fashion = (radioValue == "on") ? 'OPAQUE' : 'TRANSLUCENT';

	if (valueList != "select")
		setV('color ' + valueList + ' ' + fashion);
}

function setUnitCellOrigin(value) {
	setV("unitcell { " + value + " }");
}

function getSymInfo() {

	// update all of the model-specific page items

	SymInfo = {};
	var s = "";
	var info = jmolEvaluate('script("show spacegroup")');
	if (info.indexOf("x,") < 0) {
		s = "no space group";
	} else {
		var S = info.split("\n");
		var hm = "?";
		var itcnumber = "?";
		var hallsym = "?";
		var latticetype = "?";
		var nop = 0;
		var slist = "";
		for ( var i = 0; i < S.length; i++) {
			var line = S[i].split(":");
			if (line[0].indexOf("Hermann-Mauguin symbol") == 0)
				s += "<br>"
					+ S[i]
			.replace(
					/Hermann\-Mauguin/,
			"<a href=http://en.wikipedia.org/wiki/Hermann%E2%80%93Mauguin_notation target=_blank>Hermann-Mauguin</a>");
			else if (line[0].indexOf("international table number") == 0)
				s += "<br>"
					+ S[i]
			.replace(
					/international table number/,
			"<a href=http://it.iucr.org/ target=_blank id='prova'>international table</a> number");
			else if (line[0].indexOf("lattice type") == 0)
				s += "<br>"
					+ S[i]
			.replace(
					/lattice type/,
			"<a href=http://cst-www.nrl.navy.mil/bind/static/lattypes.html target=_blank>lattice type</a>");
			else if (line[0].indexOf(" symmetry operation") >= 0)
				nop = parseInt(line[0]);
			else if (nop > 0 && line[0].indexOf(",") >= 0)
				slist += "\n" + S[i];

		}

		s += "<br> Symmetry operators: " + nop;

		var S = slist.split("\n");
		var n = 0;
		var i = -1;
		while (++i < S.length && S[i].indexOf(",") < 0) {
		}
		s += "<br><select id='symselect' onchange=getSelect() onkeypress=\"setTimeout('getSelect()',50)\" class='select'><option value=0>select a symmetry operation</option>";
		for (; i < S.length; i++)
			if (S[i].indexOf("x") >= 0) {
				var sopt = S[i].split("|")[0].split("\t");
				SymInfo[sopt[1]] = S[i].replace(/\t/, ": ").replace(/\t/, "|");
				sopt = sopt[0] + ": " + sopt[2] + " (" + sopt[1] + ")";
				s += "<option value='" + parseInt(sopt) + "'>" + sopt
				+ "</option>";
			}
		s += "</select>";

		var info = jmolEvaluate('{*}.label("#%i %a {%[fxyz]/1}")').split("\n");
		var nPoints = info.length;
		var nBase = jmolEvaluate('{symop=1555}.length');
		s += "<br><select id='atomselect' onchange=getSelect() onkeypress=\"setTimeout('getSelect()',50)\"  class='select'><option value=0>base atoms</option>";
		s += "<option value='{0 0 0}'>{0 0 0}</option>";
		s += "<option value='{1/2 1/2 1/2}'>{1/2 1/2 1/2}</option>";
		for ( var i = 0; i < nPoints; i++)
			s += "<option value=" + i + (i == 0 ? " selected" : "") + ">"
			+ info[i] + "</option>";
		s += "</select>";

		s += "</br><input type=checkbox id=chkatoms onchange=getSelect() checked=true />superimpose atoms";
		s += " opacity:<select id=selopacity onchange=getSelect() onkeypress=\"setTimeout('getSelect()',50)\"  class='select'>"
			+ "<option value=0.2 selected>20%</option>"
			+ "<option value=0.4>40%</option>"
			+ "<option value=0.6>60%</option>"
			+ "<option value=1.0>100%</option>" + "</select>";

	}
	getbyID("syminfo").innerHTML = s;
}

function getSelect(symop) {
	var d = getbyID("atomselect");
	var atomi = d.selectedIndex;
	var pt00 = d[d.selectedIndex].value;
	var showatoms = (getbyID("chkatoms").checked || atomi == 0);
	setV("display " + (showatoms ? "all" : "none"));
	var d = getbyID("symselect");
	var iop = parseInt(d[d.selectedIndex].value);
	// if (!iop && !symop) symop = getbyID("txtop").value
	if (!symop) {
		if (!iop) {
			setV("select *;color opaque;draw sym_* delete");
			return

		}
		symop = d[d.selectedIndex].text.split("(")[1].split(")")[0];
		// getbyID("txtop").value
		// = symop
	}
	if (pt00.indexOf("{") < 0)
		pt00 = "{atomindex=" + pt00 + "}";
	var d = getbyID("selopacity");
	var opacity = parseFloat(d[d.selectedIndex].value);
	if (opacity < 0)
		opacity = 1;
	var script = "select *;color atoms translucent " + (1 - opacity);
	script += ";draw symop \"" + symop + "\" " + pt00 + ";";
	if (atomi == 0) {
		script += ";select symop=1555 or symop=" + iop + "555;color opaque;";
	} else if (atomi >= 3) {
		script += ";pt1 = "
			+ pt00
			+ ";pt2 = all.symop(\""
			+ symop
			+ "\",pt1).uxyz.xyz;select within(0.2,pt1) or within(0.2, pt2);color opaque;";
	}
	secho = SymInfo[symop];
	if (!secho) {
		secho = jmolEvaluate("all.symop('" + symop + "',{0 0 0},'draw')")
		.split("\n")[0];
		if (secho.indexOf("//") == 0) {
			secho = secho.substring(2);
		} else {
			secho = symop;
		}
	}
	script = "set echo top right;echo " + secho + ";" + script;
	setV(script);
}
function resetSymmetryView() {
	setV('select *;color atoms opaque; echo; draw off');
}

function deleteSymmetry() {
	getbyID("syminfo").removeChild;
}

cellOperation = function(){
	deleteSymmetry();
	getSymInfo();
	for ( var i = 0; i < 2; i++)
		setUnitCell();
}

var kindCoord;
var measureCoord = false;
function viewCoord(value) {
	kindCoord = value;
	measureCoord = true;
	messageMsg("Pick the atom your interested, please.");
	setPickingCallbackFunction(showCoord);
	runJmolScriptWait("select *; label off" 
			+'set defaultDistanceLabel "%10.7VALUE %UNITS"'
			+'showSelections TRUE; select none; set picking ON;set picking LABEL; set picking SELECT atom; halos on; set LABEL on;');
}

function showCoord(b, c, d, e, f) {
	// ??? 
	// setMeasureText(b);
	if (measureCoord) {
		if (kindCoord == "fractional") {
			setV('Label "%a: %.2[fX] %.2[fY] %.2[fZ]"');
		} else {
			setV('Label "%a: %1.2[atomX] %1.2[atomY] %1.2[atomZ]"');
		}
	}
}
////////////END CELL and MOTION FUNCTIONS
