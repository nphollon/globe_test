var maps = require("../scripts/maps.js");

describe("Maps", function () {
    "use strict";

    var angleFromDegrees, angleFromDMS, angleFromSeconds,
        latitude, longitude, coordinates, healpix;

    angleFromDegrees = maps.angleFromDegrees;
    angleFromDMS = maps.angleFromDMS;
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

        describe("exceptional arguments", function () {
            var getErrorTester = function (message) {
                var error = {
                    name: 'ArgumentError',
                    message: message
                };

                return function (degrees, minutes, seconds) {
                    expect(function () { angleFromDMS(degrees, minutes, seconds); }).toThrow(error);
                };
            };

            it("should error if lesser component is negative", function () {
                var verifyArgumentsThrowError = getErrorTester(
                    'only the most significant component of an angle may be negative'
                );
                verifyArgumentsThrowError(1, -1, 0);
                verifyArgumentsThrowError(1, 0, -1);
                verifyArgumentsThrowError(0, 1, -1);
            });

            it("should error if minutes or seconds are >= 60", function () {
                var verifyArgumentsThrowError = getErrorTester(
                    'minutes and seconds must be less than 60'
                );
                verifyArgumentsThrowError(0, 60);
                verifyArgumentsThrowError(0, 0, 60);
            });
        });

        describe("toDegreesMinutesSeconds()", function () {
            it("should be immutable", function () {
                var fixedAngle = angleFromDMS(1, 2, 3);
                fixedAngle.toDegreesMinutesSeconds().degrees = 10;
                expect(fixedAngle.toDegreesMinutesSeconds().degrees).toEqual(1);
            });

            it("should return 0 for undefined minutes and seconds", function () {
                var dmsForm = angleFromDegrees(1).toDegreesMinutesSeconds();
                expect(dmsForm.minutes).toEqual(0);
                expect(dmsForm.seconds).toEqual(0);
            });

            it("should negate the most significant component if necessary", function () {
                var dmsForm = angleFromDMS(-1, 0, 1).toDegreesMinutesSeconds();
                expect(dmsForm.degrees).toEqual(-1);
                expect(dmsForm.seconds).toEqual(1);
            });

            it("should convert decimal degree arg to minutes and seconds", function () {
                var dmsForm = angleFromDegrees(1.5).toDegreesMinutesSeconds();
                expect(dmsForm.degrees).toEqual(1);
                expect(dmsForm.minutes).toEqual(30);
            });

            it("should round seconds to nearest integer", function () {
                var dmsForm = angleFromDegrees(1e-3).toDegreesMinutesSeconds();
                expect(dmsForm.seconds).toEqual(4);
            });
        });

        describe("equals()", function () {
            var testAngle;

            beforeEach(function () {
                testAngle = angleFromDMS(1, 2, 3);
            });

            it("should compare degrees, minutes, and seconds of two angles", function () {
                expect(testAngle).toEqualAngle(angleFromDMS(1, 2, 3));
                expect(testAngle).not.toEqualAngle(angleFromDMS(0, 2, 3));
                expect(testAngle).not.toEqualAngle(angleFromDMS(1, 1, 3));
                expect(testAngle).not.toEqualAngle(angleFromDMS(1, 2, 2));
            });

            it("should not be equal to undefined", function () {
                expect(testAngle).not.toEqualAngle(undefined);
            });

            it("should not be equal to non-Angle objects", function () {
                var emptyObject, emptyDmsObject;
                emptyObject = {};
                emptyDmsObject = {
                    toDegreesMinutesSeconds: function () { return undefined; }
                };
                expect(testAngle).not.toEqualAngle(emptyObject);
                expect(testAngle).not.toEqualAngle(emptyDmsObject);
            });

            it("should not be equal to null", function () {
                expect(testAngle).not.toEqualAngle(null);
            });
        });

        describe("toDecimalDegrees()", function () {
            it("should return decimal representation", function () {
                expect(angleFromDMS(1, 0, 0).toDecimalDegrees()).toEqual(1);
                expect(angleFromDMS(1, 30, 0).toDecimalDegrees()).toEqual(1.5);
                expect(angleFromDMS(1, 0, 1).toDecimalDegrees()).toEqual(3601 / 3600);

                expect(angleFromDMS(-1, 30, 0).toDecimalDegrees()).toEqual(-1.5);
                expect(angleFromDMS(-1, 0, 1).toDecimalDegrees()).toEqual(-3601 / 3600);

                expect(angleFromDMS(0, 30, 1).toDecimalDegrees()).toEqual(1801 / 3600);
                expect(angleFromDMS(0, -30, 1).toDecimalDegrees()).toEqual(-1801 / 3600);
                expect(angleFromDMS(0, 0, -1).toDecimalDegrees()).toEqual(-1 / 3600);
            });
        });

        describe("toSeconds()", function () {
            it("should convert DMS into seconds", function () {
                expect(angleFromDMS(1, 1, 1).toSeconds()).toEqual(3661);
            });
        });

        describe("negative()", function () {
            it("should return a negative angle if original angle positive", function () {
                var negDegrees, negMinutes, negSeconds;

                negDegrees = angleFromDMS(1, 1, 1).negative();
                expect(angleFromDMS(-1, 1, 1)).toEqualAngle(negDegrees);

                negMinutes = angleFromDMS(0, 1, 1).negative();
                expect(angleFromDMS(0, -1, 1)).toEqualAngle(negMinutes);

                negSeconds = angleFromDMS(0, 0, 1).negative();
                expect(angleFromDMS(0, 0, -1)).toEqualAngle(negSeconds);
            });

            it("should return a positive angle if original angle negative", function () {
                var negDegrees, negMinutes, negSeconds;

                negDegrees = angleFromDMS(-1, 1, 1).negative();
                expect(angleFromDMS(1, 1, 1)).toEqualAngle(negDegrees);

                negMinutes = angleFromDMS(0, -1, 1).negative();
                expect(angleFromDMS(0, 1, 1)).toEqualAngle(negMinutes);

                negSeconds = angleFromDMS(0, 0, -1).negative();
                expect(angleFromDMS(0, 0, 1)).toEqualAngle(negSeconds);
            });
        });

        describe("toString()", function () {
            it("should string of toDegreesMinutesSeconds()", function () {
                var testAngle = angleFromDMS(1, 2, 3),
                    expectedString = '{ degrees: 1, minutes: 2, seconds: 3 }';
                expect(testAngle.toString()).toEqual(expectedString);
            });
        });
    });

    describe("Latitude", function () {
        it("should be an angle", function () {
            var latitudeObject = latitude(1, 2, 3),
                angleObject = angleFromDMS(1, 2, 3);

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
            var longitudeObject = longitude(1, 2, 3),
                angleObject = angleFromDMS(1, 2, 3);

            expect(angleObject.equals(longitudeObject)).toBeTruthy();
        });

        it("should be bounded at +/-180 degrees", function () {
            var error = { message: 'longitude cannot exceed +/-180 degrees' };
            expect(function () { longitude(180, 0, 1); }).toThrow(error);
            expect(function () { longitude(-180, 0, 1); }).toThrow(error);
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
