/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var extend = require('saber-lang/extend');
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
     * 路由规则
     *
     * @type {Array.<Object>}
     */
    var rules = [];

    /**
     * 判断是否已存在路由处理器
     *
     * @inner
     * @param {string} path
     * @return {boolean}
     */
    function indexOfHandler(path) {
        var index = -1;

        rules.some(function (item, i) {
            // toString是为了判断正则是否相等
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
        url.isRelative = url.path.charAt(0) !== '/';
        url.path = urlHelper.resolve(curLocation.path, url.path);
        url.str = url.path + 
                        (url.str.indexOf('~') >= 0 
                        ? url.str.substring(url.str.indexOf('~'))
                        : '');

        return url;
    }

    /**
     * 从path中获取query
     * 针对正则表达式的规则
     *
     * @inner
     */
    function getQueryFromPath(path, item) {
        var res = {};
        var names = item.params || [];
        var params = path.match(item.path) || [];
        
        for (var i = 1, name; i < params.length; i++) {
            name = names[i - 1] || '$' + i;
            res[name] = params[i];
        }

        return res;
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
        var handler;
        var query = extend({}, url.query);

        rules.some(function (item) {
            if (item.path instanceof RegExp
                && item.path.test(url.path)
            ) {
                handler = item;
                query = extend(getQueryFromPath(url.path, item), query);
            }
            else if (item.path == url.path) {
                handler = item;
            }

            return !!handler;
        });

        if (!handler) {
            throw new Error('can not find ' + url.path);
        }
        else {
            handler.fn.call(handler.thisArg, url.path, query);
            curLocation = url;
        }
    }

    /**
     * 处理RESTful风格的路径
     * 使用正则表达式
     *
     * @inner
     */
    function restful(path) {
        var res = {
                params: []
            };

        res.path = path.replace(/:([^/~]+)/g, function ($0, $1) {
            res.params.push($1);
            return '([^/~]+)';
        });

        res.path = new RegExp(res.path);

        return res;
    }

    /**
     * 添加路由规则
     *
     * @inner
     */
    function addRule(path, fn, thisArg) {
        var rule = {
                path: path,
                fn: fn,
                thisArg: thisArg
            };

        if (!(path instanceof RegExp) 
            && path.indexOf(':') >= 0
        ) {
            rule = extend(rule, restful(path));
        }

        rules.push(rule);
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
     * 添加路由规则
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

        addRule(path, fn, thisArg);
    };

    /**
     * 删除路由规则
     *
     * @public
     * @param {string} path
     */
    exports.remove = function (path) {
        var i = indexOfHandler(path);
        if (i >= 0) {
            rules.splice(i, 1);
        }
    };

    /**
     * 清除所有路由规则
     *
     * @public
     */
    exports.clear = function () {
        rules = [];
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
        url = url || exports.index;

        url = resolveUrl(url);
        if (url.str != curLocation.str || force) {
            redirect(url);
        }

        if (url.isRelative) {
            var href = location.href.split('#')[0];
            history.replaceState({}, document.title, href + '#' + url.str);
        }
        else {
            location.hash = '#' + url.str;
        }
    };

    /**
     * 启动路由监控
     *
     * @public
     */
    exports.start = function () {
        window.addEventListener('hashchange', monitor, false);

        exports.redirect(location.hash);
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
