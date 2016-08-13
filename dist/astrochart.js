Snap.plugin(function(Snap, Element, Paper) {
    'use strict';

    const PLANET_SIZE = 108;

    Paper.prototype.createCircularOrbit = function(cx, cy, r) {
        if (!String.prototype.format) {
            String.prototype.format = function() {
                var str = this.toString();
                if (!arguments.length)
                    return str;
                var args = typeof arguments[0],
                    args = (("string" == args || "number" == args) ? arguments : arguments[0]);

                for (var arg in args)
                    str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
                return str;
            }
        }

        var path = this.path(("M {cx}, {cy} " + 
                      "m -{r}, 0 " +
                      "a {r},{r} 0 1,0 {d},0 " + 
                      "a {r},{r} 0 1,0 -{d},0").format({cx:cx, cy:cy, r:r, d:r*2}));
        path.attr({
            'id': 'orbit',
            'fill': 'none'
        });

        return path;
    };

    /**
     * Rotates a given Snap.Element the given amount of degrees around the center. 
     * The amount of degrees can be a negative or positive number, depending on 
     * which way you want to rotate the node. The rotation will be done around 
     * the central coordinates of the element.
     *
     * @method orbit
     * @public
     * @param {Integer} degrees
     */
    Element.prototype.orbit = function(orbit, degrees) {
        var pathLength = orbit.getTotalLength();
        var point = orbit.getPointAtLength(degrees * pathLength / 360 );  

        var scale = 0.5;
        var half = scale * PLANET_SIZE/2;

        var matrix = new Snap.Matrix();
        matrix.translate(point.x, point.y);
        matrix.translate(-half, -half);
        matrix.scale(scale);
        
        this.transform(matrix);
    };
});

window.Astrochart = (function(w, h, overridenSettings) {
    "use strict";

    var settings = {
        'sprites-base-url': "/dist/image"
    }

    var snap;
    var orbit;

    var theme;

    var now = {
        'ascendant': 0,
        'houses': { 
            '1' : 30,
            '2' : 60,
            '3' : 90,
            '4' : 120,
            '5' : 150,
            '6' : 180,
            '7' : 210,
            '8' : 240,
            '9' : 270,
            '10' : 300,
            '11' : 330,
            '12' : 360
        },
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


    function _Astrochart(w, h, overridenSettings) {
        if (overridenSettings) {
            settings = $.extend(settings, overridenSettings);
        }

        snap = Snap(w, h);
        snap.attr({ 
            viewBox: '0 0 600 600',
            height: '100%',
            width: '100%' 
        });

        theme = new Astrochart.AstrochartTheme(snap);

        Snap.load(settings['sprites-base-url'] + "/zodiac.svg", function(svg) {
            // Add everything from the sprites file.
            snap.append(svg);

            // Creates the orbit for space objects
            orbit = snap.createCircularOrbit(300, 300, 230);
            snap.append(orbit);

            // Refresh theme if data changed before loading was complete.
            ascendant(now.ascendant);
            move(now.planets);
            house(now.houses);

            console.debug("Finished loading zodiac.svg.");
        });

        Snap.load(settings['sprites-base-url'] + "/things.svg", function(svg) {
            for (var planet in now.planets) {
                loadSpaceObject(svg, planet, Math.random() * 10000 + 3000);
            }
        });

        function loadSpaceObject(svg, name, animationDelay) {
            var object = svg.select("g#" + name);
            if (!object) {
                // Create one based on the default planet sprite
                object = svg.select("g#planet").clone();
                object.attr({'id': name});
            }

            snap.append(object);

            _move(name, now.planets[name]);
        };
    };

    function ascendant(degrees) {
        if (degrees !== undefined) {
            theme.ascendant(degrees);
            now.ascendant = degrees;
           
            return this;

        } else {
            return now.ascendant;
        }
    };

    function move(planets, degrees) {
        return iterateIfCollection(planets, degrees, _move);
    }

    function _move(planet, degrees) {
        if (now.planets[planet] === undefined) {
            return false;
        }

        if (degrees !== undefined) {
            theme.astro(planet, degrees);
            now.planets[planet] = degrees;
            return this;

        } else {
            return now.planets[planet];
        }
    };

    function house(houses, degrees) {
        return iterateIfCollection(houses, degrees, _house);
    };

    function _house(house, degrees) {
        if (now.houses[house] === undefined) {
            return false;
        }

        if (degrees !== undefined) {
            theme.house(house, degrees);
            now.houses[house] = degrees;
            return this;

        } else {
            return now.houses[house];
        }
    };

    function iterateIfCollection(argument, parameter, callback) {
        if (typeof argument === "object") {

            for (var i in argument) {
                callback(i, argument[i]);
            }
            return this;

        } else if (typeof argument === "string" || typeof argument === "number") {
            return callback(argument, parameter);
        }
    };

    // Initialize this instance and return public API.
    _Astrochart(w !== undefined ? w : 600, h, overridenSettings);

    return {
        snap: snap,
        ascendant: ascendant,
        move: move,
        house: house
    };

});

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
