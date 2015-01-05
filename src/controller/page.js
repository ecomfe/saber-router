/**
 * @file 默认路由控制器 应对多页面
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URL = require('../URL');
    var exports = {};

    /**
     * 初始化
     *
     * @public
     * @param {Function} applyHanlder 调用路由处理器
     */
    exports.init = function (applyHanlder) {
        var url = location.pathname;
        if (location.search.length > 1) {
            url += location.search;
        }
        applyHanlder(new URL(url));
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url
     * @param {Object=} query
     */
    exports.redirect = function (url, query) {
        url = new URL(url, query);
        location.href = url.toString();
    };

    /**
     * 销毁
     * 不需要处理
     *
     * @public
     */
    exports.dispose = function () {};

    /**
     * 重置URL
     * 不需要处理
     *
     * @public
     */
    exports.reset = function () {};

    return exports;

});
