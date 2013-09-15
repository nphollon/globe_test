var argumentValidator = function () {
    var that = {};
    var validations = {};

    that.addError = function (name, message, condition) {
        validations[name] = { message: message, condition: condition };
    };

    that.validate = function () {
        forEachProperty(validations, checkErrorCondition);
    };

    var forEachProperty = function (object, callback) {
        var property;
        for (property in object) {
            if (object.hasOwnProperty(property)) {
                callback.call(null, object[property]);
            }
        }
    };

    var checkErrorCondition = function (error) {
        if (error.condition.call()) {
            throw argumentError(error.message);
        }        
    };

    var argumentError = function (message) {
        return { name: 'ArgumentError', message: message };
    };

    return that;
}

var angle = function (degrees, minutes, seconds) {
    var that = {};

    // Private fields
    var sign, absDegrees, absMinutes, absSeconds;

    // Private functions
    var initialize, signedDegrees, signedMinutes, signedSeconds;
    var errorConditions, allFulfill, isNonNegative, isInteger, isUndefined;
    var fromDegreesMinutesSeconds, fromDecimalDegrees, getSign, fractionalPart;

    var minutesPerDegree = 60;
    var secondsPerMinute = 60;

    initialize = function () {
        errorConditions().validate();

        if (isInteger(degrees)) {
            fromDegreesMinutesSeconds();
        } else {
            fromDecimalDegrees();
        }
    };


    that.toDegreesMinutesSeconds = function () {
        return { 
            degrees: signedDegrees(),
            minutes: signedMinutes(),
            seconds: signedSeconds()
        };
    };

    that.toDecimalDegrees = function () {
        var absDecimalDegrees = absDegrees +
            absMinutes/minutesPerDegree + absSeconds/secondsPerMinute/minutesPerDegree;
        return sign * absDecimalDegrees;
    };

    that.negative = function () {
        return angle(signedDegrees(-1), signedMinutes(-1), signedSeconds(-1));
    };

    that.equals = function (object) {
        var isAnAngle = function () {
            return object !== undefined &&
                object !== null &&
                typeof object.toDegreesMinutesSeconds === 'function';
        };

        var isEqualMagnitude = function () {
            var otherDMS = object.toDegreesMinutesSeconds();
            return typeof otherDMS === 'object' &&
                signedDegrees() === otherDMS.degrees &&
                signedMinutes() === otherDMS.minutes &&
                signedSeconds() === otherDMS.seconds;
        };
        
        return isAnAngle() && isEqualMagnitude();
    };

    that.toString = function () {
        var dmsForm = that.toDegreesMinutesSeconds();
        return '{ degrees: '  + dmsForm.degrees +
            ', minutes: ' + dmsForm.minutes +
            ', seconds: ' + dmsForm.seconds +
            ' }';
    };



    signedDegrees = function (appliedSign) {
        appliedSign = appliedSign || 1;
        return appliedSign * sign * absDegrees;
    };

    signedMinutes = function (appliedSign) {
        appliedSign = appliedSign || 1;
        if (absDegrees === 0) {
            return appliedSign * sign * absMinutes;
        }
        return absMinutes;
    };

    signedSeconds = function (appliedSign) {
        appliedSign = appliedSign || 1;
        if (absDegrees === 0 && absMinutes === 0) {
            return appliedSign * sign * absSeconds;
        }
        return absSeconds;
    };

    errorConditions = function () {
        var validator = argumentValidator();

        validator.addError('invalid signs',
                           'only the most significant component of an angle may be negative',
                           function () {
                               if (degrees !== 0) {
                                   return minutes < 0 || seconds < 0;
                               } else if (minutes !== 0) {
                                   return seconds < 0;
                               } else {
                                   return false;
                               }
                           });

        validator.addError('invalid fractions',
                           'minutes and seconds must be integers',
                           function () {
                               if (isInteger(degrees)) {
                                   return !isInteger(minutes) || !isInteger(seconds);
                               } else {
                                   return false;
                               }
                           });

        validator.addError('too many arguments',
                           'minutes and seconds cannot be passed with non-integer degrees',
                           function () {
                               if (isInteger(degrees)) {
                                   return false;
                               } else {
                                   return !isUndefined(minutes) || !isUndefined(seconds);
                               }
                           });

        validator.addError('minutes/seconds overflow',
                           'minutes and seconds must be less than 60',
                           function () {
                               return minutes >= minutesPerDegree || seconds >= secondsPerMinute;
                           });

        return validator;
    };


    getSign = function () {
        return (degrees < 0 || minutes < 0 || seconds < 0) ? -1 : 1;
    }

    isInteger = function (number) {
        return number === parseInt(number) || isUndefined(number);
    };

    isUndefined = function (number) {
        return number === undefined;
    };

    fromDegreesMinutesSeconds = function () {
        sign = getSign();
        absDegrees = Math.abs(degrees);
        absMinutes = Math.abs(minutes) || 0;
        absSeconds = Math.abs(seconds) || 0;
    };

    fromDecimalDegrees = function () {
        sign = getSign();
        absDegrees = Math.abs(degrees);
        absMinutes = fractionalPart(absDegrees) * minutesPerDegree;
        absSeconds = fractionalPart(absMinutes) * secondsPerMinute;

        absDegrees = parseInt(absDegrees);
        absMinutes = parseInt(absMinutes);
        absSeconds = Math.round(absSeconds);
    };

    fractionalPart = function (number) {
        return number - parseInt(number);
    };


    initialize();
    return that;
};

