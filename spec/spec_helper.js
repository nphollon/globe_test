beforeEach(function() {
    this.addMatchers({
        toEqualObject: function (expected) {
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
