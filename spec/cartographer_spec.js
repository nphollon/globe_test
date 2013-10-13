var maps = require("../scripts/maps.js")
var cartographer = require("../scripts/cartographer.js")

describe("Cartographer", function () {
    "use strict";

    var createRenderer, point2d, projection

    createRenderer = cartographer.createRenderer
    point2d = cartographer.point2d
    projection = cartographer.projection

    describe("Renderer", function () {
        var context, renderer, pt

        beforeEach(function () {
            context = jasmine.createSpyObj('context', ['fillRect'])
            renderer = createRenderer(context)
            pt = point2d(3, 5)
        })

        describe("drawMarker()", function () {
            it("should draw a rectangle at coordinates", function () {
                renderer.drawMarker(pt)
                expect(context.fillRect).toHaveBeenCalledWith(pt.x() - 5, pt.y() - 5, 10, 10)
            })
        })

        describe("drawMarkers()", function () {
            it("should draw a marker at each of a list of points", function () {
                renderer.drawMarkers([pt])
                expect(context.fillRect).toHaveBeenCalledWith(pt.x() - 5, pt.y() - 5, 10, 10)
            })
        })
    })

    describe("Point2d", function () {
        var testPoint
        
        beforeEach(function () {
            testPoint = point2d(1, 2)
        })

        describe("plus()", function () {
            it("should return point2d with sum of coordinates", function () {
                var displacement, newPoint
                displacement = point2d(4, 7)
                newPoint = testPoint.plus(displacement)
                expect(newPoint).toEqualObject(point2d(5, 9))
            })
        })

        describe("toString()", function () {
            it("should concatenate x and y", function () {
                expect(testPoint.toString()).toEqual("(1, 2)")
            })
        })
        
        describe("equals()", function () {
            it("should be true if x and y are equal", function () {
                expect(testPoint).toEqualObject(point2d(1, 2))
            })

            it("should be false if x or y is not equal", function () {
                expect(testPoint).not.toEqualObject(point2d(0, 2))
                expect(testPoint).not.toEqualObject(point2d(1, 0))
            })

            it("should be false if operand is not a point", function () {
                expect(testPoint).not.toEqualObject(undefined)
                expect(testPoint).not.toEqualObject(null)
                expect(testPoint).not.toEqualObject({})
                expect(testPoint).not.toEqualObject({ x: function () { return 1 } })
            })
        })
    })

    describe("Equirectangular projection", function () {
        var plateCaree, verifyProjection

        verifyProjection = function (mapXY, canvasXY) {
            var canvasCoords = plateCaree(new maps.Coordinates(mapXY[0], mapXY[1]))
            expect(canvasCoords.x()).toEqual(canvasXY[0])
            expect(canvasCoords.y()).toEqual(canvasXY[1])
        }

        describe("1px per degree", function () {
            beforeEach(function () {
                plateCaree = projection(360, 180)
            })

            it("should translate coords (0, 0) to the canvas center", function () {
                verifyProjection([0, 0], [180, 90])
            })

            it("should translate coords (1, 0) to 1px above the canvas center", function () {
                verifyProjection([1, 0], [180, 89])
            })

            it("should translate coords (0, 1) to 1px right of the canvas center", function () {
                verifyProjection([0, 1], [181, 90])
            })
        })

        describe("0.5px per degree", function () {
            beforeEach(function () {
                plateCaree = projection(180, 90)
            })

            it("should translate coords (2, 0) to 1px above the canvas center", function () {
                verifyProjection([2, 0], [90, 44])
            })

            it("should translate coords (0, 2) to 1px right of the canvas center", function () {
                verifyProjection([0, 2], [91, 45])
            })
        })
    })
})
