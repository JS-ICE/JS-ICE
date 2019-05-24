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
