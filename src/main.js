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
     * @type {URL}
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
            if (item.path.toString() === path.toString()) {
                index = i;
            }
            return index !== -1;
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
        return new URL(url, {query: query, base: base});
    }

    /**
     * URL跳转
     *
     * @inner
     * @param {URL} url
     * @param {Object} options
     * @param {boolean=} options.force
     * @param {string=} options.title
     */
    function redirect(url, options) {
        options = options || {};

        if (url.equal(curLocation) && !options.force) {
            return;
        }

        var handler;
        var defHandler;
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

            if (!item.path) {
                defHandler = item;
            }

            return !!handler;
        });

        handler = handler || defHandler;

        if (!handler) {
            throw new Error('can not found route for: ' + url.getPath());
        }
        else {
            handler.fn.call(handler.thisArg, url.getPath(), query, url.toString(), options);
        }

        if (options.title) {
            document.title = options.title;
        }
        curLocation = url;
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

    function getURL() {
        var res = location.pathname;
        if (location.search.length > 1) {
            res += location.search;
        }
        if (location.hash.length > 1) {
            res += location.hash;
        }
        return res;
    }

    /**
     * hashchange监听
     *
     * @inner
     */
    function monitor(e) {
        var url = createURL(getURL(), null, curLocation);
        redirect(url, e.state);
    }

    var exports = {};

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
        url = createURL(url, query, curLocation);
        if (options.silent) {
            curLocation = url;
        }
        else {
            redirect(url, options);
        }
        options.url = url;
        history.replaceState(options, options.title, url.toString());
    };

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
     * @param {string|RegExp=} path
     * @param {function(path, query)} fn
     * @param {Object=} thisArg
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
     * @param {string} url 路径
     * @param {?Object} query 查询条件
     * @param {Object=} options 跳转参数
     * @param {string=} options.title 跳转后页面的title
     * @param {boolean=} options.force 是否强制跳转
     * @param {boolean=} options.silent 是否静默跳转（不改变hash）
     */
    exports.redirect = function (url, query, options) {
        options = options || {};
        // API向前兼容
        // 支持 redirect(url, force) 与 redirect(url, query, force)
        var args = Array.prototype.slice.call(arguments);
        if ('[object Boolean]' === Object.prototype.toString.call(args[args.length - 1])) {
            options = {force: args.pop()};
            query = args[1];
        }

        url = createURL(url, query, curLocation);
        var changed = !url.equalWithFragment(curLocation);
        redirect(url, options);
        if (!options.silent && (options.force || changed)) {
            history.pushState({title: options.title}, options.title, url.toString());
        }
    };

    /**
     * 启动路由监控
     *
     * @public
     */
    exports.start = function () {
        window.addEventListener('popstate', monitor, true);

        exports.redirect(getURL(), null, {silent: true});
    };

    /**
     * 停止路由监控
     *
     * @public
     */
    exports.stop = function () {
        window.removeEventListener('popstate', monitor, true);
    };

    return exports;
});
