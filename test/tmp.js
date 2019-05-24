/*  J-ICE library 

 based on:
 *
 * Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 * ** Contact: pierocanepa@sourceforge.net
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
 
//tabmenus.js includes older tabs.js and menu.js
//last modified 16th Mar 2011 
///////////////////////////////// menu object definition

// This list is used by callbacks

var TAB_OVER  = 0;
var TAB_CLICK = 1;
var TAB_OUT   = 2;

var TAB_DELAY_MS = 100;

// This list controls the placement of the menu item on the menu.

var MENU_FILE     = 0;
var MENU_CELL     = 1;
var MENU_SHOW     = 2;
var MENU_EDIT     = 3;
var MENU_SYM      = 4;
//var MENU_BUILD  = x;
var MENU_MEASURE  = 5;
var MENU_ORIENT   = 6;
var MENU_POLY     = 7;
var MENU_SURFACE  = 8;
var MENU_OPTIMIZE = 9;
var MENU_SPECTRA  = 10;
var MENU_EM       = 11;
var MENU_OTHER    = 12;

// local variables 

var tabs_thisMenu = -1;
var tabs_jsNames  = [];
var tabs_menu     = [];
var tabs_timeouts = [];

function Menu(name, grp, link) {
	this.name = name;
	this.grp = grp;
	this.link = link;
}

function addTab(index, jsName, menuName, group, link) {
	tabs_menu[index] = new Menu(menuName, group, link);
	tabs_jsNames[index] = jsName;
	
}

function defineMenu() {
	addTab(MENU_FILE, "File", "File", "fileGroup", "Import, Export files.");
	addTab(MENU_CELL, "Cell", "Cell", "cellGroup", "Modify cell features and symmetry.");
	addTab(MENU_SHOW, "Show", "Show", "showGroup", "Change atom, bond colours, and dimensions.");
	addTab(MENU_EDIT, "Edit", "Edit", "editGroup", "Change connectivity and remove atoms.");
	//addTab(MENU_BUILD, "Build", "Build", "builGroup", "Modify and optimize structure.");
	addTab(MENU_SYM, "Symmetry", "Sym Build", "symmetryGroup", "Add atoms to structure following rules of symmetry.");
	addTab(MENU_MEASURE, "Measure", "Measure", "measureGroup", "Measure bond distances, angles, and torsionals.");
	addTab(MENU_ORIENT, "Orient", "Orient", "orientGroup", "Change orientation and views.");
	addTab(MENU_POLY, "Polyhedra", "Poly", "polyGroup", "Create polyhedra.");
	addTab(MENU_SURFACE, "Surface", "Surface", "isoGroup", "Modify and create isosurface maps.");
	addTab(MENU_OPTIMIZE, "Optimize", "Optimize", "geometryGroup", "Geometry optimizations.");
	addTab(MENU_SPECTRA, "Spectra", "Spectra", "freqGroup", "IR/Raman frequencies and spectra.");
	addTab(MENU_EM, "Elec", "E&M", "elecGroup", "Mulliken charges, spin, and magnetic moments.");
	addTab(MENU_OTHER, "Other", "Other", "otherpropGroup", "Change background, light settings and other.");
}

function createAllMenus() {
	var s = createFileGrp()
		+ createShowGrp()
		+ createEditGrp()
		+ createSymmetryGrp() 
		//+ createBuildGrp()
		+ createMeasureGrp()
		+ createOrientGrp()
		+ createCellGrp()
		+ createPolyGrp()
		+ createIsoGrp()
		+ createOptimizeGrp()
		+ createFreqGrp()
		+ createElecpropGrp()
		+ createOtherGrp()
		+ addCommandBox()
		//+ createHistGrp()
		;
	return s
}

var showMenu = function(menu) {
	if (tabs_thisMenu >= 0)
		self["exit" + tabs_jsNames[menu]]();
	tabs_thisMenu = menu;
	exitTab();
	self["enter" + tabs_jsNames[menu]]();
	$("#menu"+menu).addClass("picked");
}

var exitTab = function() {
	cancelPicking();
	runJmolScriptWait('select *;color atoms opaque; echo; draw off;set selectionHalos off;halos off;');
}

function grpDisp(n) {
	grpDispDelayed(n, TAB_CLICK);
}

var grpDispDelayed = function(n, mode) {
	for (var i = tabs_timeouts.length; --i >= 0;) {
		if (tabs_timeouts[i])
			clearTimeout(tabs_timeouts[i]);
		tabs_timeouts = [];
	}	
	for (var i = 0; i < tabs_menu.length; i++){
		$("#menu"+i).removeClass("picked");
	}
	switch(mode) {
	case TAB_OVER:
		//tabs_timeouts[n] = setTimeout(function(){grpDispDelayed(n,1)},TAB_DELAY_MS);
		break;
	case TAB_CLICK:
		for (var i = 0; i < tabs_menu.length; i++) {
			getbyID(tabs_menu[i].grp).style.display = "none";
			tabs_menu[i].disp = 0;
		}
		getbyID(tabs_menu[n].grp).style.display = "inline";
		tabs_menu[n].disp = 1;
		showMenu(n);
		break;
	case TAB_OUT:
		break;
	}
	if (tabs_thisMenu >= 0) {
		$("#menu"+tabs_thisMenu).addClass("picked");
	}
}

function createTabMenu() {
	var strMenu = "<ul class='menu' id='menu'>";
	for (var menuIndex = 0; menuIndex < tabs_menu.length; menuIndex++) {
		strMenu += createMenuCell(menuIndex);
	}
	strMenu += "</ul>";
	return strMenu;
}

function createMenuCell(i) {
	var sTab = "<li id='menu"+ i +"' "; // Space is mandatory between i and "
	sTab += "onClick='grpDispDelayed(" + i + ",TAB_CLICK)' onmouseover='grpDispDelayed("+i+",TAB_OVER)' onmouseout='grpDispDelayed("+i+",TAB_OUT)'"; // BH 2018
	sTab += "class = 'menu' ";
	sTab += ">";
	sTab += "<a class = 'menu'>";
	sTab += tabs_menu[i].name;
	sTab += "<span>" + tabs_menu[i].link + "</span>"
	sTab += "</a></li>"
		return sTab;
}

var _build = {
	counterClicZ : 0,
	distanceZ : 0,
	angleZ : 0,
	torsionalZ : 0,
	arrayAtomZ : new Array(3),
	makeCrystalSpaceGroup : null
};

function enterBuild() {
	// not implemented
}

function exitBuild() {
}

function buildPickPlaneCallback() {
 // TODO	
}

function atomSelectedColor(atom) {
	runJmolScriptWait("select {atomno=" + atom + "};");
	_pick.colorWhat = "color atom ";
	return _pick.colorWhat;
}

function atomSelectedDelete(atom) {
	runJmolScriptWait("select {atomno=" + atom + "};");
	_edit.deleteMode = "delete {atomno=" + atom + "}";
	return _edit.deleteMode;
}

function atomSelectedHide(atom) {
	runJmolScriptWait("select {atomno=" + atom + "};");
	_edit.hideMode = "hide {atomno=" + atom + "}";
	return _edit.hideMode;
}


function atomSelectedDisplay(atom) {
	runJmolScriptWait("select all; halo off; label off");
	runJmolScriptWait("select {atomno=" + atom + "}; halo on; label on");
	_edit.displayMode = "display {atomno=" + atom + "}";
	return _edit.displayMode;
}

function addAtomfrac() {
	var value = checkBoxX("addNewFrac");
	if (value == "on") {
		messageMsg("Enter the three fractional positions of the atom you would like to add. \n ADVICE: use the functions view fractional/Cartesian coordinates of of neighbor atom/s. ");
		enableElement("x_frac");
		enableElement("y_frac");
		enableElement("z_frac");
		enableElement("addNewFracList");
		enableElement("addNewFracListBut");
	} else {
		disableElement("x_frac");
		disableElement("y_frac");
		disableElement("z_frac");
		disableElement("addNewFracList");
		disableElement("addNewFracListBut");
	}
}

function addNewatom() {
	var type = getValue("addNewFracList");
	var x, y, z;
	x = parseFloat(getValue("x_frac"));
	y = parseFloat(getValue("y_frac"));
	z = parseFloat(getValue("z_frac"));

	if (x == null || y == null || z == null) {
		errorMsg("You didn't properly set the coordinate");
		return false;
	} else {

		var question = confirm("Would you like to add the atom to the current structure (OK) or create a new structure (Cancel)?");
		if (!question) {
			// runJmolScriptWait('var mol = \"' + atomString + ' \" ;');
			messageMsg("Your coordinate will be treated as Cartesian.")
			var atomString = "1\n\n" + type + " " + parseFloat(x) + " "
			+ parseFloat(y) + " " + parseFloat(z);
			runJmolScriptWait('set appendNew TRUE; DATA "model"' + atomString
					+ ' end "model"');
		} else {
			var fractional = confirm("Are these coordinates fractionals (OK) or Cartesians (Cancel)?");
			getUnitcell(_file.frameValue);
			setUnitCell();
			runJmolScriptWait('var noatoms =' + _file.frameSelection + '.length  + 1;');
			if (!fractional) {
				var atomString = "\n 1\n\n" + type + " " + parseFloat(x) + " "
				+ parseFloat(y) + " " + parseFloat(z);
				runJmolScriptWait('set appendNew FALSE; DATA "append"' + atomString
						+ '\n end "append"');
			} else {
				runJmolScriptWait("set appendNew FALSE;");
				var script = "script inline @{'DATA \"append\"1\\n\\n TE ' + format('%12.3p',{X,Y,Z}.xyz) +'\\nend \"append\" '}"
					runJmolScriptWait(script.replace(/X/, parseFloat(x)).replace(/Y/,
							parseFloat(y)).replace(/Z/, parseFloat(z)).replace(
									/TE/, type));
			}
			// alert(atomString)

		}
		setValue("x_frac", "");
		setValue("y_frac", "");
		setValue("z_frac", "");
		getbyID("addAtomCrystal").style.display = "none";
	}
}

function addAtomZmatrix(form) {
	loadScriptZMatrix();
	selectElementZmatrix(form);
}

function loadScriptZMatrix() {

	// here we must check for crystal surface oo polymer because the routine
	// it's shlighthly different
	runJmolScriptWait("function zAdd(type, dist, a, ang, b, tor, c) {\n"
			+ "var vbc = c.xyz - b.xyz\n" + "var vba = a.xyz - b.xyz\n"
			+ "var p = a.xyz - (vba/vba) * dist\n"
			+ 'var mol = "1 \n\n" + type + " " + p.x + " " + p.y + " " + p.z\n'
			+ "var p = a.xyz + cross(vbc, vba) \n" + "set appendNew FALSE \n"
			+ 'DATA "append" \\n\\n' + '+ mol + ' + '\\n end "append" \n'
			+ 'var newAtom = {*}[0]\n' + 'connect @a @newAtom\n'
			+ 'rotate Selected molecular @a @p @ang @newAtom \n'
			+ 'rotate Selected molecular @b @a @tor @newAtom \n' + '}');
}

function selectElementZmatrix(form) {

	if (form.checked) {
		_build.counterClicZ = 0;
		for (var i = 0; i < 3; i++) {

			if (i == 0) {
				messageMsg("This procedure allows the user to introduce a new atom (or more), \n just by knowing its relationship with its neighbour atoms.")
				messageMsg("Select the 1st atom where to attach the new atom.");
			}

			if (_build.counterClicZ == 1) {
				messageMsg("Select the 2nd atom to form the angle.");
			} else if (_build.counterClicZ == 2) {
				messageMsg("Select the 3rd atom to form the torsional angle.");
			}
			setPickingCallbackFunction(pickZmatrixCallback)
			runJmolScriptWait("draw off; showSelections TRUE; select none; halos on;");
		}
	}
}

function pickZmatrixCallback(b, c, d, e) {
	if (_build.counterClicZ == 0) { // distance
		var valuedist = prompt(
				"Now enter the distance (in \305) from which you want to add the new atom. \n Seletion is done by symply clikking ont the desire atom",
		"1.0");
		_build.distanceZ = parseFloat(valuedist);
		_build.arrayAtomZ[0] = parseInt(b.substring(b.indexOf('#') + 1,
				b.indexOf('.') - 2));

	}
	if (_build.counterClicZ == 1) { // angle

		var valueangle = prompt(
				"Now the enter the angle (in degrees) formed between the new atom, the 1st and the 2nd ones. \n Seletion is done by symply clikking ont the desire atoms",
		"109.7");
		_build.angleZ = parseFloat(valueangle);
		_build.arrayAtomZ[1] = parseInt(b.substring(b.indexOf('#') + 1,
				b.indexOf('.') - 2));

	}
	if (_build.counterClicZ == 2) {// torsional

		var valuetorsion = prompt(
				"Enter the torsional angle(in degrees) formed between the new atom, the 1st, the 2nd and the 3rd ones. \n Seletion is done by symply clikking ont the desire atoms",
		"180.0");
		_build.torsionalZ = parseFloat(valuetorsion);
		_build.arrayAtomZ[2] = parseInt(b.substring(b.indexOf('#') + 1,
				b.indexOf('.') - 2));
		messageMsg("distance: " + _build.distanceZ + " from atom " + _build.arrayAtomZ[0]
		+ " angle: " + _build.angleZ + " formed by atoms: new, "
		+ _build.arrayAtomZ[0] + ", " + _build.arrayAtomZ[1] + "\n and torsional: "
		+ _build.torsionalZ + " formed by atoms: new, " + _build.arrayAtomZ[0] + ", "
		+ _build.arrayAtomZ[1] + ", " + _build.arrayAtomZ[2])
		messageMsg("Now, select the desire element.");
	}
	_build.counterClicZ++;
}

function addZatoms() {
	runJmolScriptWait('zAdd(\"' + getValue('addEleZ') + '\",' + _build.distanceZ + ',{'
			+ _build.arrayAtomZ[0] + '}, ' + _build.angleZ + ', {' + _build.arrayAtomZ[1] + '},'
			+ _build.torsionalZ + ', {' + _build.arrayAtomZ[2] + '})')
}

function createCrystalStr(form) {
	if (form.checked) {
		disableElement("periodMole");
	} else {

	}
}

function checkIfThreeD(value) {
	enableElementPeriodicityMol()
	if (value == "crystal") {

		enableElement("periodMole");
		setValue("a_frac", "");
		setValue("b_frac", "");
		setValue("c_frac", "");
	} else if (value == "slab") {
		disableElement("periodMole");
		_build.makeCrystalSpaceGroup = "P-1"; // / set P-1 as symmetry for film and
		// polymer
		setValue("a_frac", "");
		setValue("b_frac", "");
		setValue("c_frac", "0");
		disableElement("c_frac");
		setValue("alpha_frac", "");
		setValue("beta_frac", "");
		setValue("gamma_frac", "90");
		disableElement("gamma_frac");
	} else if (value == "polymer") {
		disableElement("periodMole");
		_build.makeCrystalSpaceGroup = "P-1"; // / set P-1 as symmetry for film and
		// polymer
		setValue("a_frac", "");
		setValue("b_frac", "0");
		disableElement("b_frac");
		setValue("c_frac", "0");
		disableElement("c_frac");
		setValue("alpha_frac", "90");
		disableElement("alpha_frac");
		setValue("beta_frac", "90");
		disableElement("beta_frac");
		setValue("gamma_frac", "90");
		disableElement("gamma_frac");
	} else if (value == "") {
		setValue("a_frac", "");
		disableElement("a_frac");
		setValue("b_frac", "");
		disableElement("b_frac");
		setValue("c_frac", "");
		disableElement("c_frac");
		setValue("alpha_frac", "");
		disableElement("alpha_frac");
		setValue("beta_frac", "");
		disableElement("beta_frac");
		setValue("gamma_frac", "");
		disableElement("gamma_frac");
	}
}

function setCellParamSpaceGroup(spaceGroup) {
	// /from crystal manual http://www.crystal.unito.it/Manuals/crystal09.pdf
	var trimSpaceGroup = null;

	if (spaceGroup.search(/:/) == -1) {
		if (spaceGroup.search(/\*/) == -1) {
			trimSpaceGroup = spaceGroup;
		} else {
			trimSpaceGroup = spaceGroup.substring(0, spaceGroup.indexOf('*'));
		}
	} else {
		trimSpaceGroup = spaceGroup.substring(0, spaceGroup.indexOf(':'));
	}
	switch (true) {

	case ((trimSpaceGroup <= 2)): // Triclinic lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "");
	setValue("beta_frac", "");
	setValue("gamma_frac", "");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	enableElement("alpha_frac");
	enableElement("beta_frac");
	enableElement("gamma_frac");

	break;

	case ((trimSpaceGroup > 2) && (trimSpaceGroup <= 15)): // Monoclinic
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "");
	setValue("beta_frac", "90.000");
	setValue("gamma_frac", "90.000");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	enableElement("alpha_frac");
	disableElement("beta_frac");
	disableElement("gamma_frac");
	break;

	case ((trimSpaceGroup > 15) && (trimSpaceGroup <= 74)): // Orthorhombic
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "90.000");
	setValue("beta_frac", "90.000");
	setValue("gamma_frac", "90.000");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	disableElement("alpha_frac");
	disableElement("beta_frac");
	disableElement("gamma_frac");

	break;

	case ((trimSpaceGroup > 74) && (trimSpaceGroup <= 142)): // Tetragonal
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "90.000");
	setValue("beta_frac", "90.000");
	setValue("gamma_frac", "90.000");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	disableElement("alpha_frac");
	disableElement("beta_frac");
	disableElement("gamma_frac");

	break;

	case ((trimSpaceGroup > 142) && (trimSpaceGroup <= 167)): // Trigonal
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "");
	setValue("beta_frac", "");
	setValue("gamma_frac", "");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	enableElement("alpha_frac");
	enableElement("beta_frac");
	enableElement("gamma_frac");

	break;

	case ((trimSpaceGroup > 167) && (trimSpaceGroup <= 194)): // Hexagonal
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "90.000");
	setValue("beta_frac", "90.000");
	setValue("gamma_frac", "120.000");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	disableElement("alpha_frac");
	disableElement("beta_frac");
	disableElement("gamma_frac");

	break;
	case ((trimSpaceGroup > 194) && (trimSpaceGroup <= 230)): // Cubic
		// lattices
		setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "90.000");
	setValue("beta_frac", "90.000");
	setValue("gamma_frac", "90.000");
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	disableElement("alpha_frac");
	disableElement("beta_frac");
	disableElement("gamma_frac");
	break;

	default:
		errorMsg("SpaceGroup not found in range.");
	return false;
	break;

	}// end switch
}

function createMolecularCrystal() {
	var value = getValue('typeMole')
	if (value == "") {
		errorMsg("You must select which sort of structure you would like to build.")
	} else if (value == "crystal") {
		_build.makeCrystalSpaceGroup = getValue('periodMole');
		getValueMakeCrystal();
	} else {
		getValueMakeCrystal();
	}
}

///TODO SAVE state before creating crystal
function getValueMakeCrystal() {
	reload('{1 1 1} spacegroup "' + _build.makeCrystalSpaceGroup
			+ '" unitcell ' + getCurrentUnitCell() + ';');
	getbyID("createmolecularCrystal").style.display = "none";
}

function enableElementPeriodicityMol() {
	enableElement("a_frac");
	enableElement("b_frac");
	enableElement("c_frac");
	enableElement("alpha_frac");
	enableElement("beta_frac");
	enableElement("gamma_frac");
	setValue("a_frac", "");
	setValue("b_frac", "");
	setValue("c_frac", "");
	setValue("alpha_frac", "");
	setValue("beta_frac", "");
	setValue("gamma_frac", "");
}

function cleanCreateCrystal() {
	setValue("a_frac", "");
	disableElement("a_frac");
	setValue("b_frac", "");
	disableElement("b_frac");
	setValue("c_frac", "");
	disableElement("c_frac");
	setValue("alpha_frac", "");
	disableElement("alpha_frac");
	setValue("beta_frac", "");
	disableElement("beta_frac");
	setValue("gamma_frac", "");
	disableElement("gamma_frac");
	document.builGroup.reset();
}

function createBuildGrp() {
	var periodicityName = new Array("select", "crystal", "film", "polymer");
	var periodicityValue = new Array("", "crystal", "slab", "polymer");

	var strBuild = "<form autocomplete='nope'  id='builGroup' name='builGroup' style='display:none'>";
	strBuild += "<table class='contents'><tr><td> \n";
	strBuild += "<h2>Build and modify</h2>\n";
	strBuild += "</td></tr>\n";
	/*
	 * strBuild += "<tr><td>\n"; strBuild += "Add new atom/s <i>via</i>
	 * internal coordinates (distance, angle and torsional)<br>" strBuild +=
	 * createCheck("addZnew", "Start procedure",
	 * 'toggleDiv(this,"addAtomZmatrix") + addAtomZmatrix(this)', "", "", "");
	 * strBuild += "<div id='addAtomZmatrix' style='display:none;
	 * margin-top:20px'>"; strBuild += "<br> Element: " + createSelect('addEleZ',
	 * '', 0, 1, 100, eleSymb, eleSymb); strBuild += "<br>"; strBuild +=
	 * createButton("addAtom", "add Atom", "addZatoms()", ""); strBuild += "</div>"
	 * strBuild += createLine('blue', ''); strBuild += "</td></tr>\n";
	 */
	strBuild += "<tr><td>\n";
	strBuild += "Add new atom/s<br>";
	strBuild += createCheck("addNewFrac", "Start procedure",
			'addAtomfrac()  + toggleDiv(this,"addAtomCrystal")', "", "", "");
	strBuild += "<div id='addAtomCrystal' style='display:none; margin-top:20px'>";
	strBuild += "<br> \n ";
	strBuild += "x <input type='text'  name='x_frac' id='x_frac' size='1' class='text'> ";
	strBuild += "y <input type='text'  name='y_frac' id='y_frac' size='1' class='text'> ";
	strBuild += "z <input type='text'  name='z_frac' id='z_frac' size='1' class='text'> ";
	strBuild += ", Element: "
		+ createSelect('addNewFracList', '', 0, 1, _constant.ELEM_SYM);
	strBuild += createButton("addNewFracListBut", "add Atom", "addNewatom()",
	"");
	strBuild += "<br><br> Read out coordinates of neighbor atom/s";
	strBuild += createRadio("coord", "fractional", 'viewCoord(value)', '', 0,
			"", "fractional");
	strBuild += createRadio("coord", "cartesian", 'viewCoord(value)', '', 0,
			"", "cartesian");
	strBuild += "</div>";
	strBuild += createLine('blue', '');
	strBuild += "</td></tr>\n";
	strBuild += "<tr><td>\n";
	strBuild += "Create a molecular CRYSTAL, FILM, POLYMER<br>";

	strBuild += createCheck(
			"createCrystal",
			"Start procedure",
			'createCrystalStr(this) + toggleDiv(this,"createmolecularCrystal")  + cleanCreateCrystal()',
			"", "", "");
	strBuild += "<div id='createmolecularCrystal' style='display:none; margin-top:20px'>";
	strBuild += "<br> Periodicity: "
		+ createSelect('typeMole', 'checkIfThreeD(value)', 0, 1,
				periodicityValue, periodicityName);
	strBuild += "<br> Space group: "
		+ createSelect('periodMole', 'setCellParamSpaceGroup(value)', 0, 1,
				_constant.SPACE_GROUP_VALUE, _constant.SPACE_GROUP_NAME)
				+ " <a href=http://en.wikipedia.org/wiki/Hermann%E2%80%93Mauguin_notation target=_blank>Hermann-Mauguin</a>"; // space
	// group
	// list
	// spageGroupName
	strBuild += "<br> Cell parameters: <br><br>";
	strBuild += "<i>a</i> <input type='text'  name='a_frac' id='a_frac' size='7' class='text'> ";
	strBuild += "<i>b</i> <input type='text'  name='b_frac' id='b_frac' size='7' class='text'> ";
	strBuild += "<i>c</i> <input type='text'  name='c_frac' id='c_frac' size='7' class='text'> ";
	strBuild += " &#197; <br>";
	strBuild += "<i>&#945;</i> <input type='text'  name='alpha_frac' id='alpha_frac' size='7' class='text'> ";
	strBuild += "<i>&#946;</i> <input type='text'  name='beta_frac' id='beta_frac' size='7' class='text'> ";
	strBuild += "<i>&#947;</i> <input type='text'  name='gamma_frac' id='gamma_frac' size='7' class='text'> ";
	strBuild += " degrees <br><br> "
		+ createButton("createCrystal", "Create structure",
				"createMolecularCrystal()", "") + "</div>";
	strBuild += createLine('blue', '');
	strBuild += "</td></tr>\n";
	strBuild += "<tr><td>\n";
	strBuild += "Optimize (OPT.) structure  UFF force filed<br>";
	strBuild += "Rappe, A. K., <i>et. al.</i>; <i>J. Am. Chem. Soc.</i>, 1992, <b>114</b>, 10024-10035. <br><br>";
	strBuild += createButton("minuff", "Optimize", "_uff.minimizeStructure()", "");
	strBuild += createCheck("fixstructureUff", "fix fragment",
			'_uff.fixFragmentUff(this) + toggleDiv(this,"fragmentSelected")', "",
			"", "")
			+ " ";
	strBuild += createButton("stopuff", "Stop Opt.", "_uff.stopOptimize()", "");
	strBuild += createButton("resetuff", "Reset Opt.", "_uff.resetOptimize()", "");
	strBuild += "</td></tr><tr><td><div id='fragmentSelected' style='display:none; margin-top:20px'>Fragment selection options:<br>";
	// strBuild += "by element "
	// + createSelectKey('colourbyElementList', "elementSelected(value)",
	// "elementSelected(value)", "", 1) + "\n";
	// strBuild += "&nbsp;by atom &nbsp;"
	// + createSelect2('colourbyAtomList', 'atomSelected(value)', '', 1)
	// + "\n";
	strBuild += createCheck("byselection", "by picking &nbsp;",
			'setPicking(this)', 0, 0, "set picking");
	strBuild += createCheck("bydistance", "within a sphere (&#197) &nbsp;",
			'setDistanceHide(this)', 0, 0, "");
	strBuild += createCheck("byplane", " within a plane &nbsp;",
			'onClickPickPlane(this,buildPickPlaneCallback)', 0, 0, "");
	strBuild += "</div>";
	strBuild += "</td></tr><tr><td>\n";
	strBuild += "<br> Structural optimization criterion: <br>";
	strBuild += "Opt. threshold <input type='text'  name='optciteria' id='optciteria' size='7'  value='0.001' class='text'> kJ*mol<sup>-1</sup> (Def.: 0.001, Min.: 0.0001) <br>";
	strBuild += "Max. No. Steps <input type='text'  name='maxsteps' id='maxsteps' size='7'  value='100' class='text'> (Def.: 100)";
	strBuild += "<tr><td>";
	strBuild += "<br> Optimization Output: <br>";
	strBuild += createTextArea("textUff", "", 4, 50, "");
	strBuild += createLine('blue', '');
	strBuild += "</td></tr>\n";
	strBuild += "</table>\n";
	strBuild += "</form>\n";
	return strBuild;
}


function enterCell() {
	getUnitcell(_file.frameValue);
//	//getSymInfo();
}

function exitCell() {
}

function saveFractionalCoordinate() {
	warningMsg("Make sure you have selected the model you would like to export.");

	if (_file.frameSelection == null)
		getUnitcell("1");

	var x = "var cellp = [" + roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.b)
	+ ", " + roundNumber(_file.cell.c) + ", " + roundNumber(_file.cell.alpha) + ", "
	+ roundNumber(_file.cell.beta) + ", " + roundNumber(_file.cell.gamma) + "];"
	+ 'var cellparam = cellp.join(" ");' + 'var xyzfrac = '
	+ _file.frameSelection + '.label("%a %16.9[fxyz]");'
	+ 'var lista = [cellparam, xyzfrac];'
	+ 'WRITE VAR lista "?.XYZfrac" ';
	runJmolScriptWait(x);
}

//This reads out cell parameters given astructure.
function getUnitcell(i) {
	// document.cellGroup.reset();
	_file.cell.typeSystem = "";
	var StringUnitcell = "auxiliaryinfo.models[" + (i || 1) + "].infoUnitCell";
	var cellparam = extractInfoJmol(StringUnitcell);

	_file.cell.a = roundNumber(cellparam[0]);
	_file.cell.b = roundNumber(cellparam[1]);
	_file.cell.c = roundNumber(cellparam[2]);
	_file.cell.dimensionality = parseFloat(cellparam[15]);
	_file.cell.volumeCell = roundNumber(cellparam[16]);

	var bOvera = roundNumber(parseFloat(_file.cell.b / _file.cell.c));
	var cOvera = roundNumber(parseFloat(_file.cell.c / _file.cell.a));

	switch (_file.cell.dimensionality) {
	case 1:
		_file.cell.b = 0.000;
		_file.cell.c = 0.000;
		enableElement("par_a");
		setValue("par_a", "");
		disableElement("par_b");
		setValue("par_b", "1");
		disableElement("par_c");
		setValue("par_c", "1");
		setValue("bovera", "0");
		setValue("covera", "0");
		_file.cell.typeSystem = "polymer";
		break;
	case 2:
		_file.cell.c = 0.000;
		_file.cell.typeSystem = "slab";
		enableElement("par_a");
		setValue("par_a", "");
		enableElement("par_b");
		setValue("par_b", "");
		disableElement("par_c");
		setValue("par_c", "1");
		setValue("bovera", bOvera);
		setValue("covera", "0");
		break;
	case 3:
		_file.cell.typeSystem = "crystal";
		_file.cell.alpha = cellparam[3];
		_file.cell.beta = cellparam[4];
		_file.cell.gamma = cellparam[5];
		enableElement("par_a");
		setValue("par_a", "");
		enableElement("par_b");
		setValue("par_b", "");
		enableElement("par_c");
		setValue("par_c", "");
		setValue("bovera", bOvera);
		setValue("covera", cOvera);
		break;
	default:
	  if (!cellparam[0] && !cellparam[1] && !cellparam[2] && !cellparam[4]) {
		_file.cell.a = 0.00;
		_file.cell.b = 0.00;
		_file.cell.c = 0.00;
		_file.cell.alpha = 0.00;
		_file.cell.beta = 0.00;
		_file.cell.gamma = 0.00;
		_file.cell.typeSystem = "molecule";
		setValue("bovera", "0");
		setValue("covera", "0");
	  }
	}
	setValue("cell.a", roundNumber(_file.cell.a));
	setValue("cell.b", roundNumber(_file.cell.b));
	setValue("cell.c", roundNumber(_file.cell.c));
	setValue("cell.alpha", roundNumber(_file.cell.alpha));
	setValue("cell.beta", roundNumber(_file.cell.beta));
	setValue("cell.gamma", roundNumber(_file.cell.gamma));
	setValue("cell.volumeCell", roundNumber(_file.cell.volumeCell));

}

function setUnitCell() {
	getUnitcell(_file.frameValue);
	if (_file.frameSelection == null || _file.frameSelection == "" || _file.frameValue == ""
		|| _file.frameValue == null) {
		_file.frameSelection = "{1.1}";
		_file.frameNum = "1.1";
		getUnitcell("1");
	}
}
////END OPEN SAVE FUNCTIONS

///////////////
//////////////CELL AND ORIENTATION FUNCTION
/////////////

function setCellMeasure(value) {
	_file.cell.typeSystem = "";
	var i = _file.frameValue;
	var StringUnitcell = "auxiliaryinfo.models[" + (i || 1) + "].infoUnitCell";
	var cellparam = extractInfoJmol(StringUnitcell);
	_file.cell.a = cellparam[0];
	_file.cell.b = cellparam[1];
	_file.cell.c = cellparam[2];
	if (value == "a") {
		setValue("cell.a", roundNumber(_file.cell.a));
		setValue("cell.b", roundNumber(_file.cell.b));
		setValue("cell.c", roundNumber(_file.cell.c));
	} else {
		_file.cell.a *= 1.889725989;
		_file.cell.b *= 1.889725989;
		_file.cell.c *= 1.889725989;
		setValue("cell.a", roundNumber(_file.cell.a));
		setValue("cell.b", roundNumber(_file.cell.b));
		setValue("cell.c", roundNumber(_file.cell.c));
	}
}

function setCellDotted() {
	var cella = checkBoxX('cellDott');
	if (cella == "on") {
		runJmolScriptWait("unitcell DOTTED ;");
	} else {
		runJmolScriptWait("unitcell ON;");
	}
}

var getCurrentPacking = function() {
	// BH 2018
	getValue("par_a") || setValue("par_a", 1);
	getValue("par_b") || setValue("par_b", 1);
	getValue("par_c") || setValue("par_c", 1);
	return '{ ' + getValue("par_a") + ' ' + getValue("par_b") + ' ' + getValue("par_c") + '} ';
}

var getCurrentUnitCell = function() {
	return '[ ' + parseFloat(getValue('a_frac')) + ' '
		+ parseFloat(getValue('b_frac')) + ' '
		+ parseFloat(getValue('c_frac')) + ' '
		+ parseFloat(getValue('alpha_frac')) + ' '
		+ parseFloat(getValue('beta_frac')) + ' '
		+ parseFloat(getValue('gamma_frac')) + ' ]'
}
//This gets values from textboxes using them to build supercells
function setPackaging(packMode) {
	var filter = getKindCell();
	var cell = getCurrentPacking();
	// BH 2018 adds save/restore orientation
	runJmolScriptWait('save orientation o;');
	var checkboxSuper = checkBoxX("supercellForce");
	if (checkboxSuper == "on") {
		warningMsg("You decided to constrain your original supercell to form a supercell. \n The symmetry was reduced to P1.");
		reload("{1 1 1} SUPERCELL " + cell + packMode, filter);
	} else {
		reload(cell + packMode, filter);
	}
	runJmolScriptWait("restore orientation o;");
	setUnitCell();
}


