/**
 * @file url测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URL = require('saber-router/URL');

    describe('URL', function () {

        describe('constructor', function () {

            it('should pass width a string param', function () {
                var url = new URL('/hospital/search~kw=xxx');

                expect(url.isRelative).toBeFalsy();
                expect(url.path.get()).toEqual('/hospital/search');
                expect(url.query.equal('kw=xxx')).toBeTruthy();
            });

            it('should pass width base param', function () {
                var base = new URL('/hospital/search~kw=xxx');
                var url = new URL('../search~kw=xxx', {base: base});

                expect(url.isRelative).toBeTruthy();
                expect(url.path.get()).toEqual('/search');
                expect(url.query.equal('kw=xxx')).toBeTruthy();
            });

            it('should pass with query', function () {
                var url = new URL('/index~kw=www&t=10', {query: {t: '20'}});

                expect(url.isRelative).toBeFalsy();
                expect(url.path.get()).toEqual('/index');
                expect(url.query.equal('kw=www&t=10&t=20')).toBeTruthy();
            });

        });

        describe('.toString()', function () {

            it('should return the right string', function () {
                var str = '../work/search~kw=xxx'
                var url = new URL(str);
                expect(url.toString()).toEqual(str);

                str = 'work/search~';
                url = new URL(str);
                expect(url.toString()).toEqual('work/search');
            });

        });

        describe('.toEqual()', function () {

            it('shoud return boolean', function () {
                var url1 = new URL('../work/search~kw=xxx&t=10');
                var url2 = new URL('../work/search');

                expect(url1.equal(url2)).toBeFalsy();
                expect(url2.equal(url1)).toBeFalsy();
            });

            it('should ingore query order', function () {
                var url1 = new URL('../work/search~kw=xxx&t=10');
                var url2 = new URL('../work/search~t=10&kw=xxx');

                expect(url1.equal(url2)).toBeTruthy();
                expect(url2.equal(url1)).toBeTruthy();
            });

        });

        describe('.getQuery()', function () {

            it('should return query data', function ()  {
                var url = new URL('work~kw=' + encodeURIComponent('中文') + '&t=10&t=11');

                var query = url.getQuery(url);
                expect(Object.keys(query).length).toBe(2);
                expect(query.kw).toEqual('中文');
                expect(query.t).toEqual(['10', '11']);
            });

            it('should return empty object when has no query', function () {
                var url = new URL('work');

                expect(url.getQuery()).toEqual({});
            });

        });

        describe('.getPath()', function () {

            it('should return string', function () {
                var url = new URL('work/search');

                expect(url.getPath()).toEqual('work/search');
            });

        });

        describe('.addQuery()', function () {

            it('should add item', function () {
                var url = new URL('work/search');

                url.addQuery('kw', 'www');
                expect(url.query.equal('kw=www')).toBeTruthy();
            });

            it('should add object', function () {
                var url = new URL('work/search');

                url.addQuery({kw: 'www'});
                expect(url.query.equal('kw=www')).toBeTruthy();
            });

        });

    });

});
