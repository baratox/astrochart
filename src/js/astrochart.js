"use strict";
window.Astrochart = (function() {
    var version = "0.1.0";
  
    var create = function(w, h) {
        var chart = Snap(w, h);
        var orbitPath;

        Snap.load("/dist/image/zodiac.svg", function(svg) {
            var zodiac = svg.select("g#zodiac");
            chart.append(zodiac);

            // Creates the orbit for space objects
            orbitPath = createOrbitPath(w/2, h/2, 230);
            
            Snap.animate(0, -167, function(value) {
                zodiac.transform("r" + value);
            }, 6000);

        });

        Snap.load("/dist/image/things.svg", function(svg) {
            loadSpaceObject(svg, "mercury", 3000);
            loadSpaceObject(svg, "venus", 5000);
            loadSpaceObject(svg, "mars", 8000);
            loadSpaceObject(svg, "jupiter", 12000);
        });

        function createOrbitPath(cx, cy, r) {
            
            if (!String.prototype.format) {
                String.prototype.format = function() {
                    var str = this.toString();
                    if (!arguments.length)
                        return str;
                    var args = typeof arguments[0],
                        args = (("string" == args || "number" == args) ? arguments : arguments[0]);

                    console.log(args)
                    for (var arg in args)
                        str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
                    return str;
                }
            }

            var path = chart.path(("M {cx}, {cy} " + 
                          "m -{r}, 0 " +
                          "a {r},{r} 0 1,0 {d},0 " + 
                          "a {r},{r} 0 1,0 -{d},0").format({cx:cx, cy:cy, r:r, d:r*2}));
            path.attr('fill', 'none');
            path.attr('stroke', 'red');
            path.attr('stroke-dasharray', '1,1');

            return path;
        }


        function loadSpaceObject(svg, name, animationDelay) {
            var object = svg.select("g#" + name);
            chart.append(object);

            function repeatAnimation() {
                Snap.animate(0, 360, function(value) {
                    object.orbit(value);
                }, animationDelay, null, repeatAnimation);
            }

            repeatAnimation();
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
                var pathLength = orbitPath.getTotalLength();
                var point = orbitPath.getPointAtLength(degrees * pathLength / 360 );  

                var matrix = new Snap.Matrix();
                matrix.translate(point.x - 54, point.y - 54);

                this.transform(matrix);
            };
        });

    };

    return {
        version: version,
        create: create,
    };

})();
