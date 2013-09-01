// TODO: factory method can take fractional degrees if minutes and seconds are undefined
// TODO: fractional minutes if degrees are 0 and seconds are undefined
// TODO: fractional seconds if degrees and minutes are 0
// TODO: what if minutes > 60 and seconds > 60? convert or fail?

describe("Angle", function () {
    beforeEach(function () {
        this.addMatchers({

            toEqualAngle: function (expected) {
                var actual = this.actual;
                var notText = this.isNot ? "false" : "true";

                this.message = function () {
                    return "Expected " + actual + ".equals(" + expected + ") to be " + notText;
                }

                return actual.equals(expected);
            }

        });
    });

    describe("exceptional arguments", function() {
        it("should throw error if lesser component is negative", function () {
            var negationError = { name: 'ArgumentError',
                                  message: 'only the most significant component ' +
                                  'of an angle may be negative'
                                };

            expect(function () { angle(1, -1, 0); }).toThrow(negationError);
            expect(function () { angle(1, 0, -1); }).toThrow(negationError);
            expect(function () { angle(0, 1, -1); }).toThrow(negationError);
        });
    });

    describe("toDegreesMinutesSeconds()", function () {
        it("should be immutable", function () {
            var fixedAngle = angle(1, 2, 3);
            fixedAngle.toDegreesMinutesSeconds().degrees = 10;
            expect(fixedAngle.toDegreesMinutesSeconds().degrees).toEqual(1);
        });

        it("should return 0 for undefined minutes and seconds", function () {
            var dmsForm = angle(1).toDegreesMinutesSeconds();
            expect(dmsForm.minutes).toEqual(0);
            expect(dmsForm.seconds).toEqual(0);
        });

        it("should negate the most significant component if necessary", function () {
            var dmsForm = angle(-1, 0, 1).toDegreesMinutesSeconds();
            expect(dmsForm.degrees).toEqual(-1);
            expect(dmsForm.seconds).toEqual(1);
        });
    });

    describe("equals()", function () {
        var testAngle;

        beforeEach(function () {
            testAngle = angle(1, 2, 3);
        });

        it("should compare degrees, minutes, and seconds of two angles", function () {
            expect(testAngle).toEqualAngle(angle(1, 2, 3));
            expect(testAngle).not.toEqualAngle(angle(0, 2, 3));
            expect(testAngle).not.toEqualAngle(angle(1, 1, 3));
            expect(testAngle).not.toEqualAngle(angle(1, 2, 2));
        });

        it("should not be equal to undefined", function () {
            expect(testAngle).not.toEqualAngle(undefined);
        });

        it("should not be equal to non-Angle objects", function () {
            emptyObject = {};
            emptyDmsObject = { toDegreesMinutesSeconds: function () {} };
            expect(testAngle).not.toEqualAngle(emptyObject);
            expect(testAngle).not.toEqualAngle(emptyDmsObject);
        });

        it("should not be equal to null", function () {
            expect(testAngle).not.toEqualAngle(null);
        });
    });

    describe("toDecimalDegrees()", function () {
        it("should return decimal representation", function () {
            expect(angle(1, 0, 0).toDecimalDegrees()).toEqual(1);
            expect(angle(1, 30, 0).toDecimalDegrees()).toEqual(1.5);
            expect(angle(1, 0, 1).toDecimalDegrees()).toEqual(3601/3600);

            expect(angle(-1, 30, 0).toDecimalDegrees()).toEqual(-1.5);
            expect(angle(-1, 0, 1).toDecimalDegrees()).toEqual(-3601/3600);

            expect(angle(0, 30, 1).toDecimalDegrees()).toEqual(1801/3600);
            expect(angle(0, -30, 1).toDecimalDegrees()).toEqual(-1801/3600);
            expect(angle(0, 0, -1).toDecimalDegrees()).toEqual(-1/3600);
        });
    });

    describe("negative()", function () {
        it("should return a negative angle if original angle positive", function () {
            var negDegrees = angle(1, 1, 1).negative();
            expect(angle(-1, 1, 1)).toEqualAngle(negDegrees);

            var negMinutes = angle(0, 1, 1).negative();
            expect(angle(0, -1, 1)).toEqualAngle(negMinutes);

            var negSeconds = angle(0, 0, 1).negative();
            expect(angle(0, 0, -1)).toEqualAngle(negSeconds);
        });

        it("should return a positive angle if original angle negative", function () {
            var negDegrees = angle(-1, 1, 1).negative();
            expect(angle(1, 1, 1)).toEqualAngle(negDegrees);

            var negMinutes = angle(0, -1, 1).negative();
            expect(angle(0, 1, 1)).toEqualAngle(negMinutes);

            var negSeconds = angle(0, 0, -1).negative();
            expect(angle(0, 0, 1)).toEqualAngle(negSeconds);
        });
    });

    describe("toString()", function () {
        it("should string of toDegreesMinutesSeconds()", function () {
            var testAngle = angle(1, 2, 3);
            var expectedString = '{ degrees: 1, minutes: 2, seconds: 3 }';
            expect(testAngle.toString()).toEqual(expectedString);
        });
    });
});
