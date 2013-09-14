var healpix = {};

healpix.basePixelVertices = function () {
    var vertices = [];
    var initLongitudes = [180, -135, -90, -135, 180];
    var i, lon, lat;

    for (i = 0; i < initLongitudes.length; i++) {
        lat = 90 - i * 45;
        for (lon = initLongitudes[i]; lon <= 180; lon += 90) {
            vertices.push(coordinates(lat, lon));
        }
    }
    return vertices;
};