var getKindCell = function() {
	var kindCell = getbyName("cella");
	var kindCellfinal = null;
	for (var i = 0; i < kindCell.length; i++)
		if (kindCell[i].checked)
			return kindCell[i].value;
	return "";
}

function setPackRangeAndReload(val) {
	_cell.packRange = val;
	reload("{1 1 1} RANGE " + val, getKindCell());
	//cellOperation();
}

function checkPack() {
	uncheckBox("superPack");
	// This initialize the bar
	getbyID("slider.packMsg").innerHTML = 0 + " &#197";
}

function uncheckPack() {
	uncheckBox("chPack");
	getbyID("packDiv").style.display = "none";
	setCellType(getKindCell());
}

function setCellType(value) {
	// BH 2018 Q: logic here?
	var valueConv = checkBoxX("superPack");
	var checkBoxchPack = checkBoxX("chPack");
	if (valueConv == "on" && checkBoxchPack == "off") {
		reload(null, value);
	} else if (valueConv == "off" && checkBoxchPack == "on") {
		reload("{1 1 1} RANGE " + _cell.packRange, value);
	} else {
		reload(null, value);
	}
	//cellOperation();
}

function applyPack(range) {
	setPackRangeAndReload(parseFloat(range).toPrecision(2));
	getbyID("slider.packMsg").innerHTML = _cell.packRange + " &#197";
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
	//cellOperation();
}

function setFashionAB(valueList) {

	var radio = getbyName("abFashion");
	for (var i = 0; i < radio.length; i++) {
		if (radio[i].checked == true)
			var radioValue = radio[i].value;
	}

	var fashion = (radioValue == "on") ? 'OPAQUE' : 'TRANSLUCENT';

	if (valueList != "select")
		runJmolScriptWait('color ' + valueList + ' ' + fashion);
}

function setUnitCellOrigin(value) {
	runJmolScriptWait("unitcell { " + value + " }");
	var aval = value.split(" ");
	setValue("par_x", eval(aval[0]));
	setValue("par_y", eval(aval[1]));
	setValue("par_z", eval(aval[2]));
}





function createCellGrp() {
	var unitcellName = new Array("0 0 0", "1/2 1/2 1/2", "1/2 0 0", "0 1/2 0",
			"0 0 1/2", "-1/2 -1/2 -1/2", "1 1 1", "-1 -1 -1", "1 0 0", "0 1 0",
	"0 0 1");
	var unitcellSize = new Array("1", "2", "3", "4", "5", "6", "7", "8", "9",
			"10", "11", "12", "13", "14", "15", "16", "17", "18", "19");
	var strCell = "<form autocomplete='nope'  id='cellGroup' name='cellGroup' style='display:none'>";
	strCell += "<table class='contents'><tr><td><h2>Cell properties</h2></td></tr>\n";
	strCell += "<tr><td colspan='2'>"
		+ createCheck("cell", "View Cell",
				"setJmolFromCheckbox(this, this.value)", 0, 1, "unitcell");
	strCell += createCheck("axes", "View axes",
			"setJmolFromCheckbox(this, this.value)", 0, 1, "set showAxes");
	strCell += "</td></tr><tr><td> Cell style:  \n";
	strCell += "size "
		+ createSelectFunc('offsetCell',
				'runJmolScriptWait("set unitcell " + value + ";")',
				'setTimeout("runJmolScriptWait("set unitcell " + value +";")",50)', 0,
				1, unitcellSize, unitcellSize) + "\n";
	strCell += " dotted "
		+ createCheck("cellDott", "dotted, ", "setCellDotted()", 0, 0,
		"DOTTED") + "  color ";
	strCell += "</td><td align='left'>\n";
	strCell += "<script align='left'>jmolColorPickerBox([setColorWhat, 'unitCell'],[0,0,0],'unitcellColorPicker')</script>";
	strCell += "</td></tr>\n";
	// strCell += createLine('blue', '');
	strCell += "<tr><td colspan='2'>Set cell:  \n";

	strCell += createRadio("cella", "primitive", 'setCellType(value)', 0, 1,
			"primitive", "primitive")
			+ "\n";
	strCell += createRadio("cella", "conventional", 'setCellType(value)', 0, 0,
			"conventional", "conventional")
			+ "\n";
	strCell += "</td></tr>\n";
	strCell += "<tr><td> \n";
	strCell += createCheck('superPack', 'Auto Pack', 'uncheckPack()', 0, 1, '')
	+ " ";
	strCell += createCheck('chPack', 'Choose Pack Range',
			'checkPack() + toggleDiv(this,"packDiv")', '', '', '');
	strCell += "</td></tr>\n";
	strCell += "<tr><td> \n";
	strCell += "<div id='packDiv' style='display:none; margin-top:30px'>";
	strCell += createSlider("pack");
	strCell += "</div></td></tr>\n";
	strCell += "<tr><td colspan='2'> \n";
	strCell += createLine('blue', '');
	strCell += "Supercell: <br>";
	strCell += "</td></tr><tr><td colspan='2'>\n";
	strCell += "<i>a: </i>";
	strCell += "<input type='text'  name='par_a' id='par_a' size='1' class='text'>";
	strCell += "<i> b: </i>";
	strCell += "<input type='text' name='par_b' id='par_b' size='1' class='text'>";
	strCell += "<i> c: </i>";
	strCell += "<input type='text'  name='par_c' id='par_c' size='1' class='text'> &#197;";
	strCell += createCheck('supercellForce', 'force supercell (P1)', '', '',
			'', '')
			+ "<br>\n";
	strCell += createButton('set_pack', 'pack', 'setPackaging("packed")', '') + " \n";
	strCell += createButton('set_pack', 'centroid', 'setPackaging("centroid")', '') + " \n";
	strCell += createButton('set_pack', 'unpack', 'setPackaging("")', '') + " \n";
	strCell += createLine('blue', '');
	strCell += "</td></tr>\n";
	strCell += "<tr><td colspan='2'> \n";
	strCell += "Offset unitcell \n<br>";
	strCell += "Common offsets "
		+ createSelectFunc('offsetCell', 'setUnitCellOrigin(value)',
				'setTimeout("setUnitCellOrigin(value)",50)', 0, 1,
				unitcellName, unitcellName) + "\n";
	strCell += "<br>  \n"
		strCell += createButton('advanceCelloffset', '+',
				'toggleDivValue(true,"advanceCelloffDiv",this)', '')
				+ " Advanced cell-offset options <br>"
				strCell += "<div id='advanceCelloffDiv' style='display:none; margin-top:20px'>"
					+ createCheck("manualCellset", "Manual set",
							'checkBoxStatus(this, "offsetCell")', 0, 0, "manualCellset")
							+ "\n";
	strCell += " x: ";
	strCell += "<input type='text'  name='par_x' id='par_x' size='3' class='text'>";
	strCell += " y: ";
	strCell += "<input type='text'  name='par_y' id='par_y' size='3' class='text'>";
	strCell += " z: ";
	strCell += "<input type='text'  name='par_z' id='par_z' size='3' class='text'>";
	strCell += createButton('setnewOrigin', 'set', 'setManualOrigin()', '')
	+ " \n";
	strCell += "</div>";
	strCell += createLine('blue', '');
	strCell += "</td></tr>\n";
	strCell += "<tr ><td colspan='2'>\n";
	strCell += "Cell parameters (selected model)<br>\n";
	strCell += "Unit: "
		+ createRadio("cellMeasure", "&#197", 'setCellMeasure(value)', 0,
				1, "", "a") + "\n";
	strCell += createRadio("cellMeasure", "Bohr", 'setCellMeasure(value)', 0,
			0, "", "b")
			+ "\n <br>";
	strCell += "<i>a</i> " + createText2("cell.a", "", 7, 1);
	strCell += "<i>b</i> " + createText2("cell.b", "", 7, 1);
	strCell += "<i>c</i> " + createText2("cell.c", "", 7, 1) + "<br><br>\n";
	strCell += "<i>&#945;</i> " + createText2("cell.alpha", "", 7, 1);
	strCell += "<i>&#946;</i> " + createText2("cell.beta", "", 7, 1);
	strCell += "<i>&#947;</i> " + createText2("cell.gamma", "", 7, 1)
	+ " degrees <br><br>\n";
	strCell += "Volume cell " + createText2("cell.volumeCell", "", 10, 1)
	+ "  &#197<sup>3</sup><br><br>";
//	strCell += createButton('advanceCell', '+',
//			'toggleDivValue(true,"advanceCellDiv",this)', '')
//			+ " Advanced cell options <br>";
	strCell += "<div id='advanceCellDiv' style='display:block; margin-top:20px'>"
	strCell += "<i>b/a</i> " + createText2("bovera", "", 8, 1) + " ";
	strCell += "<i>c/a</i> " + createText2("covera", "", 8, 1);
	strCell += "</div>"
		strCell += createLine('blue', '');
	strCell += "</td></tr>\n";
	strCell += "<tr><td colspan='2'> \n";
	strCell += "</td></tr>\n";
	strCell += "</table></FORM>\n";
	return strCell;
}

_edit = {
	deleteMode : "",
	hideMode : "",
	displayMode : "",
	firstTimeEdit : true,
	radBondRange : ""
}

function enterEdit() {

	_slider.radiiConnect.recalculate();

	setRadiiConnectMessage(_slider.radiiConnect.getValue());
	
	// BH 2018: Disabled -- unexpected behavior should not be on tab entry
//	if (_edit.firstTimeEdit) {
//		_slider.radiiConnect.setValue(50);
//		runJmolScriptWait("set forceAutoBond ON; set bondMode AND");
//	}
//	getbyID("radiiConnectMsg").innerHTML = " " + 2.5 + " &#197";
//	setTimeout("runJmolScriptWait(\"restore BONDS bondEdit\");", 400);
//	_edit.firstTimeEdit = false;

}

function exitEdit() {
}

function showPickPlaneCallback() {
	var distance = prompt('Enter the distance (in \305) within you want to select atoms. \n Positive values mean from the upper face on, negative ones the opposite.', '1');
	if (distance != null && distance != "") {
		runJmolScriptWait('select within(' + distance + ',plane,$plane1)');
//		_edit.hideMode = " hide selected";
//		_edit.deleteMode = " delete selected";
//		_pick.colorWhat = "color atoms";
	}
}


function setRadiiConnectMessage(r) {
	getbyID('slider.radiiConnectMsg').innerHTML = " " + r.toPrecision(2) + " &#197";
}

function applyConnect(r) {
	if (_edit.firstTimeEdit) {
//		runJmolScriptWait("connect (*) (*) DELETE; connect 2.0 (*) (*) single ModifyOrCreate;");
	} else {
		var flagBond = checkBoxX("allBondconnect");
		// alert(flagBond);
		// alert(_file.frameNum);
		if (_file.frameNum == null || _file.frameNum == '') {
			getUnitcell("1");
			_file.frameNum = 1.1;
		} else {

		}
		if (flagBond == 'off') {
			runJmolScriptWait("select " + _file.frameNum
					+ "; connect  (selected) (selected)  DELETE");
			runJmolScriptWait("connect " + r
					+ " (selected) (selected) single ModifyOrCreate;");
		} else {
			runJmolScriptWait("connect (*) (*) DELETE; connect " + r
					+ " (*) (*) single ModifyOrCreate;");
		}
		runJmolScriptWait("save BONDS bondEdit");
	}
	setRadiiConnectMessage(r);
}

function deleteAtom() {
	runJmolScriptWait(_edit.deleteMode);
	runJmolScriptWait('draw off');
}

function hideAtom() {
	runJmolScriptWait(_edit.hideMode);
	runJmolScriptWait('draw off');
}

function connectAtom() {
	var styleBond = getValue("setBondFashion");
	if (styleBond == "select") {
		errorMsg("Please select type of bond!");
		return false;
	}

	if (_edit.radbondVal == "all") {
		if (_edit.radBondRange == "just") {
			var bondRadFrom = getValue("radiuscoonectFrom");
			if (bondRadFrom == "") {
				errorMsg("Please, check values entered in the textboxes");
				return false;
			}
			// alert(bondRadFrom)
			runJmolScriptWait("connect (all) (all) DELETE; connect " + bondRadFrom
					+ " (all) (all) " + styleBond + " ModifyOrCreate;");
		} else {
			var bondRadFrom = getValue("radiuscoonectFrom");
			var bondRadTo = getValue("radiuscoonectTo");
			if (bondRadFrom == "" && bondRadTo == "") {
				errorMsg("Please, check values entered in the textboxes.");
				return false;
			}
			if (bondRadTo <= bondRadFrom) {
				errorMsg("Please, check the range value entered.");
				return false;
			}
			runJmolScriptWait("connect (all) (all) DELETE; connect " + bondRadFrom + " "
					+ bondRadTo + " (all) (all) " + styleBond
					+ " ModifyOrCreate;");
		}
	} else if (_edit.radbondVal == "atom") {
		var atomFrom = getValue("connectbyElementList");
		var atomTo = getValue("connectbyElementListone");
		if (_edit.radBondRange == "just") {
			var bondRadFrom = getValue("radiuscoonectFrom");
			if (bondRadFrom == "") {
				errorMsg("Please, check values entered in the textboxes");
				return false;
			}
			// alert(bondRadFrom)
			runJmolScriptWait("connect (" + atomFrom + ") (" + atomTo + ") DELETE; connect "
					+ bondRadFrom + " (" + atomFrom + ") (" + atomTo + ") "
					+ styleBond + " ModifyOrCreate;");
		} else {
			var bondRadFrom = getValue("radiuscoonectFrom");
			var bondRadTo = getValue("radiuscoonectTo");
			if (bondRadFrom == "" && bondRadTo == "") {
				errorMsg("Please, check values entered in the textboxes.");
				return false;
			}
			if (bondRadTo <= bondRadFrom) {
				errorMsg("Please, check the range value entered.");
				return false;
			}
			runJmolScriptWait("connect (" + atomFrom + ") (" + atomTo + ") DELETE; connect "
					+ bondRadFrom + " " + bondRadTo + " (" + atomFrom + ") ("
					+ atomTo + ") " + styleBond + " ModifyOrCreate;");
		}

	} else if (_edit.radbondVal == "selection") {
		runJmolScriptWait("connect (selected) (selected) " + styleBond + " ModifyOrCreate;");
	}
}

function deleteBond() {
	var styleBond = getValue("setBondFashion");

	if (_edit.radbondVal == "all") {
		if (_edit.radBondRange == "just") {
			var bondRadFrom = getValue("radiuscoonectFrom");
			if (bondRadFrom == "") {
				runJmolScriptWait("connect (all) (all)  DELETE;");
				return false;
			}
			// alert(bondRadFrom)
			runJmolScriptWait("connect " + bondRadFrom + " (all) (all)  DELETE;");
		} else {
			var bondRadFrom = getValue("radiuscoonectFrom");
			var bondRadTo = getValue("radiuscoonectTo");
			if (bondRadFrom == "" && bondRadTo == "") {
				runJmolScriptWait("connect (all) (all)  DELETE;");
				return false;
			}
			runJmolScriptWait("connect " + bondRadFrom + " " + bondRadTo
					+ " (all) (all)  DELETE;");
		}
	} else if (_edit.radbondVal == "atom") {
		var atomFrom = getValue("connectbyElementList");
		var atomTo = getValue("connectbyElementListone");
		if (_edit.radBondRange == "just") {
			var bondRadFrom = getValue("radiuscoonectFrom");
			if (bondRadFrom == "") {
				runJmolScriptWait("connect (" + atomFrom + ") (" + atomTo + ") DELETE;");
				return false;
			}
			// alert(bondRadFrom)
			runJmolScriptWait(" connect " + bondRadFrom + " (" + atomFrom + ") (" + atomTo
					+ ") DELETE;");
		} else {
			var bondRadFrom = getValue("radiuscoonectFrom");
			var bondRadTo = getValue("radiuscoonectTo");
			if (bondRadFrom == "" && bondRadTo == "") {
				runJmolScriptWait("connect (" + atomFrom + ") (" + atomTo + ") DELETE;");
				return false;
			}
			runJmolScriptWait("connect " + bondRadFrom + " " + bondRadTo + " (" + atomFrom
					+ ") (" + atomTo + ") DELETE;");
		}

	} else if (_edit.radbondVal == "selection") {
		runJmolScriptWait("connect (selected) (selected) " + styleBond + " DELETE;");
	}
}

function checkBondStatus(radval) {
	runJmolScriptWait("select *; halos off; label off; select none;");
	_edit.radbondVal = radval;
	if (_edit.radbondVal == "selection") {
		for (var i = 0; i < document.editGroup.range.length; i++)
			document.editGroup.range[i].disabled = true;
		runJmolScriptWait('showSelections TRUE; select none; set picking identify; halos on;');
		getbyID("connectbyElementList").disabled = true;
		getbyID("connectbyElementListone").disabled = true;
	} else {
		for (var i = 0; i < document.editGroup.range.length; i++)
			document.editGroup.range[i].disabled = false;

		getbyID("radiuscoonectFrom").disabled = true;
		getbyID("radiuscoonectTo").disabled = true;
		getbyID("connectbyElementList").disabled = true;
		getbyID("connectbyElementListone").disabled = true;

		if (_edit.radbondVal == "atom") {
			getbyID("connectbyElementList").disabled = false;
			getbyID("connectbyElementListone").disabled = false;
		}
	}

}

function checkWhithin(radVal) {
	_edit.radBondRange = radVal;
	if (_edit.radBondRange == "just") {
		getbyID("radiuscoonectFrom").disabled = false;
		getbyID("radiuscoonectTo").disabled = true;
	} else {
		getbyID("radiuscoonectFrom").disabled = false;
		getbyID("radiuscoonectTo").disabled = false;
	}

}

//Fix .AtomName
function changeElement(value) {
	var script = '{selected}.element = "' + value + '";'
	+'{selected}.ionic = "' + value + '";'
	+'label "%e";font label 16;draw off';
	runJmolScriptWait(script);
	updateElementLists();
}

function elementSelectedDelete(element) {
	selectElement(element);
	_edit.deleteMode = "delete _" + element;
	return _edit.deleteMode;
}

function elementSelectedHide(element) {
	selectElement(element);
	_edit.hideMode = "hide _" + element;
	return _edit.hideMode;
}

//function elementSelectedDisplay(element) {
//	selectElement(element);
//	_edit.displayMode = "display _" + element;
//	return _edit.displayMode;
//}

function selectElement(element) {
	runJmolScriptWait("select _" + element + ";selectionhalos on");

}

function selectAll() {
	runJmolScriptWait("select *;halos on;");
}

//function selectAllDelete() {
//	selectAll();
//	// BH: REALLY?
//	runJmolScriptWait("select *; halos on; label on;");
//	_edit.deleteMode = "select *; delete; select none ; halos off; draw off;";
//	return _edit.deleteMode;
//}
//
//function selectAllHide() {
//	runJmolScriptWait("select *; halos on; label on;");
//	_edit.hideMode = "select *; hide selected; select none; halos off; draw off;";
//	return _edit.hideMode;
//}



function createEditGrp() {
	var bondValue = new Array("select", "single", "partial", "hbond", "double",
			"aromatic", "partialDouble", "triple", "partialTriple",
	"parialTriple2");
	var strEdit = "<form autocomplete='nope'  id='editGroup' name='editGroup' style='display:none'>";
	strEdit += "<table class='contents'><tr><td > \n";
	strEdit += "<h2>Edit structure</h2>\n";
	strEdit += "</td></tr>\n";
	strEdit += "<tr><td>\n";
	strEdit += "Select atom/s by:\n";
	strEdit += "</td><tr>\n";
	strEdit += "<tr><td colspan='2'>";
	strEdit += "by element "
		+ createSelect2(
				"deletebyElementList",
				"elementSelectedDelete(value) + elementSelectedHide(value) ",
				false, 1) + "\n";
	// strEdit += "&nbsp;by atom &nbsp;"
	// + createSelect2('deltebyAtomList',
	// 'atomSelectedDelete(value) + atomSelectedHide(value) ', '',
	// 1) + "\n";
	strEdit += createButton("byselection", "by picking &nbsp;",
	'runJmolScriptWait("select {};set picking select atom; selectionhalos on")', '');
//	strEdit += createCheck("bydistance", "within a sphere (&#197); &nbsp;",
//			'setDistanceHide(this)', 0, 0, "");
	strEdit += "</td></tr><tr><td colspan='2'>\n"
		strEdit += createCheck("byplane", "within a plane &nbsp;",
				'onClickPickPlane(this,editPickPlaneCallback)', 0, 0, "");
	strEdit += "</td></tr><tr><td colspan='2'>\n";
	strEdit += createButton('edit_selectAll', 'select All',
			'selectAll()', '')
			+ "\n";
	strEdit += createButton('unselect', 'unselect All',
			'runJmolScriptWait("select *; halos off; label off")', '')
			+ "\n";
	strEdit += createButton('halooff', 'Halo/s off',
			'runJmolScriptWait("halos off; selectionhalos off" )', '')
			+ "\n";
	strEdit += createButton('label All', 'Label All',
			'runJmolScriptWait("select *; label on")', '')
			+ "\n";
	strEdit += createButton('label off', 'Label off',
			'runJmolScriptWait("select *; label off")', '')
			+ "\n";
	strEdit += createLine('blue', '');
	strEdit += "</td></tr>\n";
	strEdit += "<tr><td colspan='2'>\n";
	strEdit += "Rename atom/s<br>";
	strEdit += "Element Name ";
	strEdit += createSelect('renameEle', 'changeElement(value)', 0, 1,
			_constant.ELEM_SYM);
	strEdit += createLine('blue', '');
	strEdit += "</td></tr>\n";
	strEdit += "<tr><td colspan='2'>\n";
	strEdit += "Remove / hide atom/s <br>";
	strEdit += createButton('Delete atom', 'Delete atom/s', 'deleteAtom()', '')
	+ "\n";
	strEdit += createButton('Hide atom/s', 'Hide atom/s', 'hideAtom()', '')
	+ "\n";
	strEdit += createButton('Display atom', 'Display hidden atom/s',
			'runJmolScriptWait("select hidden; display")', '')
			+ "\n";
	strEdit += createLine('blue', '');
	strEdit += "</td></tr>\n";
	strEdit += "<tr><td >";
	strEdit += "Connectivity</a>";
	strEdit += "</td><td>";
	strEdit += createSlider("radiiConnect");
	strEdit += '<br>'
		+ createCheck('allBondconnect', 'apply to all structures', '', 0,
				1, '');
	strEdit += "</td></tr>";
	strEdit += "<tr><td colspan='2'>\n";
	strEdit += createButton('advanceEdit', '+',
			'toggleDivValue(true,"advanceEditDiv",this)', '')
			+ " Advanced options <br>"
			strEdit += "<div id='advanceEditDiv' style='display:none; margin-top:20px'>";
	strEdit += "Connect by:\n";
	strEdit += createRadio("connect", "selection", 'checkBondStatus(value)', 0,
			0, "connect", "selection");
	strEdit += createRadio("connect", "by element", 'checkBondStatus(value)',
			0, 0, "connect", "atom");
	strEdit += createRadio("connect", "all", 'checkBondStatus(value)', 0, 0,
			"connect", "all")
			+ "<br>\n";
	strEdit += "From " + createSelect2("connectbyElementList", "", false, 1) + " ";
	strEdit += "To " + createSelect2("connectbyElementListone", "", false, 1)
	+ "<br>\n";
	strEdit += "Mode "
		+ createRadio("range", "whithin", 'checkWhithin(value)', 'disab',
				0, "range", "just");
	strEdit += createRadio("range", "whithin a range", 'checkWhithin(value)',
			'disab', 0, "range", "range")
			+ "<br>\n";
	strEdit += "From / whithin "
		+ createText2("radiuscoonectFrom", "", "2", "disab") + " ";
	strEdit += " to " + createText2("radiuscoonectTo", "", "2", "disab")
	+ " &#197;";
	strEdit += "<br> Style bond "
		+ createSelect('setBondFashion', '', 0, 1, bondValue) + "<br> \n";
	strEdit += createButton('connect2', 'Connect atom', 'connectAtom()', '');
	strEdit += createButton('connect0', 'Delete bond', 'deleteBond()', '')
	+ "<br>\n";
	strEdit += "</div>";
	strEdit += createLine('blue', '');
	strEdit += "</td></tr>\n";
	strEdit += "</table></FORM>\n";
	return strEdit;
}
function enterElec() {
//	saveOrientation_e();
}

function exitElec() {
}


function setColorMulliken(value) {
	runJmolScriptWait('set propertyColorScheme "' + value + '";select *;font label 18; color {*} property partialCharge; label %5.3P');
}



//function exitMenu() {
//runJmolScriptWait('label off; select off');
//}

function removeCharges() {
}
// BH TODO - need to clear this without reloading
//runJmolScriptWait('script scripts/reload.spt');
//restoreOrientation_e();



function createElecpropGrp() {

	var colSchemeName = new Array("Rainbow (default)", "Black & White",
			"Blue-White-Red", "Red-Green", "Green-Blue");
	var colSchemeValue = new Array('roygb', 'bw', 'bwr', 'low', 'high');
	var strElec = "<form autocomplete='nope' style='display:none' id='elecGroup' name='elecGroup'";
	strElec += "<table class='contents'><tr><td ><h2>Electronic - Magnetic properties</h2> \n";
	strElec += "</td></tr>\n";
	strElec += "<tr><td>\n";
	strElec += "Mulliken population analysis\n <br>";
	strElec += createButton("mulliken", "view Mulliken",
			'runJmolScriptWait("script scripts/mulliken.spt")', 0);
	strElec += "<br> Colour-scheme "
		+ createSelect('chergeColorScheme', 'setColorMulliken(value)', 0, 0,
				colSchemeValue, colSchemeName)
				+ "&nbsp<br>";
	strElec += "</td></tr>\n";
	strElec += "<tr><td>\n";
	strElec += "Spin arrangment\n <br>";
	strElec += createButton("spin", "view Spin",
			'runJmolScriptWait("script scripts/spin.spt")', 0);
	strElec += " ";
	strElec += createButton("magnetiMoment", "view Magnetic Moment",
			'runJmolScript("script scripts/spin.spt")', 0);
	strElec += "<br> View only atoms with spin "
		+ createButton("spindown", "&#8595",
				'runJmolScriptWait("display property_spin <= 0")', 0);
	strElec += createButton("spinup", "&#8593",
			'runJmolScriptWait("display property_spin >= 0")', 0);
	// strElec+=createButton("magneticMoment","magn. Moment",'',0);
	//strElec += "</td></tr>\n";
	//strElec += "<tr><td>\n";
	strElec += createLine('blue', '');
	strElec += createButton("Removeall", "Remove", 'removeCharges()', 0);
	strElec += "</td></tr>\n";
	strElec += "<tr><td>\n";
	strElec += createLine('blue', '');
	strElec += "</td></tr>\n";
	strElec += "</table></form> \n";
	return strElec;
}





var _fileIsReload;

var sampleOptionArr = ["Load a Sample File", 
	"MgO slab", 
	"urea single-point calculation", 
	"benzene single-point calculation", 
	"NH3 geometry optimization", 
	"NH3 vibrations", 
	"Formic acid slab fragment vibrations",
	"quartz CIF", 
	"ice.out", 
	"=AMS/rutile (11 models)",
	"urea VASP test"
]

var onChangeLoadSample = function(value) {
	var fname = null;
	switch(value) {
	case "urea VASP test":
		fname = "output/vasp/Urea_vasp5.dat"
		break;
	case "=AMS/rutile (11 models)":
		fname = "output/rutile.cif";
		break;
	case "Formic acid slab fragment vibrations":
		fname = "output/vib-freq/formic_on_ha.out";
		break;
	case "quartz CIF":
		fname = "output/quartz.cif";
		break;
	case "quartz CIF":
		fname = "output/quartz.cif";
		break;
	case "ice.out":
		fname = "output/ice.out";
		break;
	case "MgO slab":
		fname = "output/cube_mgo_slab/mgo_slab_100_5l.out";
		break;
	case "urea single-point calculation":
		fname = "output/cube_urea_diff/urea-test12.out";
		break;
	case "benzene single-point calculation":
		fname = "output/single-point/c6h6_b3_631gdp.out";
		break;
	case "NH3 geometry optimization":
		fname = "output/geom-opt/nh3_pbe_631gdp_opt.out";
		break;
	case "NH3 vibrations":
		fname = "output/vib-freq/nh3_pbe_631gdp_freq.out";
		break;
	}
	if (fname) {
		runJmolScriptWait("zap;set echo top left; echo loading " + fname +"...");
		runJmolScript("load '" + fname + "' " + getValue("modelNo") + " packed");
	}
}



function enterFile() {
	
}

function exitFile() {
}

var file_method = function(methodName, defaultMethod, params) {
	// Execute a method specific to a given file type, for example:
	// var loadDone_crystal
	params || (params = []);
	methodName += "_" + _file.fileType;
	var f = self[methodName] || defaultMethod;
	return (f && f.apply(null, params));
}

var reload = function(packing, filter, more) {	
	// no ZAP here
	runJmolScriptWait("set echo top left; echo reloading...;");
	loadFile("", packing, filter, more);
//	runJmolScript("load '' " + packing + filter);
	//+ ";" + more + ';echo;frame all;frame title "@{_modelName}";frame FIRST;');
//	setFileName();
//	getUnitcell(1);
}

var loadUser = function(packing, filter) {
	loadFile("?", packing, filter);
}

var loadFile = function(fileName, packing, filter, more) {
	packing || (packing = "");
	filter = (filter ? " FILTER '" + filter + "'" : "");
	more || (more = "");
	_fileIsReload = !fileName;
	if (!_fileIsReload) {
		runJmolScriptWait("zap;");
	}
	// ZAP will clear the Jmol file cache
	runJmolScript("load '" + fileName + "' " + packing + filter + ";" + more);
}

var setDefaultJmolSettings = function() {
	runJmolScriptWait('select all; wireframe 0.15; spacefill 20% ;cartoon off; backbone off;');
	_slider.radii.setValue(20);
	_slider.bond.setValue(15);
	// _slider.radiiConnect.setValue(20);
//	getbyID('radiiMsg').innerHTML = 20 + "%";
//	getbyID('bondMsg').innerHTML = 0.15 + " &#197";

	/*
	 * getbyID('globalAtomicRadii').innerHTML = 20 ;
	 * getbyID('sliderGlobalAtomicRadii').style.left=20+'px';
	 * getbyID('globalBondWidths').innerHTML = 0.20;
	 * getbyID('sliderGlobalBondWidths').style.left=20+'px';
	 * getbyID('sepcLight').innerHTML = 22 + " % ";
	 * getbyID('sliderSepcLight').style.left=20+'px';
	 * getbyID('Ambient').innerHTML = 45 + " % ";
	 * getbyID('sliderAmbient').style.left=45+'px'; getbyID('Diffuse').innerHTML =
	 * 45 + " % "; getbyID('sliderDiffuse').style.left=45+'px';
	 * getbyID('sliderPerspective').style.left= 66+'px';
	 * getbyID('sliderGlobalBond').style.left= 20 + 'px';
	 * getbyID('globalBondCon').innerHTML = 2 + " ";
	 */

	// getbyID("packrange").innerHTML = 0 + " &#197"
	// getbyID('Perspective').innerHTML = 3;
}

var onChangeLoad = function(load) {
//	formResetAll();
	switch (load) {
	case "loadC":
	case "loadaimsfhi":
	case "loadOutcastep":
	case "loadcastep":
	case "loadDmol":
	case "loadgauss":
	case "loadgromacs":
	case "loadGulp":
	case "loadmaterial":
	case "loadMolden":
	case "loadpdb":
	case "loadShel": //??
	case "loadSiesta":
	case "loadstate":
	case "loadVasp":
	case "loadVASPoutcar":
	case "loadWien":
	case "loadXcrysden":
	case "loadxyz":
		loadUser();
		break;
	case "loadcif":
	case "loadcrystal":
	case "loadQuantum":
		loadUser("packed");
		break;
	case "reload":
		reload();
		break;
// BH 2018 moved to surface
//	case "loadCUBE":
//		cubeLoad();
//		break;
//	case "loadJvxl":
//		loadMapJvxl();
//		break;
	}
	document.fileGroup.reset();
}

function file_loadedCallback(filePath) {
	_file = {
			cell        : {},
			fileType    : jmolEvaluate("_fileType").toLowerCase(), 
			energyUnits : _constant.ENERGY_EV,
			strUnitEnergy : "e",
			hasInputModel : false,
			symmetry    : null,
			specData    : null,
			plotFreq    : null,
			geomData    : [],
			freqInfo 	: [],
			freqData	: [],
			vibLine		: [],
			counterFreq : 0,
			counterMD 	: 0,
			fMinim 		: null,
			frameSelection : null,
			frameNum       : null,
			frameValue 	   : null,
			haveGraphOptimize  : false,
			exportModelOne        : false,
			exportFractionalCoord : false
	};
	
	_file.info = extractInfoJmol("auxiliaryInfo.models");
	setFlags();
	setFileName();
	getUnitcell(1);
	runJmolScriptWait('unitcell on');
	cleanAndReloadForm();
	setFileName();
	if (!_fileIsReload)
		grpDisp(0);
	_fileIsReload = false;
	file_method("loadDone", loadDone);
}

