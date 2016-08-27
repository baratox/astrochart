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
            '1' : 0,
            '2' : 30,
            '3' : 60,
            '4' : 90,
            '5' : 120,
            '6' : 150,
            '7' : 180,
            '8' : 210,
            '9' : 240,
            '10' : 270,
            '11' : 300,
            '12' : 330
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

        theme = new Astrochart.AstrochartTheme(snap, settings);
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
        var result = iterateIfCollection(houses, degrees, _house);
        theme.invalidate();
        return result;
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

Astrochart.AstrochartTheme = function(_svg, _settings) {
    var _rotation = {
        'zodiac': 105,
        'houses': { '1' : 0, '2' : 30, '3' : 60, '4' : 90, '5' : 120, '6' : 150, 
                    '7' : 180, '8' : 210, '9' : 240, '10' : 270, '11' : 300, '12' : 330 },
        'house-texts': { '1' : 90, '2' : 90, '3' : 90, '4' : 90, '5' : 90, '6' : 90,
                         '7' : 90, '8' : 90, '9' : 90, '10' : 90, '11' : 90, '12' : 90 },
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

    // TODO Replace numerical key with text to avoid confusion with indexes
    var _houses = { 
        '1': { text: 'house-1-text' }, // Ascendant is fixed
        '2': { text: 'house-2-text', id: 'house-2', },
        '3': { text: 'house-3-text', id: 'house-3' },
        '4': { text: 'house-4-text', id: 'mc' },
        '5': { text: 'house-5-text', id: 'house-5' },
        '6': { text: 'house-6-text', id: 'house-6' },
        '7': { text: 'house-7-text' }, // Descendant is fixed
        '8': { text: 'house-8-text', id: 'house-2' },
        '9': { text: 'house-9-text', id: 'house-3' },
        '10': { text: 'house-10-text', id: 'mc' },
        '11': { text: 'house-11-text', id: 'house-5' },
        '12': { text: 'house-12-text', id: 'house-6' }
    };

    Snap.load(_settings['sprites-base-url'] + "/zodiac.svg", function(svg) {
        // Add everything from the sprites file.
        _svg.append(svg);

        // Creates the orbit for space objects
        orbit = _svg.createCircularOrbit(300, 300, 198);
        _svg.append(orbit);

        console.debug("Finished loading zodiac.svg.");
    });

    Snap.load(_settings['sprites-base-url'] + "/things.svg", function(svg) {
        for (var planet in _rotation.planets) {
            loadSpaceObject(svg, planet, Math.random() * 10000 + 3000);
        }

        function loadSpaceObject(svg, name, animationDelay) {
            var object = svg.select("g#" + name);
            if (!object) {
                // Create one based on the default planet sprite
                object = svg.select("g#planet").clone();
                object.attr({'id': name});
            }

            _svg.append(object);

            object.orbit(orbit, 0);
        };
    });


    /**
     * Gets the absolute rotation angle (0º at three o'clock) 
     * for the given zodiac-originated angle.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    var _rotate = function(zodiac) {
        var fixed = zodiac - _rotation.zodiac;
        return _round(fixed);
    };

    // Rounds to avoid complex numbers when calculating
    var _round = function(number) {
        if (typeof(number) !== "number") console.warn("Invalid number", number, typeof(number));
        number = Number(number.toFixed(5));
        if (number < 0) number += 360;
        if (number >= 360) number -= 360;
        return number;
    }

    var _centerHouseText = function(house) {
        if (typeof(house) === "number") {
            house = house.toString();
        }

        var element = _svg.select('#' + _houses[house].text);
        if (element) {
            var next = (parseInt(house) < 12 ? parseInt(house) + 1 : 1).toString();
            var center = 180 + (_round(_rotation.houses[next]) + _round(_rotation.houses[house])) / 2;
            if (next == '1') center += 180;

            var rotation = _rotation["house-texts"][house] - center;
            console.log("Centering text for house", house, "to", center, "by", rotation, "was", _rotation["house-texts"][house]);
            _rotation["house-texts"][house] = center;

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(element.transform().localMatrix);
            element.transform(matrix);

        } else {
            console.warn("No text for house", house);
        }
    };

    var invalidate = function() {
        for (var house in _houses) {
            _centerHouseText(house);
        }
    };

    /**
     * Rotates the wheel so that given angle 'zodiac' is at 180º.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    var ascendant = function(zodiac) {
        var wheel = _svg.select("g#zodiac");
        if (wheel) {
            // Sprite is rotated 105º clockwise
            var angleFrom = _rotation.zodiac - 105;
            var angleTo = zodiac - 105;
            if (angleFrom != angleTo) {
                console.debug("Rotating zodiac to", zodiac);

                // TODO Rotate everything else too
                Snap.animate(angleFrom, angleTo, function(value) {
                    wheel.transform("r" + value + ",300,300");
                }, 800);
                
                _rotation.zodiac = zodiac;
            }

        } else {
            throw "not ready";
        }
    };

    var house = function(house, zodiac) {
        if (_houses[house].id !== undefined) {
            var element = _svg.select('#' + _houses[house].id);
            if (element) {
                var fixed = _round(_rotate(zodiac));
                var rotation = _rotation.houses[house] - fixed;

                console.debug("Rotating house", house, 'to', zodiac, '(', rotation, 'rotation ).');
                
                var matrix = new Snap.Matrix();
                matrix.rotate(rotation, 300, 300);
                matrix.add(element.transform().localMatrix);
                element.transform(matrix);

                var next = (parseInt(house) > 6 ? parseInt(house) - 6 : parseInt(house) + 6).toString();
                _rotation.houses[house] = fixed;
                _rotation.houses[next] = _round(fixed + 180);
                console.log("Moved house", house, "to", _rotation.houses[house], 
                            " / ", next, "to", _rotation.houses[next]);

            } else {
                throw "not ready";
            }
        }
    };

    var astro = function(name, zodiac) {
        var element = _svg.select("g#" + name);
        if (element) {
            var angleFrom = _rotation.planets[name],
                angleTo = _rotate(zodiac);
            
            if (angleFrom < 0) { angleFrom = 360 + angleFrom; }
            if (angleTo < 0) { angleTo = 360 + angleTo; }
            
            console.debug("Moving", name, "from", angleFrom, "to", angleTo);
            
            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(orbit, value);
                }, 400);

            _rotation.planets[name] = angleTo;
        } else {
            throw "not ready";
        }
    };

    // Builds the public API for an AstrochartTheme.
    return {
        "ascendant" : ascendant,
        "astro" : astro,
        "house" : house,
        "invalidate" : invalidate
    }
};
