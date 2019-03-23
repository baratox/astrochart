import * as Snap from 'snapsvg'
import './snap/snap.orbit'
import './snap/snap.transformOriginal'
import $ from 'jquery'
import template from '../image/zodiac.svg'
/**
 * A theme draws the actual map with all provided information.
 * The theme is composed of two SVG templates
 **/
export default function AstrochartTheme(element, _settings) {

    var settings = $.extend({
        // SVG template to load
        'template': "/dist/image/zodiac.svg",

        // Center of all that exists, around which everything orbits.
        'center': {'x': 300, 'y': 300},
        // Radius of the circular orbit for all orbs.
        'orbit-radius': 207,
        'orbit-radius-synastry': 158,

        // Radius of the ends of an aspect line.
        'aspect-radius': 174,
        // The `strokeWidth` of the line for an aspect between two orbs increases with how strong
        // the aspect is. This setting is the `strokeWidth` when the aspect is the strongest.
        'aspect-full-stroke': 4,

        // The name of all supported orbs: planets, ex-planets, asteroids, etc.
        // This is also the id for the SVG sprite for it in the template.
        'orbs': ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus',
            'neptune', 'pluto'],

        // Id of the SVG element to use as orb sprite when a specific one is not found.
        'orb-sprite-default': 'planet',
        // Size in pixels of a single orb sprite in the template.
        'orb-sprite-size': 108,

        'houses': {
            'visible': true,
            'house-1': {
                // The angular position for this house in the template.
                // Starts at the further west and moves counterclockwise.
                'position': 0,
                // The angular position for the center of this house's text in the template.
                'text-position': 270
            },
            'house-2': {'position': 30, 'text-position': 270 },
            'house-3': {'position': 60, 'text-position': 270 },
            'house-4': {'position': 90, 'text-position': 270 },
            'house-5': {'position': 120, 'text-position': 270 },
            'house-6': {'position': 150, 'text-position': 270 },
            'house-7': {'position': 180, 'text-position': 270 },
            'house-8': {'position': 210, 'text-position': 270 },
            'house-9': {'position': 240, 'text-position': 270 },
            'house-10': {'position': 270, 'text-position': 270 },
            'house-11': {'position': 300, 'text-position': 270 },
            'house-12': {'position': 330, 'text-position': 270 }
        },
        // The rotation of the zodiac wheel in the template, considering 0 as the
        // middlepoint between *Pisces* and *Aries*.
        'zodiac-rotation': 0,

        // Size of the chart from the template
        'width': 600,
        'height': 600,
    }, _settings);


    console.log("Appending Astrochart to " + element);
    var _svg = Snap(element);
    _svg.attr({
        viewBox: '0 0 ' + [settings["width"], settings["height"]].join(" "),
    });

    let absolute_zero

    load(Snap.parse(template))

    function load(svg) {
        // Add everything from the sprites file.
        _svg.append(svg.select("#zodiac"));
        loadHousesFromTemplate(svg, '#main');
        loadHousesFromTemplate(svg, '#synastry');
        _svg.append(svg.select("#top"));

        _svg.select("#zodiac").transformOriginal();

        loadOrbsFromTemplate(svg, '#main', settings['orbit-radius']);
        loadOrbsFromTemplate(svg, '#synastry', settings['orbit-radius-synastry']);

        _svg.select('#synastry').attr({ visibility: 'hidden' })

        console.debug("Finished loading template.");
    }

    function loadHousesFromTemplate(svg, root) {
        _svg.append(svg.select(root));

        // Initial position for houses in the sprites file.
        for (var house = 1; house <= 12; house++) {
            var id = "house-" + house;
            var text = _svg.select(root + ' .label.' + id);
            if (text) {
                text.data("position", settings["houses"][id]["text-position"]);
            }

            var marker = _svg.select(root + ' .start-divider.' + id);
            if (marker) {
                marker.data("position", settings["houses"][id]["position"]);
                marker.data("text", text);
            }
        }

        _svg.select(root).attr({
            "visibility": settings["houses"]["visible"] ? "visible" : "hidden"
        });
    }

    function loadOrbsFromTemplate(svg, root, orbit) {
        for (var i in settings["orbs"]) {
            loadSpaceObject(svg, settings["orbs"][i]);
        }

        function loadSpaceObject(svg, name) {
            var object = svg.select("#" + name);
            console.log("Loading", name, object);
            if (!object) {
                // Create one based on the default planet sprite
                object = svg.select("#" + settings["orb-sprite-default"]);
            }

            object = object.clone();
            object.attr({ 'id': '', 'class': name + ' orb' });
            object.data("position", 0);
            _svg.select(root).append(object);

            // Scale the planet down and center it to its coordinates
            var scale = 0.37;
            var half = scale * settings["orb-sprite-size"]/2;

            var matrix = new Snap.Matrix();
            matrix.translate(-half, -half);
            matrix.scale(scale);
            object.transform(matrix);
            object.transformOriginal();

            object.data('orbit', orbit)
            object.orbit(0, orbit, settings["center"].x, settings["center"].y);
        };
    }


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

    var _centerHouseText = function(house_number, synastry) {
        var text = house(house_number, undefined, synastry).data("text");
        if (text) {
            var next = house_number < 12 ? house_number + 1 : 1;

            var center = _round(
                (house(house_number, undefined, synastry).data("position") +
                 house(next, undefined, synastry).data("position")) / 2);
            if (house_number == 12) center += 180;

            var rotation = _round(text.data("position") - center);
            // console.log("Centering text for house", house_number, "to", center, "by", rotation, "was", text.data("position"));
            text.data("position", center);

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(text.transform().localMatrix);
            text.transformOriginal(matrix);

            return text;

        } else {
            throw "No text for house " + house_number;
        }
    };

    var invalidate = function() {
        for (var house = 1; house <= 12; house++) {
            _centerHouseText(house);
            _centerHouseText(house, true);
        }
    };

    /**
     * Rotates the wheel so that given angle 'zodiac' is at 180º.
     * - zodiac: Zodiac-originated angle, with 0º at the
     *           start of Aries.
     */
    var ascendant = function(zodiac) {
        var wheel = _svg.select("#zodiac");
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
        const root = synastry ? '#synastry' : '#main'
        var element = _svg.select(`${root} .houses .house-${house}.start-divider`);
        if (element) {
            if (zodiac === undefined) {
                return element;
            }

            var absolute = _round(zodiac);
            var rotation = _round(element.data("position") - absolute);

            console.debug("Rotating house", house, 'to', absolute, '(', rotation, 'rotation ).');

            var matrix = new Snap.Matrix();
            matrix.rotate(rotation, 300, 300);
            matrix.add(element.transform().localMatrix);
            element.transformOriginal(matrix);

            element.data("position", absolute);

            return element;

        } else {
            throw "House " + house + " does not exist";
        }
    };

    var orb = function(name, zodiac, synastry = false) {
        const root = synastry ? '#synastry' : '#main'
        var element = _svg.select(`${root} .orb.${name}`);
        if (element) {
            if (zodiac === undefined) {
                return element;
            }

            var angleFrom = element.data('position')
            // Rotate counter-clock, with 0º at the farthest west, the ascendant.
            var angleTo = _round(-zodiac)

            console.debug("Moving", name, "from", angleFrom, "to", angleTo);

            // Run animation if already loaded
            Snap.animate(angleFrom, angleTo, function(value) {
                    element.orbit(value + 180, element.data('orbit'),
                        settings["center"].x, settings["center"].y);
                }, 400);

            element.data('position', angleTo);

            return element;

        } else {
            throw "Orb " + name + " does not exist";
        }
    };

    function _isAspectTarget(target) {
        if (settings["orbs"].indexOf(target) >= 0) {
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

        const orbit = settings["aspect-radius"];

        var point_a = _svg.get_orbit(astro_a.data("position") + 180, orbit,
                                     settings["center"].x, settings["center"].y),
            point_b = _svg.get_orbit(astro_b.data("position") + 180, orbit,
                                     settings["center"].x, settings["center"].y);

        // Always use the "smaller" object name first to build the id.
        var id = a < b ? 'aspect-' + a + '-' + b : 'aspect-' + b + '-' + a;
        var line = _svg.select('#' + id);
        if (!line) {
            line = _svg.line(point_a.x, point_a.y, point_b.x, point_b.y);
            line.attr({'id': id, 'class': classes});
            line.attr({'stroke': "#777", 'strokeWidth': value * settings["aspect-full-stroke"]});
            _svg.add(line);

        } else {
            line.attr({
                'class': classes,
                'x1': point_a.x, 'y1': point_a.y,
                'x2': point_b.x, 'y2': point_b.y,
                'strokeWidth': value * settings["aspect-full-stroke"]
            });
        }

        return line;
    };

    var synastry = function (enabled) {
        _svg.select('#synastry').attr({ visibility: enabled ? 'visible' : 'hidden' })
        _svg.select('#cover').attr({ visibility: enabled ? 'hidden' : 'visible' })
    }

    // Builds the public API for an AstrochartTheme.
    return {
        "ascendant" : ascendant,
        "orb" : orb,
        "house" : house,
        "aspect" : aspect,
        "invalidate" : invalidate,
        synastry
    }
};
