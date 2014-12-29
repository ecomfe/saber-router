/**
 * @file hash路由控制器
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URL = require('../URL');
    var applyHandler;
    var curLocation;

    /**
     * 调用路由处理器
     *
     * @inner
     * @param {URL} url
     * @param {Object} options
     */
    function callHandler(url, options) {
        if (curLocation && url.equal(curLocation) && !options.force) {
            return;
        }
        applyHandler(url, options);
        curLocation = url;
    }

    /**
     * 创建URL对象
     *
     * @inner
     * @param {string=} url
     * @param {Object=} query
     * @param {URL=} base
     * @return {URL}
     */
    function createURL(url, query, base) {
        if (!url) {
            url = location.hash.substring(1);
        }
        return new URL(url, {query: query, base: curLocation, token: '~'});
    }

    /**
     * 路由监控
     *
     * @inner
     */
    function monitor() {
        var hash = location.hash.substring(1);
        var url = createURL(hash);

        callHandler(url, {});

        // 相对路径的处理
        // 只能替换当次的历史记录，没法删除之前一次的记录
        // 遇到相对路径跳转当前页的情况就没辙了
        // 会导致有两次相同路径的历史条目...
        if (hash.charAt(0) !== '/') {
            location.replace('#' + url.toString());
        }
    }

    var exports = {};

    /**
     * 初始化
     *
     * @public
     * @param {Function} apply 调用路由处理器
     */
    exports.init = function (apply) {
        window.addEventListener('hashchange', monitor, false);
        applyHandler = apply;
        monitor();
    };

    /**
     * 路由跳转
     *
     * @public
     * @param {string} url 路径
     * @param {Object=} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     */
    exports.redirect = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        callHandler(url, options);
        // 会浪费一次没有必要的hashchange...
        // 但不这样搞的话 options参数不好传递
        if (!options.silent) {
            location.hash = '#' + url.toString();
        }
    };

    /**
     * 重置当前的URL
     *
     * @public
     * @param {string} url
     * @param {Object=} query
     * @param {Object=} options
     * @param {boolean=} options.silent 是否静默重置，静默重置只重置URL，不加载action
     */
    exports.reset = function (url, query, options) {
        options = options || {};
        url = createURL(url, query);

        if (!options.silent) {
            callHandler(url, options);
        }
        else {
            curLocation = url;
        }

        location.replace('#' + url.toString());
    };

    /**
     * 销毁
     *
     * @public
     */
    exports.dispose = function () {
        window.removeEventListener('hashchange', monitor, false);
    };

    return exports;

});
