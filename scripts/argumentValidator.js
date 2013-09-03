var argumentValidator = function () {
    var that = {};
    var validations = {};

    that.addError = function (name, message, condition) {
        validations[name] = { message: message, condition: condition };
    };

    that.validate = function () {
        forEachProperty(validations, checkErrorCondition);
    };

    var forEachProperty = function (object, callback) {
        var property;
        for (property in object) {
            if (object.hasOwnProperty(property)) {
                callback.call(null, object[property]);
            }
        }
    };

    var checkErrorCondition = function (error) {
        if (error.condition.call()) {
            throw argumentError(error.message);
        }        
    };

    var argumentError = function (message) {
        return { name: 'ArgumentError', message: message };
    };

    return that;
}
