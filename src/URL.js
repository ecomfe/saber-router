/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Path = require('saber-uri/component/Path');
    var Query = require('saber-uri/component/Query');

    var QUERY_SPLIT = '~';
   
    /**
     * URL
     *
     * @constructor
     * @param {string} str
     * @param {Object=} options
     * @param {Object=} options.query
     * @param {URL=} options.base
     */
    function URL(str, options) {
        options = options || {};
        var base = options.base || {};

        str = str.trim();
        if (str.charAt(0) == '#') {
            str = str.substring(1);
        }

        str = str.split(QUERY_SPLIT);

        var path = str[0].trim();
        this.isRelative = path.charAt(0) !== '/';
        this.path = new Path(path, base.path);

        var queryStr = str[1] && str[1].trim()
        this.query = new Query(queryStr || '');
        if (options.query) {
            this.query.add(options.query);
        }
    }

    /**
     * 字符串化
     *
     * @public
     * @return {string}
     */
    URL.prototype.toString = function () {
        return this.path.toString() + this.query.toString(QUERY_SPLIT);
    };

    /**
     * 比较
     *
     * @public
     * @return {Boolean}
     */
    URL.prototype.equal = function (url) {
        return this.path.equal(url.path)
            && this.query.equal(url.query);
    };

    /**
     * 获取查询条件
     *
     * @public
     * @return {Object}
     */
    URL.prototype.getQuery = function () {
        return this.query.get();
    };

    /**
     * 添加查询条件
     *
     * @public
     * @param {string|Object} key
     * @param {string} value
     */
    URL.prototype.addQuery = function (key, value) {
        this.query.add(key, value);
    };

    /**
     * 获取路径
     *
     * @public
     * @return {string}
     */
    URL.prototype.getPath = function () {
        return this.path.get();
    };

    return URL;

});