var loadDone = function() {
	setTitleEcho();
}

var cleanAndReloadForm = function() {
	// this method was called for castep, dmol, molden, quantumespresso, vasp loading	
	setDefaultJmolSettings();
	document.fileGroup.reset();
	cleanList('geom');
	cleanList('colourbyElementList');
	// cleanList('colourbyAtomList');
	cleanList('polybyElementList');
	cleanList("poly2byElementList");
	updateElementLists();
	getUnitcell("1");
	setFrameValues("1");
	setTitleEcho();
}

var setFlags = function() {
	// BH TODO: missing xmlvasp?
	switch (_file.fileType) {
	default:
	case "xyz":
	case "cube":
	case "gromacs":
	case "material":
		break;
	case "castep":
	case "outcastep":
		_file.cell.typeSystem = "crystal";
		break;
	case "aims":
	case "aimsfhi":
	case "castep":
	case "cif":
	case "crysden":
	case "pdb":
	case "shelx":
	case "wien":
		_file.cell.typeSystem = "crystal";
		_file.exportModelOne = true;
		break;
	case "siesta":
		_file.cell.typeSystem = "crystal";
		_file.exportNoSymmetry = true;
		break;
	case "dmol":
		_file.plotEnergyType = "dmol";
		break;
	case "gulp":
		_file.plotEnergyType = "gulp";
		break;
	case "vasp":
		_file.cell.typeSystem = "crystal";
		_file.plotEnergyType = "vasp";
		_file.exportNoSymmetry = true;
		break;
	case "vaspoutcar":
		_file.cell.typeSystem = "crystal";
		_file.plotEnergyType = "outcar";
		_file.exportNoSymmetry = true;		
		break;
	case "espresso":
	case "quantum":
		_file.cell.typeSystem = "crystal";
		_file.plotEnergyType = "qespresso";
		break;
	case "gaussian":
	case "gauss":
		_file.cell.typeSystem = "molecule";
		_file.plotEnergyType = "gaussian";
		break;
	case "molden":
		// WE USE SAME SETTINGS AS VASP
		// IT WORKS
		_file.cell.typeSystem = "molecule";
		_file.plotEnergyType = "outcar";
		_file.exportNoSymmetry = true;
		break;
	case "crystal":
		_file.plotEnergyType = "crystal";
		_file.plotEnergyForces = true;
		break;
	}
}

var onChangeSave = function(save) {
	// see menu.js
	switch (save) {
	case "savePNG":
		runJmolScript('write PNG "jice.png"');
		break;
	case "savePNGJ":
		runJmolScript('write PNGJ "jice.png"');
		break;
	case "saveXYZ":
		runJmolScript('write COORDS XYZ jice.xyz');
		break;
	case "saveFrac":
		saveFractionalCoordinate();
		break;
	case "saveCRYSTAL":
		exportCRYSTAL();
		break;
	case "saveVASP":
		exportVASP();
		break;
	case "saveGROMACS":
		exportGromacs();
		break;
	case "saveCASTEP":
		exportCASTEP();
		break;
	case "saveQuantum":
		exportQuantum();
		break;
	case "saveGULP":
		exportGULP();
		break;
	case "savePOV":
		runJmolScript('write POVRAY jice.pov');
		break;
	case "savepdb":
		runJmolScript('write PDB jice.pdb');
		break;
	case "saveState":
		runJmolScript('write STATE jice.spt');
		break;
	case "savefreqHtml":
		newAppletWindowFreq();
		break;
	}
	document.fileGroup.reset();
}


var printFileContent = function() {
	runJmolScript("console; getProperty fileContents;");
}


var setTitleEcho = function() {
// BH this is not a generally useful thing to do. Crystal only?
	var titleFile = extractInfoJmolString("fileHeader").split("\n")[0];
	runJmolScriptWait('set echo top right; echo "' + titleFile + ' ";');
}


var setFileName = function() {
	setStatus(jmolEvaluate("_modelFile"));
}

var saveStateAndOrientation_a = function() {
	// used in castep, gulp, and vasp output methods, and in symmetry#figureOutSpacegroup
	runJmolScriptWait("save ORIENTATION orienta; save STATE status;");
}

var restoreStateAndOrientation_a = function() {
	runJmolScriptWait("restore ORIENTATION orienta; restore STATE status;");
}


var createFileGrp = function() { // Here the order is crucial
	var elOptionArr = new Array("default", "loadC", "reload", "loadcif",
			"loadxyz", "loadOutcastep", "loadcrystal", "loadDmol",
			"loadaimsfhi", "loadgauss", "loadgromacs", "loadGulp",
			"loadmaterial", "loadMolden", "loadpdb", "loadQuantum",
			"loadSiesta", "loadShel", "loadVASPoutcar", "loadVasp", "loadWien",
			"loadXcrysden", "loadstate");
	var elOptionText = new Array("Load New File", "General (*.*)",
			"Reload current", "CIF (*.cif)", "XYZ (*.XYZ)",
			"CASTEP (INPUT, OUTPUT)", "CRYSTAL (*.*)", "Dmol (*.*)",
			"FHI-aims (*.in)", "GAUSSIAN0X (*.*)", "GROMACS (*.gro)",
			"GULP (*.gout)", "Material Studio (*.*)", "Molden, QEfreq (*.*)",
			"PDB (*.pdb)", "QuantumESPRESSO (*.*)", "Siesta (*,*)",
			"ShelX (*.*)", "VASP (OUTCAR, POSCAR)", "VASP (*.xml)",
			"WIEN2k (*.struct)", "Xcrysden (*.xtal)", "Jmol state (*.spt,*.png)");

	var str = "<form autocomplete='nope'  id='fileGroup' name='fileGroup' style='display:inline' class='contents'>\n";
	str += "<h2>File manager</h2>\n";
	str += "<table><tr><td>Drag-drop a file into JSmol or use the menu below.<br>\n";
	str += createSelectmenu('Load File', 'onChangeLoad(value)', 0, 1,
			elOptionArr, elOptionText);
	str += "</td><td><div style=display:none>model #" +
		createText2("modelNo", "", 7, "")
		+ "</div></td></tr><tr><td>\n";
	str += "Sample Files<BR>\n";
	str += createSelectmenu('Sample Files', 'onChangeLoadSample(value)', 0, 1,
			sampleOptionArr);
	str += "</td></tr></table><BR><BR>\n";
	str += "Export/Save File<BR>\n";
	// Save section
	var elSOptionArr = new Array("default", "saveCASTEP", "saveCRYSTAL",
			"saveGULP", "saveGROMACS", "saveQuantum", "saveVASP", "saveXYZ",
			"saveFrac", /* "savefreqHtml", */"savePNG", "savepdb", "savePOV",
	"saveState", "savePNGJ");
	var elSOptionText = new Array("Export File", "CASTEP (*.cell)",
			"CRYSTAL (*.d12)", "GULP (*.gin)", "GROMACS (*.gro)",
			"PWscf QuantumESPRESSO (*.inp)", "VASP (POSCAR)", "XYZ (*.XYZ)",
			"frac. coord. (*.XYZfrac)",
			// "save Frequencies HTML (*.HTML)",
			"image PNG (*.png)", "coordinates PDB (*.PDB)",
			"image POV-ray (*.pov)", "current state (*.spt)", "image+state (PNGJ)");
	str += createSelectmenu('Export File', 'onChangeSave(value)', 0, 1,
			elSOptionArr, elSOptionText);
	str += "<p ><img src='images/j-ice.png' alt='logo'/></p>";
	str += "<div style='margin-top:50px;width:350px'><p style='color:#000'> <b style='color:#f00'>Please DO CITE:</b>";
	str += createCitations();
	str += "</p></div>";
	str += "</form>\n";
	return str;
}

var createCitations = function() {
	var citations = _global.citations; 
	var s = "";
	for (var i = 0; i < citations.length; i++) {
		var cite = citations[i];
		s += "<blockquote><b>";
		s += cite.title;
		s += "</b><br>";
		s += cite.authors.join(", ");
		s += " <br>";  
		s+= cite.journal;
		s += " <a href='" + cite.link + "' target='_blank'>[doi]</a>";
		s += "</blockquote>"; 
	};
	return s
}

// not implemented

function enterHistory() {
	
}

function exitHistory() {
}

function createHistGrp() {
	var strHist = "<form autocomplete='nope'  id='HistoryGroup' name='HistoryGroup' style='display:none'>";
	strHist += "History<BR>\n";
	strHist += "Work in progress<BR>\n";
	strHist += "</form>";
	return strHist;
}



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

_orient = {
	motion : ""
}

function enterOrient() {
	_slider.slab.setValue(100 - jmolEvaluate("slab"));
	_slider.depth.setValue(jmolEvaluate("depth"));
	if (jmolEvaluate("slabEnabled") == "true")
		checkBox("slabToggle");
	else
		uncheckBox("slabToggle");
}

function exitOrient() {
}

function applySlab(x) {
	getbyID('slider.slabMsg').innerHTML = x + "%" // display
	runJmolScriptWait("slab " + (100 - x) + ";")
}

function applyDepth(x) { // alternative displays:
	getbyID('slider.depthMsg').innerHTML = (100 - x) + "%" // 100%
	runJmolScriptWait("depth " + (100 - x) + ";")
}

function toggleSlab() {
	var ctl = getbyID("slabToggle")
	if (ctl.checked) {
		runJmolScriptWait("slab on;");
//		applySlab(_slider.slab.getValue());
//		applyDepth(_slider.depth.getValue());
//		_slider.slab.setValue(20);
//		applySlab(defaultFront);
//		_slider.depth.setValue(defaultBack);
//		applyDepth(defaultBack);
	} else {
		runJmolScriptWait("slab off; ")
//		_slider.slab.setValue(0);
//		_slider.depth.setValue(0);
	}
}

//This controls the refined motion of the structure
function setKindMotion(valueList) {
	_orient.motion = valueList;
	if (_orient.motion == "select")
		errorMsg("Please select the motion");
	return _orient.motion;
}

function setMotion(axis) {
	var magnitudeMotion = getbyID("fineOrientMagn").value;

	if (_orient.motion == "select" || _orient.motion == "") {
		errorMsg("Please select the motion");
		return false;
	}

	// /(_orient.motion == "translate" )? (disableElement("-z") + disableElement("z")) :
	// (enableElement("-z") + enableElement("z"))

	if (magnitudeMotion == "") {
		errorMsg("Please, check value entered in the textbox");
		return false;
	}

	var stringa = "Selected" + " " + axis + " " + magnitudeMotion;
	if (_orient.motion == "translate" && (axis == "-x" || axis == "-y" || axis == "-z")) {
		axis = axis.replace("-", "");
		stringa = "Selected" + " " + axis + " -" + magnitudeMotion;
	}

	stringa = _orient.motion + (getbyID("moveByselection").checked ? "Selected " : " ") + stringa;
	 
	runJmolScriptWait(stringa);


}


function createOrientGrp() {
	var motionValueName = new Array("select", "translate", "rotate");
	var strOrient = "<form autocomplete='nope'  id='orientGroup' name='orientGroup' style='display:none'>\n";
	strOrient += "<table class='contents' ><tr><td><h2>Orientation and Views</td><tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Spin "
		+ createRadio("spin", "x", 'runJmolScriptWait("spin x")', 0, 0, "", "") + "\n";
	strOrient += createRadio("spin", "y", 'runJmolScriptWait("spin y")', 0, 0, "", "")
	+ "\n";
	strOrient += createRadio("spin", "z", 'runJmolScriptWait("spin z")', 0, 0, "", "")
	+ "\n";
	strOrient += createRadio("spin", "off", 'runJmolScriptWait("spin off")', 0, 1, "", "")
	+ "\n";
	strOrient += createLine('blue', '');
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Zoom " + createButton('in', 'in', 'runJmolScriptWait("zoom in")', '')
	+ " \n";
	strOrient += createButton('out', 'out', 'runJmolScriptWait("zoom out")', '') + " \n";
	strOrient += createLine('blue', '');
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "View from"
		+ createButton('top', 'top', 'runJmolScriptWait("moveto  0 1 0 0 -90")', '')
		+ " \n";
	strOrient += createButton('bottom', 'bottom', 'runJmolScriptWait("moveto  0 1 0 0 90")',
	'')
	+ " \n";
	strOrient += createButton('left', 'left', 'runJmolScriptWait("moveto  0 0 1 0 -90")', '')
	+ " \n";
	strOrient += createButton('right', 'right', 'runJmolScriptWait("moveto  0 0 1 0 90")',
	'')
	+ " \n";
	strOrient += "<br> Orient along ";
	strOrient += createButton(
			'a',
			'a',
			'runJmolScriptWait("moveto 1.0 front;var axisA = {1/1 0 0};var axisZ = {0 0 1};var rotAxisAZ = cross(axisA,axisZ);var rotAngleAZ = angle(axisA, {0 0 0}, rotAxisAZ, axisZ);moveto 1.0 @rotAxisAZ @{rotAngleAZ};var thetaA = angle({0 0 1}, {0 0 0 }, {1 0 0}, {1, 0, 1/});rotate z @{0-thetaA};")',
	'');
	strOrient += createButton(
			'b',
			'b',
			'runJmolScriptWait("moveto 1.0 front;var axisB = {0 1/1 0};var axisZ = {0 0 1};var rotAxisBZ = cross(axisB,axisZ);var rotAngleBZ = angle(axisB, {0 0 0}, rotAxisBZ, axisZ);moveto 1.0 @rotAxisBZ @{rotAngleBZ}")',
	'');
	strOrient += createButton(
			'c',
			'c',
			'runJmolScriptWait("moveto 1.0 front;var axisC = {0 0.0001 1/1};var axisZ = {0 0 1};var rotAxisCZ = cross(axisC,axisZ);var rotAngleCZ = angle(axisC, {0 0 0}, rotAxisCZ, axisZ);moveto 1.0 @rotAxisCZ @{rotAngleCZ}")',
	'');
	strOrient += createLine('blue', '');
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Z-Clip functions<br>"
		+ createCheck("slabToggle", "Z-clip", 'toggleSlab()', 0, 0,
		"slabToggle");
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Front";
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += createSlider("slab");
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Back";
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += createSlider("depth");
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += createLine('blue', '');
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td>\n";
	strOrient += "Fine orientation\n";
	strOrient += "<table class='contents'> \n";
	strOrient += "<tr><td colspan='3'>Motion "
		+ createSelectFunc('setmotion', 'setKindMotion(value)',
				'setTimeout("setKindMotion(value)",50)', 0, 1,
				motionValueName, motionValueName);
	strOrient += " magnitude\n";
	strOrient += "<input type='text' value='5' class='text' id='fineOrientMagn' size='3'> &#197 / degree;";
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td colspan='2'> ";
	strOrient += createCheck(
			"moveByselection",
			"move only slected atom/s",
			"checkBoxStatus(this, 'byElementAtomMotion')  + checkBoxStatus(this, 'byAtomMotion')",
			0, 0, "moveByselection");
	strOrient += "</td></tr>\n";
	strOrient += "<tr><td colspan='2'> ";
	strOrient += "by element "
		+ createSelect2("byElementAtomMotion", "elementSelected(value)", false, 1) + "\n";
	// strOrient += "&nbsp;by atom &nbsp;"
	// + createSelect2('byAtomMotion', 'atomSelected(value)', '', 1) + "\n";
	strOrient += createCheck("byselectionOrient", "by picking &nbsp;",
			'setPicking(this)', 0, 0, "set picking");
	strOrient += "</td></tr><tr><td colspan='2'>\n";
	strOrient += createButton('orient_selectAll', 'select All', 'selectAll()', '')
	+ "\n";
	strOrient += createButton('unselect', 'unselect All',
			'runJmolScriptWait("select *; halos off")', '')
			+ "\n";
	strOrient += createButton('halooff', 'Halos off',
			'runJmolScriptWait("halos off; selectionhalos off" )', '')
			+ "\n";
	strOrient += createButton('labelon', 'Labels on',
			'runJmolScriptWait("label on;label display")', '')
			+ "\n";
	strOrient += createButton('labeloff', 'Hide Labels',
			'runJmolScriptWait("label hide")', '')
			+ "\n";
	strOrient += "</td></tr><td ><tr>\n";
	strOrient += "<table >\n";
	strOrient += "<tr><td>"
		+ createButton('-x', '-x', 'setMotion(id)', '', 'width:40px;')
		+ "</td><td>\n";
	strOrient += createButton('x', '+x', 'setMotion(id)', '', 'width:40px;')
	+ "</td></tr>\n";
	strOrient += "<tr><td>"
		+ createButton('-y', '-y', 'setMotion(id)', '', 'width:40px;')
		+ "</td><td>\n";
	strOrient += createButton('y', '+y', 'setMotion(id)', '', 'width:40px;')
	+ "</td></tr>\n";
	strOrient += "<tr><td>"
		+ createButton('-z', '-z', 'setMotion(id)', '', 'width:40px;')
		+ "</td><td>\n";
	strOrient += createButton('z', '+z', 'setMotion(id)', '', 'width:40px;')
	+ "</td></tr>\n";
	strOrient += "</table> \n";
	strOrient += "<tr><td>\n";
	strOrient += "</td></tr>\n";
	strOrient += "</table>\n";
	strOrient += createLine('blue', '');
	strOrient += "</form>\n";
	return strOrient;
}


function enterOther() {
	setValuesOther();	
}

function exitOther() {
}


function setValuesOther() {
// show lighting
//	  set ambientPercent 45;
//	  set diffusePercent 84;
//	  set specular true;
//	  set specularPercent 22;
//	  set specularPower 40;
//	  set specularExponent 6;
//	  set celShading false;
//	  set celShadingPower 10;
//	  set zShadePower 3;
//	  set zDepth 0;
//	  set zSlab 50;
//	  set zShade false;
	
	_slider.cameraDepth.setValue(jmolEvaluate("cameraDepth") * 25);
	_slider.specularPercent.setValue(jmolEvaluate("specularPercent"));
	_slider.ambientPercent.setValue(jmolEvaluate("ambientPercent"));
	_slider.diffusePercent.setValue(jmolEvaluate("diffusePercent"));
//	getbyID("SpecularPercentMsg").innerHTML = 40 + " %";
//	getbyID("AmbientPercentMsg").innerHTML = 40 + " %";
//	getbyID("DiffusePercentMsg").innerHTML = 40 + " %";

}

function applyCameraDepth(depth) {
	runJmolScriptWait("set cameraDepth " + depth + ";")
	getbyID("slider.cameraDepthMsg").innerHTML = depth
}

function applySpecularPercent(x) {
	runJmolScriptWait(" set specularPercent " + x + ";");
	getbyID("slider.specularPercentMsg").innerHTML = x + "%";
}

function applyAmbientPercent(x) {
	runJmolScriptWait(" set ambientPercent " + x + ";");
	getbyID("slider.ambientPercentMsg").innerHTML = x + "%";
}

function applyDiffusePercent(x) {
	runJmolScriptWait(" set diffusePercent " + x + ";");
	getbyID("slider.diffusePercentMsg").innerHTML = x + "%";
}

function setTextSize(value) {
	runJmolScriptWait("select *; font label " + value + " ;");
}

function setFrameTitle(chkbox) {
	runJmolScriptWait(chkbox.checked ? "frame title" : "frame title ''");
}


function createOtherGrp() {
	var textValue = new Array("0", "6", "8", "10", "12", "16", "20", "24", "30");
	var textText = new Array("select", "6 pt", "8 pt", "10 pt", "12 pt",
			"16 pt", "20 pt", "24 pt", "30 pt");

	var shadeName = new Array("select", "1", "2", "3")
	var shadeValue = new Array("0", "1", "2", "3")
	var strOther = "<form autocomplete='nope'  id='otherpropGroup' name='otherpropGroup' style='display:none' >";
	strOther += "<table class='contents'><tr><td> \n";
	strOther += "<h2>Other properties</h2></td></tr>\n";
	strOther += "<tr><td>Background colour:</td>\n";
	strOther += "<td align='left'><script>jmolColorPickerBox([setColorWhat,'background'],[255,255,255],'backgroundColorPicker')</script></td></tr> \n";
	strOther += "<tr><td>"
		+ createLine('blue', '')
		+ createCheck(
				"perspective",
				"Perspective",
				'setJmolFromCheckbox(this, this.value)+toggleDiv(this,"perspectiveDiv")',
				0, 0, "set perspectiveDepth");
	strOther += "</td></tr><tr><td>"
	strOther += "<div id='perspectiveDiv' style='display:none; margin-top:20px'>";
	strOther += createSlider("cameraDepth");
	strOther += "</div></td></tr>\n";
	strOther += "<tr><td>"
		+ createCheck("z-shade", "Z-Fog", "setJmolFromCheckbox(this, this.value)",
				0, 0, "set zShade");
	strOther += " ";
	strOther += createSelect(
			'setzShadePower ',
			'runJmolScriptWait("set zShade; set zShadePower " + value + ";") + setJmolFromCheckbox("z-shade"," "+value)',
			0, 1, shadeValue, shadeName)
			+ " Fog level";
	strOther += "</td></tr>\n";
	strOther += "<tr><td colspan='2'> Antialiasing"
		+ createRadio("aa", "on",
				'setAntialias(true)', 0,
				0, "");
	strOther += createRadio("aa", "off",
			'setAntiAlias(false)', 0, 1, "");
	strOther += createLine('blue', '');
	strOther += "</td></tr>";
	strOther += "<tr><td>";
	strOther += "Light settings";
	strOther += "</td></tr>";
	strOther += "<tr><td>";
	strOther += createSlider("specularPercent", "Reflection");
	strOther += "</td></tr><tr><td>";
	strOther += createSlider("ambientPercent", "Ambient");
	strOther += "</td></tr><tr><td>";
	strOther += createSlider("diffusePercent", "Diffuse");
	strOther += "</td></tr><tr><td colspan='2'>" + createLine('blue', '');
	strOther += "</tr><tr><td colspan='2'>"
		strOther += "3D stereo settings <br>"
			+ createRadio("stereo", "R&B", 'runJmolScriptWait("stereo REDBLUE")', 0, 0, "")
			+ "\n";
	strOther += createRadio("stereo", "R&C", 'runJmolScriptWait("stereo REDCYAN")', 0, 0, "")
	+ "\n";
	strOther += createRadio("stereo", "R&G", 'runJmolScriptWait("stereo REDGREEN")', 0, 0,
	"")
	+ "<br>\n";
	strOther += createRadio("stereo", "side-by-side", 'runJmolScriptWait("stereo ON")', 0,
			0, "")
			+ "\n";
	strOther += createRadio("stereo", "3D off", 'runJmolScriptWait("stereo off")', 0, 1, "")
	+ createLine('blue', '') + "</td></tr>\n";
	strOther += "<tr><td colspan='2'>";
	strOther += "Label controls <br>"
		strOther += createCheck("frameName", "Name model", "setFrameTitle(this)", 0,
				1, "frame title")
				+ " ";
	strOther += createCheck("jmollogo", "Jmol Logo",
			"setJmolFromCheckbox(this, this.value)", 0, 1, "set showFrank")
			+ "</td></tr>\n";
	strOther += "<tr><td colspan='2'>";
	strOther += "Font size ";
	strOther += createSelect("fontSize", "setTextSize(value)", 0, 1,
			textValue, textText);
	strOther += "</td></tr>";
	strOther += "<tr><td colspan='2'>"
		+ createButton("removeText", "Remove Messages", 'runJmolScriptWait("echo")', 0);
	strOther += createLine('blue', '')
		+ "</td></tr>\n";
	strOther += "</td></tr></table></FORM>  \n";
	return strOther;
}




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

_show = {
	firstTimeBond : true
}

function enterShow() {
	if (_show.firstTimeBond) {
		_slider.bond.setValue(20);
		_slider.radii.setValue(22);
		getbyID('slider.radiiMsg').innerHTML = 20 + " %";
		getbyID('slider.bondMsg').innerHTML = 0.20 + " &#197";
	}
	_show.firstTimeBond = false;
}

function exitShow() {
}

function showPickPlaneCallback() {
	var distance = prompt('Enter the distance (in \305) within you want to select atoms. \n Positive values mean from the upper face on, negative ones the opposite.', '1');
	if (distance != null && distance != "") {
		runJmolScriptWait('select within(' + distance + ',plane,$plane1)');
//			_edit.hideMode = " hide selected";
//			_edit.deleteMode = " delete selected";
		_pick.colorWhat = "color atoms";
	}
}



function setColorWhat(rgb, colorscript) {
	var colorcmd = (colorscript[1] == "colorwhat" ? _pick.colorWhat : "color " + colorscript[1]);
	runJmolScriptWait(colorcmd + " " + rgb);// BH?? should be elsewhere + ";draw off");
}

function elementSelected(element) {
	selectElement(element);
	_pick.colorWhat = "color atom ";
	return _pick.colorWhat;
}

//function showSelected(chosenSelection) {
//	var selection = "element";
//	if (chosenSelection == 'by picking' || chosenSelection == 'by distance') {
//		selection = chosenSelection;  
//	}
//	switch(selection){
//		case "element":
//			elementSelected(element); 
//			break;
//		case "by picking":
//			setPicking(this); //placeholder function--does not work as of 10.1.18 A.Salij
//			break;
//		case "by distance":
//			'setDistanceHide(this)'; //placeholder function--does not work as of 10.1.18 A.Salij
//			break;
//	}	
//}

function applyTrans(t) {
	getbyID('slider.transMsg').innerHTML = t + " %"
	runJmolScript("color " + getValueSel("setFashion") + " TRANSLUCENT " + (t/100));
}

function applyRadii(rpercent) {
	getbyID('slider.radiiMsg').innerHTML = rpercent.toPrecision(2) + " %"
	runJmolScript("cpk " + rpercent + " %;");
}

function onClickCPK() {
	getbyID('slider.radiiMsg').innerHTML = "100%";
	getbyID('slider.bondMsg').innerHTML = 0.3 + " &#197";
	_slider.radii.setValue(100);
	_slider.bond.setValue(30);
	runJmolScript("wireframe 0.30; spacefill 100% ;cartoon off;backbone off; draw off");
}

function onClickWire() {
	getbyID('slider.radiiMsg').innerHTML = "0.0 %";
	getbyID('slider.bondMsg').innerHTML = 0.01 + " &#197";
	_slider.radii.setValue(0);
	_slider.bond.setValue(1);
	// BH Q: why spacefill 1%?
	runJmolScript('wireframe 0.01; spacefill off;ellipsoids off;cartoon off;backbone off;');
}

function onClickIonic() {
	getbyID('slider.radiiMsg').innerHTML = parseFloat(0).toPrecision(2) + " %";
	getbyID('slider.bondMsg').innerHTML = 0.30 + " &#197";
	_slider.radii.setValue(0);
	_slider.bond.setValue(30);
	runJmolScript("spacefill IONIC; wireframe 0.15; draw off");
}

function onStickClick() {
	getbyID('slider.radiiMsg').innerHTML = "1%";
	getbyID('slider.bondMsg').innerHTML = 0.30 + " &#197";
	_slider.radii.setValue(0);
	_slider.bond.setValue(30);
	runJmolScript("wireframe 0.15;spacefill 1%;cartoon off;backbone off; draw off");
}

function onClickBallAndStick() {
	getbyID('slider.radiiMsg').innerHTML = "20%";
	getbyID('slider.bondMsg').innerHTML = 0.20 + " &#197";
	_slider.radii.setValue(20);
	_slider.bond.setValue(20);
	runJmolScript("wireframe 0.15; spacefill 20%;cartoon off;backbone off; draw off");

}

function onClickBall() {
	getbyID('slider.radiiMsg').innerHTML = "20%";
	getbyID('slider.bondMsg').innerHTML = 0.00 + " &#197";
	_slider.radii.setValue(20);
	_slider.bond.setValue(0);
	runJmolScript("select *; spacefill 20%; wireframe off ; draw off");
}

function createShowGrp() {
	//var showList = createShowList('colourbyElementList');
	var colorBondsName = new Array("select", "atom", "bond");
	var dotName = new Array("select", "1", "2", "3", "4");
	var strShow = "<form autocomplete='nope'  id='showGroup' name='showGroup' style='display:none' >";
	strShow += "<table class='contents'><tr><td colspan='2'>\n";
	strShow += "<h2>Structure Appearance</h2>\n";
	strShow += "Select atom/s by:</td><tr>\n";
	strShow += "<tr><td colspan='2'>";
	strShow += "by element "
		+ createSelectKey('colourbyElementList', "elementSelected(value)",
				"elementSelected(value)", "", 1) + "\n";
//   	    + createSelectKey('showList', "showSelected(value)",
//	      "showSelected(value)", "", 1) + "\n";
	// strShow += "&nbsp;by atom &nbsp;"
	// + createSelect2('colourbyAtomList', 'atomSelectedColor(value)', '', 1)
	// + "\n";
	strShow += createButton("byselection", "by picking &nbsp;",
	'runJmolScriptWait("select {};set picking select atom; selectionhalos on")', '');
//
//	strShow += createCheck("bydistance", "within a sphere (&#197); &nbsp;",
//			'setDistanceHide(this)', 0, 0, "");
	strShow += "</td></tr><tr><td colspan='2'>\n";
	strShow += createCheck("byplane", "within a plane &nbsp;",
			'onClickPickPlane(this,showPickPlaneCallback)', 0, 0, "");
	strShow += "</td></tr><tr><td colspan='2'>\n";
	strShow += createButton('show_selectAll', 'select All', 'selectAll()', '')
	+ "\n";
	strShow += createButton('unselect', 'unselect All',
			'runJmolScriptWait("select *; halos off; selectionhalos off;draw off")', '')
			+ "\n";
	strShow += createButton('halooff', 'Halo/s off',
			'runJmolScriptWait("halos off; selectionhalos off; draw off" )', '')
			+ "\n";
	strShow += createButton('label on', 'Label On',
			'runJmolScriptWait("label on;label display; draw off")', '')
			+ "\n";
	strShow += createButton('label off', 'Label Off',
			'runJmolScriptWait("label hide; draw off")', '')
			+ "\n";
	strShow += createLine('blue', '');
	strShow += "</td></tr><tr><td colspan='2'>\n";
	strShow += "Atom/s & bond/s style</td></tr> \n";
	strShow += "<tr><td > \n";
	strShow += "Atom/s colour: "
		+ createButton("colorAtoms", "Default colour",
				'runJmolScriptWait("select *; color Jmol;")', 0);
	strShow += "</td><td align='left'><script>\n";
	strShow += 'jmolColorPickerBox([setColorWhat,"atoms"], "","atomColorPicker");';
	strShow += "</script> </td></tr>";
	strShow += "<tr><td>Bond colour: "
		+ createButton("bondcolor", "Default colour",
				'runJmolScriptWait(" color bonds Jmol")', 0);
	strShow += "</td><td align='left'> <script> jmolColorPickerBox([setColorWhat, 'bonds'],[255,255,255],'bondColorPicker')</script></td>";
	strShow += "</td></tr>";
	strShow += "<tr><td colspan='2'> Atom/s & bond/s finish \n";
	strShow += createRadio(
			"abFashion",
			"opaque",
			'toggleDivRadioTrans(value,"transulcencyDiv") + runJmolScriptWait("color " +  getValue("setFashion") + " OPAQUE")',
			0, 1, "on", "on")
			+ "\n";
	strShow += createRadio(
			"abFashion",
			"translucent",
			'toggleDivRadioTrans(value,"transulcencyDiv") + runJmolScriptWait("color " +  getValue("setFashion") + " TRANSLUCENT")',
			0, 0, "off", "off")
			+ "\n";
	strShow += createSelect('setFashion', '', 0, 1, colorBondsName)
			+ "\n";
	strShow += "</td></tr>"
		strShow += "<tr><td><div id='transulcencyDiv' style='display:none; margin-top:20px'>";
	strShow += createSlider("trans");
	strShow += "</div></td></tr><tr><td>";
	strShow += "Dot surface ";
	strShow += createSelect('setDot',
			'runJmolScriptWait("dots on; set dotScale " + value + "; draw off")', 0, 1,
			dotName);
	strShow += createRadio("dotStyle", "off", 'runJmolScriptWait("dots off")', 0, 0, "off",
	"off");
	strShow += createLine('blue', '');
	strShow += "</td></tr>\n";
	strShow += "<tr><td colspan='2'> Atom/s & bond/s Size<br> \n";
	strShow += createButton('Stick & Ball', 'Stick & Ball', 'onClickBallAndStick()', '')
	+ " \n";
	strShow += createButton('Stick', 'Stick', 'onStickClick()', '') + " \n";
	strShow += createButton('Wire', 'Wire', 'onClickWire()', '') + " \n";
	strShow += createButton('Ball', 'Ball', 'onClickBall()', '') + "\n";
	strShow += createButton('CPK', 'CPK', 'onClickCPK()', '') + " \n";
	strShow += createButton('ionic', 'Ionic', 'onClickIonic()', '') + "\n";
	strShow += "</td></tr>";
	strShow += "<tr><td>";
	strShow += "wireframe ";
	strShow += "</td><td>"
	strShow += createSlider("bond");
	strShow += "</td></tr>";
	strShow += "<tr><td >";
	strShow += "vdW radii";
	strShow += "</td><td>";
	strShow += createSlider("radii");
	strShow += "</td></tr>";
	strShow += "<tr><td colspan='2'>";
	strShow += createLine('blue', '');
	strShow += "H-bonds: "
		+ createRadio("H-bond", "on", 'runJmolScriptWait("script ./scripts/hbond.spt")',
				0, 0, "") + "\n";
	strShow += createRadio("H-bond", "off",
			'runJmolScriptWait("script ./scripts/hbond_del.spt")', 0, 1, "")
			+ "\n";
	strShow += " / solid H-bond"
		+ createRadio("dash", " on", 'runJmolScriptWait("set hbondsSolid TRUE")', 0, 0,
		"") + "\n";
	strShow += createRadio("dash", "off", 'runJmolScriptWait("set hbondsSolid FALSE")', 0, 1,
	"")
	+ "\n";
	strShow += "</td></tr><tr><td>H-bond colour: "
		+ createButton("bondcolor", "Default colour",
				'runJmolScriptWait("color HBONDS none")', 0) + "</td><td>\n";
	strShow += "<script align='left'>jmolColorPickerBox([setColorWhat,'hbonds'],[255,255,255],'hbondColorPicker')</script>";
	strShow += "</td></tr><tr><td colspan='2'> \n";
	strShow += "View / Hide Hydrogen/s "
		+ createCheck("hydrogenView", "", "setJmolFromCheckbox(this, this.value)",
				0, 1, "set showHydrogens") + "\n";
	strShow += "</td></tr></table> \n";
	strShow += createLine('blue', '');
	strShow += "</form>\n";
	return strShow;
}

