/**
 * @file abstract controller
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var methods = ['redirect', 'init', 'dispose', 'reset'];

    var core = require('./controller/default');

    var exports = {};

    /**
     * 动态更换内部实现
     *
     * @public
     * @param {Object} controller
     */
    exports.plugin = function (controller) {
        core = controller;
    };

    // 导出公共方法
    methods.forEach(function (name) {
        exports[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            return core[name].apply(core, args);
        };
    });

    return exports;
});
