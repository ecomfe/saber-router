/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var Path = require('saber-uri/component/Path');
    var Query = require('saber-uri/component/Query');
    var Fragment = require('saber-uri/component/Fragment');
    var config = require('./config');

    var DEFAULT_TOKEN = '?';

    /**
     * normal path
     * 如果路径指向文件夹（以`/`结尾）
     * 则添加index文件名
     *
     * @inner
     * @param {string} path 路径
     * @return {string}
     */
    function normalPath(path) {
        if (path.charAt(path.length - 1) === '/') {
            path += config.index;
        }
        return path;
    }

    /**
     * URL
     *
     * @constructor
     * @param {string} str url
     * @param {Object=} options 选项
     * @param {Object=} options.query 查询条件
     * @param {URL=} options.base 基路径
     */
    function URL(str, options) {
        options = options || {};

        str = (str || '').trim() || config.path;

        var token = this.token = options.token || DEFAULT_TOKEN;

        str = str.split('#');
        this.fragment = new Fragment(str[1]);

        str = str[0].split(token);
        var base = options.base || {};
        this.path = new Path(str[0], base.path);
        this.query = new Query(str[1]);

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
        return this.path.toString()
            + this.query.toString(this.token)
            + this.fragment.toString();
    };

    /**
     * 比较Path
     *
     * @public
     * @param {string} path 路径
     * @return {boolean}
     */
    URL.prototype.equalPath = function (path) {
        var myPath = normalPath(this.path.get());
        path = normalPath(path);

        return myPath === path;
    };

    /**
     * 比较Path与Query是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equal = function (url) {
        return this.query.equal(url.query)
            && this.equalPath(url.path.get());
    };

    /**
     * 比较Path, Query及Fragment是否相等
     *
     * @public
     * @param {URL} url url对象
     * @return {boolean}
     */
    URL.prototype.equalWithFragment = function (url) {
        return this.equal(url)
            && this.fragment.equal(url.fragment);
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
