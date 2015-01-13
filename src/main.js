/**
 * @file 路由管理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var extend = require('saber-lang/extend');
    var globalConfig = require('./config');
    var controller = require('./controller');

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
     * @param {string|RegExp} path
     * @return {number}
     */
    function indexOfHandler(path) {
        var index = -1;

        path = path.toString();
        rules.some(function (item, i) {
            // toString是为了判断正则是否相等
            if (item.raw.toString() === path) {
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
    function getParamsFromPath(path, item) {
        var res = {};
        var names = item.params || [];
        var params = path.match(item.path) || [];

        for (var i = 1, name; i < params.length; i++) {
            name = names[i - 1] || '$' + i;
            res[name] = decodeURIComponent(params[i]);
        }

        return res;
    }

    /**
     * 根据URL调用处理器
     *
     * @inner
     * @param {URL} url
     * @param {Object=} options
     * @param {string=} options.title
     */
    function apply(url, options) {
        options = options || {};

        var handler;
        var defHandler;
        var query = extend({}, url.getQuery());
        var params = {};

        rules.some(function (item) {
            if (item.path instanceof RegExp) {
                if (item.path.test(url.getPath())) {
                    handler = item;
                    params = getParamsFromPath(url.getPath(), item);
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
            handler.fn.call(handler.thisArg, url.getPath(), query, params, url.toString(), options);
        }

        if (options.title) {
            document.title = options.title;
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

        res.path = path.replace(/:([^/]+)/g, function ($0, $1) {
            res.params.push($1);
            return '([^/]+)';
        });

        res.path = new RegExp(res.path + '$');

        return res;
    }

    /**
     * 添加路由规则
     *
     * @inner
     */
    function addRule(path, fn, thisArg) {
        var rule = {
                raw: path,
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
        controller.reset(url, query, options);
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
        extend(globalConfig, options);
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
     * @param {boolean=} options.silent 是否静默跳转（不改变URL）
     */
    exports.redirect = function (url, query, options) {
        controller.redirect(url, query, options);
    };

    /**
     * 启动路由监控
     *
     * @public
     * @param {Object} options 配置项
     */
    exports.start = function (options) {
        exports.config(options);
        controller.init(apply);
    };

    /**
     * 停止路由监控
     *
     * @public
     */
    exports.stop = function () {
        controller.dispose();
        exports.clear();
    };

    /**
     * 更换控制器
     *
     * @public
     * @param {Object} implement
     */
    exports.controller = function (implement) {
        controller.plugin(implement);
    };

    return exports;
});
