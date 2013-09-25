/*global maps */
/*jslint maxlen: 80 */

var cartographer = (function () {
    "use strict";

    var createRenderer,
        draw, // called by index.html
        point2d, // value object for x-y pairs
        projection; // transforms map coordinates to pixel coordinates

    createRenderer = function (context) {
        var that = {};

        that.drawMarker = function (point) {
            context.fillRect(point.x() - 5, point.y() - 5, 10, 10);
        };

        that.drawMarkers = function (points) {
            points.map(this.drawMarker, this);
        };

        return that;
    };

    point2d = function (x, y) {
        var that = {};

        that.x = function () { return x; };
        that.y = function () { return y; };

        that.plus = function (addend) {
            return point2d(x + addend.x(), y + addend.y());
        };

        that.toString = function () {
            return "(" + x + ", " + y + ")";
        };

        that.equals = function (object) {
            return object &&
                typeof object.x === 'function' &&
                typeof object.y === 'function' &&
                x === object.x() && y === object.y();
        };

        return that;
    };

    projection = function (canvasWidth, canvasHeight) {
        return function (mapCoords) {
            var canvasCenter,
                displacement,
                transformX,
                transformY;

            transformX = mapCoords.decLongitude() * canvasWidth / 360;
            transformY = -mapCoords.decLatitude() * canvasHeight / 180;
            displacement = point2d(transformX, transformY);

            canvasCenter = point2d(canvasWidth / 2, canvasHeight / 2);

            return canvasCenter.plus(displacement);
        };
    };

    draw = function (canvas) {
        var renderer, proj, coords, points;
        renderer = createRenderer(canvas.getContext('2d'));
        proj = projection(canvas.width, canvas.height);
        coords = maps.healpix.basePixelVertices();
        points = coords.map(proj);
        renderer.drawMarkers(points);
    };

    return {
        createRenderer: createRenderer,
        point2d: point2d,
        projection: projection,
        draw: draw
    };
}());
