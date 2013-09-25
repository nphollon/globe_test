/*jslint maxlen: 80 */

var maps = (function () {
    "use strict";

    var angleFromDegrees,
        angleFromDMS,
        angleFromSeconds,
        coordinates,
        healpix,
        latitude, // returns angle bounded at +/-90 deg
        limitedAngle, // returns angle bounded by given value
        longitude, // returns angle bounded at +/- 180 deg

        minutesPerDegree = 60,
        secondsPerMinute = 60,

        that = {};

    angleFromDegrees = function (degrees) {
        var totalSeconds = degrees * minutesPerDegree * secondsPerMinute;
        return angleFromSeconds(totalSeconds);
    };

    angleFromDMS = function (degrees, minutes, seconds) {
        var argumentError,
            overflowCondition, // true if minutes or seconds >= 60
            signCondition, // true if multiple negative arguments
            sign,
            absDegrees,
            absMinutes,
            absSeconds,
            totalSeconds;

        argumentError = function (message) {
            return { name: 'ArgumentError', message: message };
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
            throw argumentError('only the most significant component ' +
                                'of an angle may be negative');
        }

        if (overflowCondition()) {
            throw argumentError('minutes and seconds must be less than 60');
        }

        sign = (degrees < 0 || minutes < 0 || seconds < 0) ? -1 : 1;
        absDegrees = Math.abs(degrees);
        absMinutes = Math.abs(minutes) || 0;
        absSeconds = Math.abs(seconds) || 0;
        totalSeconds = sign *
            (absDegrees * minutesPerDegree * secondsPerMinute +
             absMinutes * secondsPerMinute +
             absSeconds);

        return angleFromSeconds(totalSeconds);
    };

    angleFromSeconds = function (seconds) {
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
            return angleFromSeconds(-intSeconds);
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
            return '{ degrees: '  + dmsForm.degrees +
                ', minutes: ' + dmsForm.minutes +
                ', seconds: ' + dmsForm.seconds +
                ' }';
        };

        return that;
    };

    limitedAngle = function (absLimit, name) {
        var message = (name || 'angle') +
            ' cannot exceed +/-' + absLimit + ' degrees';

        return function (degrees, minutes, seconds) {
            var that =  angleFromDMS(degrees, minutes, seconds);

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
        var latAngle, // latitude angle object
            lonAngle, // longitude angle object
            polarLat = 90, // latitude of pole
            that; // return value; contains public methods

        that = {};
        latAngle = latitude(latDecimal);
        lonAngle = longitude(lonDecimal);

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
                    typeof object.latitude === 'function' &&
                    typeof object.longitude === 'function';
            };

            hasEqualComponents = function () {
                return latAngle.equals(object.latitude()) &&
                    lonAngle.equals(object.longitude());
            };

            isAtSamePole = function () {
                return (latAngle.equals(angleFromDegrees(polarLat)) &&
                        object.latitude().equals(angleFromDegrees(polarLat))) ||
                    (latAngle.equals(angleFromDegrees(-polarLat)) &&
                     object.latitude().equals(angleFromDegrees(-polarLat)));
            };

            return isCoordinates() && (isAtSamePole() || hasEqualComponents());
        };

        return that;
    };

    healpix = {};

    healpix.basePixelVertices = function () {
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
                vertices.push(coordinates(vertexLat, vertexLon));
            }
        }
        return vertices;
    };

    return {
        angleFromDegrees: angleFromDegrees,
        angleFromDMS: angleFromDMS,
        angleFromSeconds: angleFromSeconds,
        latitude: latitude,
        longitude: longitude,
        coordinates: coordinates,
        healpix: healpix
    };
}());
