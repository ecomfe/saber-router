/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var urlHelper = require('./url');

    /**
     * 当前路径
     *
     * @type {Object}
     */
    var curLocation = {
            str: '/',
            path: '/'
        };

    /**
     * 路由处理器
     *
     * @type {Object}
     */
    var handlers = {};
    
    /**
     * 解析URL
     *
     * @inner
     */
    function resolveUrl(url) {
        url = urlHelper.parse(url);
        url.path = urlHelper.resolve(curLocation.path, url.path);

        return url;
    }

    /**
     * URL跳转
     *
     * @inner
     */
    function redirect(url) {

        var items = Object.keys(handlers);
        var hit = false;
        for (var i = 0, path; !hit && (path = items[i]); i++) {
            if (path instanceof RegExp) {
                hit = path.test(url.path);
            }
            else {
                hit = path == url.path;
            }

            if (hit) {
                var fn = handlers[path];
                fn(url.path, url.query);
            }
        }

        if (!hit) {
            throw new Error('can not find ' + url.path);
        }
        else {
            curLocation = url;
        }
    }

    /**
     * hashchange监听
     *
     * @inner
     */
    function monitor() {
        exports.redirect(location.hash);
    }
    
    var exports = {
            index: '/'
        };

    /**
     * 添加路由配置
     *
     * @public
     * @param {string|RegExp} path
     * @param {function(path, query)} fn
     */
    exports.add = function (path, fn) {
        if (handlers[path]) {
            throw new Error('path has been existed');
        }

        handlers[path] = fn;
    };

    /**
     * 删除路由配置
     *
     * @public
     * @param {string} path
     */
    exports.remove = function (path) {
        if (handlers[path]) {
            delete handlers[path];
        }
    };

    /**
     * URL跳转
     *
     * @public
     * @param {string} url
     * @param {boolean} force 是否强制跳转
     */
    exports.redirect = function (url, force) {
        url = resolveUrl(url);
        if (url.str != curLocation.str || force) {
            location.hash = '#' + url.str;
            redirect(url);
        }
    };

    /**
     * 启动路由监控
     *
     * @public
     */
    exports.start = function () {
        window.addEventListener('hashchange', monitor, false);

        var url = urlHelper.parse(location.hash);
        var def = urlHelper.parse(exports.index);

        redirect(url.path ? url : def);
    };

    /**
     * 停止路由监控
     *
     * @public
     */
    exports.end = function () {
        window.removeEventLsitener('hashchange', monitor, false);
    };

    return exports;
});
