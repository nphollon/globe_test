var angle = function (degrees, minutes, seconds) {
    var absDegrees, absMinutes, absSeconds;
    var sign, signedDegrees, signedMinutes, signedSeconds;

    var that = {};


    sign = (function () {
        var isNegative, hasMalformedSigns;
        
        hasMalformedSigns = (minutes < 0 && degrees !== 0) ||
            (seconds < 0 && (minutes !== 0 || degrees !== 0));
        
        if (hasMalformedSigns) {
            throw {
                name: 'ArgumentError',
                message: 'only the most significant component of an angle may be negative'
            };
        }
        
        isNegative = (degrees < 0) || (minutes < 0) || (seconds < 0);
        return isNegative ? -1 : 1
    })();

    absDegrees = Math.abs(degrees);
    absMinutes = Math.abs(minutes) || 0;
    absSeconds = Math.abs(seconds) || 0;

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

    signedSeconds = function(appliedSign) {
        appliedSign = appliedSign || 1;
        if (absDegrees === 0 && absMinutes === 0) {
            return appliedSign * sign * absSeconds;
        }
        return absSeconds;
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

    return that;
};
