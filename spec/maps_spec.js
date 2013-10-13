var maps = require("../scripts/maps.js");

describe("Maps", function () {
    "use strict";

    var Angle = maps.Angle;
    var latitude = maps.latitude;
    var longitude = maps.longitude;
    var coordinates = maps.coordinates;
    var healpix = maps.healpix;

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
                testAngle = new Angle(1);
            });

            it("should compare two angles", function () {
                expect(testAngle).toEqualObject(Angle.fromSeconds(3600));
                expect(testAngle).toEqualObject(new Angle(1));
                expect(testAngle).not.toEqualObject(new Angle(0));
            });

            it("should not be equal to undefined", function () {
                expect(testAngle).not.toEqualObject(undefined);
            });

            it("should not be equal to non-Angle objects", function () {
                var emptyObject, emptyDmsObject;
                emptyObject = {};
                expect(testAngle).not.toEqualObject(emptyObject);
            });

            it("should not be equal to null", function () {
                expect(testAngle).not.toEqualObject(null);
            });
        });

        describe("degrees", function () {
            it("should return angle in degrees", function () {
                expect(new Angle(1).degrees).toEqual(1);
                expect(Angle.fromSeconds(3600).degrees).toEqual(1);
            });

            it("should be immutable", function () {
                expect(function () {
                    new Angle(1).degrees = 10;
                }).toThrow();
            });
        });

        describe("seconds", function () {
            it("should return angle in seconds", function () {
                expect(Angle.fromSeconds(1).seconds).toEqual(1);
                expect(new Angle(1).seconds).toEqual(3600);
            });

            it("should be immutable", function () {
                expect(function () {
                    new Angle(1).seconds = 1;
                }).toThrow();
            });
        });

        describe("negative()", function () {
            it("should return the negatiion of the angle", function () {
                var angle = new Angle(1);
                var negAngle = new Angle(-1);
                expect(angle.negative()).toEqualObject(negAngle);
                expect(negAngle.negative()).toEqualObject(angle);
            });
        });

        describe("toString()", function () {
            it("should return the angle in seconds", function () {
                var testAngle = new Angle(1);
                expect(testAngle.toString()).toEqual('3600 seconds');
            });
        });
    });

    describe("Latitude", function () {
        it("should be an angle", function () {
            var latitudeObject = latitude(1),
                angleObject = new Angle(1);

            expect(angleObject).toEqualObject(latitudeObject);
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
                angleObject = new Angle(1);

            expect(angleObject).toEqualObject(longitudeObject);
        });

        it("should be bounded at +/-180 degrees", function () {
            var error = { message: 'longitude cannot exceed +/-180 degrees' };
            expect(function () { longitude(180.1); }).toThrow(error);
            expect(function () { longitude(-180.1); }).toThrow(error);
        });

        xit("should be equal to longitudes off by 360 deg", function () {
            var farEast = longitude(180);
            var farWest = longitude(-180);
            expect(farEast).toBeEqual(farWest);
        });


    });

    describe("Coordinates", function () {
        it("should have a latitude and longitude", function () {
            var coord = coordinates(1.5, 2.7);
            expect(new Angle(1.5)).toEqualObject(coord.latitude());
            expect(new Angle(2.7)).toEqualObject(coord.longitude());
        });

        describe("equals()", function () {
            var coord;

            beforeEach(function () {
                coord = coordinates(0, 0);
            });

            it("should equal another coordinates with same lat & long", function () {
                expect(coord).toEqualObject(coordinates(0, 0));
            });

            it("should be unequal to coordinates with different lat | long", function () {
                expect(coord).not.toEqualObject(coordinates(1, 0));
                expect(coord).not.toEqualObject(coordinates(0, 1));
            });

            it("should be equal if both coordinates are at the same pole", function () {
                var northPole = coordinates(90, 0),
                    southPole = coordinates(-90, 0);
                expect(northPole).toEqualObject(coordinates(90, 100));
                expect(southPole).toEqualObject(coordinates(-90, 100));
            });

            it("should be unequal to things that aren't coordinates", function () {
                expect(coord).not.toEqualObject(null);
                expect(coord).not.toEqualObject(undefined);
                expect(coord).not.toEqualObject(new Angle(0));
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
                    expect(expectedCoords[i]).toEqualObject(actualCoords[i]);
                }
            });
        });
    });
});
