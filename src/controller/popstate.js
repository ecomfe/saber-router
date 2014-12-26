/**
 * @file popstate控制器
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
        if (url.equal(curLocation) && !options.force) {
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
     * @return {URL}
     */
    function createURL(url, query) {
        if (!url) {
            url = location.hash.substring(1);
        }
        return new URL(url, query, {base: curLocation});
    }

    /**
     * 路由监控
     *
     * @inner
     * @param {Object} e
     */
    function monitor(e) {
        var url = createURL();
        callHandler(url, e.state || {});
    }

    /**
     * 获取元素的本页跳转地址
     *
     * @inner
     * @param {HTMLElement} ele
     * @return {string=}
     */
    function getLink(ele) {
        var target = ele.getAttribute('target');
        var href = ele.getAttribute('href');

        if (!href || (target && target !== '_self')) {
            return;
        }

        return href.charAt(0) !== '#' && href.indexOf(':') < 0 && href;
    }

    /**
     * 劫持全局的click事件
     *
     * @inner
     * @param {Event} e
     */
    function hackClick(e) {
        var target = e.target;
        // 先上寻找A标签
        if (e.path) {
            for (var i = 0, item; item = e.path[i]; i++) {
                if (item.tagName === 'A') {
                    target = item;
                    break;
                }
            }
        }
        else {
            while (target && target.tagName !== 'A') {
                target = target.parentNode;
            }
        }

        if (!target) {
            return;
        }

        var href = getLink(target);
        if (href) {
            exports.redirect(href);
            e.preventDefault();
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
        window.addEventListener('popstate', monitor, false);
        window.addEventListener('click', hackClick, false);
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

        if (options.silent) {
            callHandler(url, options);
        }
        else {
            history.pushState(options, options.title, url.toString());
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
        history.replaceState(options, options.title, url.toString());
    };

    /**
     * 销毁
     *
     * @public
     */
    exports.dispose = function () {
        window.removeEventListener('hashchange', monitor, false);
        window.removeEventListener('click', hackClick, false);
    };

    return exports;

});
