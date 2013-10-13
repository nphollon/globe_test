"use strict";

var objects = require("./objects.js");

var Angle = function (seconds) {
    objects.defineConstant(this, "seconds", seconds);
};

objects.defineConstant(Angle, "secondsPerDegree", 3600);

objects.defineAccessor(Angle.prototype, "degrees", function () {
    return this.seconds / Angle.secondsPerDegree;
});

Angle.prototype.negative = function () {
    return new Angle(-this.seconds);
};

Angle.prototype.equals = function (object) {
    try {
        return this.seconds === object.seconds;
    } catch (objectNotAnAngle) {
        return false;
    }
};

Angle.prototype.toString = function () {
    return this.seconds + " seconds";
};

exports.angleFromDegrees = function (degrees) {
    return new Angle(degrees * Angle.secondsPerDegree);
};

exports.angleFromSeconds = function (seconds) {
    return new Angle(seconds);
};

var limitedAngle = function (absLimit, name) {
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
        return latAngle.degrees;
    };

    that.longitude = function () {
        return lonAngle;
    };

    that.decLongitude = function () {
        return lonAngle.degrees;
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
