/*global window, document, require */

window.onload = function () {
    "use strict";
    var canvas = document.getElementById("canvas");
    if (canvas) {
        require("./cartographer.js").draw(canvas);
    }
};
