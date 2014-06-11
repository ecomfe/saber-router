/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var extend = require('saber-lang/extend');
    var URL = require('./URL');
    var config = require('./config');

    /**
     * 当前路径
     *
     * @type {Object}
     */
    var curLocation = {};

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
            res[name] = decodeURIComponent(params[i]);
        }

        return res;
    }

    function createURL(url, query, base) {
        url = url || config.path;
        return new URL(url, {query: query, base: base});
    }

    /**
     * URL跳转
     *
     * @inner
     * @param {string} url
     * @param {boolean} force
     * @return {Url}
     */
    function redirect(url, force) {

        if (!(url instanceof URL)) {
            url = createURL(url, null, curLocation);
        }

        if (url.equal(curLocation) && !force) {
            return url;
        }

        var handler;
        var query = extend({}, url.getQuery());

        rules.some(function (item) {
            if (item.path instanceof RegExp) {
                if (item.path.test(url.getPath())) {
                    handler = item;
                    query = extend(getQueryFromPath(url.getPath(), item), query);
                }
            }
            else if (url.equalPath(item.path)) {
                handler = item;
            }

            return !!handler;
        });

        if (!handler) {
            throw new Error('can not found route for: ' + url.getPath());
        }
        else {
            handler.fn.call(handler.thisArg, url.getPath(), query);
        }

        curLocation = url;

        return url;
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

        res.path = new RegExp(res.path + '(?:~|$)');

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
        var url = redirect(location.hash);

        if (url.isRelative) {
            var href = location.href.split('#')[0];
            // 只能替换没法删除
            // 遇到相对路径跳转当前页的情况就没辙了
            // 会导致有两次相同路径的历史条目...
            history.replaceState(
                {}, 
                document.title, 
                href + '#' + url.toString()
            );
        }
    }
    
    var exports = {};

    /**
     * 设置配置信息
     *
     * @public
     * @param {Object} options 配置信息
     * @param {string=} options.path 默认路径
     * @param {string=} options.index index文件名称
     */
    exports.config = function (options) {
        options = options || {};

        extend(config, options);
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
        curLocation = {};
    };

    /**
     * URL跳转
     *
     * @public
     * @param {string} url
     * @param {Object=} query
     * @param {boolean=} force 是否强制跳转
     */
    exports.redirect = function (url, query, force) {
        var args = Array.prototype.slice.call(arguments);
        if ('[object Boolean]'
            == Object.prototype.toString.call(args[args.length - 1])
        ) {
            force = args.pop();
            query = args[1];
        }

        url = createURL(url, query, curLocation);
        redirect(url, force);
        location.hash = '#' + url.toString();
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
