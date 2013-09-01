// TODO: toDegreesMinutesSeconds() should work properly for negative angles
// TODO: negative() should work properly for negative angles
// TODO: inline angle1
// TODO: factory method can take fractional degrees if minutes and seconds are undefined
// TODO: fractional minutes if degrees are 0 and seconds are undefined
// TODO: fractional seconds if degrees and minutes are 0
// TODO: what if minutes > 60 and seconds > 60? convert or fail?

describe("Angle", function () {
    var angle1;

    beforeEach(function () {
        angle1 = angle(1, 2, 3);

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
            angle1.toDegreesMinutesSeconds().degrees = 10;
            expect(angle1.toDegreesMinutesSeconds().degrees).toEqual(1);
        });

        it("should return 0 for undefined minutes and seconds", function () {
            angle1 = angle(1);
            expect(angle1.toDegreesMinutesSeconds().minutes).toEqual(0);
            expect(angle1.toDegreesMinutesSeconds().seconds).toEqual(0);
        });

        it("should negate the most significant component if necessary", function () {
            dms = angle(-1, 0, 0).toDegreesMinutesSeconds();
            expect(dms.degrees).toEqual(-1);
        });
    });

    describe("equals()", function () {
        it("should compare degrees, minutes, and seconds of two angles", function () {
            expect(angle1).toEqualAngle(angle(1, 2, 3));
            expect(angle1).not.toEqualAngle(angle(0, 2, 3));
            expect(angle1).not.toEqualAngle(angle(1, 1, 3));
            expect(angle1).not.toEqualAngle(angle(1, 2, 2));
        });

        it("should not be equal to undefined", function () {
            expect(angle1).not.toEqualAngle(undefined);
        });

        it("should not be equal to non-Angle objects", function () {
            emptyObject = {};
            emptyDmsObject = { toDegreesMinutesSeconds: function () {} };
            expect(angle1).not.toEqualAngle(emptyObject);
            expect(angle1).not.toEqualAngle(emptyDmsObject);
        });

        it("should not be equal to null", function () {
            expect(angle1).not.toEqualAngle(null);
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
    });

    describe("toString()", function () {
        it("should string of toDegreesMinutesSeconds()", function () {
            var expectedString = '{ degrees: 1, minutes: 2, seconds: 3 }';
            expect(angle1.toString()).toEqual(expectedString);
        });
    });
});
