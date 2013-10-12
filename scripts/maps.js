/* global exports */

"use strict";

var limitedAngle,
    secondsPerDegree = 3600;

exports.angleFromDegrees = function (degrees) {
    var totalSeconds = degrees * secondsPerDegree;
    return exports.angleFromSeconds(totalSeconds);
};

exports.angleFromSeconds = function (seconds) {
    var intSeconds = Math.round(seconds),
    that = {};

    that.asDegrees = function () {
        return intSeconds / secondsPerDegree;
    };

    that.asSeconds = function () {
        return intSeconds;
    };

    that.negative = function () {
        return exports.angleFromSeconds(-intSeconds);
    };

    that.equals = function (object) {
        try {
            return intSeconds === object.asSeconds();
        } catch (objectNotAnAngle) {
            return false;
        }
    };

    that.toString = function () {
        return intSeconds + " seconds";
    };

    return that;
};

limitedAngle = function (absLimit, name) {
    var message = (name || "angle") +
        " cannot exceed +/-" + absLimit + " degrees";

    return function (degrees) {
        var that =  exports.angleFromDegrees(degrees);

        if (Math.abs(that.asDegrees()) > absLimit) {
            throw {
                name: "ArgumentError",
                message: message
            };
        }

        return that;
    };
};

exports.latitude = limitedAngle(90, "latitude");

exports.longitude = function (degrees, minutes, seconds) {
    var that = limitedAngle(180, "longitude")(degrees, minutes, seconds);
    var superEquals = that.equals;

    that.equals = function (object) {
        return superEquals(object) ||
            this.asSeconds() === object.asSeconds() + 360*60*60;
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
        var isCoordinates = function () {
            return object &&
                typeof object.latitude === "function" &&
                typeof object.longitude === "function";
        };

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

        return isCoordinates() && (isAtSamePole() || hasEqualComponents());
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
