var healpix = require("../scripts/healpix.js");
var Coordinates = require("../scripts/maps.js").Coordinates;

describe("Healpix", function () {
    "use strict";

    describe("basePixelVertices()", function () {
        it("should return list of 12 points", function () {
            var expectedCoords, actualCoords, i

            expectedCoords = [
                new Coordinates(90, 0),
                new Coordinates(45, -135),
                new Coordinates(45, -45),
                new Coordinates(45, 45),
                new Coordinates(45, 135),
                new Coordinates(0, -90),
                new Coordinates(0, 0),
                new Coordinates(0, 90),
                new Coordinates(0, 180),
                new Coordinates(-45, -135),
                new Coordinates(-45, -45),
                new Coordinates(-45, 45),
                new Coordinates(-45, 135),
                new Coordinates(-90, 0)
            ]

            actualCoords = healpix.basePixelVertices()

            for (i = 0; i < expectedCoords.length; i += 1) {
                expect(expectedCoords[i]).toEqualObject(actualCoords[i])
            }
        })
    })
})
