/**
 * @file abstract controller
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var methods = ['redirect', 'init', 'dispose', 'reset'];

    var core = {};

    methods.forEach(function (name) {
        core[name] = function () {
            throw new Error('route controller need to implement "' + name + '"');
        };
    });

    var exports = {};

    /**
     * 动态更换内部实现
     *
     * @public
     * @param {Object} controller 控制器
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
