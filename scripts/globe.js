/*global window, document */

var cartographer, // Namespace for drawing- & projection-related functions
    maps; // Namespace for coordinate-related functions

maps = (function () {
    "use strict";

    var angleFromDegrees,
        angleFromDMS,
        angleFromSeconds,
        coordinates,
        healpix,
        latitude, // returns angle bounded at +/-90 deg
        limitedAngle, // returns angle bounded by given value
        longitude; // returns angle bounded at +/- 180 deg

    var minutesPerDegree = 60,
        secondsPerMinute = 60;

    angleFromDegrees = function (degrees) {
        return angleFromSeconds(Math.round(degrees * minutesPerDegree * secondsPerMinute));
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
        totalSeconds = sign * (absDegrees * minutesPerDegree * secondsPerMinute +
                           absMinutes * secondsPerMinute +
                           absSeconds);

        return angleFromSeconds(totalSeconds);
    };

    angleFromSeconds = function (seconds) {
        var that = {};

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

            minuteSplit = integerDivide(seconds, secondsPerMinute);
            degreeSplit = integerDivide(minuteSplit.quotient, minutesPerDegree);

            return {
                degrees: degreeSplit.quotient,
                minutes: degreeSplit.remainder,
                seconds: minuteSplit.remainder
            };
        };

        that.toDecimalDegrees = function () {
            return seconds / (secondsPerMinute * minutesPerDegree);
        };

        that.toSeconds = function () {
            return seconds;
        };

        that.negative = function () {
            return angleFromSeconds(-seconds);
        };

        that.equals = function (object) {
            try {
                return seconds === object.toSeconds();
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

cartographer = (function () {
    "use strict";

    var createRenderer,
        draw, // called by index.html
        point2d, // value object for x-y pairs
        projection; // transforms map coordinates to pixel coordinates

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

    point2d = function (x, y) {
        var that = {};

        that.x = function () { return x; };
        that.y = function () { return y; };

        that.plus = function (addend) {
            return point2d(x + addend.x(), y + addend.y());
        };

        that.toString = function () {
            return "(" + x + ", " + y + ")";
        };

        that.equals = function (object) {
            return object &&
                typeof object.x === 'function' &&
                typeof object.y === 'function' &&
                x === object.x() && y === object.y();
        };

        return that;
    };

    projection = function (canvasWidth, canvasHeight) {
        return function (mapCoords) {
            var canvasCenter,
                displacement,
                transformX,
                transformY;

            transformX = mapCoords.decLongitude() * canvasWidth / 360;
            transformY = -mapCoords.decLatitude() * canvasHeight / 180;
            displacement = point2d(transformX, transformY);

            canvasCenter = point2d(canvasWidth / 2, canvasHeight / 2);

            return canvasCenter.plus(displacement);
        };
    };

    draw = function (canvas) {
        var renderer, proj, coords, points;
        renderer = createRenderer(canvas.getContext('2d'));
        proj = projection(canvas.width, canvas.height);
        coords = maps.healpix.basePixelVertices();
        points = coords.map(proj);
        renderer.drawMarkers(points);
    };

    return {
        createRenderer: createRenderer,
        point2d: point2d,
        projection: projection,
        draw: draw
    };
}());

window.onload = function () {
    "use strict";
    var canvasElement = document.getElementById('canvas');
    if (canvasElement) {
        cartographer.draw(canvasElement);
    }
};
