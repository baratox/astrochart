"use strict";
window.Astrochart = (function(w, h) {
    var version = "0.1.0";

    const DEFAULT_PLANET_SIZE = 108;

    var snap;
    var orbit;

    var now = {
        'ascendant': 0,
        'houses': [],
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


    function _Astrochart(w, h) {
        snap = Snap(w, h);
        snap.attr({ 
            viewBox: '0 0 600 600',
            height: '100%',
            width: '100%' 
        });

        Snap.load("/dist/image/zodiac.svg", function(svg) {
            var zodiac = svg.select("g#zodiac");
            snap.append(zodiac);

            // Creates the orbit for space objects
            orbit = createOrbitPath(w/2, h/2, 230);
        });

        Snap.load("/dist/image/things.svg", function(svg) {
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

        Snap.plugin(function(Snap, Element) {
            'use strict';

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
            Element.prototype.orbit = function(degrees) {
                var pathLength = orbit.getTotalLength();
                var point = orbit.getPointAtLength(degrees * pathLength / 360 );  

                var scale = 0.5;
                var half = scale * DEFAULT_PLANET_SIZE/2;

                var matrix = new Snap.Matrix();
                matrix.translate(point.x, point.y);
                matrix.translate(-half, -half);
                matrix.scale(scale);
                
                this.transform(matrix);
            };
        });
    };

    function createOrbitPath(cx, cy, r) {
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

        var path = snap.path(("M {cx}, {cy} " + 
                      "m -{r}, 0 " +
                      "a {r},{r} 0 1,0 {d},0 " + 
                      "a {r},{r} 0 1,0 -{d},0").format({cx:cx, cy:cy, r:r, d:r*2}));
        path.attr('fill', 'none');
        path.attr('stroke', 'red');
        path.attr('stroke-dasharray', '1,1');

        return path;
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
        if (typeof planets === "object") {
            for (var planet in planets) {
                _move(planet, planets[planet]);
            }
            return this;

        } else if (typeof planets === "string") {
            return _move(planets, degrees);
        }
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
                        element.orbit(degrees);
                    }, 400);
            }
            
            now.planets[planet] = degrees;
            return this;

        } else {
            return now.planets[planet];
        }
    }

    // Initialize this instance and return public API.
    _Astrochart(w !== undefined ? w : 600, 
                h !== undefined ? h : 600);

    return {
        version: version,
        ascendant: ascendant,
        move: move,
        snap: snap
    };

});
