/*global window, document, cartographer */
/*jslint maxlen: 80 */

window.onload = function () {
    "use strict";
    var canvasElement = document.getElementById('canvas');
    if (canvasElement) {
        cartographer.draw(canvasElement);
    }
};