/*
 *   based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

//This simulates the IR - Raman spectrum given an input 


function enterSpectra() {
//enterSpectra gets information from fileData in order to set up the plot frequency. This includes nmin, nmax and selected 
//frequency values. nMin, nMax and sigma values are also changeable by hitting the enter key.
	if (!_file.plotFreq) {
		_file.plotFreq = {
				yscale: 1,
				minX0: 0,
				maxX0: 4000,
				selectedFreq: -1
		};
		_file.specData = null;
		symmetryModeAdd();	
		onClickModSpec(true, true);	
		if (!_file.specData)
			return;		
		setValue("nMax", _file.specData.maxX);
		setValue("nMin", _file.specData.minX);
	}
	setSpectraEvents();
	setTimeout(fixColorPicker,10);
}

var setSpectraEvents = function() {
	$("#nMin").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			onClickMinMax();
		}
	});
	$("#nMax").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			onClickMinMax();
		}
	});
	$("#sigma").keypress(function(event) {
	if (event.which == 13) {
		event.preventDefault();
		onClickModSpec(false, true);
		}
	});
}

var fixColorPicker = function() {
	var d = getbyID('vectorColorPicker')
	var table = d.children[0];
	table.border="0";
	d.style.width = d.style.height = "12px";
}

function exitSpectra() {
//Leaving the spectra page turns off the vibration and vectors.
	stopVibration();
}

function stopVibration() {
	runJmolScriptWait("vibration off; vectors off");	
}

function doSpectraNewWindow() {
//This opens the spectra graph in the new window. 
	var newwin = open("spectrum.html");
}

function onClickSelectVib() {
//Vibration chosen and shown in animation
	var vib = getbyID('vib');
	var model = parseInt(vib.value);
	showFrame(model);	
	updateJmolForFreqParams(true);
	// trigger to make sure selectedIndex has been set.
	setTimeout(function() {selectVib()}, 50);
}

function selectVib(index) {
//When triggered (by a click), the vibration is retrieved from the file data. The graph is then
//updated to show a larger red line at the selected frequency. The correct frame is also shown for the 
//specific vibration.
	var vib = getbyID('vib');
	index || (index = vib.selectedIndex);
	_file.specData.currentModel = (index < 0 ? 0 : parseInt(vib.options[index].value));
	_file.plotFreq.selectedFreq = (index < 0 ? -1 
			: _file.specData.freqs[_file.specData.vibList[index][3]]);
	showFreqGraph("plotareafreq", _file.specData, _file.plotFreq);
}

function selectVibByModel(model) {
	if (model > 0) {
		var vib = getbyID('vib');
		var options = vib.options;
		for (var i = 0; i < options.length; i++) {
			if (options[i].value == model) {
				vib.selectedIndex = i;
				selectVib(i);
				return;
			}
		}
	}
	_file.plotFreq.selectedFreq = -1;
	stopVibration();
}

function setYMax() {
// The maxY value is found from the information taken from the file and put into specData. 
//The max y value of both Raman and IR arrays becomes the ymax value in fileData.
	var specData = setUpSpecData("all", "any"); 
	getFrequencyList(specData);
	createSpectrum(specData);
	 _file.spectraYMax = Math.max(arrayMax(specData.specIR), arrayMax(specData.specRaman));
}

function onClickSymmetry() {
	onClickMinMax();
}

function onClickMinMax() {
	var model = _file.specData.currentModel;
	onClickModSpec();
	selectVibByModel(model);
}

function onClickModSpec(isPageOpen, doSetYMax) {
// Gets information on the symmetry, IR or Raman, etc. in specData that is chosen by the user 
//and/or file data. It then remakes the spectra plot with the updated information.
	if (_file.freqData.length == 0) {
		return;
	}
	if (doSetYMax) {
		setYMax();
	}
	if (isPageOpen) {
		checkBox("radVibrationOff");
		uncheckBox("vectorsON");
	}
	var typeIRorRaman = getRadioSetValue(document.modelsVib.modSpec);
	var irrep = getValueSel('sym');		
	_file.specData = setUpSpecData(typeIRorRaman,irrep);
	getFrequencyList(_file.specData);
	createSpectrum(_file.specData);
	setVibList(_file.specData);
	if (isPageOpen){
		setMaxMinPlot(_file.specData);
	}
	return showFreqGraph("plotareafreq", _file.specData, _file.plotFreq);
}

function setUpSpecData(typeIRorRaman,irrep) {
// This sets up specData, which is used throughout the code as an easy way to store all 
//necessary information in terms of plotting the spectra.
	return {
			typeIRorRaman : typeIRorRaman, 
			typeConvolve  : getRadioSetValue(document.modelsVib.convol), 
			irrep     : irrep,
			sigma     : parseFloat(getValue('sigma')), 
			rescale   : true,
			invertx   : isChecked('invertX'),
			freqCount : _file.freqInfo.length,
			minX      : Math.min(parseInt(getValue("nMin")), parseInt(getValue("nMax"))),
			maxX      : Math.max(parseInt(getValue("nMin")), parseInt(getValue("nMax"))),
			maxY      : _file.spectraYMax,
			maxR      : 3700,
			previousPointFreq : -1,
			currentModel : 1,
			vibList   : [],
			freqInfo  : [],
			irInt     : [],
			irFreq    : [],
			ramanInt  : [],
			ramanFreq : [],
			sortInt   : [],
			specIR    : [],
			specRaman : [],
			model     : [],
			freqs     : [],
			ranges    : [] 
	};
	
}

function createSpectrum(specData) {
//This function creates the spectrum (either stick or cool) based on whether the spectrum includes
//Raman data, IR data, or both (decided on by user and found in specData).
	switch (specData.typeIRorRaman) {
	case "ir":
		extractIRData(specData);
		break;
	case "raman":
		extractRamanData(specData);
		break;
	default:
		extractIRData(specData);
		extractRamanData(specData);
		break;
	}
	
	var create = (specData.typeConvolve == "stick" ? createStickSpectrum : createCoolSpectrum);

	switch (specData.typeIRorRaman) {
	case "ir":
		create(specData, "ir");
		break;
	case "raman":
		create(specData, "raman");
		break;
	default:
		create(specData, "ir");
		create(specData, "raman");
		break;
	}
}

function setMaxMinPlot(specData) {
//This function gets the max and min data for the plot. The max x is defined as being 4000, or 300 
//greater than the last peak if the final peak is at a much lower value.
	var n = specData.freqCount;
	var sum = 0;
	try { 
		for (var i = 0; i < n; i++) {
			
			System.out.println(i + " " + specData.freqInfo[i].modelProperties.Frequency);
			
			sum += roundoff(substringFreqToFloat(specData.freqInfo[i].modelProperties.Frequency), 0);
		}
		specData.maxR = (isNaN(sum) ? 3700 : sum / n);

	} catch (err){
			specData.maxR = 3700;
	}
		
	_file.plotFreq.minX0 = specData.minX = 0;
	_file.plotFreq.maxX0 = specData.maxX = specData.maxR + 300;

}

function getFrequencyList(specData) {
// This function finds the frequency list and vibration list from modelProperties in fileData, and
//is based on IR or Raman type. These lists are then pushed into specData as the freqInfo and VibList.
	// fill specData.freqInfo[] and specData.vibList[]
	var vibLinesFromIrrep = getVibLinesFromIrrep(specData);
	var prop = (specData.typeIRorRaman == "ir" ? "IRactivity" 
			: specData.typeIRorRaman == "raman" ? "Ramanactivity" 
			: null);
	specData.vibList = [];
	specData.freqInfo = [];
	for (var i = 0; i < specData.freqCount; i++) {
		var label = null;
		if ((vibLinesFromIrrep == null || (label = vibLinesFromIrrep[i]))
			  && (prop == null || _file.freqInfo[i].modelProperties[prop] == "A")) {
			specData.freqInfo.push(_file.freqInfo[i]);
			specData.vibList.push([(label || (i+1) + " " + _file.freqInfo[i].name), _file.freqInfo[i].modelNumber, -1]);
		}
	}
}

function setVibList(specData) {
// This function makes vibList include only frequencies in the xmax and xmin range.
	var vib = getbyID('vib');	
	cleanList('vib');
	console.log("clear vib");
	var xmin = specData.minX;
	var xmax = specData.maxX;	
	for (var i = 0, pt = 0, n = specData.vibList.length; i < n; i++) {
		if (specData.freqs[i] >= xmin && specData.freqs[i] <= xmax) {
			addOption(vib, specData.vibList[i][0], specData.vibList[i][1]);
			console.log("adding vib " + i + " " + specData.vibList[i]);
			specData.vibList[pt][3] = i;  // reverse loop-up
			specData.vibList[i][2] = pt++;
		}
	}
	var script = ";set echo bottom left;echo \"\";";	
	runJmolScriptWait(script)

}

function getVibLinesFromIrrep(specData) {
	var vibLinesFromIrrep = [];
	var irep = specData.irrep;
	if (irep == "any")
		return null;
	
	// check for F, E, or A irreducible representations
	
	if (_file.freqSymm) {
		// gaussian and others
		for (var i = 0, val; i < _file.freqSymm.length; i++) {
			if (irep == _file.freqSymm[i])
				vibLinesFromIrrep[i] = 
					(i+1) + " " + irep + " "+ _file.freqData[i] 
					+ (_file.freqIntens[i] ? " (" + _file.freqIntens[i] + ")" : "");
		}
	} else {
		for (var i = 0, val; i < _file.freqInfo.length; i++) {
			if (irep == _file.freqInfo[i].modelProperties.vibrationalSymmetry)
				vibLinesFromIrrep[i] = (i+1) + " " + _file.freqInfo[i].name;
		}
	}
	return vibLinesFromIrrep;
}

function extractIRData(specData) {
//Returns the file type that the IR data must be extracted from..
 return file_method("extractIRData", function() {}, [specData]);
}

//The next functions extract IR data for a variety of file types.
function extractIRData_crystal(specData) {
	var n = specData.freqInfo.length;
	for (var i = 0; i < n; i++) {
		if (specData.freqInfo[i].modelProperties.IRactivity != "A") 
			continue;
		specData.freqs[i] = specData.irFreq[i] = Math.round(substringFreqToFloat(specData.freqInfo[i].modelProperties.Frequency));
		specData.irInt[i] = Math.round(substringIntFreqToFloat(specData.freqInfo[i].modelProperties.IRintensity));
		specData.sortInt[i] = specData.irInt[i];
		specData.specIR[specData.irFreq[i]] = specData.irInt[i];
		specData.model[specData.irFreq[i]] = specData.freqInfo[i].modelNumber;
		
	}
	System.out.println("crystal extractIRData");
}

function extractIRData_vaspoutcar(specData) {
	var n = specData.freqInfo.length;
	for (var i = 0; i < n; i++) {
		specData.freqs[i] = specData.irFreq[i] = Math.round(substringFreqToFloat(_file.freqData[i]));
		specData.specIR[specData.irFreq[i]] = 100;
		specData.model[specData.irFreq[i]] = specData.freqInfo[i].modelNumber;
		specData.irInt[i] = 100;
		if (i == 0)
			specData.irInt[i] = 0;
	}
}

function extractIRData_gaussian(specData) {
	var n = specData.freqInfo.length;
	for (var i = 0; i < n; i++) {
		specData.freqs[i] = specData.irFreq[i] = Math.round(substringFreqToFloat(specData.freqData[i]));
		specData.specIR[specData.irFreq[i]] = specData.irInt[i] = rtrim(specData.freqIntens[i], 1, "K", 1);
		specData.model[specData.irFreq[i]] = specData.freqInfo[i].modelNumber;
	}
}

function rtrim(s, i0, ch, i1) {
	return s.substring(i0,s.indexOf(ch) - i1);
}

function extractRamanData(specData) {
//Extracts the Raman data and adds it to specData.
	var n = specData.freqInfo.length;
	for (var i = 0; i < n; i++) {
		if (specData.freqInfo[i].modelProperties.Ramanactivity == "A") {
			specData.freqs[i] = specData.ramanFreq[i] = Math.round(substringFreqToFloat(specData.freqInfo[i].modelProperties.Frequency));
			specData.ramanInt[i] = 100;
			specData.specRaman[specData.ramanFreq[i]] = 100;
			specData.model[specData.ramanFreq[i]] = specData.freqInfo[i].modelNumber;
		} else {
			specData.ramanInt[i] = 0;
		}
	}
	return specData;
}

function createStickSpectrum(specData, type) {
//Scales the data for a stick spectrum.
	var rescale = specData.rescale;
	var spec = (type == "ir" ? specData.specIR : specData.specRaman);
	var maxInt = maxValue(spec);
	var allZero = (maxInt == 0);
	if (allZero) {
		maxInt = 200;
		rescale = true;
	}
	spec[0]= null
	for (var i = 0; i < 4000; i++) {
		if (spec[i] == null) {
			spec[i] = 0;
		} else {
			if (allZero && spec[i] == 0)
				spec[i] = maxInt / 2; 
			if (rescale) {
				if (spec[i] != 0)
					spec[i] = (spec[i] / maxInt) * 100;
			}
		}
	}
}

function createCoolSpectrum(specData, type) {
//scales data for Gaussian or Lorentzian convolutions. 
		var maxInt;
		if (specData.sortInt) {
		 	maxInt = maxValue(specData.sortInt);
		} else if (specData.maxR) {
			maxInt = specData.maxR;
		} else {
			maxInt = 100;
		}
		if (maxInt == 0)
			maxInt = 200;
		specData.maxInt = maxInt;
		
		createConvolvedSpectrum(specData, type);
}

function getPlotIntArray() {
	alert("_m_spectra.js#getPlotIntArray has not been implemented.");
}

function createConvolvedSpectrum(specData, type) {
// Based on the typeconvolve given in specData, function creates the Gaussian and Lorentzian convolutions.
	var isGaussian = (specData.typeConvolve == "gaus");
	var spec = (type == "ir" ? specData.specIR : specData.specRaman);
	var freqCount = specData.freqCount;
	var irInt = specData.irInt;
	var irFreq = specData.irFreq;
	var ramanInt = specData.ramanInt;
	var ramanFreq = specData.ramanFreq;
	var sigma = specData.sigma;	
	var maxInt = specData.maxInt;

	var allZero = (maxValue(spec) == 0);

	// Gaussian Convolution
	var cx = 4 * Math.LN2;
	var ssa = sigma * sigma / cx;	

	// Lorentzian Convolution
	var xgamma = specData.sigma;
	var ssc = xgamma * 0.5 / Math.PI;
	var ssd = (xgamma * 0.5) * (xgamma * 0.5);
	
	var sb = Math.sqrt(cx) / (sigma * Math.sqrt(Math.PI));

	var freq = (type == "ir" ? irFreq : ramanFreq);
	var integ = (type == "ir" ? irInt : ramanInt);
	
	for (var i = 0; i < 4000; i++) {
		var sp = 0;
		for (var k = 0, n = freqCount; k < n; k++) {
			// discard translation
			if (!freq[k]) 
				continue;
			integ[k] || (integ[k] = 0);
			var v = (allZero ? 100 : integ[k]);
			var xnn = i - freq[k];
			sp += (isGaussian ? Math.exp(-xnn * xnn / ssa) : ssc / (xnn * xnn + ssd)) * v * sb;
		}
		spec[i] = sp;
	}
}

function showFreqGraph(plotDiv, specData, plot) {
//This large function creates the spectrum itself. This makes the axes, the clickable and hoverable options, and 
// creates the ability to zoom and open the spectrum in a new window. 
	var isHTMLPage = (!specData);
	if (isHTMLPage) {
		specData = _file.specData = opener._file.specData;
		plot = _file.plotFreq = opener._file.plotFreq;
	}
	var minX = specData.minX;
	var maxX = specData.maxX;
	var maxY = specData.maxY;
	if (maxY == 0)
		maxY = 200;
	maxY *= 1.2;
	var minY = -0.05*maxY;
	var plotArea = $("#" + plotDiv);
	getRanges(specData);
	var A = specData.specIR, B = specData.specRaman;	
	var model = specData.model;
	var nplots = (B && B.length && A && A.length ? 2 : 1);
	var options = {
      series:{
    	  	lines: { show: true, fill: false }
      },
      xaxis: { 
    	  min : minX, 
    	  max : maxX, 
    	  ticks : (maxX - minX < 2000 ? 5 : 10), 
    	  invert : specData.invertx,
    	  tickDecimals: 0 
      },
      yaxis: { ticks: 0, tickDecimals: 0, min: minY, max: maxY },
      selection: { 
    	  	mode: "x", 
    	  	hoverMode: "x" 
      },
      grid: { 
			hoverable: true, 
			clickable: true, 
			hoverDelay: 10, 
		    autoHighlight: false,
			hoverDelayDefault: 10
      }
	};
	var ir = [];
	var raman = [];
	for (var i = specData.minX, pt = 0; i < specData.maxX; i++, pt++) {
		if (A.length)
			ir[pt] = [i, A[i]*plot.yscale, model[i]];
		if (B.length)
			raman[pt] = [i, B[i]*plot.yscale, model[i]];		
	}

	var data = [];
	if (A.length && B.length) {
		data.push({label:"IR", data:ir, color:"orange"});
		data.push({label:"Raman", data: raman, color:"blue"});
	} else if (A.length) {
		data.push({label:"IR", data:ir, color:"orange"});
	} else if (B.length) {
		data.push({label:"Raman", data: raman, color:"blue"});
	}
	var haveSelected = false;
	for(var i= 0; specData.freqs.length > i; i++){
		var specfreq= specData.freqs[i];
		var y0 = (!isHTMLPage && plot.selectedFreq == specfreq ? minY : maxY * 0.95)
		data.push({data: [[specfreq, y0],[specfreq, maxY]], color:"red", lineWidth:1});
		if (y0 == minY)
			haveSelected = true;
	}
	plotArea.unbind("plothover plotclick plotselected", null)
	plotArea.bind("plothover", plotHoverCallbackFreq);
	if (!isHTMLPage) {
		plotArea.bind("plotclick", plotClickCallbackFreq);
		plotArea.bind( "plotselected", plotSelectCallbackFreq);
	}
	$.plot(plotArea, data, options);	
	_file.specData.previousPointFreq = -1;
	return haveSelected;
}

function plotSelectCallbackFreq(event, ranges) {
//Used to change the min and max x when a large enough range is selected. 
	var x1 = ranges.xaxis.from | 0;
	var x2 = ranges.xaxis.to | 0;
	if (Math.abs(x2-x1) > 100) {
		setValue("nMin", Math.min(x1, x2));
		setValue("nMax", Math.max(x1, x2));
		setTimeout(onClickMinMax,50);
	}
}

function getRanges(specData) {
// Function creates the ranges array in specData. This is used to provide the user a small clickable
//range which facilitates clicking peaks. 
	var freqs = specData.freqs
	var sigma = specData.sigma;
	var n = specData.freqs.length;
	
	for (var i = 0, x1, x2, last=n-1; i <= last; i++) { 
		switch (i) {
		case 0:
			x1 = specData.minX;
			x2 = (freqs[i] + freqs[i + 1])/2;
			break;
		case last:
			x1 = (freqs[i] + freqs[i - 1])/2;
			x2 = specData.maxX;
			break;
		default:
			x1 = (freqs[i] + freqs[i - 1])/2;
			x2 = (freqs[i] + freqs[i + 1])/2;
			break;
		}
		specData.ranges.push([Math.max(x1, freqs[i] - sigma/2), Math.min(x2, freqs[i] + sigma/2), freqs[i], i]);
	}
}	

function plotClickCallbackFreq(event, pos, itemFreq) {
//Vibration is selected based on a range clicked. 
	var range = (itemFreq ? getFreqForClick(itemFreq.datapoint) : null);
	// itemFreq is [x,y] so [freq,int]
	// range is [min,max,freq,i]
	var listIndex = (range ? _file.specData.vibList[range[3]][2] : -1);
	if (listIndex < 0) {
		setTimeout(function() { selectVib(-1) }, 50);
		return;		
	}
	
	// saves model index as _file.specData.currentModel
	getbyID('vib').options[listIndex].selected = true;
	setTimeout(function(){onClickSelectVib(0);},50);
}

function plotHoverCallbackFreq(event, pos, itemFreq) {
//Shows the vibrational frequency if user hovers over range. Does not change the frequency 
//unless user hovers along the top red lines.
	hideTooltip();
	if(!itemFreq)return
	if (_file.specData.previousPointFreq != itemFreq.datapoint) {
		_file.specData.previousPointFreq = itemFreq.datapoint;
		var range = getFreqForClick(itemFreq.datapoint);
		if (!range)
			return;
		var freq = range[2];
		var listIndex = _file.specData.vibList[range[3]][2];	
		if (listIndex < 0)
			return;		
		var model = _file.specData.model[freq];
		var x = roundoff(itemFreq.datapoint[0],2);
		var y = roundoff(itemFreq.datapoint[1],1);
		var model = itemFreq.datapoint[2];		
		var label = getbyID('vib').options[listIndex].text;
		showTooltipFreq(itemFreq.pageX, itemFreq.pageY + 10, label, pos);
	}
	if (pos.canvasY < 30)setTimeout(function(){plotClickCallbackFreq(event, pos, itemFreq)},50);
}


/*
 * function scaleSpectrum(){
 * 
 * var vecorFreq = []; var vecorChk = []; var counter; for(var i =0 ; i <
 * _file.info.length; i++){ vecorFreq[i] = _file.info[i].name; vecorChk[i] = 0 if(i == 0)
 * vecorChk[i] = 1 counter++ }
 * 
 * var s = " Shift spectrum "; s+= createSelect("Frequencies", "", 0, 1, counter ,
 * vecorFreq, vecorFreq, vecorChk) + "" s+=
 * createText2("rescaleSpectra","0.00","5","") + " cm<sup>-1</sup>"; s+=
 * createButton("rescaleSpectraButton","Shift","","") document.write(s); }
 */

function sortNumber(a, b) {
//Returns value a-b (self-explanatory).
	return a - b;
}

function maxValue(a) {
//This simply finds the maximum value in an array. 
	var max = 0;
	for (var i = a.length; --i >= 0;) {
		if (a[i] > max)
			max = a[i];
	}
	return max;
}

function minValue(irInt) {
	return parseInt(irInt.sort(sortNumber)[0]);
}

function symmetryModeAdd() { 
// extracts vibrational symmetry modes from _file.info
// array and lets one get symmetry operations by ID.
	cleanList('sym');
	var sym = getbyID('sym');
	if (_file.info[3] && _file.info[3].modelProperties) {
		var symm = _file.freqSymm;
		if (!symm) {
			var symm = [];
			for (var i = 1; i < _file.info.length; i++)
				if (_file.info[i].name)
					symm[i] = _file.info[i].modelProperties.vibrationalSymmetry;
		}
		var sortedSymm = unique(symm);
		addOption(sym, "any", "any");
		for (var i = 0; i < sortedSymm.length; i++) {
			var label = sortedSymm[i]; 
			if (label)
				addOption(sym, label, label);
		}
	}	
}

function unique(a) {
// This function removes duplicates.
	var r = [];
	var list = "";
	for (var i = 0, n = a.length; i < n; i++) {
		var item = a[i];
		var key = ";" + item + ";";
		if (list.indexOf(key) >= 0)
			continue;
		list += key;
		r.push(item);
	}
	return r;
}

function onClickFreqParams() {
	updateJmolForFreqParams(false);
}

function updateJmolForFreqParams(isVibClick) {
//This function is used often to update the parameters that are changeable by the user (vibration,
// vectors and their size/width/color).
	var c = jmolColorPickerBoxes["vectorColorPicker"].getJmolColor();
	var vectorsON = isChecked("vectorsON");
	var vibON = isChecked("radVibrationOn");
	var script = "vibration " + vibON
					+ ";vectors " + vectorsON
					+ ";" + getValueSel("vecsamplitude")
					+ ";" + getValueSel("vecscale")
					+ ";color vectors " + c;				
//					(isChecked("vibVectcolor") ? "none" : "white");
	if (vectorsON)
		script += ";" + getValueSel("widthvec");	
	var label = getTextSel('vib');
	script += ";set echo bottom left;echo \""+label+ "\";";	
	runJmolScriptWait(script);
	if (isVibClick && !vectorsON && !vibON) {
		getbyID('radVibrationOn').checked = true;
		runJmolScriptWait("vibration ON"); 
	}
}

function onClickScaleFreq(mode) {
//Makes the up button increase the y scale by 1.414, the down button decrease the y scale by 1.414, 
//and the middle button reset the original yscale, xmax and xmin. 
	switch (mode) {
	case 1:
	case -1:
		_file.plotFreq.yscale *= (mode == 1 ? 1.414 : 1/1.414);
		onClickModSpec();
		return;
	case 0:
		_file.plotFreq.yscale = 1;
		setValue("nMin", _file.plotFreq.minX0);
		setValue("nMax", _file.plotFreq.maxX0);
		onClickMinMax();
		return;
	}
}

function createFreqGrp() { 
// Creates the frequency menu on the web applet.
	var vibAmplitudeValue = new Array("", "vibration Scale 1",
			"vibration Scale 2", "vibration Scale 5", "vibration Scale 7", "vibration Scale 10"); 
	var vecscaleValue = new Array("", "vectors SCALE 1", "vectors SCALE 3",
			"vectors SCALE 5", "vectors SCALE 7", "vectors SCALE 10",
			"vectors SCALE 15", "vectors SCALE 19");
	var vecwidthValue = new Array("", "vectors 1", "vectors  3", "vectors  5",
			"vectors  7", "vectors 10", "vectors 15", "vectors  19");
	var vecscaleText = new Array("select", "1", "3", "5", "7", "10", "15", "19");
	var vibAmplitudeText = new Array("select", "1", "2", "5", "7", "10");

	var smallGraph =  createDiv("plotareafreq", "background:blue;width:300px;height:180px;background-color:#EFEFEF","");  
	var graphButtons = createButtonB("scaleup", "&#x25b2;","onClickScaleFreq(1)' title='increase Y scale",0,"width:40px") + "<br>"
		+ createButtonB("scaleup", "&#x25cf;","onClickScaleFreq(0)' title='reset X and Y",0,"width:40px") + "<br>"
		+ createButtonB("scaleup", "&#x25bc;","onClickScaleFreq(-1)' title='decrease Y scale",0,"width:40px");
	var smallGraphAndButtons = "<table cellpadding=0 cellspacing=0><tr><td valign=top>" 
			+ smallGraph + "</td><td valign=center>" 
			+ graphButtons + "</td></tr></table>";

	var simPanel = createDiv("simPanel", "", "Raman intensities set to 0.0 kmMol<sup>-1</sup>"
		+ "<br>\n"
		+ createLine('blue', '')
		+ "<br>"
		+ "Min freq. " + createText2("nMin", "0", "4", "")
		+ " Max " + createText2("nMax", "4000", "4", "") + "cm<sup>-1</sup>"
		+ createCheck("invertX", "Invert x", "onClickModSpec()", 0, 1, "")
		+ "<br>" + "Band width " + createText2("sigma", "30", "2", "") + "cm<sup>-1</sup>" 
		+ "&nbsp;"
		+ createRadio("convol", "Gaussian", 'onClickModSpec(false, true)', 0, 1, "", "gaus")
		+ createRadio("convol", "Lorentzian", 'onClickModSpec(false, true)', 0, 0, "", "lor") 
		+ createRadio("convol", "Stick", 'onClickModSpec(false, true)', 0, 0, "", "stick")
		+ "&nbsp;" + "&nbsp;" + "&nbsp;"
		+ "<br>" + createButton("simSpectra", "New Window", "doSpectraNewWindow()", 0));

	var str = "<form autocomplete='nope'  id='freqGroup' name='modelsVib' style='display:none'>";
		str += "<table border=0 class='contents'><tr><td valign='bottom'>";
			str += "<h2>IR-Raman Frequencies</h2>\n";
			str += createRadio("modSpec", "Both", "onClickModSpec()", 0, 1, "", "all");
			str += createRadio("modSpec", "IR", "onClickModSpec()", 0, 0, "", "ir");
			str += createRadio("modSpec", "Raman", "onClickModSpec()", 0, 0, "", "raman");
			str += "<BR>\n";
			str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Symmetry <select id='sym' name='vibSym' onchange='onClickSymmetry()' onkeyup='onClickSymmetry()' CLASS='select' >";
			str += "</select> ";
			str += "<BR>\n";
			str += "<select id='vib' name='models' OnClick='onClickSelectVib()' onkeyup='onClickSelectVib()' class='selectmodels' size=9 style='width:200px; overflow: auto;'></select>";	
		str += "</td>"; // end of the first column
		str += "<td valign='bottom'>";		
		str += "<table>";
			str += "<tr><td>vibration</td><td>";
			str += createRadio("vibration", "on", 'onClickFreqParams()', 0, 1, "radVibrationOn", "on");
			str += createRadio("vibration", "off", 'onClickFreqParams()', 0, 0, "radVibrationOff", "off");
			str += "</td></tr><tr><td>view vectors</td><td>";
			str += createRadio("vectors", "on", 'onClickFreqParams()', 0, 1, "vectorsON", "on");
			str += createRadio("vectors", "off", 'onClickFreqParams()', 0,0, "vectorsOFF", "off");
			str += "</td></tr><tr><td>amplitude</td><td>";
			str += createSelect("vecsamplitude", "onClickFreqParams()", 0, 1,
					vibAmplitudeValue, vibAmplitudeText,[0,1]);
			str += "</td></tr><tr><td>scale</td><td>";
			str += createSelect("vecscale", "onClickFreqParams()", 0, 1, vecscaleValue, vecscaleText, [0,0,1]); 
			str += "</td></tr><tr><td>width</td><td>";
			str += createSelect("widthvec", "onClickFreqParams()", 0, 1, vecwidthValue, vecscaleText,[0,0,0,1]);
			str += "</td></tr><tr><td>color</td>";
			str += "<td><table><tr><td><script>jmolColorPickerBox([setColorWhat,'vectors'],[255,255,255],'vectorColorPicker')</script>";
//??				str +="&nbsp;&nbsp;" + createButton("vibVectcolor", "def", 'onClickFreqParams()', 0);
			str += "</td></tr></table>";
		str += "</td></tr></table>";
		str += "</td></tr>";
		str += "<tr><td colspan=2>";
		str += createDiv("graphfreqdiv", // making small graph
			"width:320px;height:200px;background-color:#EFEFEF;margin-left:5px;display:inline", 
			smallGraphAndButtons + simPanel);
		str += "</td></tr>";
	str += "</table></form> ";

	return str;
}

function getFreqForClick(p) {
//This retrieves only the frequencies within range. 
	var freq = p[0];
	var integ = p[1];
	var listIndex = -1;
	
	for (var i = 0; i < _file.specData.ranges.length; i++) {
		var range = _file.specData.ranges[i];
		if (freq >= range[0] && freq <= range[1]) {
			return range;
		}
	}
	return null;
}




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

//CASTEP Js.
/*! Al metal in non-primitive FCC Unit cell

 %block LATTICE_CART ! In Angstroms
 4.0495 0.0    0.00
 0.00   4.0495 0.00
 0.00   0.00   4.0495
 %endblock LATTICE_CART
 %block POSITIONS_FRAC
 Al  0.0000000000    0.0000000000    0.0000000000
 Al  0.0000000000    0.5000000000    0.5000000000
 Al  0.5000000000    0.5000000000    0.0000000000
 Al  0.5000000000    0.0000000000    0.5000000000
 %endblock POSITIONS_FRAC
 kpoints_mp_grid 4 4 4
 fix_all_ions true
 fix_all_cell true
 %BLOCK SPECIES_POT
 %ENDBLOCK SPECIES_POT
 */

// /// FUNCTION LOAD

var loadDone_castep = function() {
	_file.energyUnits = _constant.ENERGY_EV;
	_file.counterFreq = 0;
	_file.counterMD = 0;
	for (var i = 0; i < _file.info.length; i++) {
		if (_file.info[i].name != null) {
			var line = _file.info[i].name;
			if (line.search(/Energy =/i) != -1) {
				addOption(getbyID('geom'), i + " " + line, i + 1);
				_file.geomData[i] = line;
				_file.counterFreq++;
			} else if (line.search(/cm-1/i) != -1) {
				var data = parseFloat(line.substring(0, line.indexOf("cm") - 1));
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(line);
				_file.vibLine.push(i + " A " + data + " cm^-1");
				_file.counterMD++;
			}
		}
	}
	getUnitcell("1");
	setFrameValues("1");
	//disableFreqOpts();
	//getSymInfo();
	loadDone();
}

