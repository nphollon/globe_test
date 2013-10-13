"use strict";

exports.defineConstant = function (object, name, value) {
    Object.defineProperty(object, name, {
        value: value,
        writeable: false,
        enumerable: false,
        configurable: false
    });
};

exports.defineAccessor = function (object, name, getter) {
    Object.defineProperty(object, name, {
        get: getter,
        set: undefined,
        enumerable: false,
        configurable: false
    });
};
