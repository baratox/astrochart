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
