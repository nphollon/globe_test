var projection = function (canvasWidth, canvasHeight) {
    return function (mapCoords) {
        var x =  canvasWidth / 2 + mapCoords.decLongitude() * canvasWidth / 360;
        var y =  canvasHeight / 2 - mapCoords.decLatitude() * canvasHeight / 180;
        return point2d(x, y);
    };
};

var point2d = function (x, y) {
    var that = {};
    that.x = function () { return x; };
    that.y = function () { return y; };
    return that;
}
