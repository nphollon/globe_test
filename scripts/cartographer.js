"use strict";

var objects = require("./objects.js")

var Point2d = function(x, y) {
    if(!(this instanceof Point2d)) {
        return new Point2d(x, y)
    }
    objects.defineConstant(this, "x", x)
    objects.defineConstant(this, "y", y)
}

Point2d.prototype.plus = function (addend) {
    return new Point2d(this.x + addend.x, this.y + addend.y)
}

Point2d.prototype.equals = function (object) {
    try {
        return this.x === object.x && this.y === object.y
    } catch (notAPoint) {
        return false
    }
}

Point2d.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")"
}

exports.projection = function (canvasWidth, canvasHeight) {
    return function (mapCoords) {
        var canvasCenter,
        displacement,
        transformX,
        transformY

        transformX = mapCoords.longitude.degrees * canvasWidth / 360
        transformY = -mapCoords.latitude.degrees * canvasHeight / 180
        displacement = new Point2d(transformX, transformY)

        canvasCenter = new Point2d(canvasWidth / 2, canvasHeight / 2)

        return canvasCenter.plus(displacement)
    }
}

var Renderer = function (context) {
    if (!(this instanceof Renderer)) {
        return new Renderer(context)
    }
    objects.defineConstant(this, "context", context)
}

Renderer.prototype.drawMarker = function (point) {
    this.context.fillRect(point.x - 5, point.y - 5, 10, 10)
}

Renderer.prototype.drawMarkers = function (points) {
    points.map(this.drawMarker, this)
}

exports.Renderer = Renderer
exports.Point2d = Point2d
