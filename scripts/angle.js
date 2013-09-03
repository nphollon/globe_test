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
