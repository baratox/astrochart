Snap.plugin(function(Snap, Element, Paper) {
    'use strict';

    const PLANET_SIZE = 108;

    /**
     * Moves the Snap.Element in a clock-wise circular orbit around 
     * the given center. At 0º the element is at farthest east point.
     *
     * @method orbit
     * @public
     * @param {Integer} angle: Angle in degrees.
     * @param {Integer} radius: Radius in pixels.
     * @param {Integer} cx: x coordinate of the orbit center.
     * @param {Integer} cy: y coordinate of the orbit center.
     */
    Element.prototype.get_orbit = function(angle, radius, cx, cy) {
        var x = cx + radius * Math.cos(Snap.rad(angle)),
            y = cy + radius * Math.sin(Snap.rad(angle));
        return { 'x': x, 'y': y }
    };


    /**
     * Moves the Snap.Element in a clock-wise circular orbit around 
     * the given center. At 0º the element is at farthest east point.
     *
     * @method orbit
     * @public
     * @param {Integer} angle: Angle in degrees.
     * @param {Integer} radius: Radius in pixels.
     * @param {Integer} cx: x coordinate of the orbit center.
     * @param {Integer} cy: y coordinate of the orbit center.
     */
    Element.prototype.orbit = function(angle, radius, cx, cy) {
        var point = this.get_orbit(angle, radius, cx, cy);

        var matrix = new Snap.Matrix();
        matrix.translate(point.x, point.y);
        this.transformOriginal(matrix);
    };
});

Snap.plugin(function(Snap, Element, Paper) {
    'use strict';

    Element.prototype.transformOriginal = function(t, append) {
        if (typeof t === "undefined") {
            // Save current transformation as original.
            this.data("original-transform", this.transform().localMatrix);

        } else {
            // Prepends t to the original transform by default
            append = typeof append !== "undefined" ? append : false;
            var original = this.data("original-transform") != null ? this.data("original-transform").clone() : null;
            if (original) {
                if (t instanceof Snap.Matrix) {
                    if (append) {
                        this.transform(original.add(t));
                    } else {
                        this.transform(t.add(original));
                    }

                } else {
                    if (append) {
                        this.transform(original);
                        this.transform(t);
                    } else {
                        this.transform(t);
                        this.transform(original);
                    }
                }
                
            } else {
                this.transform(t);
            }
        }
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
    _Astrochart(w !== undefined ? w : 600, h, overridenSettings);

    return {
        snap: snap,
        theme: theme,
        ascendant: ascendant,
        move: move,
        house: house,
        aspect: aspect
    };

});

Astrochart.AstrochartTheme = function(_svg, _settings) {

    var settings = jQuery.extend({
        'sprites-planet-size': 108,
        'center': {'x': 300, 'y': 300},
        'astro-orbit': 198,
        'aspect-orbit': 164,
        'aspect-maximun-stroke': 4,
        'visible-astros': ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 
                           'saturn', 'uranus', 'neptune', 'pluto']
    }, _settings);

    var zodiac_rotation = 105;

    var _rotation = {
        'houses': { '1' : 0, '2' : 30, '3' : 60, '4' : 90, '5' : 120, '6' : 150, 
                    '7' : 180, '8' : 210, '9' : 240, '10' : 270, '11' : 300, '12' : 330 },
        'house-texts': { '1' : 90, '2' : 90, '3' : 90, '4' : 90, '5' : 90, '6' : 90,
                         '7' : 90, '8' : 90, '9' : 90, '10' : 90, '11' : 90, '12' : 90 }
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

    Snap.load(settings['sprites-base-url'] + "/zodiac.svg", function(svg) {
        // Add everything from the sprites file.
        _svg.append(svg);

        console.debug("Finished loading zodiac.svg.");
    });

    Snap.load(settings['sprites-base-url'] + "/things.svg", function(svg) {
        for (var i in settings["visible-astros"]) {
            loadSpaceObject(svg, settings["visible-astros"][i], Math.random() * 10000 + 3000);
        }

        function loadSpaceObject(svg, name, animationDelay) {
            console.log("Loading", name)
            var object = svg.select("g#" + name);
            if (!object) {
                // Create one based on the default planet sprite
                object = svg.select("g#planet").clone();
                object.attr({'id': name});
            }
            object.data("position", 0);

            _svg.append(object);

            // Scale the planet down an center it to its coordinates
            var scale = 0.37;
            var half = scale * settings["sprites-planet-size"]/2;

            var matrix = new Snap.Matrix();
            matrix.translate(-half, -half);
            matrix.scale(scale);
            object.transform(matrix);
            object.transformOriginal();

            object.orbit(0, settings["astro-orbit"], settings["center"].x, settings["center"].y);
        };
    });


    /**
     * Gets the absolute rotation angle (0º at three o'clock) 
     * for the given zodiac-originated angle.
     * - zodiac: Zodiac-originated angle, with 0º at the 
     *           start of Aries.
     */
    var _rotate = function(zodiac) {
        var fixed = zodiac - zodiac_rotation;
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
            var angleFrom = zodiac_rotation - 105;
            var angleTo = zodiac - 105;
            if (angleFrom != angleTo) {
                console.debug("Rotating zodiac to", zodiac);

                // TODO Rotate everything else too
                Snap.animate(angleFrom, angleTo, function(value) {
                    wheel.transform("r" + value + ",300,300");
                }, 800);
                
                zodiac_rotation = zodiac;
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
            var angleFrom = element.data('position')
                // Rotate counter-clock, with 0º at the farthest west, the ascendant.
                angleTo = - (180 + _rotate(zodiac));
            
            if (angleFrom < 0) { angleFrom = 360 + angleFrom; }
            if (angleTo < 0) { angleTo = 360 + angleTo; }
            
            console.debug("Moving", name, "from", angleFrom, "to", angleTo);
            
            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(value, settings["astro-orbit"], settings["center"].x, settings["center"].y);
                }, 400);

            element.data('position', angleTo);
        } else {
            throw "not ready";
        }
    };

    // Shows the relationship between two objects in the chart 
    var aspect = function(a, b, value, classes) {
        if (settings["visible-astros"].indexOf(a) < 0) {
            throw a + " is unknown"
        }
        if (settings["visible-astros"].indexOf(b) < 0) {
            throw b + " is unknown"
        }

        var astro_a = _svg.select("#" + a),
            astro_b = _svg.select("#" + b);

        var point_a = _svg.get_orbit(astro_a.data("position"), settings["aspect-orbit"], 
                                     settings["center"].x, settings["center"].y),
            point_b = _svg.get_orbit(astro_b.data("position"), settings["aspect-orbit"], 
                                     settings["center"].x, settings["center"].y);

        // Always use the "smaller" object name first to build the id.
        var id = a < b ? 'aspect-' + a + '-' + b : 'aspect-' + b + '-' + a;
        var line = _svg.select('#' + id);
        if (!line) {
            line = _svg.line(point_a.x, point_a.y, point_b.x, point_b.y);
            line.attr({'id': id, 'class': classes});
            line.attr({'stroke': "#777", 'strokeWidth': value * settings["aspect-maximun-stroke"]});
            _svg.add(line);

        } else {
            line.attr({
                'class': classes,
                'x1': point_a.x, 'y1': point_a.y, 
                'x2': point_b.x, 'y2': point_b.y,
                'strokeWidth': value * settings["aspect-maximun-stroke"] 
            });
        }

        return line;
    };

    // Builds the public API for an AstrochartTheme.
    return {
        "ascendant" : ascendant,
        "astro" : astro,
        "house" : house,
        "aspect" : aspect,
        "invalidate" : invalidate
    }
};
