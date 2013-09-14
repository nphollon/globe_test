describe("Renderer", function () {
    var context;
    var renderer;
    var pt;

    beforeEach(function () {
        context = jasmine.createSpyObj('context', ['fillRect']);
        renderer = createRenderer(context);
        pt = point2d(3, 5);
    });

    describe("drawMarker()", function () {
        it("should draw a rectangle at coordinates", function () {
            renderer.drawMarker(pt);
            expect(context.fillRect).toHaveBeenCalledWith(pt.x() - 5, pt.y() - 5, 10, 10);
        });
    });

    describe("drawMarkers()", function () {
        it("should draw a marker at each of a list of points", function () {
            renderer.drawMarkers([pt]);
            expect(context.fillRect).toHaveBeenCalledWith(pt.x() - 5, pt.y() - 5, 10, 10);
        });
    });
});
