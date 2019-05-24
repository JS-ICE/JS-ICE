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

