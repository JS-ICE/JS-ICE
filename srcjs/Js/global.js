// global variables used in JS-ICE
// Geoff van Dover 2018.10.26

var version = "3.0.0"; // BH 2018



// _m_file.js

var _global = {
    startupFile: "output/hematite.out",
	citations : [
	   { title:				
		'J-ICE: a new Jmol interface for handling and visualizing crystallographic and electronic properties' 
		, authors: ['P. Canepa', 'R.M. Hanson', 'P. Ugliengo', '& M. Alfredsson']
		, journal: 'J.Appl. Cryst. 44, 225 (2011)' 
		, link: 'http://dx.doi.org/10.1107/S0021889810049411'
	   }
	   
	 ]  
};


;(function() {
	var uri = "&" + document.location.search.substring(1) + "&file=";
	var file = uri.split("&file=")[1].split("&")[0];
	if (file)
		_global.startupFile = file;	
})();

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

