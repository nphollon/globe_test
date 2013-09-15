/*jslint sloppy: true */

var argumentValidator, angle, limitedAngle, latitude, longitude, coordinates, createRenderer, draw, projection, point2d, healpix;

argumentValidator = function () {
    var that, validations,
        forEachProperty, checkErrorCondition, argumentError;

    that = {};
    validations = {};

    forEachProperty = function (object, callback) {
        var property;
        for (property in object) {
            if (object.hasOwnProperty(property)) {
                callback.call(null, object[property]);
            }
        }
    };

    checkErrorCondition = function (error) {
        if (error.condition.call()) {
            throw argumentError(error.message);
        }
    };

    argumentError = function (message) {
        return { name: 'ArgumentError', message: message };
    };

    that.addError = function (name, message, condition) {
        validations[name] = { message: message, condition: condition };
    };

    that.validate = function () {
        forEachProperty(validations, checkErrorCondition);
    };
    return that;
};

angle = function (degrees, minutes, seconds) {
    var that, sign, absDegrees, absMinutes, absSeconds, minutesPerDegree, secondsPerMinute,

    // Private functions
        initialize, signedDegrees, signedMinutes, signedSeconds,
        errorConditions, isInteger, isUndefined,
        fromDegreesMinutesSeconds, fromDecimalDegrees, getSign, fractionalPart;

    minutesPerDegree = 60;
    secondsPerMinute = 60;

    that = {};

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
            absMinutes / minutesPerDegree +
            absSeconds / secondsPerMinute / minutesPerDegree;
        return sign * absDecimalDegrees;
    };

    that.negative = function () {
        return angle(signedDegrees(-1), signedMinutes(-1), signedSeconds(-1));
    };

    that.equals = function (object) {
        var isAnAngle, isEqualMagnitude;

        isAnAngle = function () {
            return object !== undefined &&
                object !== null &&
                typeof object.toDegreesMinutesSeconds === 'function';
        };

        isEqualMagnitude = function () {
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
        var validator, signCondition, fractionCondition, argumentNumberCondition, overflowCondition;

        validator = argumentValidator();

        signCondition = function () {
            if (degrees !== 0) {
                return minutes < 0 || seconds < 0;
            }
            if (minutes !== 0) {
                return seconds < 0;
            }
            return false;
        };

        fractionCondition = function () {
            if (isInteger(degrees)) {
                return !isInteger(minutes) || !isInteger(seconds);
            }
            return false;
        };

        argumentNumberCondition = function () {
            if (isInteger(degrees)) {
                return false;
            }
            return !isUndefined(minutes) || !isUndefined(seconds);
        };

        overflowCondition = function () {
            return minutes >= minutesPerDegree || seconds >= secondsPerMinute;
        };

        validator.addError('invalid signs',
                           'only the most significant component of an angle may be negative',
                           signCondition);

        validator.addError('invalid fractions',
                           'minutes and seconds must be integers',
                           fractionCondition);

        validator.addError('too many arguments',
                           'minutes and seconds cannot be passed with non-integer degrees',
                           argumentNumberCondition);

        validator.addError('minutes/seconds overflow',
                           'minutes and seconds must be less than 60',
                           overflowCondition);

        return validator;
    };


    getSign = function () {
        return (degrees < 0 || minutes < 0 || seconds < 0) ? -1 : 1;
    };

    isInteger = function (number) {
        return number === parseInt(number, 10) || isUndefined(number);
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

        absDegrees = parseInt(absDegrees, 10);
        absMinutes = parseInt(absMinutes, 10);
        absSeconds = Math.round(absSeconds);
    };

    fractionalPart = function (number) {
        return number - parseInt(number, 10);
    };


    initialize();
    return that;
};

limitedAngle = function (absLimit, name) {
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

latitude = limitedAngle(90, 'latitude');

longitude = limitedAngle(180, 'longitude');

coordinates = function (latDecimal, lonDecimal) {
    var that, latAngle, lonAngle, polarLat;

    that = {};
    latAngle = latitude(latDecimal);
    lonAngle = longitude(lonDecimal);

    polarLat = 90;

    that.latitude = function () { return latAngle; };
    that.decLatitude = function () { return latAngle.toDecimalDegrees(); };
    that.longitude = function () { return lonAngle; };
    that.decLongitude = function () { return lonAngle.toDecimalDegrees(); };

    that.equals = function (object) {
        var isCoordinates, hasEqualComponents, isAtSamePole;

        isCoordinates = function () {
            return object !== null && object !== undefined &&
                typeof object.latitude === 'function' &&
                typeof object.longitude === 'function';
        };

        hasEqualComponents = function () {
            return latAngle.equals(object.latitude()) &&
                lonAngle.equals(object.longitude());
        };

        isAtSamePole = function () {
            return (latAngle.equals(angle(polarLat)) && object.latitude().equals(angle(polarLat))) ||
                (latAngle.equals(angle(-polarLat)) && object.latitude().equals(angle(-polarLat)));
        };

        return isCoordinates() && (isAtSamePole() || hasEqualComponents());
    };

    return that;
};

createRenderer = function (context) {
    var that = {};

    that.drawMarker = function (point) {
        context.fillRect(point.x() - 5, point.y() - 5, 10, 10);
    };

    that.drawMarkers = function (points) {
        points.map(this.drawMarker, this);
    };

    return that;
};

draw = function (canvas) {
    var renderer, proj, coords, points;
    renderer = createRenderer(canvas.getContext('2d'));
    proj = projection(canvas.width, canvas.height);
    coords = healpix.basePixelVertices();
    points = coords.map(proj);
    renderer.drawMarkers(points);
};

projection = function (canvasWidth, canvasHeight) {
    return function (mapCoords) {
        var x = canvasWidth / 2 + mapCoords.decLongitude() * canvasWidth / 360,
            y = canvasHeight / 2 - mapCoords.decLatitude() * canvasHeight / 180;
        return point2d(x, y);
    };
};

point2d = function (x, y) {
    var that = {};
    that.x = function () { return x; };
    that.y = function () { return y; };
    return that;
};

healpix = {};

healpix.basePixelVertices = function () {
    var vertices, initLongitudes, i, lon, lat;
    vertices = [];
    initLongitudes = [180, -135, -90, -135, 180];

    for (i = 0; i < initLongitudes.length; i += 1) {
        lat = 90 - i * 45;
        for (lon = initLongitudes[i]; lon <= 180; lon += 90) {
            vertices.push(coordinates(lat, lon));
        }
    }
    return vertices;
};
