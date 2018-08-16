window.Astrochart = (function(overridenSettings) {
    "use strict";

    var settings = {
        'sprites-base-url': "/dist/image",
    }

    const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra",
                   "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

    var orbit;

    var theme;

    var now = {
        'houses': {
            1 : 0,
            2 : 30,
            3 : 60,
            4 : 90,
            5 : 120,
            6 : 150,
            7 : 180,
            8 : 210,
            9 : 240,
            10 : 270,
            11 : 300,
            12 : 330
        },
        'ascendant': { 'degrees': 0, 'sign': "aries", 'house': 1 },
        'planets': {
            'sun':     { 'degrees': 0, 'sign': "aries", "house": 1 },
            'moon':    { 'degrees': 0, 'sign': "aries", "house": 1 },
            'mercury': { 'degrees': 0, 'sign': "aries", "house": 1 },
            'venus':   { 'degrees': 0, 'sign': "aries", "house": 1 },
            'mars':    { 'degrees': 0, 'sign': "aries", "house": 1 },
            'jupiter': { 'degrees': 0, 'sign': "aries", "house": 1 },
            'saturn':  { 'degrees': 0, 'sign': "aries", "house": 1 },
            'uranus':  { 'degrees': 0, 'sign': "aries", "house": 1 },
            'neptune': { 'degrees': 0, 'sign': "aries", "house": 1 },
            'pluto':   { 'degrees': 0, 'sign': "aries", "house": 1 }
        }
    };


    function _Astrochart(overridenSettings) {
        if (overridenSettings) {
            settings = $.extend(settings, overridenSettings);
        }

        theme = new Astrochart.AstrochartTheme(settings);
    };

    /**
     * Gets an object with astrological information for the given angle.
     */
    function astrologicalInfo(degrees) {
        if (degrees < 0 || degrees > 360) {
            throw "Invalid degree " + degrees;
        }

        var house;
        for (var i = 1; i <= 12; i++) {
            var begin = now.houses[i]
            var next = i < 12 ? now.houses[i + 1] : now.houses[1];
            if (begin < next) {
                if (degrees >= begin && degrees < next) {
                    house = i;
                    break;
                }
            } else {
                if (degrees >= begin || degrees < next) {
                    house = i;
                    break;
                }
            }
        }

        return {
            'degrees': degrees,
            'sign': signs[Math.floor(degrees / 30)],
            'house': house
        }
    }

    function ascendant(degrees) {
        if (degrees !== undefined) {
            theme.ascendant(degrees);
            now.ascendant = astrologicalInfo(degrees);

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
            now.planets[planet] = astrologicalInfo(degrees);
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
        house = typeof house !== "number" ? parseInt(house) : house;
        if (now.houses[house] === undefined) {
            return false;
        }

        if (degrees !== undefined) {
            theme.house(house, degrees);
            now.houses[house] = astrologicalInfo(degrees);
            return this;

        } else {
            return now.houses[house];
        }
    };

    function aspect(aspects) {
        for (var i in aspects) {
            var aspect = aspects[i];
            theme.aspect(aspect.a, aspect.b, aspect.value, aspect.classes);
        }
    }


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
    _Astrochart(overridenSettings);

    return {
        theme: theme,
        ascendant: ascendant,
        move: move,
        house: house,
        aspect: aspect
    };

});
