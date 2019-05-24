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


var createText = function(name, text, onclick, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='text'";
	if (disab) {
		s += "DISABLED "
	}
	s += "OnChange='" + onclick + "'> ";
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

var createText2 = function(name, text, size, disab) {
	var s = "<INPUT TYPE='TEXT'";
	s += "NAME='" + name + "' ";
	s += "VALUE='" + text + "' ";
	s += "ID='" + name + "' ";
	s += "CLASS='text'";
	if (disab) {
		s += "readonly "
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
			d.style.background = d.style.color = "grey";
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


