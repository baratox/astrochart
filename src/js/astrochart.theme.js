Astrochart.AstrochartTheme = function(svg) {
    this.svg = svg;
    
    this.rotation = {
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

    this.houses = { 
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
    this._rotate = function(zodiac) {
        return zodiac - this.rotation.zodiac;
    };

    this._centerHouseText = function(house) {
        var element = this.svg.select('#' + this.houses[house].text);
        if (element) {
            var next = parseInt(house) < 12 ? parseInt(house) + 1 : 1;
            var center = this.rotation.houses[house] + (this.rotation.houses[next] - this.rotation.houses[house]) / 2;
            console.log("Centering text for house", house, "to", center, next);

            var rotation = center - this.rotation["house-texts"][house];
            this.rotation["house-texts"][house] = center;

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(element.transform().localMatrix);
            element.transform(matrix);

        } else {
            console.warn("No text for house", house);
        }
    };
};

Astrochart.AstrochartTheme.prototype = {
    /**
     * Rotates the wheel so that given angle 'zodiac' is at 180º.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    "ascendant": function(zodiac) {
        // Sprite is rotated 105º clockwise
        var angleFrom = this.rotation.zodiac - 105;
        var angleTo = zodiac - 105;

        console.debug("Rotating zodiac from", angleFrom, "to", angleTo);


        if (angleFrom != angleTo) {
            var wheel = this.svg.select("g#zodiac");
            if (wheel) {
                // TODO Rotate everything else too
                Snap.animate(angleFrom, angleTo, function(value) {
                    wheel.transform("r" + value + ",300,300");
                }, 800);
                
                this.rotation.zodiac = zodiac;
            }
        }
    },

    "house": function(house, zodiac) {
        var fixed = this._rotate(zodiac);
        if (this.houses[house].id !== undefined) {
            var rotation = this.rotation['houses'][house] - fixed;
            console.debug("Rotating house", house, 'to', zodiac, " (", fixed, "). Rotation:", rotation);

            var element = this.svg.select('#' + this.houses[house].id);
            if (element) {
                var matrix = new Snap.Matrix();
                matrix.rotate(rotation, 300, 300);
                matrix.add(element.transform().localMatrix);
                element.transform(matrix);

                this._centerHouseText(house);

                this.rotation.houses[house] = fixed;
            } else {
                console.warn("Nothing to move");
            }
        }

    },

    "astro": function(name, zodiac) {
        var angleFrom = this.rotation.planets[name],
            angleTo = this._rotate(zodiac);
        
        console.debug("Moving", name, "from", angleFrom, "to", angleTo);

        var element = this.svg.select("g#" + name);
        if (element) {
            if (angleFrom < 0) { angleFrom = 360 + angleFrom; }
            if (angleTo < 0) { angleTo = 360 + angleTo; }
            
            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(orbit, value);
                }, 400);

            this.rotation.planets[name] = angleTo;
        }

    }
};
