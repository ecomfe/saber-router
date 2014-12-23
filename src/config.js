/**
 * @file 配置信息
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var env = require('saber-env');

    return {
        /**
         * index文件名
         *
         * @type {string}
         */
        index: '',

        /**
         * 是否禁用前端路由跳转
         *
         * @type {boolean}
         */
        disabled: (function () {
            var os = env.os;
            var res = false;
            var minVersion = {
                android: 4.2,
                ios: 6.0
            };

            Object.keys(minVersion).forEach(function (name) {
                var mver = minVersion[name];
                res = mver && parseFloat(os.version) < mver;
            });

            return res;
        })()
    };

});
