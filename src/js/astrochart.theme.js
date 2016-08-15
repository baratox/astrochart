Astrochart.AstrochartTheme = function(_svg) {
    var _rotation = {
        'zodiac': 105,
        'houses': { '1' : 30, '2' : 60, '3' : 90, '4' : 120, '5' : 150, '6' : 180,
                    '7' : 210, '8' : 240, '9' : 270, '10' : 300, '11' : 330, '12' : 360 },
        'house-texts': { '1' : 45, '2' : 75, '3' : 105, '4' : 135, '5' : 165, '6' : 195,
                         '7' : 225, '8' : 255, '9' : 285, '10' : 315, '11' : 345, '12' : 375 },
        'planets': {
            'sun': 0,
            'moon': 0,
            'mercury': 0, 
            'venus': 0,
            'mars': 0,
            'jupiter': 0,
            'saturn': 0,
            'uranus': 0,
            'neptune': 0,
            'pluto': 0 
        }
    };

    var _houses = { 
        '1': { text: 'house-1-text', id: 'house-1', },
        '2': { text: 'house-2-text', id: 'house-2' },
        '3': { text: 'house-3-text', id: 'mc' },
        '4': { text: 'house-4-text', id: 'house-4' },
        '5': { text: 'house-5-text', id: 'house-5' },
        '6': { text: 'house-6-text' }, // Descendant is fixed
        '7': { text: 'house-7-text', id: 'house-1' },
        '8': { text: 'house-8-text', id: 'house-2' },
        '9': { text: 'house-9-text', id: 'mc' },
        '10': { text: 'house-10-text', id: 'house-4' },
        '11': { text: 'house-11-text', id: 'house-5' },
        '12': { text: 'house-12-text' } // Ascendant is fixed
    };

    /**
     * Gets the absolute rotation angle (0º at three o'clock) 
     * for the given zodiac-originated angle.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    var _rotate = function(zodiac) {
        return zodiac - _rotation.zodiac;
    };

    var _centerHouseText = function(house) {
        var element = _svg.select('#' + _houses[house].text);
        if (element) {
            var next = parseInt(house) < 12 ? parseInt(house) + 1 : 1;
            var center = _rotation.houses[house] + (_rotation.houses[next] - _rotation.houses[house]) / 2;
            console.log("Centering text for house", house, "to", center, next);

            var rotation = center - _rotation["house-texts"][house];
            _rotation["house-texts"][house] = center;

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(element.transform().localMatrix);
            element.transform(matrix);

        } else {
            console.warn("No text for house", house);
        }
    };

    /**
     * Rotates the wheel so that given angle 'zodiac' is at 180º.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    var ascendant = function(zodiac) {
        // Sprite is rotated 105º clockwise
        var angleFrom = _rotation.zodiac - 105;
        var angleTo = zodiac - 105;

        console.debug("Rotating zodiac from", angleFrom, "to", angleTo);

        if (angleFrom != angleTo) {
            var wheel = _svg.select("g#zodiac");
            if (wheel) {
                // TODO Rotate everything else too
                Snap.animate(angleFrom, angleTo, function(value) {
                    wheel.transform("r" + value + ",300,300");
                }, 800);
                
                _rotation.zodiac = zodiac;
            }
        }
    };

    var house = function(house, zodiac) {
        var fixed = _rotate(zodiac);
        if (_houses[house].id !== undefined) {
            var rotation = _rotation['houses'][house] - fixed;
            console.debug("Rotating house", house, 'to', zodiac, " (", fixed, "). Rotation:", rotation);

            var element = _svg.select('#' + _houses[house].id);
            if (element) {
                var matrix = new Snap.Matrix();
                matrix.rotate(rotation, 300, 300);
                matrix.add(element.transform().localMatrix);
                element.transform(matrix);

                _centerHouseText(house);

                _rotation.houses[house] = fixed;
            } else {
                console.warn("Nothing to move");
            }
        }

    };

    var astro = function(name, zodiac) {
        var angleFrom = _rotation.planets[name],
            angleTo = _rotate(zodiac);
        
        console.debug("Moving", name, "from", angleFrom, "to", angleTo);

        var element = _svg.select("g#" + name);
        if (element) {
            if (angleFrom < 0) { angleFrom = 360 + angleFrom; }
            if (angleTo < 0) { angleTo = 360 + angleTo; }
            
            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(orbit, value);
                }, 400);

            _rotation.planets[name] = angleTo;
        }
    };

    // Builds the public API for an AstrochartTheme.
    return {
        "ascendant" : ascendant,
        "astro" : astro,
        "house" : house
    }
};
