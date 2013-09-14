describe("Healpix", function () {
    describe("basePixelVertices()", function () {
        it("should return list of 12 points", function () {
            var expectedCoords = [
                coordinates(90, 0),
                coordinates(45, -135),
                coordinates(45, -45),
                coordinates(45, 45),
                coordinates(45, 135),
                coordinates(0, -90),
                coordinates(0, 0),
                coordinates(0, 90),
                coordinates(0, 180),
                coordinates(-45, -135),
                coordinates(-45, -45),
                coordinates(-45, 45),
                coordinates(-45, 135),
                coordinates(-90, 0),
            ];
            var actualCoords = healpix.basePixelVertices();
            var i;
            for (i in expectedCoords) {
                expect(expectedCoords[i].equals(actualCoords[i])).toBeTruthy();
            }
        });
    });
});
