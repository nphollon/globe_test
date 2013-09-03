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
