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
