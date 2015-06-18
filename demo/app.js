/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var exports = {};
    var content = document.getElementById('content');
    var extend = require('saber-lang/extend');

    document.getElementById('btn').onclick = function () {
        history.back();
    };

    exports.index = function (path, query, params, url) {
        console.log(path, query, params, url);
        content.innerHTML = 'home page';
    };

    exports.list = function (path, query, params, url) {
        console.log(path, query, params, url);
        content.innerHTML = 'list page';
    };

    exports.product = function (path, query, params, url) {
        console.log(path, query, params, url);
        query = extend(params, query);
        content.innerHTML = 'product: ' + query.id;
    };

    return exports;
});
