/*global window, document, require */

window.onload = function () {
    "use strict";
    var cartographer = require("./cartographer.js");
    var canvasElement = document.getElementById("canvas");
    if (canvasElement) {
        cartographer.draw(canvasElement);
    }
};
