/**
 * @file abstract controller
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var methods = ['redirect', 'init', 'dispose', 'reset'];

    var controller = require('./controller/default');

    var exports = {};

    exports.plugin = function (core) {
        controller = core;
    };

    methods.forEach(function (name) {
        exports[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            return controller[name].apply(controller, args);
        };
    });

    return exports;
});
