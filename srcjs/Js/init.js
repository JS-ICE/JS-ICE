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

var writeDivs = function() {
	docWriteTabs();
	docWriteRightFrame();
	docWriteBottomFrame();
	loadSliders();
}

var docWriteTabs = function() {
	$("#tabs").html(createTabMenu());
}

var docWriteBottomFrame = function() {
	var s = "";
	s += ("<br> ");	
	s += (createText5('statusLine', '', '108', '', '', "disab"));
	s += ("<br>");
	s += (createButton1("reload", "Reload",
			'onChangeLoad("reload")', 0,
			"specialbutton"));
	s += (createButton1("reset", "Reset",
			'runJmolScriptWait("script ./scripts/reset.spt")', 0, "specialbutton"));
//	s += (createButton1("Console", "Console", 'runJmolScriptWait("console")', 0,
//			"specialbutton"));
	s += (createButton("NewWindow", "New window", "newAppletWindow()", 0));
	s += (createButton("viewfile", "File content", "printFileContent()", 0));
	s += (createButton1("saveState", 'Save state', 'doClickSaveCurrentState()',
			0, "savebutton"));
	s += (createButton1("restoreState", 'Restore state',
			'doClickReloadCurrentState()', 0, "restorebutton"));
	s += (createButton("Feedback", 'Feedback', 'newAppletWindowFeed()', 0));
	$("#bottom").html(s);
}

var docWriteRightFrame = function() {
	$("#right").html(createAllMenus());
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

