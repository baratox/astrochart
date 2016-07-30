window.Astrochart = (function(w, h, overridenSettings) {
    "use strict";

    var settings = {
        'sprites-base-url': "/dist/image"
    }

    var snap;
    var orbit;

    var now = {
        'ascendant': 0,
        'mc': 270,
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

        Snap.load(settings['sprites-base-url'] + "/zodiac.svg", function(svg) {
            var zodiac = svg.select("g#zodiac");
            snap.append(zodiac);

            // Creates the orbit for space objects
            orbit = snap.createCircularOrbit(300, 300, 230);
            snap.append(orbit);

            var houses = svg.select("g#houses");
            snap.append(houses);
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

            console.debug("Object", object, "loaded.");
            snap.append(object);

            _move(name, now.planets[name]);
        };
    };

    function ascendant(degrees) {
        if (degrees !== undefined) {
            var zodiac = snap.select("g#zodiac");
            if (zodiac) {
                Snap.animate(now.ascendant, degrees, function(value) {
                    zodiac.transform("r" + value);
                }, 800);
            }
            
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
            var element = snap.select("g#" + planet);
            if (element) {
                // Run animation if already loaded
                Snap.animate(now.planets[planet], degrees, function(value) {
                        element.orbit(orbit, degrees);
                    }, 400);
            }
            
            now.planets[planet] = degrees;
            return this;

        } else {
            return now.planets[planet];
        }
    }

    function house(houses, degrees) {
        return iterateIfCollection(houses, degrees, _house);
    }

    function _house(house, degrees) {
        if (now.houses[house] === undefined) {
            return false;
        }

        if (degrees !== undefined) {
            var houseElements = { 
                '1': { id: 'house-1' },
                '2': { id: 'house-2' },
                '3': { id: 'mc' },
                '4': { id: 'house-4' },
                '5': { id: 'house-5' },
                '6': { }, // Descendant is fixed
                '7': { id: 'house-1' },
                '8': { id: 'house-2' },
                '9': { id: 'mc' },
                '10': { id: 'house-4' },
                '11': { id: 'house-5' },
                '12': { } // Ascendant is fixed
            }

            var element = houseElements[house].id !== undefined ? 
                            snap.select('#' + houseElements[house].id) : null;
            if (element) {
                var matrix = new Snap.Matrix()
                matrix.rotate(now.houses[house] - degrees, 300, 300);
                matrix.add(element.transform().localMatrix);
                element.transform(matrix);

                console.log(matrix.toTransformString());
            }
            
            now.houses[house] = degrees;
            return this;

        } else {
            return now.houses[house];
        }
    }

    function iterateIfCollection(argument, parameter, callback) {
        if (typeof argument === "object") {
            for (var i in argument) {
                callback(i, argument[i]);
            }
            return this;

        } else if (typeof argument === "string") {
            return callback(argument, parameter);
        }

    }

    // Initialize this instance and return public API.
    _Astrochart(w !== undefined ? w : 600, h, overridenSettings);

    return {
        snap: snap,
        ascendant: ascendant,
        move: move,
        house: house
    };

});
