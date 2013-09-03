var angle = function (degrees, minutes, seconds) {
    var that = {};

    // Private fields
    var sign, absDegrees, absMinutes, absSeconds;

    // Private functions
    var initialize, signedDegrees, signedMinutes, signedSeconds;
    var validateArguments, allFulfill, isNonNegative, isInteger, isUndefined;
    var fromDegreesMinutesSeconds, fromDecimalDegrees;

    initialize = function () {
        validateArguments();

        if (isInteger(degrees)) {
            fromDegreesMinutesSeconds();
        } else {
            fromDecimalDegrees();
        }
    };


    that.toDegreesMinutesSeconds = function () {
        return { degrees: signedDegrees(),
                 minutes: signedMinutes(),
                 seconds: signedSeconds()
               };
    };

    that.toDecimalDegrees = function () {
        var absDecimalDegrees = absDegrees + absMinutes/60 + absSeconds/3600;
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

    validateArguments = function () {
        var hasValidSigns, minutesSecondsCondition;

        var throwArgumentError = function (message) {
            throw {
                name: 'ArgumentError',
                message: message
            };
        };

        if (degrees !== 0) {
            hasValidSigns = allFulfill(isNonNegative, minutes, seconds);
        } else if (minutes !== 0) {
            hasValidSigns = isNonNegative(seconds);
        } else {
            hasValidSigns = true;
        }
        
        if (!hasValidSigns) {
            throwArgumentError('only the most significant component ' +
                               'of an angle may be negative');
        }

        var minutesSecondsCondition = isInteger(degrees) ? isInteger : isUndefined;
        
        if (!allFulfill(minutesSecondsCondition, minutes, seconds)) {
            throwArgumentError('angle() received unexpected non-integer arguments');
        }
    }

    allFulfill = function (condition) {
        for (var i = 1; i < arguments.length; i++) {
            if (!condition.call(null, arguments[i])) return false;
        }
        return true;
    };

    isInteger = function (number) {
        return number === parseInt(number) || isUndefined(number);
    };

    isNonNegative = function (number) {
        return number >= 0 || isUndefined(number);
    };

    isUndefined = function (number) {
        return number === undefined;
    };

    fromDegreesMinutesSeconds = function () {
        sign = allFulfill(isNonNegative, degrees, minutes, seconds) ? 1 : -1;
        absDegrees = Math.abs(degrees);
        absMinutes = Math.abs(minutes) || 0;
        absSeconds = Math.abs(seconds) || 0;
    };

    fromDecimalDegrees = function () {
        sign = allFulfill(isNonNegative, degrees, minutes, seconds) ? 1 : -1;
        absDegrees = Math.abs(degrees);
        absMinutes = (absDegrees - parseInt(absDegrees)) * 60;
        absSeconds = (absMinutes - parseInt(absMinutes)) * 60;

        absDegrees = parseInt(absDegrees);
        absMinutes = parseInt(absMinutes);
        absSeconds = Math.round(absSeconds);
    };

    initialize();
    return that;
};
