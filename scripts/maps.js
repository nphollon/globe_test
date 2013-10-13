/* global exports */

"use strict";

var limitedAngle,
    secondsPerDegree = 3600;

var Angle = function (seconds) {
    this.seconds = seconds;
};

Angle.prototype.asDegrees = function () {
    return this.seconds / secondsPerDegree;
};

Angle.prototype.asSeconds = function () {
    return this.seconds;
};

Angle.prototype.negative = function () {
    return exports.angleFromSeconds(-this.seconds);
};

Angle.prototype.equals = function (object) {
    try {
        return this.asSeconds() === object.asSeconds();
    } catch (objectNotAnAngle) {
        return false;
    }
};

Angle.prototype.toString = function () {
    return this.seconds + " seconds";
};

exports.angleFromDegrees = function (degrees) {
    return new Angle(degrees * secondsPerDegree);
};

exports.angleFromSeconds = function (seconds) {
    return new Angle(seconds);
};

limitedAngle = function (absLimit, name) {
    var message = (name || "angle") +
        " cannot exceed +/-" + absLimit + " degrees";

    return function (degrees) {
        if (Math.abs(degrees) > absLimit) {
            throw {
                name: "ArgumentError",
                message: message
            };
        }

        return exports.angleFromDegrees(degrees);
    };
};

exports.latitude = limitedAngle(90, "latitude");

exports.longitude = function (degrees) {
    var that = limitedAngle(180, "longitude")(degrees);

    that.equals = function (object) {
        return exports.angleFromDegrees(degrees).equals(object) ||
            exports.angleFromDegrees(degrees-360).equals(object);
    };
    return that;
};

exports.coordinates = function (latDecimal, lonDecimal) {
    var latAngle, // latitude angle object
    lonAngle, // longitude angle object
    that; // return value; contains public methods

    that = {};
    latAngle = exports.latitude(latDecimal);
    lonAngle = exports.longitude(lonDecimal);

    that.latitude = function () {
        return latAngle;
    };

    that.decLatitude = function () {
        return latAngle.asDegrees();
    };

    that.longitude = function () {
        return lonAngle;
    };

    that.decLongitude = function () {
        return lonAngle.asDegrees();
    };

    that.equals = function (object) {
        var hasEqualComponents = function () {
            return latAngle.equals(object.latitude()) &&
                lonAngle.equals(object.longitude());
        };

        var isAtSamePole = function () {
            var northPole = exports.angleFromDegrees(90);
            var southPole = northPole.negative();
            return (latAngle.equals(northPole) &&
                    object.latitude().equals(northPole)) ||
                (latAngle.equals(southPole) &&
                 object.latitude().equals(southPole));
        };

        try {
            return isAtSamePole() || hasEqualComponents();
        } catch (objectNotCoordinates) {
            return false;
        }
    };

    return that;
};

exports.healpix = {};

exports.healpix.basePixelVertices = function () {
    var i,
        initLongitudes, // list of starting longitudes for each vertexLat
        vertexLat, // iterates through vertex latitudes
        vertexLon, // iterates through vertex longitudes
        vertices; // return value

    vertices = [];
    initLongitudes = [180, -135, -90, -135, 180];

    for (i = 0; i < initLongitudes.length; i += 1) {
        vertexLat = 90 - i * 45;
        for (vertexLon = initLongitudes[i];
             vertexLon <= 180;
             vertexLon += 90) {
            vertices.push(exports.coordinates(vertexLat, vertexLon));
        }
    }
    return vertices;
};
