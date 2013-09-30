;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global exports, require */

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
    var renderer, proj, coords, points;
    renderer = exports.createRenderer(canvas.getContext("2d"));
    proj = exports.projection(canvas.width, canvas.height);
    coords = maps.healpix.basePixelVertices();
    points = coords.map(proj);
    renderer.drawMarkers(points);
};

},{"./maps.js":3}],2:[function(require,module,exports){
/*global window, document, require */

window.onload = function () {
    "use strict";
    var cartographer = require("./cartographer.js");
    var canvasElement = document.getElementById("canvas");
    if (canvasElement) {
        cartographer.draw(canvasElement);
    }
};

},{"./cartographer.js":1}],3:[function(require,module,exports){
/* global exports*/

"use strict";

var limitedAngle,
    minutesPerDegree = 60,
    secondsPerMinute = 60;

exports.angleFromDegrees = function (degrees) {
    var totalSeconds = degrees * minutesPerDegree * secondsPerMinute;
    return exports.angleFromSeconds(totalSeconds);
};

exports.angleFromDMS = function (degrees, minutes, seconds) {
    var argumentError,
    overflowCondition, // true if minutes or seconds >= 60
    signCondition, // true if multiple negative arguments
    sign,
    absDegrees,
    absMinutes,
    absSeconds,
    totalSeconds;

    argumentError = function (message) {
        return { name: "ArgumentError", message: message };
    };

    signCondition = function () {
        if (degrees !== 0) {
            return minutes < 0 || seconds < 0;
        }
        if (minutes !== 0) {
            return seconds < 0;
        }
        return false;
    };

    overflowCondition = function () {
        return minutes >= minutesPerDegree ||
            seconds >= secondsPerMinute;
    };

    if (signCondition()) {
        throw argumentError("only the most significant component " +
                            "of an angle may be negative");
    }

    if (overflowCondition()) {
        throw argumentError("minutes and seconds must be less than 60");
    }

    sign = (degrees < 0 || minutes < 0 || seconds < 0) ? -1 : 1;
    absDegrees = Math.abs(degrees);
    absMinutes = Math.abs(minutes) || 0;
    absSeconds = Math.abs(seconds) || 0;
    totalSeconds = sign *
        (absDegrees * minutesPerDegree * secondsPerMinute +
         absMinutes * secondsPerMinute +
         absSeconds);

    return exports.angleFromSeconds(totalSeconds);
};

exports.angleFromSeconds = function (seconds) {
    var intSeconds = Math.round(seconds),
    that = {};

    that.toDegreesMinutesSeconds = function () {
        var integerDivide, minuteSplit, degreeSplit;

        integerDivide = function (dividend, divisor) {
            var result = {};
            result.remainder = dividend % divisor;
            result.quotient = (dividend - result.remainder) / divisor;
            if (result.quotient !== 0) {
                result.remainder = Math.abs(result.remainder);
            }
            return result;
        };

        minuteSplit = integerDivide(intSeconds, secondsPerMinute);
        degreeSplit = integerDivide(minuteSplit.quotient, minutesPerDegree);

        return {
            degrees: degreeSplit.quotient,
            minutes: degreeSplit.remainder,
            seconds: minuteSplit.remainder
        };
    };

    that.toDecimalDegrees = function () {
        return intSeconds / (secondsPerMinute * minutesPerDegree);
    };

    that.toSeconds = function () {
        return intSeconds;
    };

    that.negative = function () {
        return exports.angleFromSeconds(-intSeconds);
    };

    that.equals = function (object) {
        try {
            return intSeconds === object.toSeconds();
        } catch (objectNotAnAngle) {
            return false;
        }
    };

    that.toString = function () {
        var dmsForm = that.toDegreesMinutesSeconds();
        return "{ degrees: "  + dmsForm.degrees +
            ", minutes: " + dmsForm.minutes +
            ", seconds: " + dmsForm.seconds +
            " }";
    };

    return that;
};

limitedAngle = function (absLimit, name) {
    var message = (name || "angle") +
        " cannot exceed +/-" + absLimit + " degrees";

    return function (degrees, minutes, seconds) {
        var that =  exports.angleFromDMS(degrees, minutes, seconds);

        if (Math.abs(that.toDecimalDegrees()) > absLimit) {
            throw {
                name: "ArgumentError",
                message: message
            };
        }

        return that;
    };
};

exports.latitude = limitedAngle(90, "latitude");

exports.longitude = limitedAngle(180, "longitude");

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
        return latAngle.toDecimalDegrees();
    };

    that.longitude = function () {
        return lonAngle;
    };

    that.decLongitude = function () {
        return lonAngle.toDecimalDegrees();
    };

    that.equals = function (object) {
        var isAtSamePole, // true if latitudes are at north or south pole
        isCoordinates, // true if object is comparable to coordinates
        hasEqualComponents; // true if latitudes and longitudes are eq

        isCoordinates = function () {
            return object &&
                typeof object.latitude === "function" &&
                typeof object.longitude === "function";
        };

        hasEqualComponents = function () {
            return latAngle.equals(object.latitude()) &&
                lonAngle.equals(object.longitude());
        };

        isAtSamePole = function () {
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

},{}]},{},[2])
;