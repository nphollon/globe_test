var maps = require("../scripts/maps.js");

describe("Maps", function () {
    "use strict";

    var angleFromDegrees, angleFromDMS, angleFromSeconds,
        latitude, longitude, coordinates, healpix;

    angleFromDegrees = maps.angleFromDegrees;
    angleFromSeconds = maps.angleFromSeconds;
    latitude = maps.latitude;
    longitude = maps.longitude;
    coordinates = maps.coordinates;
    healpix = maps.healpix;

    describe("Angle", function () {
        beforeEach(function () {
            this.addMatchers({

                toEqualAngle: function (expected) {
                    var actual = this.actual,
                        notText = this.isNot ? "false" : "true";

                    this.message = function () {
                        return "Expected " + actual + ".equals("
                            + expected + ") to be " + notText;
                    };

                    return actual.equals(expected);
                }
            });
        });

        describe("equals()", function () {
            var testAngle;

            beforeEach(function () {
                testAngle = angleFromSeconds(3600);
            });

            it("should compare two angles", function () {
                expect(testAngle).toEqualAngle(angleFromSeconds(3600));
                expect(testAngle).toEqualAngle(angleFromDegrees(1));
                expect(testAngle).not.toEqualAngle(angleFromSeconds(0));
            });

            it("should not be equal to undefined", function () {
                expect(testAngle).not.toEqualAngle(undefined);
            });

            it("should not be equal to non-Angle objects", function () {
                var emptyObject, emptyDmsObject;
                emptyObject = {};
                expect(testAngle).not.toEqualAngle(emptyObject);
            });

            it("should not be equal to null", function () {
                expect(testAngle).not.toEqualAngle(null);
            });
        });

        describe("degrees", function () {
            it("should return angle in degrees", function () {
                expect(angleFromSeconds(3600).degrees).toEqual(1);
                expect(angleFromDegrees(1).degrees).toEqual(1);
            });

            it("should be immutable", function () {
                expect(function () {
                    angleFromDegrees(1).degrees = 10;
                }).toThrow();
            });
        });

        describe("seconds", function () {
            it("should return angle in seconds", function () {
                expect(angleFromSeconds(1).seconds).toEqual(1);
                expect(angleFromDegrees(1).seconds).toEqual(3600);
            });

            it("should be immutable", function () {
                expect(function () {
                    angleFromDegrees(1).seconds = 1;
                }).toThrow();
            });
        });

        describe("negative()", function () {
            it("should return the negatiion of the angle", function () {
                var angle = angleFromSeconds(1);
                var negAngle = angleFromSeconds(-1);
                expect(angle.negative()).toEqualAngle(negAngle);
                expect(negAngle.negative()).toEqualAngle(angle);
            });
        });

        describe("toString()", function () {
            it("should return the angle in seconds", function () {
                var testAngle = angleFromSeconds(100);
                expect(testAngle.toString()).toEqual('100 seconds');
            });
        });
    });

    describe("Latitude", function () {
        it("should be an angle", function () {
            var latitudeObject = latitude(1),
                angleObject = angleFromDegrees(1);

            expect(angleObject.equals(latitudeObject)).toBeTruthy();
        });

        it("should be bounded at +/-90 degrees", function () {
            var error = { message: 'latitude cannot exceed +/-90 degrees' };
            expect(function () { latitude(90.1); }).toThrow(error);
            expect(function () { latitude(-90.1); }).toThrow(error);
        });
    });

    describe("Longitude", function () {
        it("should be an angle", function () {
            var longitudeObject = longitude(1),
                angleObject = angleFromDegrees(1);

            expect(angleObject.equals(longitudeObject)).toBeTruthy();
        });

        it("should be bounded at +/-180 degrees", function () {
            var error = { message: 'longitude cannot exceed +/-180 degrees' };
            expect(function () { longitude(180.1); }).toThrow(error);
            expect(function () { longitude(-180.1); }).toThrow(error);
        });

        xit("should be equal to longitudes off by 360 deg", function () {
            var farEast = longitude(180);
            var farWest = longitude(-180);
            expect(farEast.equals(farWest)).toBeTruthy();
        });


    });

    describe("Coordinates", function () {
        it("should have a latitude and longitude", function () {
            var coord = coordinates(1.5, 2.7);
            expect(angleFromDegrees(1.5).equals(coord.latitude())).toBeTruthy();
            expect(angleFromDegrees(2.7).equals(coord.longitude())).toBeTruthy();
        });

        describe("equals()", function () {
            var coord;

            beforeEach(function () {
                coord = coordinates(0, 0);
            });

            it("should be equal to another coordinates with equal lat & long", function () {
                expect(coord.equals(coordinates(0, 0))).toBeTruthy();
            });

            it("should be unequal to coordinates with different lat | long", function () {
                expect(coord.equals(coordinates(1, 0))).toBeFalsy();
                expect(coord.equals(coordinates(0, 1))).toBeFalsy();
            });

            it("should be equal if both coordinates are at the same pole", function () {
                var northPole = coordinates(90, 0),
                    southPole = coordinates(-90, 0);
                expect(northPole.equals(coordinates(90, 100))).toBeTruthy();
                expect(southPole.equals(coordinates(-90, 100))).toBeTruthy();
            });

            it("should be unequal to things that aren't coordinates", function () {
                expect(coord.equals(null)).toBeFalsy();
                expect(coord.equals(undefined)).toBeFalsy();
                expect(coord.equals(angleFromDegrees(0))).toBeFalsy();
            });
        });
    });

    describe("Healpix", function () {
        describe("basePixelVertices()", function () {
            it("should return list of 12 points", function () {
                var expectedCoords, actualCoords, i;

                expectedCoords = [
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
                    coordinates(-90, 0)
                ];

                actualCoords = healpix.basePixelVertices();

                for (i = 0; i < expectedCoords.length; i += 1) {
                    expect(expectedCoords[i].equals(actualCoords[i])).toBeTruthy();
                }
            });
        });
    });
});
