"use strict";
window.Astrochart = (function() {
    var version = "0.1.0";
  
    var create = function(w, h) {
        var chart = Snap(w, h);

        Snap.load("/dist/image/things.svg", function(svg) {
            loadSpaceObject(svg, "mercury", 3000);
            loadSpaceObject(svg, "venus", 5000);
            loadSpaceObject(svg, "mars", 8000);
            loadSpaceObject(svg, "jupiter", 12000);
        });

        // Path for planets
        var path = chart.path("M 270, 270 " + 
                              "m -200, 0 " +
                              "a 200,200 0 1,0 400,0 " + 
                              "a 200,200 0 1,0 -400,0");
        path.attr('fill', 'none');
        path.attr('stroke', 'red');
        path.attr('stroke-dasharray', '1,1');


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
                var pathLength = path.getTotalLength();
                var point = path.getPointAtLength(degrees * pathLength / 360 );  

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
