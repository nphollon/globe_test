var maps = require("../scripts/maps.js")

describe("Maps", function () {
    "use strict";

    var Angle = maps.Angle
    var Latitude = maps.Latitude
    var Longitude = maps.Longitude
    var Coordinates = maps.Coordinates
    var healpix = maps.healpix

    describe("Angle", function () {        
        var oneSecond = 1 / Angle.secondsPerDegree
        
        describe("degrees", function () {
            it("should return angle in degrees", function () {
                expect(new Angle(1).degrees).toEqual(1)
            })

            it("should be immutable", function () {
                expect(function () {
                    new Angle(1).degrees = 10
                }).toThrow()
            })

            it("should have arcsecond precision", function () {
                expect(new Angle(1.1 * oneSecond).degrees).toEqual(oneSecond)
            })
        })

        describe("fromSeconds", function () {
            it("should construct an angle for the given number of seconds", function () {
                expect(Angle.fromSeconds(3600)).toEqualObject(new Angle(1))
            })
        })

        describe("seconds", function () {
            it("should return angle in seconds", function () {
                expect(new Angle(1).seconds).toEqual(3600)
            })

            it("should be immutable", function () {
                expect(function () {
                    new Angle(1).seconds = 1
                }).toThrow()
            })

            it("should round to nearest second", function () {
                expect(new Angle(1.1 * oneSecond).seconds).toEqual(1)
            })

            it("should normalize angle to be within (-180, 180] degrees", function () {
                expect(new Angle(361).seconds).toEqual(Angle.secondsPerDegree)
                expect(new Angle(359).seconds).toEqual(-Angle.secondsPerDegree)
                expect(new Angle(-359).seconds).toEqual(Angle.secondsPerDegree)
                expect(new Angle(-180).seconds).toEqual(180 * Angle.secondsPerDegree)
            })
        })

        describe("negative()", function () {
            it("should return the negatiion of the angle", function () {
                var angle = new Angle(1)
                var negAngle = new Angle(-1)
                expect(angle.negative()).toEqualObject(negAngle)
                expect(negAngle.negative()).toEqualObject(angle)
            })
        })

        describe("equals()", function () {
            var testAngle

            beforeEach(function () {
                testAngle = new Angle(1)
            })

            it("should compare two angles", function () {
                expect(testAngle).toEqualObject(Angle.fromSeconds(3600))
                expect(testAngle).toEqualObject(new Angle(1))
                expect(testAngle).not.toEqualObject(new Angle(0))
            })

            it("should compare angles with arcsecond precision", function () {
                expect(testAngle).toEqualObject(new Angle(1 + 0.1*oneSecond))
            })

            it("should not be equal to undefined", function () {
                expect(testAngle).not.toEqualObject(undefined)
            })

            it("should not be equal to non-Angle objects", function () {
                expect(testAngle).not.toEqualObject({})
            })

            it("should not be equal to null", function () {
                expect(testAngle).not.toEqualObject(null)
            })
        })

        describe("toString()", function () {
            it("should return the angle in seconds", function () {
                var testAngle = new Angle(1)
                expect(testAngle.toString()).toEqual('3600 seconds')
            })
        })
    })

    describe("Latitude", function () {
        it("should be an angle", function () {
            var latitude = new Latitude(1),
                angleObject = new Angle(1)

            expect(angleObject).toEqualObject(latitude)
        })

        it("should be bounded at +/-90 degrees", function () {
            expect(function () { new Latitude(90.1) }).toThrow()
            expect(function () { new Latitude(-90.1) }).toThrow()
        })
    })

    describe("Longitude", function () {
        it("should be an angle", function () {
            var longitude = new Longitude(1),
                angleObject = new Angle(1)

            expect(angleObject).toEqualObject(longitude)
        })

        it("should be bounded at +/-180 degrees", function () {
            expect(function () { new Longitude(180.1) }).toThrow()
            expect(function () { new Longitude(-180.1) }).toThrow()
        })
    })

    describe("Coordinates", function () {
        it("should have a latitude and longitude", function () {
            var coord = new Coordinates(1.5, 2.7)
            expect(new Angle(1.5)).toEqualObject(coord.latitude)
            expect(new Angle(2.7)).toEqualObject(coord.longitude)
        })

        describe("equals()", function () {
            var coord

            beforeEach(function () {
                coord = new Coordinates(0, 0)
            })

            it("should equal another coordinates with same lat & long", function () {
                expect(coord).toEqualObject(new Coordinates(0, 0))
            })

            it("should be unequal to coordinates with different lat | long", function () {
                expect(coord).not.toEqualObject(new Coordinates(1, 0))
                expect(coord).not.toEqualObject(new Coordinates(0, 1))
            })

            it("should be equal if both coordinates are at the same pole", function () {
                var northPole = new Coordinates(90, 0),
                    southPole = new Coordinates(-90, 0)
                expect(northPole).toEqualObject(new Coordinates(90, 100))
                expect(southPole).toEqualObject(new Coordinates(-90, 100))
            })

            it("should be unequal to things that aren't coordinates", function () {
                expect(coord).not.toEqualObject(null)
                expect(coord).not.toEqualObject(undefined)
                expect(coord).not.toEqualObject(new Angle(0))
            })
        })
    })
})
