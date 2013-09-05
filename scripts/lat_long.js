var latitude = function (degrees, minutes, seconds) {
    var that =  angle(degrees, minutes, seconds);

    if (Math.abs(that.toDecimalDegrees()) > 90) {
        throw {
            name: 'ArgumentError',
            message: 'latitude cannot exceed +/-90 degrees'
        };
    }

    return that;
};

var longitude = function (degrees, minutes, seconds) {
    var that = angle(degrees, minutes, seconds);

    if (Math.abs(that.toDecimalDegrees()) > 180) {
        throw {
            name: 'ArgumentError',
            message: 'longitude cannot exceed +/-180 degrees'
        };
    }

    return that;
};

var coordinates = function (lat, lon) {
    return {
        latitude: latitude(lat),
        longitude: longitude(lon)
    };
};
