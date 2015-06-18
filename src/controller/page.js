/**
 * @file 默认路由控制器 应对多页面
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URL = require('../URL');
    var exports = {};

    /**
     * 创建URL对象
     *
     * @inner
     * @param {string=} url url字符串
     * @param {Object=} query 查询条件
     * @return {URL}
     */
    function createURL(url, query) {
        if (!url) {
            url.location.pathname;
        }
        return new URL(url, {query: query});
    }

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
        applyHanlder(createURL(url));
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url URL参数
     * @param {Object=} query 查询条件
     */
    exports.redirect = function (url, query) {
        url = createURL(url, query);
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
