describe("Equirectangular projection", function () {
    var plateCaree, verifyProjection;

    verifyProjection = function (mapXY, canvasXY) {
        var mapCoords = coordinates(mapXY[0], mapXY[1]);
        var canvasCoords = plateCaree(mapCoords);
        expect(canvasCoords.x()).toEqual(canvasXY[0]);
        expect(canvasCoords.y()).toEqual(canvasXY[1]);
    };

    describe("1px per degree", function () {
        beforeEach(function () {
            plateCaree = projection(360, 180);
        });
        
        it("should translate coords (0, 0) to the canvas center", function () {
            verifyProjection([0, 0], [180, 90]);
        });

        it("should translate coords (1, 0) to 1px above the canvas center", function () {
            verifyProjection([1, 0], [180, 89]);
        });

        it("should translate coords (0, 1) to 1px right of the canvas center", function () {
            verifyProjection([0, 1], [181, 90]);
        });
    });

    describe("0.5px per degree", function () {
        beforeEach(function () {
            plateCaree = projection(180, 90);
        });
        
        it("should translate coords (2, 0) to 1px above the canvas center", function () {
            verifyProjection([2, 0], [90, 44]);
        });

        it("should translate coords (0, 2) to 1px right of the canvas center", function () {
            verifyProjection([0, 2], [91, 45]);
        });
    });
});
