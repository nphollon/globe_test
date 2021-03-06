"use strict";

var objects = require("./objects.js")

var normalize = function (degrees) {
    var fullCircle = 360
    var normalDegrees = degrees
    while (normalDegrees > 0.5*fullCircle) { normalDegrees -= fullCircle; }
    while (normalDegrees <= -0.5*fullCircle) { normalDegrees += fullCircle; }
    return normalDegrees
}

var Angle = function (degrees) {
    if (!(this instanceof Angle)) {
        return new Angle(degrees)
    }
    var seconds = Math.round(normalize(degrees) * Angle.secondsPerDegree)
    objects.defineConstant(this, "seconds", seconds)
}

objects.defineConstant(Angle, "secondsPerDegree", 3600)

Angle.fromSeconds = function (seconds) {
    return new Angle(seconds / Angle.secondsPerDegree)
}

objects.defineAccessor(Angle.prototype, "degrees", function () {
    return this.seconds / Angle.secondsPerDegree
})

Angle.prototype.negative = function () {
    return Angle.fromSeconds(-this.seconds)
}

Angle.prototype.equals = function (object) {
    try {
        return this.seconds === object.seconds
    } catch (objectNotAnAngle) {
        return false
    }
}

Angle.prototype.toString = function () {
    return this.seconds + " seconds"
}


var checkAngleLimit = function (degrees, limit, name) {
    if (Math.abs(degrees) > limit) {
        throw {
            name: "ArgumentError",
            message: name + " cannot exceed +/- " + limit + " degrees"
        }
    }
}

var Latitude = function (degrees) {
    checkAngleLimit(degrees, 90, "Latitude")
    return new Angle(degrees)
}

var Longitude = function (degrees) {
    checkAngleLimit(degrees, 180, "Longitude")
    return new Angle(degrees)
}

var Coordinates = function (latDegrees, lonDegrees) {
    if (!(this instanceof Coordinates)) {
        return new Coordinates(latDegrees, lonDegrees)
    }
    objects.defineConstant(this, "latitude", new Latitude(latDegrees))
    objects.defineConstant(this, "longitude", new Longitude(lonDegrees))
}

Coordinates.prototype.toString = function () {
    return "(" + this.latitude + ", " + this.longitude + ")"
}

Coordinates.prototype.equals = function (object) {
    var that = this

    var hasEqualComponents = function () {
        return that.latitude.equals(object.latitude) &&
            that.longitude.equals(object.longitude)
    }

    var isAtSamePole = function () {
        var northPole = new Angle(90)
        var southPole = new Angle(-90)
        return (that.latitude.equals(northPole) &&
                object.latitude.equals(northPole)) ||
            (that.latitude.equals(southPole) &&
             object.latitude.equals(southPole))
    }

    try {
        return isAtSamePole() || hasEqualComponents()
    } catch (objectNotCoordinates) {
        return false
    }
}

exports.Angle = Angle
exports.Latitude = Latitude
exports.Longitude = Longitude
exports.Coordinates = Coordinates
