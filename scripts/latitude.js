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
