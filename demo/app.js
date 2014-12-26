/**
 * @file app
 * @author treelite(c.xinle@gmail.com)
 */

define(function () {

    var exports = {};
    var content = document.getElementById('content');

    document.getElementById('btn').onclick = function () {
        history.back();
    };

    exports.index = function (path, query, url) {
        console.log(path, query, url);
        content.innerHTML = 'home page';
    };

    exports.list = function (path, query, url) {
        console.log(path, query, url);
        content.innerHTML = 'list page';
    };

    exports.product = function (path, query, url) {
        console.log(path, query, url);
        content.innerHTML = 'product: ' + query.id;
    };

    return exports;
});
