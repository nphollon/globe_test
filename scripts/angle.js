var angle = function (degrees, minutes, seconds) {
    var that = {};

    var absDegrees, absMinutes, absSeconds, signedDegrees, signedMinutes, signedSeconds;

    var sign, isNegative, isAnAngle, isEqualMagnitude, hasMalformedSigns;

    hasMalformedSigns = (minutes < 0 && degrees !== 0) ||
        (seconds < 0 && (minutes !== 0 || degrees !== 0));

    if (hasMalformedSigns) {
        throw {
            name: 'ArgumentError',
            message: 'only the most significant component of an angle may be negative'
        };
    }

    isNegative = (degrees < 0) || (minutes < 0) || (seconds < 0);
    sign = isNegative ? -1 : 1;

    absDegrees = Math.abs(degrees);
    absMinutes = Math.abs(minutes) || 0;
    absSeconds = Math.abs(seconds) || 0;

    signedDegrees = sign * absDegrees;
    signedMinutes = (absDegrees === 0) ? sign * absMinutes : absMinutes;
    signedSeconds = (absMinutes === 0) ? sign * absSeconds : absSeconds;

    isAnAngle = function (object) {
        return object !== undefined &&
            object !== null &&
            typeof object.toDegreesMinutesSeconds === 'function';
    }

    isEqualMagnitude = function (otherAngle) {
        var otherDMS = otherAngle.toDegreesMinutesSeconds();
        return typeof otherDMS === 'object' &&
            signedDegrees === otherDMS.degrees &&
            signedMinutes === otherDMS.minutes &&
            signedSeconds === otherDMS.seconds;
    };


    that.toDegreesMinutesSeconds = function () {
        return { degrees: signedDegrees, minutes: signedMinutes, seconds: signedSeconds };
    };

    that.toDecimalDegrees = function () {
        var absDecimalDegrees = absDegrees + absMinutes/60 + absSeconds/3600;
        return sign * absDecimalDegrees;
    };

    that.negative = function () {
        if (absDegrees !== 0) return angle(-absDegrees, absMinutes, absSeconds);
        if (absMinutes !== 0) return angle(0, -absMinutes, absSeconds);
        return angle(0, 0, -absSeconds);
    };

    that.equals = function (object) {
        return isAnAngle(object) && isEqualMagnitude(object);
    };

    that.toString = function () {
        var dmsForm = that.toDegreesMinutesSeconds();
        return '{ degrees: '  + dmsForm.degrees +
            ', minutes: ' + dmsForm.minutes +
            ', seconds: ' + dmsForm.seconds +
            ' }';
    }

    return that;
};
