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

loadDone_gaussian = function() {

	warningMsg("This is a molecular reader. Therefore not all properties will be available.")

	_file.energyUnits = ENERGY_HARTREE;
	_file.StrUnitEnergy = "H";

	setTitleEcho();
	setFrameValues("1");
	disableFreqOpts();

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

