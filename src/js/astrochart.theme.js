Astrochart.AstrochartTheme = function( _settings) {

    var settings = jQuery.extend({
        'sprites-planet-size': 108,
        'center': {'x': 300, 'y': 300},
        'astro-orbit': 207,
        'aspect-orbit': 174,
        'aspect-orbit-synastry': 127,
        'aspect-maximun-stroke': 4,
        'visible-astros': ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
                           'saturn', 'uranus', 'neptune', 'pluto'],
        'houses': {
            'visibility': "hidden",
            'house-1': {'position': 0, 'text-position': 90 },
            'house-2': {'position': 30, 'text-position': 90 },
            'house-3': {'position': 60, 'text-position': 90 },
            'house-4': {'position': 90, 'text-position': 90 },
            'house-5': {'position': 120, 'text-position': 90 },
            'house-6': {'position': 150, 'text-position': 90 },
            'house-7': {'position': 180, 'text-position': 90 },
            'house-8': {'position': 210, 'text-position': 90 },
            'house-9': {'position': 240, 'text-position': 90 },
            'house-10': {'position': 270, 'text-position': 90 },
            'house-11': {'position': 300, 'text-position': 90 },
            'house-12': {'position': 330, 'text-position': 90 }
        },
        'zodiac-rotation': 0,
        'synastry': {
            'visible': false,
        },
        'width': 600,
        'height': 600,
    }, _settings);


    var _svg = Snap(settings['width'], settings['height']);
    _svg.attr({
        viewBox: '0 0 600 600',
        height: '100%',
        width: '100%'
    });

    Snap.load(settings['sprites-base-url'] + "/zodiac.svg", function(svg) {
        // Add everything from the sprites file.
        _svg.append(svg.select("#zodiac"));
        _svg.append(svg.select("#houses"));
        _svg.append(svg.select("#synastry"));
        _svg.append(svg.select("#top"));

        _svg.select("#zodiac").transformOriginal();

        // Initial position for houses in the sprites file.
        for (var house = 1; house <= 12; house++) {
            var id = "house-" + house;
            var text = _svg.select("#" + id + "-text");
            if (text) {
                text.data("position", settings["houses"][id]["text-position"]);
            }

            var marker = _svg.select("#" + id);
            if (marker) {
                marker.data("position", settings["houses"][id]["position"]);
                marker.data("text", text);
            }
        }

        _svg.select("#houses").attr({"visibility": settings["houses"]["visibility"]});

        synastry(settings["synastry"]["visible"]);

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
    var _abs = function(zodiac) {
        var absolute = zodiac - absolute_zero;
        return absolute;
    };

    /**
     * Rounds angles to 5 decimal places to avoid complex values
     * when calculating.
     */
    var _round = function(number) {
        if (typeof(number) !== "number") console.warn("Invalid number", number, typeof(number));
        var rounded = number;
        if (number < 0) {
            rounded += 360;
        }
        if (number >= 360) {
            rounded -= 360;
        }

        return Number(rounded.toFixed(3));
    }

    var _centerHouseText = function(house_number) {
        var text = house(house_number).data("text");
        if (text) {
            var next = house_number < 12 ? house_number + 1 : 1;

            var center = _round((house(house_number).data("position") + house(next).data("position")) / 2);
            if (house_number == 6) center += 180;

            var rotation = _round(text.data("position") - center);
            console.log("Centering text for house", house_number, "to", center, "by", rotation, "was", text.data("position"));
            text.data("position", center);

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(text.transform().localMatrix);
            text.transform(matrix);

            return text;

        } else {
            throw "No text for house " + house_number;
        }
    };

    var invalidate = function() {
        for (var house = 1; house <= 12; house++) {
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
            if (zodiac === undefined) {
                return wheel;
            }

            zodiac = _round(zodiac);

            var angleFrom = settings["zodiac-rotation"];
            var angleTo = zodiac;
            console.debug("Rotating zodiac to", zodiac, angleFrom, angleTo);
            Snap.animate(angleFrom, angleTo, function(value) {
                var matrix = new Snap.Matrix();
                matrix.rotate(-value, 300, 300);
                wheel.transformOriginal(matrix);
            }, Math.abs(angleTo - angleFrom) * 9, mina.easeout);

            wheel.data("rotation", angleTo);
            absolute_zero = zodiac;

            return wheel;

        } else {
            throw "Zodiac does not exist";
        }
    };

    var house = function(house, zodiac, synastry = false) {
        var element = _svg.select('#house-' + house);
        if (element) {
            if (zodiac === undefined) {
                return element;
            }

            // Show house elements if hidden
            if (settings["houses"]["visibility"] === "hidden") {
                settings["houses"]["visibility"] = "visible";
                _svg.select("#houses").attr({"visibility": "visible"});
            }

            var absolute = _round(zodiac);
            var rotation = _round(element.data("position") - absolute);

            console.debug("Rotating house", house, 'to', absolute, '(', rotation, 'rotation ).');

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(element.transform().localMatrix);
            element.transform(matrix);

            element.data("position", absolute);

            return element;

        } else {
            throw "House " + house + " does not exist";
        }
    };

    var astro = function(name, zodiac) {
        var element = _svg.select("g#" + name);
        if (element) {
            if (zodiac === undefined) {
                return element;
            }

            var angleFrom = element.data('position')
                // Rotate counter-clock, with 0º at the farthest west, the ascendant.
                angleTo = _round(-zodiac);

            console.debug("Moving", name, "from", angleFrom, "to", angleTo);

            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(value + 180, settings["astro-orbit"], settings["center"].x, settings["center"].y);
                }, 400);

            element.data('position', angleTo);

            return element;

        } else {
            throw "Astro " + name + " does not exist";
        }
    };

    function _isAspectTarget(target) {
        if (settings["visible-astros"].indexOf(target) >= 0) {
            return true;
        } else if (target in settings["houses"]) {
            return true;
        }

        return false;
    };

    // Shows the relationship between two objects in the chart
    var aspect = function(a, b, value, classes) {
        if (!_isAspectTarget(a)) throw a + " is unknown";
        if (!_isAspectTarget(b)) throw b + " is unknown";

        var astro_a = _svg.select("#" + a),
            astro_b = _svg.select("#" + b);

        var orbit;
        if (settings["synastry"]["visible"]) {
            orbit = settings["aspect-orbit-synastry"];
        } else {
            orbit = settings["aspect-orbit"];
        }

        var point_a = _svg.get_orbit(-astro_a.data("position"), orbit,
                                     settings["center"].x, settings["center"].y),
            point_b = _svg.get_orbit(-astro_b.data("position"), orbit,
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

    function synastry(visible) {
        settings["synastry"]["visible"] = visible;

        _svg.select("#synastry-houses").attr({"visibility": visible ? "visible" : "hidden"});
        // Hide synastry cover if synastry is visible
        _svg.select("#cover").attr({"visibility": visible ? "hidden" : "visible"});
    }

    // Builds the public API for an AstrochartTheme.
    return {
        "ascendant" : ascendant,
        "astro" : astro,
        "house" : house,
        "aspect" : aspect,
        "invalidate" : invalidate
    }
};
