/**
 * @file url测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var urlHelper = require('saber-router/url');

    describe('url.parse', function () {
        it('normal', function () {
            var urlStr = '/home';

            var url = urlHelper.parse(urlStr);

            expect(url.path).toBe('/home');
            expect(url.query).toEqual({});
            expect(url.str).toBe(urlStr);
        });

        it('begin with hash', function () {
            var urlStr = '#/home';

            var url = urlHelper.parse(urlStr);

            expect(url.path).toBe('/home');
            expect(url.query).toEqual({});
            expect(url.str).toBe('/home');
        });

        it('with querystring', function () {
            var urlStr = '/home~name=treelite&uid=1001';

            var url = urlHelper.parse(urlStr);

            expect(url.path).toBe('/home');
            expect(url.query).toEqual({name: 'treelite', uid: '1001'});
            expect(url.str).toBe(urlStr);
        });

        it('with wrong querystring', function () {
            var urlStr = '/home~name=treelite&uid=~1001~&';

            var url = urlHelper.parse(urlStr);

            expect(url.path).toBe('/home');
            expect(url.query).toEqual({name: 'treelite', uid: '~1001~'});
            expect(url.str).toBe(urlStr);
        });
    });

    describe('url.resolve', function () {
        it('one param', function () {
           var res = urlHelper.resolve('/home/usr/../work');

           expect(res).toBe('/home/work');
        });

        it('one param with empty', function () {
           var res = urlHelper.resolve('');

           expect(res).toBe('/');
        });

        it('one param with absolute path', function () {
           var res = urlHelper.resolve('/');

           expect(res).toBe('/');
        });

        it('one param with relative path', function () {
           var res = urlHelper.resolve('../home/usr/./../work');
           expect(res).toBe('/home/work');

           res = urlHelper.resolve('./home/usr/../work');
           expect(res).toBe('/home/work');
        });

        it('two params', function () {
            var res = urlHelper.resolve('/home/usr', './../work/');

            expect(res).toBe('/work/');
        });

        it('two params, second is absolute', function () {
            var res = urlHelper.resolve('/home/usr', '/work/saber');

            expect(res).toBe('/work/saber');
        });

        it('two params, first is empty, second is relative', function () {
            var res = urlHelper.resolve('', './../../work/');

            expect(res).toBe('/work/');
        });

        it('two params, first is root, second is relative', function () {
            var res = urlHelper.resolve('/', './../../work/');

            expect(res).toBe('/work/');
        });
    });
});
