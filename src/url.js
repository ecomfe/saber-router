/**
 * @file url处理
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    var exports = {};

    /**
     * 解析hash
     *
     * @param {string} hash
     * @return {Object}
     */
    exports.parse = function (hash) {
        var res = {};

        res.str = hash.substring(hash.charAt(0) == '#' ? 1 : 0);

        hash.replace(/^#?([^~]*)(~|$)/, function ($0, $1) {
            res.path = $1;
        });

        res.query = {};
        hash.replace(/~(.*)$/, function ($0, $1) {
            var items = $1.split('&');
            items.forEach(function (item) {
                item = item.split('=');
                res.query[item[0]] = item[1];
            });
        });

        return res;
    };

    /**
     * 处理相对路径
     *
     * @param {?string} from 起始路径
     * @param {string} to 目标路径
     * @return {string}
     */
    exports.resolve = function () {
        var from = '/';
        var to = arguments[0];

        if (arguments[1]) {
            form = to;
            to = arguments[1];
        }

        // 目标路径从根目录开始
        // 则忽略起始路径
        var res = to.charAt(0) != '/' 
                    ? form.split('/')
                    : [];

        var paths = to.split('/');

        paths.forEach(function (item) {
            if (item == '..') {
                res.splice(res.length - 1, 1);
            }
            else if (item && item !== '.') {
                res.push(item);
            }
        });

        return '/' + res.join('/');
    };

    return exports;
});
