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
            str: '',
            path: ''
        };

    /**
     * 路由处理器
     *
     * @type {Array.<Object>}
     */
    var handlers = [];

    /**
     * 判断是否已存在路由处理器
     *
     * @inner
     * @param {string} path
     * @return {boolean}
     */
    function indexOfHandler(path) {
        var index = -1;

        handlers.some(function (item, i) {
            if (item.path.toString() == path.toString()) {
                index = i;
            }
            return index != -1;
        });

        return index;
    }

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
     * @param {Object} url
     * @param {string} url.path
     * @param {Object} url.query
     * @param {string} url.str
     */
    function redirect(url) {
        var handle;

        handlers.some(function (item) {
            if (item.path instanceof RegExp
                && item.path.test(url.path)
            ) {
                handle = item;
            }
            else if (item.path == url.path) {
                handle = item;
            }

            return !!handle;
        });

        if (!handle) {
            throw new Error('can not find ' + url.path);
        }
        else {
            handle.fn.call(handle.thisArg, url.path, url.query);
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
     * @param {Object} thisArg
     */
    exports.add = function (path, fn, thisArg) {
        if (indexOfHandler(path) >= 0) {
            throw new Error('path has been existed');
        }

        handlers.push({
            path: path,
            fn: fn,
            thisArg: thisArg
        });
    };

    /**
     * 删除路由配置
     *
     * @public
     * @param {string} path
     */
    exports.remove = function (path) {
        var i = indexOfHandler(path);
        if (i >= 0) {
            handlers.splice(i, 1);
        }
    };

    /**
     * 清除所有路由配置
     *
     * @public
     */
    exports.clear = function () {
        handlers = [];
        curLocation.path = '';
        curLocation.str = '';
    };

    /**
     * URL跳转
     *
     * @public
     * @param {string} url
     * @param {boolean} force 是否强制跳转
     */
    exports.redirect = function (url, force) {
        if (!url) {
            return;
        }

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
    exports.stop = function () {
        window.removeEventListener('hashchange', monitor, false);
    };

    return exports;
});