function exportCASTEP() {
	warningMsg("Make sure you have selected the model you would like to export.");
	setUnitCell();
	saveStateAndOrientation_a();
	var lattice = fromfractionaltoCartesian();
	setVacuum();
	switch (_file.cell.typeSystem) {
	case "slab":
		scaleModelCoordinates("z", "div", roundNumber(_file.cell.c));
		break;
	case "polymer":
		scaleModelCoordinates("z", "div", roundNumber(_file.cell.c));
		scaleModelCoordinates("y", "div", roundNumber(_file.cell.b));
		break;
	case "molecule":
		scaleModelCoordinates("z", "div", roundNumber(_file.cell.c));
		scaleModelCoordinates("y", "div", roundNumber(_file.cell.b));
		scaleModelCoordinates("x", "div", roundNumber(_file.cell.a));
		break;
	}

	var cellCastep = "var latticeHeader = '\%block LATTICE_CART';"
		+ "var latticeOne = [" + lattice[0] +"].join(' ');"
		+ "var latticeTwo = [" + lattice[1] + "].join(' ');"
		+ "var latticeThree = [" + lattice[2] + "].join(' ');"
		+ "var latticeClose = '\%endblock LATTICE_CART';"
		+ "latticeCastep = [latticeHeader, latticeOne, latticeTwo,latticeThree, latticeClose];";
	runJmolScriptWait(cellCastep);
	
	var positionCastep = "var positionHeader = '\%block POSITIONS_FRAC';"
		+ 'var xyzCoord = ' + _file.frameSelection + '.label("%e %16.9[fxyz]");'
		+ 'xyzCoord = xyzCoord.replace("\n\n","\n");'
		+ "var positionClose = '\%endblock POSITIONS_FRAC';"
		+ "positionCastep = [positionHeader, xyzCoord, positionClose];"
		+ 'positionCastep = positionCastep.replace("\n\n","\n");';
	runJmolScriptWait(positionCastep);
	
	restoreStateAndOrientation_a();

	var finalInputCastep = 'var final = [latticeCastep, positionCastep].replace("\n\n","\n");'
			+ 'WRITE VAR final "?.cell"';
	runJmolScript(finalInputCastep);
}

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

////The following functions are to control import/ export, geometry optimization, frequency properties.
/////////
////////////////SAVE INPUT
/////////

///////////////////////// LOAD & ON LOAD functions

var loadDone_crystal = function() {
	_file.energyUnits = _constant.ENERGY_HARTREE;
	_file.StrUnitEnergy = "H";
	var vib = getbyID('vib');
	for (var i = 0; i < _file.info.length; i++) {
		var line = _file.info[i].name;
		if (line != null) {
			if (line.search(/Energy/i) != -1) { // Energy
//				if (i > 0 && i < _file.info.length)
//					var previous = substringEnergyToFloat(_file.info[i - 1].name);
//				if (_file.info[i].name != null) {
				addOption(getbyID('geom'), i + " " + line, i + 1);
				_file.geomData[i] = line;
				_file.counterFreq++;
//				}
			} else if (line.search(/cm/i) != -1) {
				if (line.search(/LO/) == -1) {
					_file.freqInfo.push(_file.info[i]);
					_file.vibLine.push((i - _file.counterFreq) + " " + line); 
					_file.freqData.push(line);
				}
			}
	
		}
	} 
	getUnitcell("1");
	runJmolScriptWait("echo");
	setTitleEcho();
	loadDone();
}

function exportCRYSTAL() {
	var systemCRYSTAL = null;
	var keywordCRYSTAL = null;
	var symmetryCRYSTAL = null;

	var endCRYSTAL = "TEST', 'END";
	var script = "";
	var flagsymmetry;
	warningMsg("Make sure you have selected the model you would like to export.")

	var titleCRYS = prompt("Type here the job title:", "");
	(titleCRYS == "" || titleCRYS == null) ? (titleCRYS = ' .d12 prepared with J-ICE ')
			: (titleCRYS = titleCRYS + ' .d12 prepared with J-ICE');

	setUnitCell();

	var  numAtomCRYSTAL = _file.frameSelection + ".length";
	var fractionalCRYSTAL = _file.frameSelection + '.label("%l %16.9[fxyz]")';

	switch (_file.cell.typeSystem) {
	case "crystal":
		systemCRYSTAL = "'CRYSTAL'";
		keywordCRYSTAL = "'0 0 0'";
		symmetryCRYSTAL = "'1'";

		if (!_file.exportNoSymmetry)
			flagsymmetry = confirm("Do you want to introduce symmetry ?")
		if (!flagsymmetry) {
			script = "var cellp = ["
					+ roundNumber(_file.cell.a)
					+ ", "
					+ roundNumber(_file.cell.b)
					+ ", "
					+ roundNumber(_file.cell.c)
					+ ", "
					+ roundNumber(_file.cell.alpha)
					+ ", "
					+ roundNumber(_file.cell.beta)
					+ ", "
					+ roundNumber(_file.cell.gamma)
					+ "];"
					+ 'var cellparam = cellp.join(" ");'
					+ 'cellparam = cellparam.replace("\n\n","\n");'
					+ "var crystalArr = ['"
					+ titleCRYS
					+ "', "
					+ systemCRYSTAL
					+ ", "
					+ keywordCRYSTAL
					+ ", "
					+ symmetryCRYSTAL
					+ "];"
					+ "var crystalRestArr = ["
					+ numAtomCRYSTAL
					+ ", "
					+ fractionalCRYSTAL
					+ ", '"
					+ endCRYSTAL
					+ "'];"
					+ 'var finalArr = [crystalArr, cellparam , crystalRestArr];'
					+ 'finalArr = finalArr.replace("\n\n","\n");'
					+ 'WRITE VAR finalArr "?.d12"';
		} else {
			warningMsg("This procedure is not fully tested.");
			
			// BH: THIS METHOD WILL RELOAD THE FILE!
			figureOutSpaceGroup(true, true);
			var endCRYSTAL = "TEST', 'END";
			var script = "var cellp = [" + _file.stringCellParam + "];"
					+ 'var cellparam = cellp.join(" ");' + "var crystalArr = ['"
					+ titleCRYS + "', " + systemCRYSTAL + ", " + keywordCRYSTAL + ", "
					+ _file.interNumber + "];" + 'crystalArr = crystalArr.replace("\n\n"," ");'
					+ "var crystalRestArr = [" + numAtomCRYSTAL + ", " + fractionalCRYSTAL
					+ ", '" + endCRYSTAL + "'];"
					+ 'crystalRestArr = crystalRestArr.replace("\n\n"," ");'
					+ 'var finalArr = [crystalArr, cellparam , crystalRestArr];'
					+ 'finalArr = finalArr.replace("\n\n","\n");'
					+ 'WRITE VAR finalArr "?.d12"';
			runJmolScript(script);
		}
		break;
	case "slab":
		systemCRYSTAL = "'SLAB'";
		keywordCRYSTAL = "";
		symmetryCRYSTAL = "'1'";

		warningMsg("Symmetry not exploited!");

		script = "var cellp = [" + roundNumber(_file.cell.a) + ", "
				+ roundNumber(_file.cell.b) + ", " + roundNumber(_file.cell.gamma) + "];"
				+ 'var cellparam = cellp.join(" ");' + "var crystalArr = ['"
				+ titleCRYS + "', " + systemCRYSTAL + ", " + symmetryCRYSTAL
				+ "];" + 'crystalArr = crystalArr.replace("\n\n","\n");'
				+ "var crystalRestArr = [" + numAtomCRYSTAL + ", "
				+ fractionalCRYSTAL + ", '" + endCRYSTAL + "'];"
				+ 'crystalRestArr = crystalRestArr.replace("\n\n","\n");'
				+ 'var finalArr = [crystalArr, cellparam , crystalRestArr];'
				+ 'finalArr = finalArr.replace("\n\n","\n");'
				+ 'WRITE VAR finalArr "?.d12"';
		break;
	case "polymer":
		systemCRYSTAL = "'POLYMER'";
		keywordCRYSTAL = "";
		symmetryCRYSTAL = "'1'";

		warningMsg("Symmetry not exploited!");

		script = "var cellp = " + roundNumber(_file.cell.a) + ";"
				+ "var crystalArr = ['" + titleCRYS + "', " + systemCRYSTAL
				+ ", " + symmetryCRYSTAL + "];"
				+ 'crystalArr = crystalArr.replace("\n\n","\n");'
				+ "var crystalRestArr = [" + numAtomCRYSTAL + ", "
				+ fractionalCRYSTAL + ", '" + endCRYSTAL + "'];"
				+ 'crystalRestArr = crystalRestArr.replace("\n\n","\n");'
				+ 'var finalArr = [crystalArr, cellp , crystalRestArr];'
				+ 'finalArr = finalArr.replace("\n\n","\n");'
				+ 'WRITE VAR finalArr "?.d12"';
		break;
	case "molecule":
		// alert("prov")
		systemCRYSTAL = "'MOLECULE'";
		symmetryCRYSTAL = "'1'"; // see how jmol exploits the punctual TODO:
		warningMsg("Symmetry not exploited!");
		script = "var crystalArr = ['" + titleCRYS + "', " + systemCRYSTAL
				+ ", " + symmetryCRYSTAL + "];"
				+ 'crystalArr = crystalArr.replace("\n\n","\n");'
				+ "var crystalRestArr = [" + numAtomCRYSTAL + ", "
				+ fractionalCRYSTAL + ", '" + endCRYSTAL + "'];"
				+ 'crystalRestArr = crystalRestArr.replace("\n\n","\n");'
				+ 'var finalArr = [crystalArr, crystalRestArr];'
				+ 'finalArr = finalArr.replace("\n\n","\n");'
				+ 'WRITE VAR finalArr "?.d12"';
		break;
	}
	script = script.replace("\n\n", "\n");
	runJmolScriptWait(script);
}


////////////////////////END SAVE INPUT


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

//3rd-Sept-2010 CANEPA

var loadDone_dmol = function() {
	_file.energyUnits = _constant.ENERGY_HARTREE;
	_file.StrUnitEnergy = "H";
	for (var i = 0; i < _file.info.length; i++) {
		var line = _file.info[i].name;
		if (line != null) {
			if (line.search(/E =/i) != -1) {
				addOption(getbyID('geom'), i + " " + line, i + 1);
				_file.geomData[i] = line;
				_file.counterFreq++;
			} else if (line.search(/cm/i) != -1) {
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(line);
				var data = parseFloat(line.substring(0, line.indexOf("cm") - 1));
				_file.vibLine.push(i + " A " + data + " cm^-1");
				_file.counterMD++;
			}
		}
	}

	getUnitcell("1");
	setFrameValues("1");
	//getSymInfo();
	loadDone();
}
/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

var loadDone_gaussian = function() {

	warningMsg("This is a molecular reader. Therefore not all properties will be available.")

	_file.energyUnits = _constant.ENERGY_HARTREE;
	_file.StrUnitEnergy = "H";

	setTitleEcho();
	setFrameValues("1");

	var geom = getbyID('geom');
	var vib = getbyID('vib');
	for (var i = 0; i < _file.info.length; i++) {
		if (_file.info[i].name != null) {
			var line = _file.info[i].name;
			// alert(line)
			if (line.search(/E/i) != -1) {
				_file.geom[i] = _file.info[i].name;
				addOption(geom, i + " " + _file.geom[i], i + 1);
				if (_file.info[i].modelProperties.Energy != null
						|| _file.info[i].modelProperties.Energy != "")
					_file.energy[i] = _file.info[i].modelProperties.Energy;
				_file.counterGauss++;
			} else if (line.search(/cm/i) != -1) {
				_file.vibLine.push(i + " " + _file.info[i].name + " (" + _file.info[i].modelProperties.IRIntensity + ")");
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(_file.info[i].modelProperties.Frequency);
				_file.freqSymm.push(_file.info[i].modelProperties.FrequencyLabel);
				_file.freqIntens.push(_file.info[i].modelProperties.IRIntensity);
			}
		}
	}
	loadDone();
}

/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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


function exportGromacs() {
	warningMsg("Make sure you have selected the model you would like to export.");

	var titleGromacs = prompt("Type here the job title:", "");
	(titleGromacs == "") ? (titleGromacs = 'Input prepared with J-ICE ')
			: (titleGromacs = 'Input prepared with J-ICE ' + titleGromacs);
	titleGromacs = 'titleg = \"' + titleGromacs + '\"; ';
	runJmolScriptWait(titleGromacs);

	setUnitCell();
	
	scaleModelCoordinates("xyz", "div", 10);
	
	var numatomsGrom = " " + _file.frameSelection + ".length";
	var coordinateGrom = _file.frameSelection
			+ '.label("  %i%e %i %e %8.3[xyz] %8.4fy %8.4fz")';
	var cellbox = +roundNumber(_file.cell.a) * (cosRounded(_file.cell.alpha)) + ' '
			+ roundNumber(_file.cell.b) * (cosRounded(_file.cell.beta)) + ' '
			+ roundNumber(_file.cell.c) * (cosRounded(_file.cell.gamma));
	var coordinateGromacs = 'var numatomGrom = ' + ' ' + numatomsGrom + ';'
			+ 'var coordGrom = ' + coordinateGrom + ';'
			+ 'var cellGrom = \" \n\t' + cellbox + '\"; '
			+ 'coordinate = [numatomGrom,coordGrom,cellGrom];';
	runJmolScriptWait(coordinateGromacs);
	
	scaleModelCoordinates("xyz", "mul", 10);
	
	var finalInputGromacs = "var final = [titleg,coordinate];"
			+ 'final = final.replace("\n\n","");' + 'WRITE VAR final "?.gro" ';
	runJmolScriptWait(finalInputGromacs);
}


 /*   based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

// ////////////GULP READER

var loadDone_gulp = function() {
	_file.energyUnits = _constant.ENERGY_EV;
	_file.StrUnitEnergy = "e";
	_file.counterFreq = 0;
	for (var i = 0; i < _file.info.length; i++) {
		var line = _file.info[i].name;
		if (i == 0) {
			line = "Intial";
		}
		addOption(getbyID('geom'), i + " " + line, i + 1);
		_file.geomData[i] = line;
		_file.counterFreq++;
	}

	runJmolScriptWait("script scripts/gulp_name.spt"); 
	getUnitcell("1");
	setFrameValues("1");
	//getSymInfo();
	loadDone();
}

///THIS ROUTINE IS TO EXPORT INPUT FOR GULP

function exportGULP() {
	
	var stringCellparamgulp;
	var coordinateAddgulp = "";
	var cellHeadergulp = "cell";
	var flagsymmetryGulp = false;

	warningMsg("Make sure you have selected the model you would like to export.");
	saveStateAndOrientation_a();
	if (_file.cell.typeSystem != "crystal")
		setUnitCell();
	
	var titleGulpinput = prompt("Type here the job title:", "");
	(titleGulpinput == "") ? (titleGulpinput = 'Input prepared with J-ICE ')
			: (titleGulpinput = '#Input prepared with J-ICE \n'
					+ titleGulpinput);
	var titleGulp = 'var optiongulp = \"opti conp propr #GULP options\";'
			+ 'var titleheader = \"title \"; ' + 'var title = \"'
			+ titleGulpinput + '\"; ' + 'var titleend = \"end \";'
			+ 'titlegulp = [optiongulp, titleheader, title, titleend];';
	runJmolScriptWait(titleGulp);

	switch (_file.cell.typeSystem) {
	case "crystal":
		setUnitCell();
		flagsymmetryGulp = confirm("Do you want to introduce symmetry ?");

		if (flagsymmetryGulp) {
			warningMsg("This procedure is not fully tested.");
			figureOutSpaceGroup(false, false);
		} else {
			stringCellparamgulp = roundNumber(_file.cell.a) + ' ' + roundNumber(_file.cell.b)
					+ ' ' + roundNumber(_file.cell.c) + ' ' + roundNumber(_file.cell.alpha) + ' '
					+ roundNumber(_file.cell.beta) + ' ' + roundNumber(_file.cell.gamma);
		}
		break;

	case "surface":
		cellHeadergulp = "scell";
		coordinateAddgulp = "s";
		stringCellparamgulp = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.b)
				+ ", " + roundNumber(_file.cell.gamma);
		break;

	case "polymer":
		cellHeadergulp = "pcell";
		coordinateAddgulp = "";
		stringCellparamgulp = roundNumber(_file.cell.a);
		break;

	case "molecule":
		// TODO

		break;
	}


	var cellGulp = 'var cellheader = \"' + cellHeadergulp + '\";'
		+ 'var cellparameter = \"' + stringCellparamgulp + '\";'
		+ 'cellgulp = [cellheader, cellparameter];';
	runJmolScriptWait(cellGulp);

	var coordinateString;
	var coordinateShel;
	var sortofCoordinateGulp;
	if (_file.cell.typeSystem == 'crystal') {
		var sortofCoordinate = confirm("Do you want the coordinates in Cartesian or fractional? \n OK for Cartesian, Cancel for fractional.")
		sortofCoordinateGulp = (sortofCoordinate == true) ? (coordinateAddgulp + "cartesian")
				: (coordinateAddgulp + "fractional");
	} else {
		messageMsg("Coordinate will be exported in Cartesian");
	}
	var flagShelgulp = confirm("Is the inter-atomic potential a core/shel one? \n Cancel stands for NO core/shel potential.");
	if (sortofCoordinateGulp && _file.cell.typeSystem == 'crystal') {
		coordinateString = _file.frameSelection + '.label("%e core %16.9[fxyz]")';
		coordinateShel = _file.frameSelection + '.label("%e shel %16.9[fxyz]")';
	} else {
		coordinateString = _file.frameSelection + '.label("%e core %16.9[xyz]")';
		coordinateShel = _file.frameSelection + '.label("%e shel %16.9[xyz]")';
	}
	var coordinateGulp;
	if (flagShelgulp) {
		coordinateGulp = 'var coordtype = \"' + sortofCoordinateGulp + '\";'
				+ 'var coordcore = ' + coordinateString + ';'
				+ 'var coordshel = ' + coordinateShel + ';'
				+ 'coordgulp = [coordtype, coordcore, coordshel];';
	} else {
		coordinateGulp = 'var coordtype = \"' + sortofCoordinateGulp + '\";'
				+ 'var coordcore = ' + coordinateString + ';'
				+ 'coordgulp = [coordtype, coordcore];';
	}
	runJmolScriptWait(coordinateGulp);

	if (_file.cell.typeSystem == "crystal") {
		// interNumber from crystalfunction .. BH??? interNumber is only defined locally in figureOutSpaceGroup
		if (!flagsymmetryGulp)
			_file.interNumber = "P 1"
		var spacegroupGulp = 'var spaceheader = \"spacegroup\";'
				+ 'var spacegroup = \"' + _file.interNumber + '\";'// TBC
				+ 'spacegulp = [spaceheader, spacegroup];';
		runJmolScriptWait(spacegroupGulp);
	}

	var restGulp;
	if (flagShelgulp) {
		restGulp = 'var species= \"species \" \n\n;'
				+ 'var restpot = \"#here the user should enter the inter-atomic potential setting\";'
				+ 'var spring = \"spring \"  \n\n;'
				+ 'restgulp = [species, restpot, spring];';
	} else {
		restGulp = 'var species= \"species \" \n\n;'
				+ 'var restpot = \"#here the user should enter the inter-atomic potential setting\";'
				+ 'restgulp = [species, restpot];';
	}
	runJmolScriptWait(restGulp);

	var finalInputGulp;
	if (_file.cell.typeSystem == "crystal") {
		finalInputGulp = "var final = [titlegulp,cellgulp,coordgulp,spacegulp,restgulp];"
				+ 'final = final.replace("\n\n","\n");'
				+ 'WRITE VAR final "?.gin" ';
	} else {
		finalInputGulp = "var final = [titlegulp,cellgulp,coordgulp,restgulp];"
				+ 'final = final.replace("\n\n","\n");'
				+ 'WRITE VAR final "?.gin" ';
	}
	runJmolScriptWait(finalInputGulp);
	restoreStateAndOrientation_a();

}

/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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


var loadDone_molden = function(msg) {

	_file.energyUnits = _constant.ENERGY_EV;
	_file.StrUnitEnergy = "e";
	
	for (var i = 0; i < _file.info.length; i++) {
		if (_file.info[i].name != null) {
			var line = _file.info[i].name;
			if (line.search(/cm/i) != -1) {
				var data = parseFloat(line.substring(0, line.indexOf("cm") - 1));
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(line);
				_file.vibLine.push(i + " A " + data + " cm^-1");
				_file.counterMD++;
			}
		}
	}

	//getSymInfo();
	loadDone();
}
/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

///// QUANTUM ESPRESSO READER

var loadDone_espresso = function() {
	
	_file.energyUnits = _constant.ENERGY_RYDBERG;
	_file.StrUnitEnergy = "R";
	_file.hasInputModel = true;

	for (var i = 0; i < _file.info.length; i++) {
		var line = _file.info[i].name;

		if (i == 0) {
			_file.geomData[0] = line;
			addOption(getbyID('geom'), "0 initial", 1);
		}
		if (line != null) {
			if (line.search(/E =/i) != -1) {
				addOption(getbyID('geom'), i + 1 + " " + line, i + 1);
				_file.geomData[i + 1] = line;
				_file.counterFreq++;
			} 
		}
	}
	getUnitcell("1");
	setFrameValues("1");
	//getSymInfo();
	loadDone();
}


/*&CONTROL
 title = 'alpha_PbO_PBE' ,
 calculation = 'vc-relax' ,
 restart_mode = 'from_scratch' ,
 outdir = '/home/pc229/backup/Counts/PWscf/alpha_PbO/' ,
 wfcdir = '/home/pc229/backup/Counts/PWscf/alpha_PbO/' ,
 pseudo_dir = '/home/pc229/backup/Counts/PWscf/alpha_PbO/pseudo/' ,
 prefix  =' alpha_PbO_PBE' ,
 /
 &SYSTEM
 ibrav = 6,
 celldm(1) = 7.511660805,
 celldm(3) = 1.263647799,
 nat = 4,
 ntyp = 2,
 ecutwfc = 50 ,
 nbnd = 60,
 nelec = 40,
 tot_charge = 0.000000,
 occupations = 'fixed' ,
 /
 &ELECTRONS
 mixing_beta = 0.3D0 ,
 /
 &IONS
 ion_dynamics = 'bfgs' ,
 /
 &CELL
 cell_dynamics = 'bfgs' ,
 /
 ATOMIC_SPECIES
 Pb  207.20000  Pb.pbe-d-van.UPF
 O   15.99400  O.pbe-van_ak.UPF
 ATOMIC_POSITIONS crystal
 Pb      0.000000000    0.500000000    0.238500000
 O      0.000000000    0.000000000    0.000000000
 Pb      0.500000000    0.000000000   -0.238500000
 O      0.500000000    0.500000000    0.000000000
 K_POINTS automatic
 4 4 4   0 0 0
 */

//Main block
function exportQuantum() {
	warningMsg("Make sure you have selected the model you would like to export.");
	prepareControlblock();
	prepareSystemblock();
	prepareElectronblock();
	prepareIonsblock();
	prepareCellblock();
	prepareSpecieblock();
	preparePostionblock();
	prepareKpoint();

	var finalInputQ = "var final = [control, system, electron, ions, cell, atomsp, posQ, kpo];"
		+ 'final = final.replace("\n\n"," ");' + 'WRITE VAR final "?.inp" ';
	runJmolScriptWait(finalInputQ);
}

function prepareControlblock() {

	var stringTitleNew, stringTitle = prompt("Type here the job title:", "");
	(stringTitle == "") ? (stringTitleNew = 'Input prepared with J-ICE ')
			: (stringTitleNew = 'Input prepared with J-ICE ' + stringTitle);

	// stringa = 'title= \'prova\','
	var controlQ = "var controlHeader = '\&CONTROL';"
		+ 'var controlTitle = "           title = \''
		+ stringTitleNew
		+ '\'";'
		+ 'var controlJob = "           calculation = \'  \'";'
		+ 'var controlRestart ="           restart = \'from_scratch\'";'
		+ 'var controlOutdir  ="           outdir = \' \'";'
		+ 'var controlWcfdir  ="           wcfdir = \' \'";'
		+ 'var controlPsddir  ="           pseudo_dir = \' \'";'
		+ 'var controlPrefix  ="           prefix = \''
		+ stringTitle
		+ '\'";'
		+ "var controlClose = '\/';"
		+ ' control = [controlHeader,controlTitle,controlJob,controlRestart,controlOutdir,controlWcfdir,controlPsddir,controlPrefix,controlClose];';
	runJmolScriptWait(controlQ);
	// IMPORTANT THE LAST VARIABLE MUST NOT BE CALL SUCH AS var xxxx
}

function prepareSystemblock() {
	// /here goes the symmetry part

	setUnitCell();

	var numberAtom = jmolEvaluate(_file.frameSelection + ".length");

	var stringCutoff = null;
	var stringCutoffrho = null;
	var stringElec = null;
	var stringBand = null;

	/*
	 * var stringCutoff = prompt("Do you know how much is the cutoff on the wave
	 * function? If YES please enter it in eV.") var stringCutoffrho = null;
	 * 
	 * if(stringCutoff != ""){ stringCutoff = fromevTorydberg(stringCutoff);
	 * stringCutoffrho = stringCutoff * 4; }
	 * 
	 * var stringElec = prompt("How many electron does your system have?");
	 * if(stringElec != ""){ stringElec = parseInt(stringElec); stringBand =
	 * parseInt((stringElec / 2) + (stringElec / 2 * 0.20)); }
	 */

	setUnitCell();
	
	var cellDimString, ibravQ;	
	switch (_file.cell.typeSystem) {
	case "crystal":
		var flagsymmetry = confirm("Do you want to introduce symmetry ?")
		if (!flagsymmetry) {
			cellDimString = "           celldm(1) = "
				+ roundNumber(fromAngstromToBohr(_file.cell.a))
				+ "  \n           celldm(2) =  "
				+ roundNumber(_file.cell.b / _file.cell.a)
				+ "  \n           celldm(3) =  "
				+ roundNumber(_file.cell.c / _file.cell.a)
				+ "  \n           celldm(4) =  "
				+ (cosRounded(_file.cell.alpha))
				+ "  \n           celldm(5) =  "
				+ (cosRounded(_file.cell.beta))
				+ "  \n           celldm(6) =  "
				+ (cosRounded(_file.cell.gamma));
			ibravQ = "14";
		} else {
			warningMsg("This procedure is not fully tested.");
			// magnetic = confirm("Does this structure have magnetic properties?
			// \n Cancel for NO.")
			figureOutSpaceGroup(true, false, true);
		}
		break;
	case "slab":
		setVacuum();
		scaleModelCoordinates("z", "div", _file.cell.c);
		cellDimString = "            celldm(1) = "
			+ roundNumber(fromAngstromToBohr(_file.cell.a))
			+ "  \n            celldm(2) =  " + roundNumber(_file.cell.b / _file.cell.a)
			+ "  \n            celldm(3) =  " + roundNumber(_file.cell.c / _file.cell.a)
			+ "  \n            celldm(4) =  "
			+ (cosRounded(_file.cell.alpha))
			+ "  \n            celldm(5) =  " + (cosRounded(90))
			+ "  \n            celldm(6) =  " + (cosRounded(90));
		ibravQ = "14";
		break;
	case "polymer":
		setVacuum();
		scaleModelCoordinates("z", "div", _file.cell.c);
		scaleModelCoordinates("y", "div", _file.cell.b);
		cellDimString = "            celldm(1) = "
			+ roundNumber(fromAngstromToBohr(_file.cell.a))
			+ "  \n            celldm(2) =  " + roundNumber(_file.cell.b / _file.cell.a)
			+ "  \n            celldm(3) =  " + roundNumber(_file.cell.b / _file.cell.a)
			+ "  \n            celldm(4) =  " + (cosRounded(90))
			+ "  \n            celldm(5) =  " + (cosRounded(90))
			+ "  \n            celldm(6) =  " + (cosRounded(90));
		ibravQ = "14";
		break;
	case "molecule":
		setVacuum();
		scaleModelCoordinates("x", "div", _file.cell.a);
		scaleModelCoordinates("y", "div", _file.cell.b);
		scaleModelCoordinates("z", "div", _file.cell.c);
		cellDimString = "            celldm(1) = "
			+ roundNumber(fromAngstromToBohr(_file.cell.a))
			+ "  \n            celldm(2) =  " + roundNumber(1.00000)
			+ "  \n            celldm(3) =  " + roundNumber(1.00000)
			+ "  \n            celldm(4) =  "
			+ (cosRounded(_file.cell.alpha))
			+ "  \n            celldm(5) =  " + (cosRounded(90))
			+ "  \n            celldm(6) =  " + (cosRounded(90));
		ibravQ = "14";
		break;
	}

	var elements = getElementList();

	var systemQ = "var systemHeader = '\&SYSTEM';"
		+ 'var systemIbrav = "           ibrav = '
		+ ibravQ
		+ '";' // This variable is defined in the crystal function
		+ 'var systemCelld = "'
		+ cellDimString
		+ '";'
		// + 'var systemNat = " nat = \' \'\,";'
		+ 'var systemNat = "           nat = '
		+ numberAtom
		+ '";'
		+ 'var systemNty = "           ntyp = '
		+ elements.length
		+ '";'
		+ 'var systemCut = "           ecutwfc = 40";'
		+ 'var systemToc = "           tot_charge = 0.000000";'
		+ 'var systemOcc = "           occupation = \' \'";' // #this
		// must be
		// fixed if
		// the
		// structure
		// is an
		// insulator
		+ "var systemClose= '\/';"
		+ ' system = [systemHeader, systemIbrav, systemCelld, systemNat,systemNty,systemCut,systemToc,systemOcc , systemClose];';
	runJmolScriptWait(systemQ);

}

//to be completed
function prepareElectronblock() {
	var electronQ = "var electronHeader = '\&ELECTRONS';"
		+ 'var electronBeta = "           mixing_beta = \'  \'";'
		+ "var electronClose= '\/';"
		+ ' electron = [electronHeader, electronBeta, electronClose];';
	runJmolScriptWait(electronQ);
}

//ask what algorithm to use window?
//set Tolerance as well!
function prepareIonsblock() {
	var ionsQ = "var ionHeader = '\&IONS';"
		+ 'var ionDyn = "           ion_dynamics= \'  \'";'
		+ "var ionClose= '\/';" + 'ions = [ionHeader, ionDyn, ionClose];';
	runJmolScriptWait(ionsQ);

}

function prepareCellblock() {
	var cellQ = "var cellHeader = '\&CELL';"
		+ 'var cellDyn = "           cell_dynamics= \'  \'";'
		+ "var cellClose= '\/';"
		+ 'cell = [cellHeader, cellDyn, cellClose];'
		+ 'cell = cell.replace("\n\n"," ");';
	runJmolScriptWait(cellQ);
}

//ATOMIC_SPECIES Pb 207.20000 Pb.pbe-d-van.UPF O 15.99400 O.pbe-van_ak.UPF


//To BE COMPLETED
function prepareSpecieblock() {
	setUnitCell();
	var scriptEl = "";
	var stringList = "";
	var sortedElement = getElementList();

	for (var i = 0; i < sortedElement.length; i++) {
		var elemento = sortedElement[i];
		var numeroAtom = jmolEvaluate('{' + _file.frameNum + ' and _' + elemento
				+ '}[0].label("%l")'); //tobe changed in atomic mass
		scriptEl = "'" + elemento + " " +  _constant.ELEM_MASS[parseInt(numeroAtom)]
		+ " #Here goes the psudopotential filename e.g.: " + elemento
		+ ".pbe-van_ak.UPF '";
		scriptEl = scriptEl.replace("\n", " ");
		if (i == 0) {
			stringList = scriptEl;
		} else {
			stringList = stringList + "," + scriptEl;
		}

		stringList = stringList.replace("\n", " ")

	}

	var atomspQ = "var atomsHeader = 'ATOMIC_SPECIES';" + 'var atomsList = ['
	+ stringList + '];' + 'atomsList = atomsList.replace("\n", " ");'
	// + 'atomList = atomList.join(" ");'
	+ 'atomsp =  [atomsHeader,atomsList];';
	runJmolScriptWait(atomspQ);
}

function preparePostionblock() {
	setUnitCell();
	var atompositionQ = "var posHeader = 'ATOMIC_POSITIONS crystal';"
		+ 'var posCoord = ' + _file.frameSelection + '.label(\"%e %14.9[fxyz]\");' // '.label(\"%e
		// %16.9[fxyz]\");'
		+ 'posQ = [posHeader,posCoord];';
	runJmolScriptWait(atompositionQ);
}

function prepareKpoint() {
	var kpointQ = "var kpointWh = '\n\n'  ;"
		+ "var kpointHeader = 'K_POINTS automatic';"
		+ "var kpointgr = ' X X X 0 0 0';"
		+ 'kpo = [kpointWh, kpointHeader, kpointgr];';
	runJmolScriptWait(kpointQ);
}

/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

//24th May 2011 P. Canepa


