/* jshint browser: true */

var draw = function (canvas) {
    "use strict";

    var cart = require("./cartographer.js")
    var hpix = require("./healpix.js")

    var projection = cart.projection(canvas.width, canvas.height)
    var coordinates = hpix.basePixelVertices()
    var points = coordinates.map(projection)

    var renderer = new cart.Renderer(canvas.getContext("2d"))
    renderer.drawMarkers(points)
}

window.onload = function () {
    "use strict";
    var canvas = document.getElementById("canvas")
    if (canvas) {
        draw(canvas)
    }
}
