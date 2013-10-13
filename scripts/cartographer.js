"use strict";

var maps = require("./maps.js");

exports.createRenderer = function (context) {
    var that = {};

    that.drawMarker = function (point) {
        context.fillRect(point.x() - 5, point.y() - 5, 10, 10);
    };

    that.drawMarkers = function (points) {
        points.map(this.drawMarker, this);
    };

    return that;
};

exports.point2d = function (x, y) {
    var that = {};

    that.x = function () { return x; };
    that.y = function () { return y; };

    that.plus = function (addend) {
        return exports.point2d(x + addend.x(), y + addend.y());
    };

    that.toString = function () {
        return "(" + x + ", " + y + ")";
    };

    that.equals = function (object) {
        return object &&
            typeof object.x === "function" &&
            typeof object.y === "function" &&
            x === object.x() && y === object.y();
    };

    return that;
};

exports.projection = function (canvasWidth, canvasHeight) {
    return function (mapCoords) {
        var canvasCenter,
        displacement,
        transformX,
        transformY;

        transformX = mapCoords.decLongitude() * canvasWidth / 360;
        transformY = -mapCoords.decLatitude() * canvasHeight / 180;
        displacement = exports.point2d(transformX, transformY);

        canvasCenter = exports.point2d(canvasWidth / 2, canvasHeight / 2);

        return canvasCenter.plus(displacement);
    };
};

exports.draw = function (canvas) {
    var renderer = exports.createRenderer(canvas.getContext("2d"));
    var proj = exports.projection(canvas.width, canvas.height);
    var coords = maps.healpix.basePixelVertices();
    var points = coords.map(proj);
    renderer.drawMarkers(points);
};
