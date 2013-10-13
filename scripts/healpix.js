"use strict";

var maps = require("./maps.js");

exports.basePixelVertices = function () {
    var i,
        initLongitudes, // list of starting longitudes for each vertexLat
        vertexLat, // iterates through vertex latitudes
        vertexLon, // iterates through vertex longitudes
        vertices // return value

    vertices = []
    initLongitudes = [180, -135, -90, -135, 180]

    for (i = 0; i < initLongitudes.length; i += 1) {
        vertexLat = 90 - i * 45
        for (vertexLon = initLongitudes[i];
             vertexLon <= 180;
             vertexLon += 90) {
            vertices.push(new maps.Coordinates(vertexLat, vertexLon))
        }
    }
    return vertices
}