var loadDone_siesta = function(msg) {
	warningMsg("This is a molecular reader. Therefore not all properties will be available.")
	// Reset program and set filename if available
	// This also extract the auxiliary info

	_file.energyUnits = _constant.ENERGY_RYDBERG;
	_file.StrUnitEnergy = "R";
	for (var i = 0; i < _file.info.length; i++) {
		var line = _file.info[i].name;
		if (line != null) {
			if (line.search(/E/i) != -1) {
				addOption(getbyID('geom'), i + " " + line, i + 1);
				_file.geomSiesta[i] = line;
				if (_file.info[i].modelProperties.Energy != null
						|| _file.info[i].modelProperties.Energy != "")
					_file.energy[i] = _file.info[i].modelProperties.Energy;
				_file.counterFreq++;
			} else if (line.search(/cm/i) != -1) {
				_file.vibLine.push(i + " " + line + " ("
						+ _file.info[i].modelProperties.IRIntensity + ")");
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(_file.info[i].modelProperties.Frequency);
				_file.freqSymm.push(_file.info[i].modelProperties.FrequencyLabel);
				_file.freqIntens.push(_file.info[i].modelProperties.IRIntensity);
			}
		}
	}
	setFrameValues("1");
	setTitleEcho();
	loadDone();
}

/*  J-ICE library 

    based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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


var loadDone_vaspoutcar = function() {
	_file.energyUnits = _constant.ENERGY_EV;
	_file.StrUnitEnergy = "e";
	_file.counterFreq = 1; 
	for (var i = 0; i < _file.info.length; i++) {
		if (_file.info[i].name != null) {
			var line = _file.info[i].name;
			if (line.search(/G =/i) != -1) {
				addOption(getbyID('geom'), i + " " + line, i + 1);
				_file.geomData[i] = line;
				_file.counterFreq++;
			} else if (line.search(/cm/i) != -1) {
				var data = parseFloat(line.substring(0, line.indexOf("cm") - 1));	
				_file.freqInfo.push(_file.info[i]);
				_file.freqData.push(line);
				_file.vibLine.push(i + " A " + data + " cm^-1");
				_file.counterMD++;
			} else if (line.search(/Temp/i) != -1) {
				addOption(getbyID('geom'), (i - _file.counterMD) + " " + line, i + 1);
			}
		}
	}

	getUnitcell("1");
	setFrameValues("1");
	//getSymInfo();
	loadDone();
}

var loadDone_xmlvasp = function() {

	warningMsg("This reader is limited in its own functionalities\n  It does not recognize between \n geometry optimization and frequency calculations.")

	// _file.... ? 
	
	for (var i = 0; i < _file.info.length; i++) {
		if (_file.info[i].name != null) {
			var valueEnth = _file.info[i].name.substring(11, 24);
			var gibbs = _file.info[i].name.substring(41, 54);
			var stringa = "Enth. = " + valueEnth + " eV, Gibbs E.= " + gibbs
			+ " eV";
			
			addOption(getbyID('geom'), i + " " + stringa, i + 1);
		}
	}
	getUnitcell("1");
	setTitleEcho();
	loadDone();
}

////EXPORT FUNCTIONS
function exportVASP() {
	var newElement = [];
	var scriptEl = "";
	var stringTitle = "";
	var stringList = "";
	var stringElement = "";
	getUnitcell(_file.frameValue);
	setUnitCell();
	var sortedElement = getElementList();
	for (var i = 0; i < sortedElement.length; i++) {
		// scriptEl = "";
		scriptEl = "{" + _file.frameNum + " and _" + sortedElement[i] + "}.length";

		if (i != (sortedElement.length - 1)) {
			stringList = stringList + " " + scriptEl + ", ";
			stringTitle = stringTitle + " " + scriptEl + ", ";
			stringElement = stringElement + " " + sortedElement[i] + ", ";
		} else {
			stringList = stringList + " " + scriptEl;
			stringTitle = stringTitle + " " + scriptEl;
			stringElement = stringElement + " " + sortedElement[i];
		}
	}

	var lattice = fromfractionaltoCartesian();

	warningMsg("Make sure you have selected the model you would like to export.");
	var vaspFile = prompt("Type here the job title:", "");
	(vaspFile == "") ? (vaspFile = 'POSCAR prepared with J-ICE whose atoms are: ')
			: (vaspFile = 'POSCAR prepared with J-ICE ' + vaspFile
					+ ' whose atoms are:');
	saveStateAndOrientation_a();
	// This if the file come from crystal output

	_measure.kindCoord = null;
	var fractString = null;
	if (prompt("Would you like to export the structure in fractional coordinates?", "yes") == "yes") {
		_measure.kindCoord = "Direct"
			fractString = "[fxyz]";
		_file._exportFractionalCoord = true;
	} else {
		_measure.kindCoord = "Cartesian"
			fractString = "[xyz]";
		_file._exportFractionalCoord = false;
	}

	setVacuum();

	var stringVasp = "var titleVasp = ["
		+ stringTitle
		+ "];"
		+ 'var title  = titleVasp.join("  ");'
		+ "var head  ='"
		+ vaspFile
		+ "';"
		+ "var atomLab ='"
		+ stringElement
		+ "';"
		+ 'var titleArr =[head, title, atomLab];'
		+ 'var titleLin = titleArr.join(" ");'
		+ 'var scaleFact = 1.000000;' // imp
		+ 'var vaspCellX = [' + lattice[0] + '].join(" ");'
		+ 'var vaspCellY = [' + lattice[1] + '].join(" ");'
		+ 'var vaspCellZ = [' + lattice[2] + '].join(" ");'
		+ 'var listEle  = [atomLab.replace(",","")];'
		+ 'var listLabel  = listEle.join("  ");'
		+ "var listInpcar = ["
		+ stringList
		+ "];"// imp
		+ 'var listAtom  = listInpcar.join("  ");'
		+ 'var cartString = "'
		+ _measure.kindCoord
		+ '";' // imp
		+ 'var xyzCoord = '
		+ _file.frameSelection
		+ '.label(" %16.9'
		+ fractString
		+ '");' // imp
		+ 'var lista = [titleLin, scaleFact, vaspCellX, vaspCellY, vaspCellZ, listLabel, listAtom, cartString, xyzCoord];' // misses
		// listInpcar
		+ 'var cleaned  = lista.replace("[","");'
		+ 'WRITE VAR cleaned "POSCAR.vasp" ';
	runJmolScriptWait(stringVasp);
	restoreStateAndOrientation_a();
}

/////// END EXPORT VASP

// BH 2018

var _callback = {
	fPick : null
}

var getCallbackSettings = function() {
	return	"set errorCallback 'myErrorCallback';" +
			"set loadStructCallback 'myLoadStructCallback';" +
			"set measureCallback 'myMeasurementCallback';" +
			"set pickCallback 'myPickCallback';" +
			"set minimizationCallback 'myMinimizationCallback';"
}

var myMeasurementCallback = function(app, msg, type, state, value) {
	// BH 2018
	if (state == "measurePicked")
		_measure.setMeasureText(msg);
}

var myLoadStructCallback = function(applet,filePath,c,d) {
	if (filePath)
		file_loadedCallback(filePath);
}

var myErrorCallback = function(applet, b, msg, d) {
	errorMsg(msg);
}



var setPickingCallbackFunction = function(f) {
	_callback.fPick = f;
}

var myPickCallback = function(applet, b, c, d) {
	_callback.fPick && _callback.fPick(b,c,d);
}

var setMinimizationCallbackFunction = function(f) {
	_file.fMinim = f;
}

var myMinimizationCallback = function(applet,b,c,d) {
	_file.fMinim && _file.fMinim(b, c, d);
}

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




_constant.ENERGY_EV      = 0;
_constant.ENERGY_HARTREE = 1;
_constant.ENERGY_RYDBERG = 2;

_constant.ELEM_SYM = [
	//0
	 "select",
	//1
	 "H",
	//2
	 "He",
	//3
	 "Li",
	//4
	 "Be",
	//5
	 "B",
	//6
	 "C",
	//7
	 "N",
	//8
	 "O",
	//9
	 "F",
	//10
	 "Ne",
	//11
	 "Na",
	//12
	 "Mg",
	//13
	 "Al",
	//14
	 "Si",
	//15
	 "P",
	//16
	 "S",
	//17
	 "Cl",
	//18
	 "Ar",
	//19
	 "K",
	//20
	 "Ca",
	//21
	 "Sc",
	//22
	 "Ti",
	//23
	 "V",
	//24
	 "Cr",
	//25
	 "Mn",
	//26
	 "Fe",
	//27
	 "Co",
	//28
	 "Ni",
	//29
	 "Cu",
	//30
	 "Zn",
	//31
	 "Ga",
	//32
	 "Ge",
	//33
	 "As",
	//34
	 "Se",
	//35
	 "Br",
	//36
	 "No",
	//37
	 "Rb",
	//38
	 "Sr",
	//39
	 "Y",
	//40
	 "Zr",
	//41
	 "Nb",
	//42
	 "Mo",
	//43
	 "Tc",
	//44
	 "Ru",
	//45
	 "Rh",
	//46
	 "Pd",
	//47
	 "Ag",
	//48
	 "Cd",
	//49
	 "In",
	//50
	 "Sn",
	//51
	 "Sb",
	//52
	 "Te",
	//53
	 "I",
	//54
	 "Xe",
	//55
	 "Cs",
	//56
	 "Ba",
	//57
	 "La",
	//58
	 "Ce",
	//59
	 "Lr",
	//60
	 "Md",
	//61
	 "Pr",
	//62
	 "Sm",
	//63
	 "Eu",
	//64
	 "Gd",
	//65
	 "Tb",
	//66
	 "Dy",
	//67
	 "Ho",
	//68
	 "Er",
	//69
	 "Tm",
	//70
	 "Yb",
	//71
	 "Lu",
	//72
	 "Hf",
	//73
	 "Ta",
	//74
	 "W",
	//75
	 "Re",
	//76
	 "Os",
	//77
	 "Ir",
	//78
	 "Pt",
	//79
	 "Au",
	//80
	 "Hg",
	//81
	 "Tl",
	//82
	 "Pb",
	//83
	 "Bi",
	//84
	 "Po",
	//85
	 "At",
	//86
	 "Rd",
	//87
	 "Fr",
	//88
	 "Rn",
	//89
	 "Ac",
	//90
	 "Th",
	//91
	 "Pa",
	//92
	 "Sg",
	//93
	 "Np",
	//94
	 "Pu",
	//95
	 "Am",
	//96
	 "Cm",
	//97
	 "Bk",
	//98
	 "Cf",
	//99
	 "Es"
	 ];

////Arrays elements : 594
_constant.SPACE_GROUP_NAME = ["select", "1, P1", "2, P-1", "3:b, P121",
		"3:b, P2", "3:c, P112", "3:a, P211", "4:b, P1211", "4:b, P21",
		"4:b*, P1211*", "4:c, P1121", "4:c*, P1121*", "4:a, P2111",
		"4:a*, P2111*", "5:b1, C121", "5:b1, C2", "5:b2, A121", "5:b3, I121",
		"5:c1, A112", "5:c2, B112", "5:c3, I112", "5:a1, B211", "5:a2, C211",
		"5:a3, I211", "6:b, P1m1", "6:b, Pm", "6:c, P11m", "6:a, Pm11",
		"7:b1, P1c1", "7:b1, Pc", "7:b2, P1n1", "7:b2, Pn", "7:b3, P1a1",
		"7:b3, Pa", "7:c1, P11a", "7:c2, P11n", "7:c3, P11b", "7:a1, Pb11",
		"7:a2, Pn11", "7:a3, Pc11", "8:b1, C1m1", "8:b1, Cm", "8:b2, A1m1",
		"8:b3, I1m1", "8:b3, Im", "8:c1, A11m", "8:c2, B11m", "8:c3, I11m",
		"8:a1, Bm11", "8:a2, Cm11", "8:a3, Im11", "9:b1, C1c1", "9:b1, Cc",
		"9:b2, A1n1", "9:b3, I1a1", "9:-b1, A1a1", "9:-b2, C1n1",
		"9:-b3, I1c1", "9:c1, A11a", "9:c2, B11n", "9:c3, I11b", "9:-c1, B11b",
		"9:-c2, A11n", "9:-c3, I11a", "9:a1, Bb11", "9:a2, Cn11", "9:a3, Ic11",
		"9:-a1, Cc11", "9:-a2, Bn11", "9:-a3, Ib11", "10:b, P12/m1",
		"10:b, P2/m", "10:c, P112/m", "10:a, P2/m11", "11:b, P121/m1",
		"11:b, P21/m", "11:b*, P121/m1*", "11:c, P1121/m", "11:c*, P1121/m*",
		"11:a, P21/m11", "11:a*, P21/m11*", "12:b1, C12/m1", "12:b1, C2/m",
		"12:b2, A12/m1", "12:b3, I12/m1", "12:b3, I2/m", "12:c1, A112/m",
		"12:c2, B112/m", "12:c3, I112/m", "12:a1, B2/m11", "12:a2, C2/m11",
		"12:a3, I2/m11", "13:b1, P12/c1", "13:b1, P2/c", "13:b2, P12/n1",
		"13:b2, P2/n", "13:b3, P12/a1", "13:b3, P2/a", "13:c1, P112/a",
		"13:c2, P112/n", "13:c3, P112/b", "13:a1, P2/b11", "13:a2, P2/n11",
		"13:a3, P2/c11", "14:b1, P121/c1", "14:b1, P21/c", "14:b2, P121/n1",
		"14:b2, P21/n", "14:b3, P121/a1", "14:b3, P21/a", "14:c1, P1121/a",
		"14:c2, P1121/n", "14:c3, P1121/b", "14:a1, P21/b11", "14:a2, P21/n11",
		"14:a3, P21/c11", "15:b1, C12/c1", "15:b1, C2/c", "15:b2, A12/n1",
		"15:b3, I12/a1", "15:b3, I2/a", "15:-b1, A12/a1", "15:-b2, C12/n1",
		"15:-b2, C2/n", "15:-b3, I12/c1", "15:-b3, I2/c", "15:c1, A112/a",
		"15:c2, B112/n", "15:c3, I112/b", "15:-c1, B112/b", "15:-c2, A112/n",
		"15:-c3, I112/a", "15:a1, B2/b11", "15:a2, C2/n11", "15:a3, I2/c11",
		"15:-a1, C2/c11", "15:-a2, B2/n11", "15:-a3, I2/b11", "16, P222",
		"17, P2221", "17*, P2221*", "17:cab, P2122", "17:bca, P2212",
		"18, P21212", "18:cab, P22121", "18:bca, P21221", "19, P212121",
		"20, C2221", "20*, C2221*", "20:cab, A2122", "20:cab*, A2122*",
		"20:bca, B2212", "21, C222", "21:cab, A222", "21:bca, B222",
		"22, F222", "23, I222", "24, I212121", "25, Pmm2", "25:cab, P2mm",
		"25:bca, Pm2m", "26, Pmc21", "26*, Pmc21*", "26:ba-c, Pcm21",
		"26:ba-c*, Pcm21*", "26:cab, P21ma", "26:-cba, P21am", "26:bca, Pb21m",
		"26:a-cb, Pm21b", "27, Pcc2", "27:cab, P2aa", "27:bca, Pb2b",
		"28, Pma2", "28*, Pma2*", "28:ba-c, Pbm2", "28:cab, P2mb",
		"28:-cba, P2cm", "28:-cba*, P2cm*", "28:bca, Pc2m", "28:a-cb, Pm2a",
		"29, Pca21", "29:ba-c, Pbc21", "29:cab, P21ab", "29:-cba, P21ca",
		"29:bca, Pc21b", "29:a-cb, Pb21a", "30, Pnc2", "30:ba-c, Pcn2",
		"30:cab, P2na", "30:-cba, P2an", "30:bca, Pb2n", "30:a-cb, Pn2b",
		"31, Pmn21", "31:ba-c, Pnm21", "31:cab, P21mn", "31:-cba, P21nm",
		"31:bca, Pn21m", "31:a-cb, Pm21n", "32, Pba2", "32:cab, P2cb",
		"32:bca, Pc2a", "33, Pna21", "33*, Pna21*", "33:ba-c, Pbn21",
		"33:ba-c*, Pbn21*", "33:cab, P21nb", "33:cab*, P21nb*",
		"33:-cba, P21cn", "33:-cba*, P21cn*", "33:bca, Pc21n",
		"33:a-cb, Pn21a", "34, Pnn2", "34:cab, P2nn", "34:bca, Pn2n",
		"35, Cmm2", "35:cab, A2mm", "35:bca, Bm2m", "36, Cmc21", "36*, Cmc21*",
		"36:ba-c, Ccm21", "36:ba-c*, Ccm21*", "36:cab, A21ma",
		"36:cab*, A21ma*", "36:-cba, A21am", "36:-cba*, A21am*",
		"36:bca, Bb21m", "36:a-cb, Bm21b", "37, Ccc2", "37:cab, A2aa",
		"37:bca, Bb2b", "38, Amm2", "38:ba-c, Bmm2", "38:cab, B2mm",
		"38:-cba, C2mm", "38:bca, Cm2m", "38:a-cb, Am2m", "39, Abm2",
		"39:ba-c, Bma2", "39:cab, B2cm", "39:-cba, C2mb", "39:bca, Cm2a",
		"39:a-cb, Ac2m", "40, Ama2", "40:ba-c, Bbm2", "40:cab, B2mb",
		"40:-cba, C2cm", "40:bca, Cc2m", "40:a-cb, Am2a", "41, Aba2",
		"41:ba-c, Bba2", "41:cab, B2cb", "41:-cba, C2cb", "41:bca, Cc2a",
		"41:a-cb, Ac2a", "42, Fmm2", "42:cab, F2mm", "42:bca, Fm2m",
		"43, Fdd2", "43:cab, F2dd", "43:bca, Fd2d", "44, Imm2", "44:cab, I2mm",
		"44:bca, Im2m", "45, Iba2", "45:cab, I2cb", "45:bca, Ic2a", "46, Ima2",
		"46:ba-c, Ibm2", "46:cab, I2mb", "46:-cba, I2cm", "46:bca, Ic2m",
		"46:a-cb, Im2a", "47, Pmmm", "48:01:00, Pnnn", "48:02:00, Pnnn",
		"49, Pccm", "49:cab, Pmaa", "49:bca, Pbmb", "50:01:00, Pban",
		"50:02:00, Pban", "50:1cab, Pncb", "50:2cab, Pncb", "50:1bca, Pcna",
		"50:2bca, Pcna", "51, Pmma", "51:ba-c, Pmmb", "51:cab, Pbmm",
		"51:-cba, Pcmm", "51:bca, Pmcm", "51:a-cb, Pmam", "52, Pnna",
		"52:ba-c, Pnnb", "52:cab, Pbnn", "52:-cba, Pcnn", "52:bca, Pncn",
		"52:a-cb, Pnan", "53, Pmna", "53:ba-c, Pnmb", "53:cab, Pbmn",
		"53:-cba, Pcnm", "53:bca, Pncm", "53:a-cb, Pman", "54, Pcca",
		"54:ba-c, Pccb", "54:cab, Pbaa", "54:-cba, Pcaa", "54:bca, Pbcb",
		"54:a-cb, Pbab", "55, Pbam", "55:cab, Pmcb", "55:bca, Pcma",
		"56, Pccn", "56:cab, Pnaa", "56:bca, Pbnb", "57, Pbcm",
		"57:ba-c, Pcam", "57:cab, Pmca", "57:-cba, Pmab", "57:bca, Pbma",
		"57:a-cb, Pcmb", "58, Pnnm", "58:cab, Pmnn", "58:bca, Pnmn",
		"59:01:00, Pmmn", "59:02:00, Pmmn", "59:1cab, Pnmm", "59:2cab, Pnmm",
		"59:1bca, Pmnm", "59:2bca, Pmnm", "60, Pbcn", "60:ba-c, Pcan",
		"60:cab, Pnca", "60:-cba, Pnab", "60:bca, Pbna", "60:a-cb, Pcnb",
		"61, Pbca", "61:ba-c, Pcab", "62, Pnma", "62:ba-c, Pmnb",
		"62:cab, Pbnm", "62:-cba, Pcmn", "62:bca, Pmcn", "62:a-cb, Pnam",
		"63, Cmcm", "63:ba-c, Ccmm", "63:cab, Amma", "63:-cba, Amam",
		"63:bca, Bbmm", "63:a-cb, Bmmb", "64, Cmca", "64:ba-c, Ccmb",
		"64:cab, Abma", "64:-cba, Acam", "64:bca, Bbcm", "64:a-cb, Bmab",
		"65, Cmmm", "65:cab, Ammm", "65:bca, Bmmm", "66, Cccm", "66:cab, Amaa",
		"66:bca, Bbmb", "67, Cmma", "67:ba-c, Cmmb", "67:cab, Abmm",
		"67:-cba, Acmm", "67:bca, Bmcm", "67:a-cb, Bmam", "68:01:00, Ccca",
		"68:02:00, Ccca", "68:1ba-c, Cccb", "68:2ba-c, Cccb", "68:1cab, Abaa",
		"68:2cab, Abaa", "68:1-cba, Acaa", "68:2-cba, Acaa", "68:1bca, Bbcb",
		"68:2bca, Bbcb", "68:1a-cb, Bbab", "68:2a-cb, Bbab", "69, Fmmm",
		"70:01:00, Fddd", "70:02:00, Fddd", "71, Immm", "72, Ibam",
		"72:cab, Imcb", "72:bca, Icma", "73, Ibca", "73:ba-c, Icab",
		"74, Imma", "74:ba-c, Immb", "74:cab, Ibmm", "74:-cba, Icmm",
		"74:bca, Imcm", "74:a-cb, Imam", "75, P4", "76, P41", "76*, P41*",
		"77, P42", "77*, P42*", "78, P43", "78*, P43*", "79, I4", "80, I41",
		"81, P-4", "82, I-4", "83, P4/m", "84, P42/m", "84*, P42/m*",
		"85:01:00, P4/n", "85:02:00, P4/n", "86:01:00, P42/n",
		"86:02:00, P42/n", "87, I4/m", "88:01:00, I41/a", "88:02:00, I41/a",
		"89, P422", "90, P4212", "91, P4122", "91*, P4122*", "92, P41212",
		"93, P4222", "93*, P4222*", "94, P42212", "95, P4322", "95*, P4322*",
		"96, P43212", "97, I422", "98, I4122", "99, P4mm", "100, P4bm",
		"101, P42cm", "101*, P42cm*", "102, P42nm", "103, P4cc", "104, P4nc",
		"105, P42mc", "105*, P42mc*", "106, P42bc", "106*, P42bc*",
		"107, I4mm", "108, I4cm", "109, I41md", "110, I41cd", "111, P-42m",
		"112, P-42c", "113, P-421m", "114, P-421c", "115, P-4m2", "116, P-4c2",
		"117, P-4b2", "118, P-4n2", "119, I-4m2", "120, I-4c2", "121, I-42m",
		"122, I-42d", "123, P4/mmm", "124, P4/mcc", "125:01:00, P4/nbm",
		"125:02:00, P4/nbm", "126:01:00, P4/nnc", "126:02:00, P4/nnc",
		"127, P4/mbm", "128, P4/mnc", "129:01:00, P4/nmm", "129:02:00, P4/nmm",
		"130:01:00, P4/ncc", "130:02:00, P4/ncc", "131, P42/mmc",
		"132, P42/mcm", "133:01:00, P42/nbc", "133:02:00, P42/nbc",
		"134:01:00, P42/nnm", "134:02:00, P42/nnm", "135, P42/mbc",
		"135*, P42/mbc*", "136, P42/mnm", "137:01:00, P42/nmc",
		"137:02:00, P42/nmc", "138:01:00, P42/ncm", "138:02:00, P42/ncm",
		"139, I4/mmm", "140, I4/mcm", "141:01:00, I41/amd",
		"141:02:00, I41/amd", "142:01:00, I41/acd", "142:02:00, I41/acd",
		"143, P3", "144, P31", "145, P32", "146:h, R3", "146:r, R3",
		"147, P-3", "148:h, R-3", "148:r, R-3", "149, P312", "150, P321",
		"151, P3112", "152, P3121", "153, P3212", "154, P3221", "155:h, R32",
		"155:r, R32", "156, P3m1", "157, P31m", "158, P3c1", "159, P31c",
		"160:h, R3m", "160:r, R3m", "161:h, R3c", "161:r, R3c", "162, P-31m",
		"163, P-31c", "164, P-3m1", "165, P-3c1", "166:h, R-3m", "166:r, R-3m",
		"167:h, R-3c", "167:r, R-3c", "168, P6", "169, P61", "170, P65",
		"171, P62", "172, P64", "173, P63", "173*, P63*", "174, P-6",
		"175, P6/m", "176, P63/m", "176*, P63/m*", "177, P622", "178, P6122",
		"179, P6522", "180, P6222", "181, P6422", "182, P6322", "182*, P6322*",
		"183, P6mm", "184, P6cc", "185, P63cm", "185*, P63cm*", "186, P63mc",
		"186*, P63mc*", "187, P-6m2", "188, P-6c2", "189, P-62m", "190, P-62c",
		"191, P6/mmm", "192, P6/mcc", "193, P63/mcm", "193*, P63/mcm*",
		"194, P63/mmc", "194*, P63/mmc*", "195, P23", "196, F23", "197, I23",
		"198, P213", "199, I213", "200, Pm-3", "201:01:00, Pn-3",
		"201:02:00, Pn-3", "202, Fm-3", "203:01:00, Fd-3", "203:02:00, Fd-3",
		"204, Im-3", "205, Pa-3", "206, Ia-3", "207, P432", "208, P4232",
		"209, F432", "210, F4132", "211, I432", "212, P4332", "213, P4132",
		"214, I4132", "215, P-43m", "216, F-43m", "217, I-43m", "218, P-43n",
		"219, F-43c", "220, I-43d", "221, Pm-3m", "222:01:00, Pn-3n",
		"222:02:00, Pn-3n", "223, Pm-3n", "224:01:00, Pn-3m",
		"224:02:00, Pn-3m", "225, Fm-3m", "226, Fm-3c", "227:01:00, Fd-3m",
		"227:02:00, Fd-3m", "228:01:00, Fd-3c", "228:02:00, Fd-3c",
		"229, Im-3m", "230, Ia-3d"
		];

_constant.SPACE_GROUP_VALUE = ["select", "1", "2", "3:b", "3:b", "3:c", "3:a",
		"4:b", "4:b", "4:b*", "4:c", "4:c*", "4:a", "4:a*", "5:b1", "5:b1",
		"5:b2", "5:b3", "5:c1", "5:c2", "5:c3", "5:a1", "5:a2", "5:a3", "6:b",
		"6:b", "6:c", "6:a", "7:b1", "7:b1", "7:b2", "7:b2", "7:b3", "7:b3",
		"7:c1", "7:c2", "7:c3", "7:a1", "7:a2", "7:a3", "8:b1", "8:b1", "8:b2",
		"8:b3", "8:b3", "8:c1", "8:c2", "8:c3", "8:a1", "8:a2", "8:a3", "9:b1",
		"9:b1", "9:b2", "9:b3", "9:-b1", "9:-b2", "9:-b3", "9:c1", "9:c2",
		"9:c3", "9:-c1", "9:-c2", "9:-c3", "9:a1", "9:a2", "9:a3", "9:-a1",
		"9:-a2", "9:-a3", "10:b", "10:b", "10:c", "10:a", "11:b", "11:b",
		"11:b*", "11:c", "11:c*", "11:a", "11:a*", "12:b1", "12:b1", "12:b2",
		"12:b3", "12:b3", "12:c1", "12:c2", "12:c3", "12:a1", "12:a2", "12:a3",
		"13:b1", "13:b1", "13:b2", "13:b2", "13:b3", "13:b3", "13:c1", "13:c2",
		"13:c3", "13:a1", "13:a2", "13:a3", "14:b1", "14:b1", "14:b2", "14:b2",
		"14:b3", "14:b3", "14:c1", "14:c2", "14:c3", "14:a1", "14:a2", "14:a3",
		"15:b1", "15:b1", "15:b2", "15:b3", "15:b3", "15:-b1", "15:-b2",
		"15:-b2", "15:-b3", "15:-b3", "15:c1", "15:c2", "15:c3", "15:-c1",
		"15:-c2", "15:-c3", "15:a1", "15:a2", "15:a3", "15:-a1", "15:-a2",
		"15:-a3", "16", "17", "17*", "17:cab", "17:bca", "18", "18:cab",
		"18:bca", "19", "20", "20*", "20:cab", "20:cab*", "20:bca", "21",
		"21:cab", "21:bca", "22", "23", "24", "25", "25:cab", "25:bca", "26",
		"26*", "26:ba-c", "26:ba-c*", "26:cab", "26:-cba", "26:bca", "26:a-cb",
		"27", "27:cab", "27:bca", "28", "28*", "28:ba-c", "28:cab", "28:-cba",
		"28:-cba*", "28:bca", "28:a-cb", "29", "29:ba-c", "29:cab", "29:-cba",
		"29:bca", "29:a-cb", "30", "30:ba-c", "30:cab", "30:-cba", "30:bca",
		"30:a-cb", "31", "31:ba-c", "31:cab", "31:-cba", "31:bca", "31:a-cb",
		"32", "32:cab", "32:bca", "33", "33*", "33:ba-c", "33:ba-c*", "33:cab",
		"33:cab*", "33:-cba", "33:-cba*", "33:bca", "33:a-cb", "34", "34:cab",
		"34:bca", "35", "35:cab", "35:bca", "36", "36*", "36:ba-c", "36:ba-c*",
		"36:cab", "36:cab*", "36:-cba", "36:-cba*", "36:bca", "36:a-cb", "37",
		"37:cab", "37:bca", "38", "38:ba-c", "38:cab", "38:-cba", "38:bca",
		"38:a-cb", "39", "39:ba-c", "39:cab", "39:-cba", "39:bca", "39:a-cb",
		"40", "40:ba-c", "40:cab", "40:-cba", "40:bca", "40:a-cb", "41",
		"41:ba-c", "41:cab", "41:-cba", "41:bca", "41:a-cb", "42", "42:cab",
		"42:bca", "43", "43:cab", "43:bca", "44", "44:cab", "44:bca", "45",
		"45:cab", "45:bca", "46", "46:ba-c", "46:cab", "46:-cba", "46:bca",
		"46:a-cb", "47", "48:01:00", "48:02:00", "49", "49:cab", "49:bca",
		"50:01:00", "50:02:00", "50:1cab", "50:2cab", "50:1bca", "50:2bca",
		"51", "51:ba-c", "51:cab", "51:-cba", "51:bca", "51:a-cb", "52",
		"52:ba-c", "52:cab", "52:-cba", "52:bca", "52:a-cb", "53", "53:ba-c",
		"53:cab", "53:-cba", "53:bca", "53:a-cb", "54", "54:ba-c", "54:cab",
		"54:-cba", "54:bca", "54:a-cb", "55", "55:cab", "55:bca", "56",
		"56:cab", "56:bca", "57", "57:ba-c", "57:cab", "57:-cba", "57:bca",
		"57:a-cb", "58", "58:cab", "58:bca", "59:01:00", "59:02:00", "59:1cab",
		"59:2cab", "59:1bca", "59:2bca", "60", "60:ba-c", "60:cab", "60:-cba",
		"60:bca", "60:a-cb", "61", "61:ba-c", "62", "62:ba-c", "62:cab",
		"62:-cba", "62:bca", "62:a-cb", "63", "63:ba-c", "63:cab", "63:-cba",
		"63:bca", "63:a-cb", "64", "64:ba-c", "64:cab", "64:-cba", "64:bca",
		"64:a-cb", "65", "65:cab", "65:bca", "66", "66:cab", "66:bca", "67",
		"67:ba-c", "67:cab", "67:-cba", "67:bca", "67:a-cb", "68:01:00",
		"68:02:00", "68:1ba-c", "68:2ba-c", "68:1cab", "68:2cab", "68:1-cba",
		"68:2-cba", "68:1bca", "68:2bca", "68:1a-cb", "68:2a-cb", "69",
		"70:01:00", "70:02:00", "71", "72", "72:cab", "72:bca", "73",
		"73:ba-c", "74", "74:ba-c", "74:cab", "74:-cba", "74:bca", "74:a-cb",
		"75", "76", "76*", "77", "77*", "78", "78*", "79", "80", "81", "82",
		"83", "84", "84*", "85:01:00", "85:02:00", "86:01:00", "86:02:00",
		"87", "88:01:00", "88:02:00", "89", "90", "91", "91*", "92", "93",
		"93*", "94", "95", "95*", "96", "97", "98", "99", "100", "101", "101*",
		"102", "103", "104", "105", "105*", "106", "106*", "107", "108", "109",
		"110", "111", "112", "113", "114", "115", "116", "117", "118", "119",
		"120", "121", "122", "123", "124", "125:01:0", "125:02:0", "126:01:0",
		"126:02:0", "127", "128", "129:01:0", "129:02:0", "130:01:0",
		"130:02:0", "131", "132", "133:01:0", "133:02:0", "134:01:0",
		"134:02:0", "135", "135*", "136", "137:01:0", "137:02:0", "138:01:0",
		"138:02:0", "139", "140", "141:01:0", "141:02:0", "142:01:0",
		"142:02:0", "143", "144", "145", "146:h", "146:r", "147", "148:h",
		"148:r", "149", "150", "151", "152", "153", "154", "155:h", "155:r",
		"156", "157", "158", "159", "160:h", "160:r", "161:h", "161:r", "162",
		"163", "164", "165", "166:h", "166:r", "167:h", "167:r", "168", "169",
		"170", "171", "172", "173", "173*", "174", "175", "176", "176*", "177",
		"178", "179", "180", "181", "182", "182*", "183", "184", "185", "185*",
		"186", "186*", "187", "188", "189", "190", "191", "192", "193", "193*",
		"194", "194*", "195", "196", "197", "198", "199", "200", "201:01:0",
		"201:02:0", "202", "203:01:0", "203:02:0", "204", "205", "206", "207",
		"208", "209", "210", "211", "212", "213", "214", "215", "216", "217",
		"218", "219", "220", "221", "222:01:0", "222:02:0", "223", "224:01:0",
		"224:02:0", "225", "226", "227:01:0", "227:02:0", "228:01:0",
		"228:02:0", "229", "230"
		];

_constant.ELEM_MASS = [
	
	//0
	 "select",
	//1
	 1.00,
	//2
	 4.00,
	//3
	 6.94,
	//4
	 9.01,
	//5
	 10.81,
	//6
	 12.01,
	//7
	 14.01,
	//8
	 16.00,
	//9
	 19.00,
	//10
	 20.18,
	//11
	 22.99,
	//12
	 24.31,
	//13
	 26.98,
	//14
	 28.09,
	//15
	 30.97,
	//16
	 32.06,
	//17
	 35.45,
	//18
	 39.95,
	//19
	 39.10,
	//20
	 40.08,
	//21
	 44.96,
	//22
	 47.88,
	//23
	 50.94,
	//24
	 52.00,
	//25
	 54.94,
	//26
	 55.85,
	//27
	 58.93,
	//28
	 58.69,
	//29
	 63.55,
	//30
	 65.38,
	//31
	 69.72,
	//32
	 72.59,
	//33
	 74.92,
	//34
	 78.96,
	//35
	 79.90,
	//36
	 83.80,
	//37
	 85.47,
	//38
	 87.62,
	//39
	 88.91,
	//40
	 91.22,
	//41
	 92.91,
	//42
	 95.94,
	//43
	 98.00,
	//44
	 101.07,
	//45
	 102.91,
	//46
	 106.42,
	//47
	 107.87,
	//48
	 112.41,
	//49
	 114.82,
	//50
	 118.69,
	//51
	 121.75,
	//52
	 127.60,
	//53
	 126.90,
	//54
	 131.29,
	//55
	 132.91,
	//56
	 137.34,
	//57
	 138.91,
	//58
	 140.12,
	//59
	 140.91,
	//60
	 144.24,
	//61
	 145.00,
	//62
	 150.36,
	//63
	 151.96,
	//64
	 157.25,
	//65
	 158.93,
	//66
	 162.50,
	//67
	 164.93,
	//68
	 167.26,
	//69
	 168.93,
	//70
	 173.04,
	//71
	 174.97,
	//72
	 178.49,
	//73
	 180.95,
	//74
	 183.85,
	//75
	 186.21,
	//76
	 190.20,
	//77
	 192.22,
	//78
	 195.09,
	//79
	 196.97,
	//80
	 200.59,
	//81
	 204.38,
	//82
	 207.19,
	//83
	 208.98,
	//84
	 209.00,
	//85
	 210.00,
	//86
	 222.00,
	//87
	 223.00,
	//88
	 226.00,
	//89
	 227.00,
	//90
	 232.04,
	//91
	 231.04,
	//92
	 238.04,
	//93
	 237.05,
	//94
	 244.00,
	//95
	 243.00,
	//96
	 247.00,
	//97
	 247.00,
	//98
	 251.00,
	//99
	 252.00
];
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

//////////////////////////////////////VALUE conversion AND ROUNDOFF

var substringEnergyToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(
				value.substring(value.indexOf('=') + 1, value.indexOf('H') - 1))
				.toPrecision(12); // Energy = -5499.5123027313 Hartree
		grab = grab * 2625.50;
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var substringEnergyGulpToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(
				value.substring(value.indexOf('=') + 1, value.indexOf('e') - 1))
				.toPrecision(8); // E = 100000.0000 eV
		grab = grab * 96.48;
		// http://web.utk.edu/~rcompton/constants
		grab = Math.round(grab * 100000000) / 100000000;
	}
	return grab;
}

var substringEnergyVaspToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(
				value.substring(value.indexOf('=') + 1, value.indexOf('e') - 1))
				.toPrecision(8); // Enthaply = -26.45132096 eV
		grab = grab * 96.485; // constant from
		// http://web.utk.edu/~rcompton/constants
		grab = Math.round(grab * 100000000) / 100000000;
	}
	return grab;
}


var substringEnergyCastepToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(
				value.substring(value.indexOf('=') + 1, value.indexOf('e') - 1))
				.toPrecision(8); // Enthaply = -26.45132096 eV
		grab = grab * 96.485; // constant from
		// http://web.utk.edu/~rcompton/constants
		grab = Math.round(grab * 100000000) / 100000000;
		//alert(grab)
	}
	return grab;
}

var substringEnergyQuantumToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(
				value.substring(value.indexOf('=') + 1, value.indexOf('R') - 1))
				.toPrecision(8); // E = 100000.0000 Ry
		grab = grab * 96.485 * 0.5; // constant from
		// http://web.utk.edu/~rcompton/constants
		grab = Math.round(grab * 100000000) / 100000000;
	}
	return grab;
}

var substringFreqToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(value.substring(0, value.indexOf('c') - 1));
		// BH 2018 looking out for "F 300.2" in frequencies
		if (isNaN(grab))
			grab= parseFloat(value.substring(1, value.indexOf('c') - 1));
		if (isNaN(grab))
			return NaN;
		else
		grab = Math.round(grab.toPrecision(8) * 100000000) / 100000000;
	}
	return grab;
}

var substringIntGaussToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(value.substring(0, value.indexOf('K') - 1))
		.toPrecision(8);
		grab = Math.round(grab * 100000000) / 100000000;
	}
	return grab;
}

var substringIntFreqToFloat = function(value) {
	if (value != null) {
		var grab = parseFloat(value.substring(0, value.indexOf('k') - 1))
		.toPrecision(5);
		grab = Math.round(grab * 10000) / 10000;
	}
	return grab;
}

var cosRounded = function(value) {
	if (value != null) {
		var angle = parseFloat(value).toPrecision(7);
		angle = Math.round(cosDeg(value) * 10000000) / 10000000;
	}
	return angle;
}

var cosDeg = function(angle) {
	return Math.cos(angle * Math.PI/180);
}

var sinDeg = function(angle) {
	return Math.sin(angle * Math.PI/180);
}

var roundNumber = function(v) { //BH 2018 was 10000000
	return Math.round(v * 10000) / 10000;
}

var roundoff = function(value, precision) {
	value = "" + value
	precision = parseInt(precision)

	var result = "" + Math.round(value * Math.pow(10, precision))
	var decPoint = result.length - precision;
	return (decPoint == 0 ? result : result.substring(0, decPoint) + "." + result.substring(decPoint, result.length));
}


////////////////////////////////ENERGY CONV

///Hartree
var fromHartreeToEV = function(value) { // 1 Hartree = 27.211396132eV
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = grab * 27.211396132;
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromHartreeToHartree = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromHartreeToKJ = function(value) { // From hartree to kJmol-1
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = grab * 2625.50;
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

var fromHartreeToRydberg = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = grab * 2;
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromHartreeToKcalmol = function(value) { // 1Hartree == 627.509 kcal*mol-1
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = grab * 627.509;
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

/// end Hartree

////ev

var fromEVToKJ = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromEVToHartree(grab);
		grab = fromHartreeToKJ(grab)
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

var fromEVToHartree = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromHartreeToEV(1 / grab);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromEVToRydberg = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = grab * 0.073498618;
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromEVToEV = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromEVToKcalmol = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromEVToHartree(grab);
		grab = fromHartreeToKcalmol(grab);
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

////end ev

//rydberg

var fromRydbergToHartree = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromHartreeToRydberg(1 / grab);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

var fromRydbergToEV = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromEVToRydberg(1 / grab);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;

}

var fromRydbergToKJ = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromHartreeToKJ(grab / 2);
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

var fromRydbergToKcalmol = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = fromRydbergToHartree(grab);
		grab = fromHartreeToKcalmol(grab);
		grab = Math.round(grab * 1000) / 1000;
	}
	return grab;
}

var fromRydbergToRydberg = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(12);
		grab = Math.round(grab * 1000000000000) / 1000000000000;
	}
	return grab;
}

//1 Angstrom = 1.889725989 Bohr
var fromAngstromToBohr = function(value) {
	if (value != null) {
		var grab = parseFloat(value).toPrecision(7);
		grab = grab * 1.889725989;
		grab = Math.round(grab * 10000000) / 10000000;
	}
	return grab;
}

/////////////////////////////////END ENERGY conversion
var debugSay = function(script) {
	// the debug area at the bottom of each tab
	var div = getbyID("debugdiv");
	var area = getbyID("debugarea");
	if (script === null) {
		script = "";
	} else {
		console.log(script);
		if (isChecked("debugMode")) {
			div.style.display = "block";
			script = area.value + script + "\n";
		} else {
			div.style.display = "none";
			script = "";
		}
	}
	area.value = script;
	area.scrollTop = area.scrollHeight;
}

var debugShowCommands = function(isOn) {
	getbyID("debugdiv").style.display = (isOn ? "block" : "none");
}

var debugShowHistory = function() {
 	debugSay(jmolEvaluate("show('history')"));
}

var addCommandBox = function() {
	// see debug.js
	return "<div id='debugpanel'><hr>"
		+ createCheck("debugMode", "Show Commands", "debugShowCommands(this.checked)", 0,
			0, "")
		+ "&nbsp;" + createButton("removeText", "Clear", 'debugShowCommands(true);debugSay(null)', 0)
		+ "&nbsp;" + createButton("getHelp", "History", 'debugShowCommands(true);debugShowHistory()', 0)
		+ "&nbsp;" + createButton("getHelp", "Help", 'runJmolScriptWait("help")', 0)
		+ "&nbsp;" + createButton("openConsole", "Console", 'runJmolScriptWait("console")', 0)
		+ "<br>\n"
		+ "<div id='debugdiv' style='display:none'>"
		+ "<input type='text' style='font-size:12pt;width:350px' value='' placeHolder='type a command here' onKeydown='event.keyCode === 13&&$(this).select()&&runJmolScriptWait(value)'/>" 
		+ "<br><textarea id='debugarea' style='font-size:12pt;width:350px;height:150px;font-family:monospace;overflow-y:auto'></textarea>" 
		+ "</div></div>"
}



function scaleModelCoordinates(xyz, op1, f1, op2, f2, etc) {
	// e.g. {1.1}.xyz.all.mul(2);
	var atomArray = _file.frameSelection + '.' + xyz;
	var s = "";
	for (var i = 1; i < arguments.length;) {
		s += atomArray + " = " + atomArray + ".all." + arguments[i++] + "(" + arguments[i++] + ");";
	}
	runJmolScriptWait(s);
	
}

function setVacuum() {
	var newCell_c;
	var vacuum;
	switch (_file.cell.typeSystem) {
	case "slab":
		vacuum = prompt("Please enter the vacuum thickness (\305).", "");
		(vacuum == "") ? (errorMsg("Vacuum not entered!"))
				: (messageMsg("Vacuum set to: " + vacuum + " \305."));

		var zMaxCoord = parseFloat(jmolEvaluate(_file.frameSelection + '.fz.max'));
		vacuum = parseFloat(vacuum);
		newCell_c = (zMaxCoord * 2) + vacuum;
		var factor = roundNumber(zMaxCoord + vacuum);
		if (_file._exportFractionalCoord) { // from VASP only?
			scaleModelCoordinates("z", "add", factor, "div", newCell_c);
		} else {
			scaleModelCoordinates("z", "add", factor);
		}
		fromfractionaltoCartesian(null, null, newCell_c, null, 90, 90);
		break;
	case "polymer":
		vacuum = prompt("Please enter the vacuum thickness (\305).", "");
		(vacuum == "") ? (errorMsg("Vacuum not entered!"))
				: (messageMsg("Vacuum set to: " + vacuum + "  \305."));

		var zMaxCoord = parseFloat(jmolEvaluate(_file.frameSelection + '.fz.max'));
		vacuum = parseFloat(vacuum);
		newCell_c = (zMaxCoord * 2) + vacuum;
		var factor = roundNumber(zMaxCoord + vacuum);
		scaleModelCoordinates("z", "add", factor);
		scaleModelCoordinates("y", "add", factor);
		fromfractionaltoCartesian(null, newCell_c, newCell_c, 90, 90, 90);
		break;
	case "molecule":
		vacuum = prompt("Please enter the vacuum thickness (\305).", "");
		(vacuum == "") ? (errorMsg("Vacuum not entered!"))
				: (messageMsg("Vacuum set to: " + vacuum + " \305."));

		var zMaxCoord = parseFloat(jmolEvaluate(_file.frameSelection + '.fz.max'));
		vacuum = parseFloat(vacuum);
		newCell_c = (zMaxCoord * 2) + vacuum;
		var factor = roundNumber(zMaxCoord + vacuum);
		scaleModelCoordinates("xyz", "add", factor);
		fromfractionaltoCartesian(newCell_c, newCell_c, newCell_c, 90, 90, 90);
		break;

	}
}

function fromfractionaltoCartesian(aparam, bparam, cparam, alphaparam,
		betaparam, gammaparam) {
	//From fractional to Cartesian -- returns a 3x3 matrix
	var xx, xy, xz, 
	    yx, yy, yz, 
	    zx, zy, zz;
	if (aparam != null)
		_file.cell.a = aparam;
	if (bparam != null)
		_file.cell.b = bparam;
	if (cparam != null)
		_file.cell.c = cparam;
	if (alphaparam != null)
		_file.cell.alpha = alphaparam;
	if (betaparam != null)
		_file.cell.beta = betaparam;
	if (gammaparam != null)
		_file.cell.gamma = gammaparam;
	// formula repeated from
	// http://en.wikipedia.org/wiki/Fractional_coordinates
	var v = Math.sqrt(1
			- (cosDeg(_file.cell.alpha) * cosDeg(_file.cell.alpha))
			- (cosDeg(_file.cell.beta) * cosDeg(_file.cell.beta))
			- (cosDeg(_file.cell.gamma) * cosDeg(_file.cell.gamma))
			+ 2	* (cosDeg(_file.cell.alpha) * cosDeg(_file.cell.beta) * cosDeg(_file.cell.gamma)));
	xx = _file.cell.a * sinDeg(_file.cell.beta);
	xy = parseFloat(0.000);
	xz = _file.cell.a * cosDeg(_file.cell.beta);
	yx = _file.cell.b
	* (((cosDeg(_file.cell.gamma)) - ((cosDeg(_file.cell.beta)) * (cosDeg(_file.cell.alpha)))) / sinDeg(_file.cell.beta));
	yy = _file.cell.b * (v / sinDeg(_file.cell.beta));
	yz = _file.cell.b * cosDeg(_file.cell.alpha);
	zx = parseFloat(0.000);
	zy = parseFloat(0.000);
	zz = _file.cell.c;
	return [[xx, xy, xz], [yx, yy, yz], [zx, zy, zz]];

}


//prevframeSelection needs because of the conventional
//var prevframeSelection = null;
//var prevFrame = null;
	

function figureOutSpaceGroup(doReload, isConv, quantumEspresso) {
	var stringCellParam;
	var cellDimString = null;
	var ibravQ = "";
	saveStateAndOrientation_a();
	//prevframeSelection = _file.frameSelection;
	if (_file.frameValue == null || _file.frameValue == "" || _file.exportModelOne)
		_file.frameValue = 1; // BH 2018 fix: was "framValue" in J-ICE/Java crystalFunction.js
	var prevFrame = _file.frameValue;
	var magnetic = confirm('It\'s the primitive cell ?')
	// crystalPrev = confirm('Does the structure come from a previous CRYSTAL
	// calculation?')
	reload(null, 
			isConv ? "conv" : null, 
			magnetic ? "delete not cell=555;" : null
	);
	var s = ""
	var info = jmolEvaluate('show("spacegroup")')
	if (info.indexOf("x,") < 0) {
		s = "no space group"
	} else {
		var S = info.split("\n")
		for (var i = 0; i < S.length; i++) {
			var line = S[i].split(":")
			if (line[0].indexOf("international table number") == 0)
				s = parseInt(S[i]
						.replace(/international table number:/, ""));
		}
	}
	var interNumber = _file.internationalTableNumber = parseInt(s);
	getUnitcell(prevFrame);
	// /from crystal manual http://www.crystal.unito.it/Manuals/crystal09.pdf
	switch (true) {
	case ((interNumber <= 2)): // Triclinic lattices
		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.b) + ", "
				+ roundNumber(_file.cell.c) + ", " + roundNumber(_file.cell.alpha) + ", "
				+ roundNumber(_file.cell.beta) + ", " + roundNumber(_file.cell.gamma);
		cellDimString = " celdm(1) =  " + fromAngstromToBohr(_file.cell.a)
				+ " \n celdm(2) =  " + roundNumber(_file.cell.b / _file.cell.a)
				+ " \n celdm(3) =  " + roundNumber(_file.cell.c / _file.cell.a)
				+ " \n celdm(4) =  " + cosRounded(_file.cell.alpha) + " \n celdm(5) =  "
				+ (cosRounded(_file.cell.beta)) + " \n celdm(6) =  "
				+ (cosRounded(_file.cell.gamma)) + " \n\n";
		ibravQ = "14";
		break;

	case ((interNumber > 2) && (interNumber <= 15)): // Monoclinic lattices
		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.b) + ", "
				+ roundNumber(_file.cell.c) + ", " + roundNumber(_file.cell.alpha);
		if (quantumEspresso) {
			cellDimString = " celdm(1) =  " + fromAngstromToBohr(_file.cell.a)
					+ " \n celdm(2) =  " + roundNumber(_file.cell.b / _file.cell.a)
					+ " \n celdm(3) =  " + roundNumber(_file.cell.c / _file.cell.a)
					+ " \n celdm(4) =  " + (cosRounded(_file.cell.alpha))
					+ " \n\n";
			ibravQ = "12"; // Monoclinic base centered

			var question = confirm("Is this a Monoclinic base centered lattice?")
			if (question)
				ibravQ = "13";
		}
		break;

	case ((interNumber > 15) && (interNumber <= 74)): // Orthorhombic lattices
		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.b) + ", "
				+ roundNumber(_file.cell.c);
		if (quantumEspresso) {
			cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a)
					+ " \n celdm(2) =  " + roundNumber(_file.cell.b / _file.cell.a)
					+ " \n celdm(3) =  " + roundNumber(_file.cell.c / _file.cell.a) + " \n\n";
			ibravQ = "8";

			var question = confirm("Is this a Orthorhombic base-centered lattice?")
			if (question) {
				ibravQ = "9";
			} else {
				var questionfcc = confirm("Is this a Orthorhombic face-centered (fcc) lattice?");
				if (questionfcc) {
					ibravQ = "10";
				} else {
					ibravQ = "11";// Orthorhombic body-centered
				}
			}

		}
		break;

	case ((interNumber > 74) && (interNumber <= 142)): // Tetragonal lattices

		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.c);
		if (quantumEspresso) {
			cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a)
					+ " \n celdm(3) =  " + roundNumber(_file.cell.c / _file.cell.a) + " \n\n";
			ibravQ = "6";
			var question = confirm("Is this a Tetragonal I body centered (bct) lattice?");
			if (question)
				ibravQ = "7";
		}
		break;

	case ((interNumber > 142) && (interNumber <= 167)): // Trigonal lattices
		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.alpha) + ", "
				+ roundNumber(_file.cell.beta) + ", " + roundNumber(_file.cell.gamma);
		cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a)
				+ " \n celdm(4) =  " + (cosRounded(_file.cell.alpha))
				+ " \n celdm(5) = " + (cosRounded(_file.cell.beta))
				+ " \n celdm(6) =  " + (cosRounded(_file.cell.gamma));
		ibravQ = "5";
		var question = confirm("Is a romboheadral lattice?")
		if (question) {
			stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.c);
			cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a)
					+ " \n celdm(4) =  " + (cosRounded(_file.cell.alpha))
					+ " \n celdm(5) = " + (cosRounded(_file.cell.beta))
					+ " \n celdm(6) =  " + (cosRounded(_file.cell.gamma))
					+ " \n\n";
			ibravQ = "4";
		}
		break;
	case ((interNumber > 167) && (interNumber <= 194)): // Hexagonal lattices
		stringCellParam = roundNumber(_file.cell.a) + ", " + roundNumber(_file.cell.c);
		if (quantumEspresso) {
			cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a)
					+ " \n celdm(3) = " + roundNumber(_file.cell.c / _file.cell.a) + " \n\n";
			ibravQ = "4";
		}
		break;
	case ((interNumber > 194) && (interNumber <= 230)): // Cubic lattices
		stringCellParam = roundNumber(_file.cell.a);
		if (quantumEspresso) {
			cellDimString = " celdm(1) = " + fromAngstromToBohr(_file.cell.a);
			// alert("I am here");
			ibravQ = "1";
			var question = confirm("Is a face centered cubic lattice?")
			if (question) {
				var questionBase = confirm("Is a body centered cubic lattice?")
				if (questionBase) {
					ibravQ = "3";
				} else {
					ibravQ = "2";
				}
			}
	
		}
		break;
	default:
		errorMsg("SpaceGroup not found in range.");
		return false;
		break;
	}// end switch
	
//	stringCellparamgulp = roundNumber(_file.cell.a) + ' ' + roundNumber(_file.cell.b) + ' '
//			+ roundNumber(_file.cell.c) + ' ' + roundNumber(_file.cell.alpha) + ' '
//			+ roundNumber(_file.cell.beta) + ' ' + roundNumber(_file.cell.gamma);
	//	alert(stringCellparamgulp)
	_file.stringCellParam = stringCellParam;
	if (doReload) {
		reload("primitive");
		restoreStateAndOrientation_a();
	}
}


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


var updateElementLists = function(x) {
	for (var i = (getbyID('colourbyElementList').options.length - 1); i >= 0; i--)
		getbyID('colourbyElementList').remove(i);
	for (var i = (getbyID('polybyElementList').options.length - 1); i >= 0; i--)
		getbyID('polybyElementList').remove(i);
	for (var i = (getbyID("poly2byElementList").options.length - 1); i >= 0; i--)
		getbyID("poly2byElementList").remove(i);
	for (var i = (getbyID("byElementAtomMotion").options.length - 1); i >= 0; i--)
		getbyID("byElementAtomMotion").remove(i);
	for (var i = (getbyID("deletebyElementList").options.length - 1); i >= 0; i--)
		getbyID("deletebyElementList").remove(i);
	for (var i = (getbyID("connectbyElementList").options.length - 1); i >= 0; i--)
		getbyID("connectbyElementList").remove(i);
	for (var i = (getbyID("connectbyElementListone").options.length - 1); i >= 0; i--)
		getbyID("connectbyElementListone").remove(i);
	
	var sortedElement = getElementList(["select"]);

	for (var i = 0; i < sortedElement.length; i++) {
		addOption(getbyID('colourbyElementList'), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID('polybyElementList'), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID("poly2byElementList"), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID("byElementAtomMotion"), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID("deletebyElementList"), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID("connectbyElementList"), sortedElement[i],
				sortedElement[i]);
		addOption(getbyID("connectbyElementListone"), sortedElement[i],
				sortedElement[i]);
	}
}

var createShowList = function(colourbyElementList){
	var showList = colourbyElementList.push('by picking')
	showList = showList.push('by distance')
	return showList
}



var formResetAll = function() {

	setStatus("");
	setUnitCell();
	document.fileGroup.reset();
	document.showGroup.reset();
	document.orientGroup.reset();
	document.measureGroup.reset();
	document.cellGroup.reset();
	document.polyGroup.reset();
	document.isoGroup.reset();
	document.modelsGeom.reset();
	document.modelsVib.reset();
	document.elecGroup.reset();
	document.otherpropGroup.reset();
	document.editGroup.reset();
	// document.HistoryGroup.reset();
	// this disables antialias option BH: NOT - or at least not generally. We need a switch for this
	runJmolScriptWait('antialiasDisplay = true;set hermiteLevel 0');
	//resetFreq();
	_uff.resetOptimize();
}

var createSlider = function(name, label) {
	var s = '<div tabIndex="1" class="slider" id="_-div" style="float:left;width:150px;" >'
		+ '<input class="slider-input" id="_-input" name="_-input" />'
	    + '</div>'
	    + (label || "") 
	    + ' <span id="_Msg" class="msgSlider"></span>';
	return s.replace(/_/g, "slider." + name);
	
}

var createButton = function(name, text, onclick, disab, style) {
	return createButton1(name, text, onclick, disab, "button", style);
}

var getButtonText = function(name) {
	return getbyID(name).innerHTML;
}

var setButtonText = function(name, text) {
	getbyID(name).innerHTML = text;
}


var createButtonB = function(name, text, onclick, disab, style) {
	var s = "<BUTTON type='button' ";
	s += "NAME='" + name + "' ";
	s += "ID='" + name + "' ";
	if (style)
		s += "style='" + style + "'";
	if (disab) {
		s += "DISABLED ";
	}
	s += "OnClick='" + onclick + "'>";
	s += text;
	s += "</BUTTON>";
	return s;
}

//This includes the class
var createButton1 = function(name, text, onclick, disab, myclass, style) {
	var s = "<INPUT TYPE='BUTTON'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	if (style)
		s += "style='" + style + "'";
	s += "CLASS='" + myclass + "'";
	if (disab) {
		s += "DISABLED "
	}
	s += "OnClick='" + onclick + "'> ";
	return s;
}


var createText = function(id, text, onchange, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "ID='" + id + "' ";
	s += "NAME='" + id+ "' ";
	s += "VALUE='" + text + "' ";
	s += "CLASS='text'";
	if (disab)
		s += "DISABLED "
	s += "onchange='" + onchange + "'";
	s += "> ";
	return s;
}

var createCheck = function(name, text, onclick, disab, def, value) {
	var s = "<INPUT TYPE='CHECKBOX' ";
	s += " NAME='" + name + "' ";
	s += " ID='" + name + "' ";
	s += " VALUE='" + value + "' ";
	s += " CLASS='checkbox'";
	if (def) {
		s += " CHECKED "
	}
	if (disab) {
		s += " DISABLED "
	}
	s += "OnClick='" + onclick + "'> ";
	s += text;
	// var i=tabForm.length;
	// tabForm[i]=new formItem();
	// tabForm[i].Id=name;
	// tabForm[i].def=def;
	return s;
}

var createRadio = function(name, text, onclick, disab, def, id, value) {
	var s = "<INPUT TYPE='RADIO' ";
	s += " NAME='" + name + "' ";
	s += " ID='" + id + "' ";
	s += " VALUE='" + value + "'";
	s += " CLASS='checkbox'";
	if (def) {
		s += " CHECKED "
	}
	if (disab) {
		s += " DISABLED "
	}
	s += "OnClick='" + onclick + "'> ";
	s += text;
	// var i=tabForm.length;
	// tabForm[i]=new formItem();
	// tabForm[i].Id=id;
	// tabForm[i].def=def;
	return s;
}

var createSelect = function(name, onclick, disab, size, optionValue, optionText, optionCheck, type, onkey) {
	optionText || (optionText = optionValue);
	optionCheck || (optionCheck = [1]);
	if (optionValue.length != optionText.length)
		alert("form.js#createSelect optionValue not same length as optionText: " + name);
	var optionN = optionValue.length
	var s = "<SELECT ";
	s += "NAME='" + name + "' ";
	s += "ID='" + name + "' ";
	s += "SIZE='" + size + "' ";	
	if (disab) {
		s += "DISABLED ";
	}
	s += "OnChange='" + onclick + "' ";
	if (onkey)
		s += "OnKeypress='" + onkey + "' ";
	s += " CLASS='select";
	switch (type) {
	case "menu":
		s += "menu' resizable='yes";
		break;
	case "elem":
		return s + "'><option value=0>select</option></SELECT>";
	case "func":
	default:
		break;
	}
	s += "'>";
	for (var n = 0; n < optionN; n++) {
		s += "<OPTION VALUE='" + optionValue[n] + "'";
		if (optionCheck[n] == 1) {
			s += " selected";
		}
		s += ">";
		s += optionText[n];
		s += "</OPTION>";
	}
	s += "</SELECT>";
	return s;
}

var createSelectFunc = function(name, onclick, onkey, disab, size, optionValue, optionText, optionCheck) {
	return createSelect(name, onclick, disab, size, optionValue, optionText, optionCheck, "func", onkey);
}

var createSelectmenu = function(name, onclick, disab, size, optionValue, optionText, optionCheck) {
	return createSelect(name, onclick, disab, size, optionValue, optionText, optionCheck, "menu");
}

var createSelect2 = function(name, onclick, disab, size) {
	return createSelect(name, onclick, disab, size, []);
}

var createSelectKey = function(name, onclick, onkey, disab, size) {
	return createSelect(name, onclick, disab, size, [], [], [], "key", onkey)
}

var createSelectElement = function(name, onclick, onkey, disab, size) {
	return createSelect(name, onclick, disab, size, [], [], [], "elem", onkey)
}

var createTextArea = function(name, text, rows, cols, disab) {
	var s = "<TEXTAREA ";
	s += "NAME='" + name + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='text'";
	if (disab) {
		s += "readonly "
	}
	s += " ROWS=" + rows + " ";
	s += " COLS=" + cols + " >";
	s += text;
	s += "</TEXTAREA> ";
	return s;
}

var createText2 = function(name, text, size, disab, onEnter, placeholder) {
	var s = "<INPUT TYPE='TEXT' ";
	s += "ID='" + name + "' ";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + (text||"") + "' ";
	s += "CLASS='text' ";
	if (disab) {
		s += "readonly ";
	} else if (onEnter) {
		s += "onkeyup=\"function(e){if (e.keyCode==13)" + onEnter + "}\" ";	
	}
	if (placeholder) {
		s += "placeholder='" + placeholder + "' ";
	}
	s += "SIZE=" + size + "> ";
	return s;
}

var createTextSpectrum = function(name, text, size, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "style='background-color:6a86c4;'"
	if (disab) {
		s += "readonly ";
	}
	s += "SIZE=" + size + "> ";
	return s;
}

var createText3 = function(name, text, value, onchange, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='text'";
	s += "onChange='" + onchange + "'";
	if (disab) {
		s += "readonly "
	}
	s += "> ";
	return s;
}

var createText4 = function(name, text, size, value, onchange, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='text'";
	s += "SIZE=" + size;
	s += "onChange='" + onchange + "'";
	if (disab) {
		s += "readonly "
	}
	s += "> ";
	return s;
}

var createText5 = function(name, text, size, value, onchange, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='textwhite'";
	s += "SIZE=" + size;
	s += "onChange='" + onchange + "'";
	if (disab) {
		s += "readonly "
	}
	s += "> ";
	return s;
}

var createDiv = function(id, style, contents) {
	return "<div id='" + id + "' style='" + style + "'>"
		+ (contents == null ? "" : contents + "</div>");
}

var createLine = function(color, style) {
	return "<hr color='#D8E4F8' style='" + style + "' >";
}


var getValue = function(id) {
	return getbyID(id).value;
}

var setValue = function(id, val) {
	getbyID(id).value = val;
}

var getValueSel = function(id) {
	return getbyID(id)[getbyID(id).selectedIndex].value;
}

var getTextSel = function(id) {
	return getbyID(id)[getbyID(id).selectedIndex].text;
}

var isChecked = function(id) {
	return getbyID(id).checked;
}

var checkBox = function(id) {
	getbyID(id).checked = true;
}

var uncheckBox = function(id) {
	getbyID(id).checked = false;
}

var resetValue = function(form) {
	var element = "document." + form + ".reset";
	return element;
}

var getRadioSetValue = function(radios) {
	// BH -- switched to top radios -- for frequency list as well as spectrum
	for (var i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
			return radios[i].value;
		}
	}
}

var disableElement = function(element) {
	// BH 2018
	var d = (typeof element == "string" ? getbyID(element) : element);
	if (d.type == "text")
		d.readOnly = true;
	else {
		d.disabled = true;
		if (d.tagName == "OPTION") {
			d.style.background = "lightgrey";
			d.style.color = "grey";
		}
	}
}

var enableElement = function(element) {
	// BH 2018
	var d = (typeof element == "string" ? getbyID(element) : element);
	if (d.type == "text")
		d.readOnly = false;
	else {
		d.disabled = false;
		if (d.tagName == "OPTION") {
			d.style.background = "white";
			d.style.color = "black";
		}
	}
}


var checkBoxStatus = function(form, element) {
	if (form.checked == true)
		disableElement(element);
	if (form.checked == false)
		enableElement(element);
}

var checkBoxX = function(form) {
	var value = "";
	var test = getbyID(form);
	value = (test.checked) ? ("on") : ("off");
	return value;
}

var setTextboxValue = function(nametextbox, valuetextbox) {
	var tbox = getbyID(nametextbox);
	tbox.value = "";
	if (tbox)
		tbox.value = valuetextbox;
}

var uncheckRadio = function(radio) {
	var radioId = getbyName(radio);
	for (var i = 0; i < radioId.length; i++)
		radioId[i].checked = false;
}

var toggleDiv = function(form, me) {
	if (form.checked == true)
		getbyID(me).style.display = "inline";
	if (form.checked == false)
		getbyID(me).style.display = "none";
}

var toggleDivValue = function(value, me,d) {
	if (d.value == "+") {
		d.value = "\u2212";
		getbyID(me).style.display = "inline";
	} else {
		d.value = "+";
		getbyID(me).style.display = "none";
	}
}

var untoggleDiv = function(form, me) {
	if (form.checked == true)
		getbyID(me).style.display = "none";
	if (form.checked == false)
		getbyID(me).style.display = "inline";
}

var toggleDivRadioTrans = function(value, me) {
	if (value == "off") {
		getbyID(me).style.display = "inline";
	} else {
		getbyID(me).style.display = "none";
	}
}

var setJmolFromCheckbox = function(box, value) {
	runJmolScriptWait(value + " " + !!box.checked);
}

var getbyID = function(id) {
	return document.getElementById(id);
}

var getbyName = function(na) {
	return document.getElementsByName(na);
}

//This is meant to add new element to a list
var addOption = function(selectbox, text, value) {
	var optn = document.createElement("OPTION");
	optn.text = text;
	optn.value = value;
	selectbox.options.add(optn);
}

var cleanList = function(listname) {
	var d = getbyID(listname)
	if (d)
		for (var i = d.options.length; --i >= 0;)
			d.remove(i);
}

var selectListItem = function(list, itemToSelect) {
	// Loop through all the items
	for (var i = 0; i < list.options.length; i++) {
		if (list.options[i].value == itemToSelect) {
			// Item is found. Set its selected property, and exit the loop
			list.options[i].selected = true;
			break;
		}
	}

}

//
//function toggleFormObject(status, elements) {
//
//	if (status == "on") {
//		for (var i = 0; i < elements.length; i++)
//			enableElement(elements[i]);
//	}
//	if (status == "off") {
//		for (var i = 0; i < elements.length; i++)
//			disableElement(elements[i]);
//	}
//
//}
//


function setFrameValues(i) {
	if (i == null || i == "") {
		_file.frameSelection = "{1.1}";
		_file.frameNum = "1.1";
		_file.frameValue = 1;
	} else {
		_file.frameSelection = "{1." + i + "}";
		_file.frameNum = "1." + i;
		_file.frameValue = i;
	}
}

function showFrame(model) {
	//BH: Java comment: This shows a frame once clicked on the lateral list
	runJmolScriptWait("frame " + model);
	setFrameValues(model);
	getUnitcell(model);
}
// global variables used in JS-ICE
// Geoff van Dover 2018.10.26

var version = "3.0.0"; // BH 2018


// _m_file.js

var _global = {
	citations : [
	   { title:				
		'J-ICE: a new Jmol interface for handling and visualizing crystallographic and electronic properties' 
		, authors: ['P. Canepa', 'R.M. Hanson', 'P. Ugliengo', '& M. Alfredsson']
		, journal: 'J.Appl. Cryst. 44, 225 (2011)' 
		, link: 'http://dx.doi.org/10.1107/S0021889810049411'
	   }
	   
	 ]  
};

var _file = {
		specData: null,
		plotFreq: null
};

var _fileIsReload = false;

var _cell = {};

var _constant = {};

var _edit = {};

var _orient = {};

var _pick = {};

var _plot = {};

var _show = {};


function extractInfoJmol(whatToExtract) {
	return jmolGetPropertyAsArray(whatToExtract);
}

function extractInfoJmolString(whatToExtract) {
	return jmolGetPropertyAsString(whatToExtract);
}

function getElementList(arr) {
	// BH 2018 using element.pivot.keys for easy array creation
	arr || (arr = []);
	var elements = getJmolValue("{*}.element.pivot.keys");
	for (var i = 0; i < elements.length; i++)
		arr.push(elements[i]);
	return arr;
}


// note that JmolColorPicker is customized -- BH 2018

var doClickSaveCurrentState = function() {
	warningMsg("This option only saves the state temporarily. To save your work, use File...Export...image+state(PNGJ). The image created can be dragged back into Jmol or JSmol or sent to a colleague to reproduce the current state exactly as it appears in the image.");
	runJmolScriptWait('save ORIENTATION orask; save STATE stask; save BOND bask');
}

var doClickReloadCurrentState = function() {
	runJmolScriptWait('restore ORIENTATION orask; restore STATE stask; restore BOND bask;');
}

var runJmolScript = function(script) {
	debugSay(script);
	jmolScript(script);	
}

var runJmolScriptWait = function(script) {
	debugSay(script);
	jmolScriptWait(script);	
}

var getJmolValue = function(expression) {
	return Jmol.evaluateVar(jmolApplet0, expression);
}

var createApplet = function() {
	Jmol.Info || (Jmol.Info = {});
	Jmol.Info.serverUrl = "https://chemapps.stolaf.edu/jmol/jsmol/php/jmol.php"
	jmolSetAppletColor("white");
	var script = "script scripts/init.spt;"
			+ getCallbackSettings()
			+ ";script scripts/reset.spt;"
	jmolApplet(
			[ "570", "570" ],
			script 
			);
}

var setAntialias = function(isOn) {
	runJmolScriptWait(isOn? 
			"antialiasDisplay = true;set hermiteLevel 5"
			: "antialiasDisplay = false;set hermiteLevel 0"
	);
}

var setStatus = function(status) {
	setTextboxValue("statusLine", status); 
}
		
var warningMsg = function(msg) {
	alert("WARNING: " + msg);
}

var errorMsg = function(msg) {
	if (msg.indexOf("#CANCELED#") < 0) {
		alert("ERROR: " + msg);
	} else {
		runJmolScript("echo");
	}
	return false;
}

var messageMsg = function(msg) {
	alert(msg);
}

var docWriteTabs = function() {
	document.write(createTabMenu());
}

var docWriteBottomFrame = function() {
	document.write("<br> ");	
	document.write(createText5('statusLine', '', '108', '', '', "disab"));
	document.write("<br>");
	document.write(createButton1("reload", "Reload",
			'onChangeLoad("reload")', 0,
			"specialbutton"));
	document.write(createButton1("reset", "Reset",
			'runJmolScriptWait("script ./scripts/reset.spt")', 0, "specialbutton"));
//	document.write(createButton1("Console", "Console", 'runJmolScriptWait("console")', 0,
//			"specialbutton"));
	document.write(createButton("NewWindow", "New window", "newAppletWindow()", 0));
	document.write(createButton("viewfile", "File content", "printFileContent()", 0));
	document.write(createButton1("saveState", 'Save state', 'doClickSaveCurrentState()',
			0, "savebutton"));
	document.write(createButton1("restoreState", 'Restore state',
			'doClickReloadCurrentState()', 0, "restorebutton"));
	document.write(createButton("Feedback", 'Feedback', 'newAppletWindowFeed()', 0));
}

var docWriteRightFrame = function() {
	document.write(createAllMenus());
}


var docWriteSpectrumHeader = function() {
	// for spectrum.html
//	var s = 
	//"Min Freq. " + createTextSpectrum("minValue", "", "5", "")
	//+ " Max " + createTextSpectrum("maxValue", "", "5", "")
	//+ " cm<sup>-1</sup> ";
//	createButton("rescaleSpectraButton", "Rescale", "replotSpectrumHTML()", "");
	//+ createButton("savespectra", "Save spectrum", "writeSpectumHTML()", "");
//	document.write(s);
}

_pick = {
	pickingEnabled 	: false,
	counterHide 	: 0,
	selectedAtoms	: [],
	sortquestion 	: null,
	selectCheckbox 	: null,
	menuCallback 	: null,
	colorWhat		: "color atom" 
}

function setPicking(form) {
	if (form.checked) {
		runJmolScriptWait('showSelections TRUE; select none;halos on; ');
		_pick.colorWhat = "color atom";
	} else {
		runJmolScriptWait('select none;');
	}
	return _pick.colorWhat;
}

function setPickingDelete(form) {
	runJmolScriptWait("select none; halos off;" +
			"draw off; showSelections TRUE; select none;");
	var plane = checkBoxX('byplane');
	var sphere = checkBoxX('bydistance');
	if (form.checked) {
		if (plane == 'on' || sphere == 'on') {
			runJmolScriptWait('halos on; ');
		} else {
			runJmolScriptWait('showSelections TRUE; halos on;');
			_edit.deleteMode = "delete selected";
		}
	}
	if (!form.checked)
		runJmolScriptWait('select none; halos off;');
	return _edit.deleteMode;
}

function setPickingHide(form) {
	runJmolScriptWait("select none; halos off;" +
			"draw off; showSelections TRUE; select none;");

	var plane = checkBoxX('byplane');
	var sphere = checkBoxX('bydistance');
	if (form.checked) {
		if (plane == 'on' || sphere == 'on') {
			runJmolScriptWait('showSelections TRUE; halos on; ');
		} else {
			runJmolScriptWait('showSelections TRUE; select none; halos on; ');
		}
		_edit.hideMode = " hide selected";
	} else {
		runJmolScriptWait('select none; halos off; label off;');
	}
	return _edit.hideMode;
}


/*
 * display within(0,plane,@{plane({atomno=3}, {0 0 0}, {0 1/2 1/2})})
 * 
 * The parametric equation ax + by + cz + d = 0 is expressed as {a b c d}.
 * 
 * Planes based on draw and isosurface objects are first defined with an ID
 * indicated, for example:
 * 
 * draw plane1 (atomno=1) (atomno=2) (atomno=3)
 * 
 * After that, the reference $plane1 can be used anywhere a plane expression is
 * required. For instance,
 * 
 * select within(0,plane, $plane1)
 */


