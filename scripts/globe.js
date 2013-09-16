var cartographer, // Namespace for drawing- & projection-related functions
    maps; // Namespace for coordinate-related functions

maps = (function () {
    "use strict";

    var angle,
        argumentValidator,
        coordinates,
        healpix,
        latitude, // returns angle bounded at +/-90 deg
        limitedAngle, // returns angle bounded by given value
        longitude; // returns angle bounded at +/- 180 deg


    argumentValidator = function () {
        var addError, // adds new error condition to validations list
            argumentError, // returns error object
            checkErrorCondition, // throws error if given condition fails
            validate, // maps checkErrorCondition onto validations
            validations; // stores error conditions and messages

        validations = [];

        argumentError = function (message) {
            return { name: 'ArgumentError', message: message };
        };

        checkErrorCondition = function (error) {
            if (error.condition.call()) {
                throw argumentError(error.message);
            }
        };

        addError = function (message, condition) {
            validations.push({ message: message, condition: condition });
        };

        validate = function () {
            validations.map(checkErrorCondition);
        };

        return { addError: addError, validate: validate };
    };

    angle = function (degrees, minutes, seconds) {
        var absDegrees, // absolute value of degrees
            absMinutes, // absolute value of minutes
            absSeconds, // absolute value of seconds
            minutesPerDegree = 60,
            secondsPerMinute = 60,
            sign, // sign of angle (+1 or -1)
            that, // return value; contains public methods

            // Functions
            errorConditions, // constructs an argumentValidator
            fromDegreesMinutesSeconds, // constructor helper
            fromDecimalDegrees, // constructor helper
            getSign,
            initialize, // constructor
            isInteger,
            isUndefined,
            signedDegrees, // applies sign to absDegrees
            signedMinutes, // applies sign to absMinutes
            signedSeconds; // applies sign to absSeconds

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
            return angle(signedDegrees(-1),
                         signedMinutes(-1),
                         signedSeconds(-1));
        };

        that.equals = function (object) {
            var isAnAngle, // true if object is comparable to angle
                isEqualMagnitude; // true if DMS values are equal

            isAnAngle = function () {
                return object &&
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
            var argumentNumberCondition, // true if too many arguments passed
                fractionCondition, // true if multiple non-integer arguments
                overflowCondition, // true if minutes or seconds > 60
                signCondition, // true if multiple negative arguments
                validator; // return value

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
                return minutes >= minutesPerDegree ||
                    seconds >= secondsPerMinute;
            };

            validator.addError('only the most significant component ' +
                               'of an angle may be negative',
                               signCondition);

            validator.addError('minutes and seconds must be integers',
                               fractionCondition);

            validator.addError('minutes and seconds cannot be passed ' +
                               'with non-integer degrees',
                               argumentNumberCondition);

            validator.addError('minutes and seconds must be less than 60',
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
            var fractionalPart = function (number) {
                return number - parseInt(number, 10);
            };

            sign = getSign();
            absDegrees = Math.abs(degrees);
            absMinutes = fractionalPart(absDegrees) * minutesPerDegree;
            absSeconds = fractionalPart(absMinutes) * secondsPerMinute;

            absDegrees = parseInt(absDegrees, 10);
            absMinutes = parseInt(absMinutes, 10);
            absSeconds = Math.round(absSeconds);
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
                return (latAngle.equals(angle(polarLat)) &&
                        object.latitude().equals(angle(polarLat))) ||
                    (latAngle.equals(angle(-polarLat)) &&
                     object.latitude().equals(angle(-polarLat)));
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
        angle: angle,
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