var limitedAngle = function (absLimit, name) {
    var message = (name || 'angle') +
        ' cannot exceed +/-' + absLimit + ' degrees';

    return function (degrees, minutes, seconds) {
        var that =  angle(degrees, minutes, seconds);

        if (Math.abs(that.toDecimalDegrees()) > absLimit) {
            throw {
                name: 'ArgumentError',
                message: message
            };
        }

        return that;
    };
};

var latitude = limitedAngle(90, 'latitude');

var longitude = limitedAngle(180, 'longitude');

var coordinates = function (latDecimal, lonDecimal) {
    var that = {};
    var latAngle = latitude(latDecimal);
    var lonAngle = longitude(lonDecimal);

    var polarLat = 90;

    that.latitude = function () { return latAngle; }
    that.decLatitude = function () { return latAngle.toDecimalDegrees(); }
    that.longitude = function () { return lonAngle; };
    that.decLongitude = function () { return lonAngle.toDecimalDegrees(); }

    that.equals = function (object) {
        var isCoordinates = function () {
            return object !== null && object !== undefined && 
                typeof object.latitude === 'function' &&
                typeof object.longitude === 'function';
        };

        var hasEqualComponents = function () {
            return latAngle.equals(object.latitude()) &&
                lonAngle.equals(object.longitude());
        };

        var isAtSamePole = function () {
            return latAngle.equals(angle(polarLat)) &&
                object.latitude().equals(angle(polarLat)) ||
                latAngle.equals(angle(-polarLat)) &&
                object.latitude().equals(angle(-polarLat));
        }

        return isCoordinates() && (isAtSamePole() || hasEqualComponents());
    };

    return that;
};

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

var projection = function (canvasWidth, canvasHeight) {
    return function (mapCoords) {
        var x =  canvasWidth / 2 + mapCoords.decLongitude() * canvasWidth / 360;
        var y =  canvasHeight / 2 - mapCoords.decLatitude() * canvasHeight / 180;
        return point2d(x, y);
    };
};

var point2d = function (x, y) {
    var that = {};
    that.x = function () { return x; };
    that.y = function () { return y; };
    return that;
}

var healpix = {};

healpix.basePixelVertices = function () {
    var vertices = [];
    var initLongitudes = [180, -135, -90, -135, 180];
    var i, lon, lat;

    for (i = 0; i < initLongitudes.length; i++) {
        lat = 90 - i * 45;
        for (lon = initLongitudes[i]; lon <= 180; lon += 90) {
            vertices.push(coordinates(lat, lon));
        }
    }
    return vertices;
};
