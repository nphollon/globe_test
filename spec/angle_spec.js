describe("Angle", function () {
    beforeEach(function () {
        this.addMatchers({

            toEqualAngle: function (expected) {
                var actual = this.actual;
                var notText = this.isNot ? "false" : "true";

                this.message = function () {
                    return "Expected " + actual + ".equals("
                        + expected + ") to be " + notText;
                }

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
                expect(function () { angle(degrees, minutes, seconds); }).toThrow(error);
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

        it("should error if minutes or seconds are not less than sixty", function () {
            var verifyArgumentsThrowError = getErrorTester(
                'minutes and seconds must be less than 60'
            );
            verifyArgumentsThrowError(0, 60);
            verifyArgumentsThrowError(0, 0, 60);
        });

        it("should error if minutes/seconds are fractional", function () {
            var verifyArgumentsThrowError = getErrorTester(
                'minutes and seconds must be integers'
            );
            verifyArgumentsThrowError(0, 1.1);
            verifyArgumentsThrowError(0, 0, 1.1);
        });

        it("should error if minutes/seconds included with decimal degrees", function () {
            var verifyArgumentsThrowError = getErrorTester(
                'minutes and seconds cannot be passed with non-integer degrees'
            );
            verifyArgumentsThrowError(1.1, 0);
            verifyArgumentsThrowError(1.1, undefined, 0);
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

        it("should convert decimal degree argument to minutes and seconds", function () {
            var dmsForm = angle(1.5).toDegreesMinutesSeconds();
            expect(dmsForm.degrees).toEqual(1);
            expect(dmsForm.minutes).toEqual(30);
        });

        it("should round seconds seconds", function() {
            var dmsForm = angle(1e-3).toDegreesMinutesSeconds();
            expect(dmsForm.seconds).toEqual(4);
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
