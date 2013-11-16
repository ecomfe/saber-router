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
            from = to;
            to = arguments[1];
        }

        // 目标路径从根目录开始
        // 则忽略起始路径
        var res = to.charAt(0) != '/' 
                    ? from.split('/')
                    : [];

        var paths = to.split('/');

        // 如果最后一位不是空
        // 则最后一位是文件，不应参与路径的比较
        if (res[res.length - 1]) {
            res.splice(res.length - 1, 1);
        }
        
        // 去除res中的空元素
        for (var i = 0, item; i < res.length; i++) {
            if (!(item = res[i])) {
                res.splice(i, 1);
                i--;
            }
        }
        
        paths.forEach(function (item) {
            if (item == '..') {
                res.splice(res.length - 1, 1);
            }
            else if (item !== '.') {
                res.push(item);
            }
        });

        // 首部不是空元素则添加一个空元素
        // 使最后join后能以`/`开头
        if (res[0] || res.length <= 1) {
            res.unshift('');
        }

        // 去除连续的空元素
        // 防止最后join的时候出现多个`/`
        if (res.length > 2) {
            var empty;
            for (var i = 0, item; i < res.length; i++) {
                item = res[i];
                if (!item) {
                    if (empty) {
                        res.splice(i, 1);
                        i--;
                    }
                    empty = true;
                }
                else {
                    empty = false;
                }
            }
        }

        return res.join('/');
    };

    return exports;
});
