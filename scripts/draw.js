"use strict";

var createRenderer = function (context) {
    var that = {};

    that.drawMarker = function (point) {
        context.fillRect(point.x() - 5, point.y() - 5, 10, 10);
    };

    that.drawMarkers = function (points) {
        points.map(this.drawMarker, this);
    };

    return that;
};

var draw = function (canvas) {
    var renderer = createRenderer(canvas.getContext('2d'));
    var proj = projection(canvas.width, canvas.height);
    var coords = healpix.basePixelVertices();
    var points = coords.map(proj);
    renderer.drawMarkers(points);
};
