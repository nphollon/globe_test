describe("Latitude", function () {
    it("should be an angle", function () {
        var latitudeObject = latitude(1, 2, 3);
        var angleObject = angle(1, 2, 3);

        expect(angleObject.equals(latitudeObject)).toBeTruthy();
    });

    it("should be bounded at +/-90 degrees", function () {
        var error = { message: 'latitude cannot exceed +/-90 degrees' };
        expect(function () { latitude(90, 0, 1); }).toThrow(error);
        expect(function () { latitude(-90, 0, 1); }).toThrow(error);
    });
});

describe("Longitude", function () {
    it("should be an angle", function () {
        var longitudeObject = longitude(1, 2, 3);
        var angleObject = angle(1, 2, 3);

        expect(angleObject.equals(longitudeObject)).toBeTruthy();
    });

    it("should be bounded at +/-180 degrees", function () {
        var error = { message: 'longitude cannot exceed +/-180 degrees' };
        expect(function () { longitude(180, 0, 1); }).toThrow(error);
        expect(function () { longitude(-180, 0, 1); }).toThrow(error);
    });
});

describe("Coordinates", function() {
    it("should have a latitude and longitude", function () {
        var coord = coordinates(1.5, 2.7);
        expect(angle(1.5).equals(coord.latitude)).toBeTruthy();
        expect(angle(2.7).equals(coord.longitude)).toBeTruthy();
    });
});