var onClickPickPlane = function(checkbox, callback) {
	_pick.menuCallback = callback;
	_pick.selectCheckbox = checkbox;
	if (!checkbox || checkbox.checked) {
		selectPlane();
	} else {
		runJmolScriptWait('select none; halos off;draw off; showSelections TRUE; select none;');
	}
}

function selectPlane() {
	var miller = prompt("In order to extract a 2D map from a 3D file you need to select a plane. \n" +
			" If you want to select a Miller plane, enter three Miller indices here. \n" +
			" If you want to pick three atoms to define the plane, leave this blank.", "").trim();
	if (miller === null)
		return;
	if (miller) {
		runJmolScriptWait('draw delete; draw plane1 HKL {' + miller + '};draw off;');
		_pick.menuCallback && _pick.menuCallback();
		return true;			
	} else {
		runJmolScriptWait("draw off; showSelections TRUE; select none; halos on;");
		messageMsg('Select in sequence three atoms to define the plane.');
		startPicking();
	}
}

function startPicking() {
	_pick.selectedAtoms = [];
	_pick.counterHide = 0;
	_pick.pickingEnabled = true;
	runJmolScriptWait("pickedlist = []");
	setPickingCallbackFunction(pickPlaneCallback);
}

function cancelPicking() {
	setPickingCallbackFunction(null);
	_pick.pickingEnabled = false;
	runJmolScriptWait("select none; halos off; draw off; showSelections TRUE; select none;");
	if (_pick.selectCheckbox)
		uncheckBox(_pick.selectCheckbox);
}

