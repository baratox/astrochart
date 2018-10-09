import * as Snap from 'snapsvg'

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