function setDistanceHide(checkbox) {
	_pick.selectCheckbox = checkbox;
	if (checkbox.checked) {
		setStatus('Select the central atom around which you want to select atoms.');
		_pick.pickingEnabled = true;
		setPickingCallbackFunction(pickDistanceCallback);
		runJmolScriptWait("showSelections TRUE; select none; halos on;");
	} else {
		runJmolScriptWait('select none; halos off;');
	}
}

function pickPlaneCallback() {
	if (_pick.pickingEnabled) {
		runJmolScriptWait("select pickedList");
		var picklist = getJmolValue( "pickedlist");
		if (picklist.length < 3) {
			setStatus('Select another atom.');
			return false;
		}
		cancelPicking();
		runJmolScriptWait('draw delete; draw plane1 PLANE @pickedlist;draw off');
		_pick.menuCallback && _pick.menuCallback();
		return true;			
	}
}

function pickDistanceCallback() {
	if (_pick.pickingEnabled == true) {
		runJmolScriptWait("select picked");
		var distance = prompt('Enter the distance (in \305) within you want to select atoms.', '2.0');
		if (distance != null && distance != "") {
			runJmolScriptWait('select within(' + distance + ',picked); draw sphere1 width ' + distance + '  {picked} translucent;');
			_edit.hideMode = " hide selected";
			_edit.deleteMode = " delete selected";
			_pick.colorWhat = "color atoms";
			cancelPicking();
			return true;
		}
	}

}

/* J-ICE 0.1 script library Piero Canepa 

    based on: http://chemapps.stolaf.edu/jmol/docs/examples-11/flot/ Bob Hanson
 *
 * Copyright (C) 2010-2014  Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 * Contact: pc229@kent.ac.uk
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

// var itemEnergy
// var previousPoint = null
// var itemForce
// var previousPointForce = null

// var theplot; // global, mostly for testing.

// var haveGraphOptimize;


//	var label = "";
//	var previous = 0;
	
//	var data = [];
//  var A = [];
//    var nplots = 1;
//	var modelCount = _file.info.length;
//var stringa = _file.info[3].name;
    
//	var nullValues;
    
//    var minY = 999999;

//	var dataSpectrum = [];
//	var spectrum = [];


//var appletPrintable = (navigator.appName != "Netscape"); // Sorry, I don't
////know how to check
////for this
//
////This has changed
//function $() {
//	// document ready function
//	if (!appletPrintable)$("#appletdiv").addClass("noprint"); 
//}

function arrayMax(a) {
		if (a.length == 0)
			return 0;
		var max = -1e9;
		var len = a.length;
		for (var i = a.length; --i >= 0;)
			if (a[i] > max)
				max = a[i];
		return max;
}

function arrayMin(a) {
	if (a.length == 0)
		return 0;
	var min = 1e9;
	var len = a.length;
	for (var i = a.length; --i >= 0;)
		if (a[i] < min)
			min = a[i];
	return min;
}


function plotEnergies(){
	var modelCount = _file.info.length;
	if (_file.haveGraphOptimize || modelCount < 3)
		return false;
	_file.haveGraphOptimize = true;
	_plot = {
		theplot : null,
		itemEnergy : 0,
		itemForce : 0,
		previousPoint : null,
		previousPointForce : null
	};
	var last = modelCount - 1;
	var previous = null;
	var energy = 0;
	var label = "";
	var data = [];
	var A = [];
	var nplots = 1;
	var stringa = _file.info[3].name;
	var f = null;
	var pattern = null;

	switch (_file.plotEnergyType) {
	case "crystal":
		if(stringa.search(/Energy/i) < 0)
			return false;
		f = substringEnergyToFloat;
		break;
	case "dmol":
		if(stringa.search(/E/i) < 0) 
			return false;
		f = substringEnergyToFloat;
		break;
	case "outcar":
		pattern = new RegExp("G =", "i");
		f = substringEnergyVaspToFloat;
		break;
	case "qespresso":
		pattern = new RegExp("E =", "i");
		f = substringEnergyQuantumToFloat;
		break;
	case "gulp":
		pattern = new RegExp("E =", "i");
		f = substringEnergyGulpToFloat;
		break;
	case "gaussian":
		// special case
		break;
	default:
		f = substringEnergyVaspToFloat;
		break;
	}
	
	if (f) {
		// not Gaussian
		for (var i = 0; i < last; i++) {
			var name = _file.info[i].name;
			if (!name || pattern && !pattern.exec(name) || name.search(/cm/i) >= 0)
				continue;
			var modelnumber = 0+ _file.info[i].modelNumber;
			if(i > 0)
				previous = i - 1;
			var e = f(name);
//			if(i == 0 || _file.info[i - 1].name == null) {
				energy = Math.abs(e - f(_file.info[last].name));
//			} else if (previous > 0 && e != f(_file.info[i - 1].name)) {
//				energy = Math.abs(e - f(_file.info[i - 1].name));
//			}
			label = 'Model = ' + modelnumber + ', &#916 E = ' + energy + ' kJmol^-1';
			A.push([i+1,energy,modelnumber,label]);
		}
	} else {
		// Gaussian
		last = _file.energy.length;
		for (var i = 1; i < last; i++) {
			var name = _file.energy[i];
			if (!name || pattern && !pattern.exec(name) || name.search(/cm/i) >= 0)
				continue;
			var modelnumber = _file.energy.length - 1;		
			if(i > 0 && i < _file.info.length)
				var previous = i - 1;
			var e = fromHartreeToKJ(name);
			var e1;
//			if(i == 0 || (e1 = energyGauss[i - 1]) == null) {
				energy = Math.abs(e - fromHartreeToKJ(_file.energy[last]));
//			} else if (previous > 0) {
//				if (e != e1)
//					energy = Math.abs(e - e1);
//			}
			label = 'Model = ' + modelnumber + ', &#916 E = ' + energy + ' kJmol^-1';
			A.push([i+1,energy,modelnumber,label]);
		}
	}
	data.push(A)
	var options = {
		lines: { show: true },
		points: {show: true, fill: true},
		xaxis: { ticks: 8, tickDecimals: 0 },
		yaxis: { ticks: 6,tickDecimals: 1 },
		selection: { mode: (nplots == 1 ? "x" : "xy"), hoverMode: (nplots == 1 ? "x" : "xy") },
		grid: { hoverable: true, clickable: true, hoverDelay: 10, hoverDelayDefault: 10 }
	}
	_plot.energyPlot = $.plot($('#plotarea'), data, options);
	_plot.previousPoint = null;
	$("#plotarea").unbind("plothover plotclick", null);
	$("#plotarea").bind("plotclick", plotClickCallback);
	_plot.itemEnergy = {datapoint:A[0]}
	setTimeout(function(){plotClickCallback(null,null,_plot.itemEnergy)},100);

	//function plotGradient(){


	if(!_file.plotEnergyForces)
		return;
	var data = [];
	var A = [];
		
	var maxGra;
	if(stringa.search(/Energy/i) != -1){
		last = modelCount - 1;
		for (var i = 0; i < last; i++) {
			var name = _file.info[i].name;
			if (name == null)
				continue;
			var modelnumber = 0 + _file.info[i].modelNumber;
			// first gradient will be for model 1
			// This is if is to check if we are dealing with an optimization
			// or
			// a
			// frequency calculation
			if (!name || pattern && !pattern.exec(name) || name.search(/cm/i) >= 0)
				continue;
				maxGra = parseFloat(_file.info[i].modelProperties.maxGradient);
//			else if(name && previous > 0) {
//				if (substringEnergyToFloat(_file.info[i].name) != substringEnergyToFloat(_file.info[i - 1].name))
//					maxGra = parseFloat(_file.info[i].modelProperties.maxGradient);
//			}
			if (isNaN(maxGra))
				continue;
			label = 'Model = ' + modelnumber + ', ForceMAX = ' + maxGra;
			A.push([i+1,maxGra,modelnumber,label]);
		}
	}	
	data.push(A);
	var options = {
		lines: { show: true },
		points: {show: true, fill: true},
		xaxis: { ticks: 8, tickDecimals: 0 },
		yaxis: { ticks: 6,tickDecimals: 5 },
		selection: { mode: (nplots == 1 ? "x" : "xy"), hoverMode: (nplots == 1 ? "x" : "xy") },
		grid: { hoverable: true, clickable: true, hoverDelay: 10, hoverDelayDefault: 10 }
		// hoverMode, hoverDelay, and hoverDelayDefault are not in the original
		// Flot package
	}
	_plot.forcePlot = $.plot($("#plotarea1"), data, options);
	_plot.previousPointForce = null
	$("#plotarea1").unbind("plothover plotclick", null);
	$("#plotarea1").bind("plothover", plotHoverCallbackforce);
	$("#plotarea1").bind("plotclick", plotClickCallbackForce);
	_plot.itemForce = { datapoint:A[0] };
	setTimeout(function(){plotClickCallbackForce(null,null,_plot.itemForce)},100);
}

function plotClickCallback(event, pos, itemEnergy) {

	if (!itemEnergy)
		return
	var model = itemEnergy.datapoint[2];
	var label = itemEnergy.datapoint[3];
	runJmolScriptWait('model '+ model);
	// This select the element from the list of the geometry models
	// +1 keeps the right numeration of models
	getbyID('geom').value = model + 1;

}

function plotClickCallbackForce(event, pos, itemForce) {
	if (!itemForce)return
	var model = itemForce.datapoint[2];
	var label = itemForce.datapoint[3];
	runJmolScriptWait('model '+model);
	// This select the element from the list of the geometry models
	// +1 keeps the right numeration of models
	getbyID('geom').value = model + 1;

}

function plotHoverCallback(event, pos, itemEnergy) {
	hideTooltip();
	if(!itemEnergy)return
	if (_plot.previousPoint != itemEnergy.datapoint) {
		_plot.previousPoint = itemEnergy.datapoint ;
		var y = roundoff(itemEnergy.datapoint[1],4);
		var model = itemEnergy.datapoint[2];
		var label = "&nbsp;&nbsp;Model "+ model + ", &#916 E = " + y +" kJmol^-1";
		showTooltipEnergy(itemEnergy.pageX, itemEnergy.pageY + 10, label, pos)
	}
	if (pos.canvasY > 350)plotClickCallback(event, pos, itemEnergy);
}


function plotHoverCallbackforce(event, pos, itemForce) {
	hideTooltip();
	if(!itemForce)return
	if (_plot.previousPointForce != itemForce.datapoint) {
		_plot.previousPointForce = itemForce.datapoint;
		var y = roundoff(itemForce.datapoint[1],6);
		var model = itemForce.datapoint[2];
		var label = "&nbsp;&nbsp;Model "+ model + ", MAX Force = " + y;
		showTooltipForce(itemForce.pageX, itemForce.pageY + 10, label, pos);
	}
	if (pos.canvasY > 350)plotClickCallback(event, pos, itemForce);
}

function hideTooltip() {
	$("#tooltip").remove();
}

function showTooltipEnergy(x, y, contents, pos) {

	if (pos.canvasY > 340) y += (340 - pos.canvasY)
	$('<div id="tooltip">' + contents + '</div>').css( {
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#6a86c4',
		'color': '#FFFFCC',
		'font-weight': 'bold',
		opacity: 0.80
	}).appendTo("body").fadeIn(200);

}

function showTooltipForce(x, y, contents, pos) {
	if (pos.canvasY > 340) y += (340 - pos.canvasY);
	$('<div id="tooltip">' + contents + '</div>').css( {
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#6a86c4',
		'color': '#FFFFCC',
		'font-weight': 'bold',
		opacity: 0.80
	}).appendTo("body").fadeIn(200);

}

function showTooltipFreq(x, y, contents, pos) {
	if (pos.canvasY > 340) y += (340 - pos.canvasY);
	$('<div id="tooltip">' + contents + '</div>').css( 
	{
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#6a86c4',
		'color': '#FFFFCC',
		'font-weight': 'bold',
		opacity: 0.80}
	).appendTo("body").fadeIn(200);

}

//function jmolLoadStructCallback() {
//	alert("calling plotgraph#jmolLoadStructCallback??")
//	setTimeout('doPlot()');
//}

//code that fakes an applet print by creating an image in its place! :)

//function setImage() {
//	if (appletPrintable)return
//	var image = jmolGetPropertyAsString("image")
//	var html = '<img src="data:image/jpeg;base64,'+image+'" />'
//	getbyID("imagediv").innerHTML = html
//}

//function doHighlight(app, modelIndex) {
//	if (!iamready)return;
//	theplot.unhighlight(0,-1)
//	theplot.highlight(0, modelIndex);
//	var label = data[0][modelIndex][3];
//    setTimeout('runJmolScript("set echo top left; echo ' + label+'")',100);
//}


//function doPrintAll() {
//	setImage()
//	window.print()
//}

//function countNullModel(arrayX) {
//	var valueNullelement = 0;
//	for (var i = 0; i < arrayX.length; i++) {
//		if (arrayX[i].name == null || arrayX[i].name == "")
//			valueNullelement = valueNullelement + 1;
//	}
//	return valueNullelement;
//}

//for spectrum.html or new dynamic cool spectrum simulation

// var plotOptionsHTML = {
//		   series: { lines: { show: true, fill: false } },
//		   xaxis: { ticks: 10, tickDecimals: 0 },
//		   yaxis: { ticks: 0, tickDecimals: 0 },
//		   grid: { hoverable: true, autoHighlight: false},
//		   //crosshair: { mode: "x" }
//		};

/*  J-ICE library 

    based on: A toolkit for publishing enhanced figures; B. McMahon and R. M. Hanson; J. Appl. Cryst. (2008). 41, 811-814
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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
var _slider = {
	defaultFront	: 20,
	defaultBack 	: 100,
	bond 			: null,
	radii 			: null,
	radiiConnect	: null,
	trans			: null,
	pack			: null,
	cameraDepth		: null,
	specularPercent : null,
	ambientPercent	: null,
	diffusePercent	: null,
	slab 			: null,
	depth			: null
}	
var applyBond = function(angstroms) {
	if (_show.firstTimeBond) {
		runJmolScriptWait("wireframe .2;");
	} else {
		runJmolScriptWait("wireframe " + angstroms + ";");
		getbyID('slider.bondMsg').innerHTML = angstroms.toPrecision(1) + " &#197";
		runJmolScriptWait("save BONDS bondEdit");
	}
}


var loadSliders = function() {
	_slider.bond = new Slider(getbyID("slider.bond-div"), getbyID("slider.bond-input"), "horizontal");
	_slider.bond.setMaximum(100);
	_slider.bond.setMinimum(0);
	_slider.bond.setUnitIncrement(5);
	//amount to increment the value when using the arrow keys
	_slider.bond.setValue(15);
	_slider.bond.onchange = function() {
		applyBond(_slider.bond.getValue() / 100)
	}
	
	_slider.radii = new Slider(getbyID("slider.radii-div"), getbyID("slider.radii-input"), "horizontal");
	_slider.radii.setMaximum(100);
	_slider.radii.setMinimum(0);
	_slider.radii.setUnitIncrement(5);
	//amount to increment the value when using the arrow keys
	_slider.radii.setValue(26);
	_slider.radii.onchange = function() {
		applyRadii(_slider.radii.getValue())
	}
	
	_slider.radiiConnect = new Slider(getbyID("slider.radiiConnect-div"), getbyID("slider.radiiConnect-input"), "horizontal");
	_slider.radiiConnect.setMaximum(100);
	//does not work with values < 1
	_slider.radiiConnect.setMinimum(0);
	_slider.radiiConnect.setUnitIncrement(1);
	//amount to increment the value when using the arrow keys
	_slider.radiiConnect.setValue(80);
	_slider.radiiConnect.onchange = function() {
		applyConnect(_slider.radiiConnect.getValue() / 20)
	}
	
	_slider.trans = new Slider(getbyID("slider.trans-div"), getbyID("slider.trans-input"), "horizontal");
	_slider.trans.setMaximum(100);
	_slider.trans.setMinimum(0);
	_slider.trans.setUnitIncrement(4);
	//amount to increment the value when using the arrow keys
	_slider.trans.setValue(100);
	_slider.trans.onchange = function() {
		applyTrans(_slider.trans.getValue())
	}
	
	_slider.pack = new Slider(getbyID("slider.pack-div"), getbyID("slider.pack-input"), "horizontal");
	_slider.pack.setMaximum(100);
	_slider.pack.setMinimum(0);
	_slider.pack.setUnitIncrement(0.5);
	//amount to increment the value when using the arrow keys
	_slider.pack.setValue(1);
	_slider.pack.onchange = function() {
		applyPack(_slider.pack.getValue() / 20)
	}
	
	
	_slider.cameraDepth = new Slider(getbyID("slider.cameraDepth-div"), getbyID("slider.cameraDepth-input"), "horizontal");
	_slider.cameraDepth.setMaximum(100);
	_slider.cameraDepth.setMinimum(1);
	_slider.cameraDepth.setUnitIncrement(2);
	//amount to increment the value when using the arrow keys
	_slider.cameraDepth.setValue(5);
	_slider.cameraDepth.onchange = function() {
		applyCameraDepth(_slider.cameraDepth.getValue()/25)
	}
	
	_slider.specularPercent = new Slider(getbyID("slider.specularPercent-div"), getbyID("slider.specularPercent-input"), "horizontal");
	_slider.specularPercent.setMaximum(100);
	_slider.specularPercent.setMinimum(0);
	_slider.specularPercent.setUnitIncrement(2);
	//amount to increment the value when using the arrow keys
	_slider.specularPercent.setValue(5);
	_slider.specularPercent.onchange = function() {
		applySpecularPercent(_slider.specularPercent.getValue())
	}
	
	_slider.ambientPercent = new Slider(getbyID("slider.ambientPercent-div"), getbyID("slider.ambientPercent-input"), "horizontal");
	_slider.ambientPercent.setMaximum(100);
	_slider.ambientPercent.setMinimum(0);
	_slider.ambientPercent.setUnitIncrement(2);
	//amount to increment the value when using the arrow keys
	_slider.ambientPercent.setValue(5);
	_slider.ambientPercent.onchange = function() {
		applyAmbientPercent(_slider.ambientPercent.getValue())
	}
	
	_slider.diffusePercent = new Slider(getbyID("slider.diffusePercent-div"), getbyID("slider.diffusePercent-input"), "horizontal");
	_slider.diffusePercent.setMaximum(100);
	_slider.diffusePercent.setMinimum(0);
	_slider.diffusePercent.setUnitIncrement(2);
	//amount to increment the value when using the arrow keys
	_slider.diffusePercent.setValue(5);
	_slider.diffusePercent.onchange = function() {
		applyDiffusePercent(_slider.diffusePercent.getValue())
	}
	
	_slider.slab = new Slider(getbyID("slider.slab-div"), getbyID("slider.slab-input"), "horizontal");
	_slider.slab.setMaximum(100)
	_slider.slab.setMinimum(0)
	_slider.slab.setUnitIncrement(2) 
	// amount to increment the value when using the
	// arrow keys
	_slider.slab.setValue(_slider.defaultFront)
	_slider.slab.onchange = function() {
		applySlab(_slider.slab.getValue())
	}
	
	_slider.depth = new Slider(getbyID("slider.depth-div"), getbyID("slider.depth-input"), "horizontal");
	_slider.depth.setMaximum(100);
	_slider.depth.setMinimum(0);
	_slider.depth.setUnitIncrement(2); // amount to increment the value when using
	// the arrow keys
	_slider.depth.setValue(_slider.defaultBack);
	_slider.depth.onchange = function() { // onchange MUST BE all lowercase
		applyDepth(_slider.depth.getValue())
	}
}

/*  J-ICE library 
 *
 *   based on:
 *
 *  Copyright (C) 2010-2014 Pieremanuele Canepa http://j-ice.sourceforge.net/
 *
 *  Contact: pierocanepa@sourceforge.net
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

//////////Following functions control the structural optimization of a structure using the embedded uff of Jmol
var _uff = {
	counterUff : 0
}

_uff.minimizeStructure = function() {
	var optCriterion = parseFloat(getValue("optciteria"));
	var optSteps = parseInt(getValue("maxsteps"));
	var form = getbyID("fixstructureUff");
	// alert(optCriterion + " " + optSteps)

	if (!optCriterion) {
		warningMsg("Please set the Opt. threshold. This must be not lower than 0.0001. ");
		return false;
	} else if (!optSteps) {
		warningMsg("Please set the Max No. of steps.");
		return false;
	} else if (!form.checked) {
		_uff.counterUff = 0;
		setMinimizationCallbackFunction(_uff.scriptUffCallback);
		runJmolScript("set debugscript on ;set logLevel 5;set minimizationCriterion " + optCriterion + "; minimize STEPS "
				+ optSteps + "; set minimizationRefresh TRUE;  minimize;");
	} else if (form.checked) {
		_uff.counterUff = 0;
		setMinimizationCallbackFunction(_uff.scriptUffCallback);
		runJmolScript("set debugscript on ;set logLevel 5;set minimizationCriterion " + optCriterion + "; minimize STEPS "
				+ optSteps
				+ "; set minimizationRefresh TRUE;  minimize FIX {selected};");
	}
}

_uff.fixFragmentUff = function(form) {
	if (form.checked) {
		messageMsg("Now select the fragment you would like to optimize by the following options");
		//fragmentSelect
	} else {

	}
}

_uff.stopOptimize = function() {
	runJmolScriptWait('minimize STOP;');
}

_uff.resetOptimize = function() {
	runJmolScriptWait('minimize STOP;');
	setValue("optciteria", "0.001");
	setValue("maxsteps", "100");
	setValue("textUff", "");
}

_uff.scriptUffCallback = function(b, step, d, e, f, g) {
	var text = ("s = " + _uff.counterUff + " E = " + parseFloat(d).toPrecision(10)
			+ " kJ/mol, dE = " + parseFloat(e).toPrecision(6) + " kJ/mol")
	getbyID("textUff").value = text
	_uff.counterUff++;
}
function newAppletWindow() {
	var windowoptions = "menubar=yes,resizable=1,scrollbars,alwaysRaised,width=600,height=600,left=50"
	var sm = "" + Math.random();
	sm = sm.substring(2, 10);
	var newwin = open("OutputResized.html", "jmol_" + sm, windowoptions);
}


function newAppletWindowFreq() {
	var windowfreq = "menubar=no,resizable=no,scrollbars=yes,resizable=yes;alwaysRaised,width=1024,height=768";
	var sm = "" + Math.random();
	sm = sm.substring(2, 10);
	var newwin = open("exportfreq.html", sm, windowfreq);
}

function onClickAcknow() {
	var woption = "menubar=no, toolbar=no scrollbar=no, status=no, resizable=no, alwaysRaised,width=360, height=200, top=10, left=10,";
	var sm = "" + Math.random();
	sm = sm.substring(2, 10);
	var newwin = open("acn.html", sm, woption);
}


function newAppletWindowFeed() {
	var windowfeed = "menubar=no,resizable=no,scrollbars=yes,resizable=yes;alwaysRaised,width=1024,height=768";
	var sm = "" + Math.random();
	sm = sm.substring(2, 10);
	var newwin = open("http://j-ice.sourceforge.net/?page_id=9", sm, windowfeed);
}
