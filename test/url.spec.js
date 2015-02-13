/**
 * @file url测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var URL = require('saber-router/URL');

    describe('URL', function () {

        describe('constructor', function () {

            it('should pass width a string param', function () {
                var url = new URL('/hospital/search?kw=xxx#www');

                expect(url.path.get()).toEqual('/hospital/search');
                expect(url.query.equal('kw=xxx')).toBeTruthy();
                expect(url.fragment.equal('www')).toBeTruthy();
            });

            it('should pass width base param', function () {
                var base = new URL('/hospital/search?kw=xxx');
                var url = new URL('../?kw=xxx', {base: base});

                expect(url.path.get()).toEqual('/');
                expect(url.query.equal('kw=xxx')).toBeTruthy();
            });

            it('should pass with query', function () {
                var url = new URL('/index?kw=www&t=10', {query: {t: '20'}});

                expect(url.path.get()).toEqual('/index');
                expect(url.query.equal('kw=www&t=10&t=20')).toBeTruthy();
            });

            it('should pass width token', function () {
                var url = new URL('/index~kw=ww&t=10', {token: '~'});

                expect(url.path.get()).toEqual('/index');
                expect(url.query.equal('kw=ww&t=10')).toBeTruthy();
                expect(url.fragment.get()).toEqual('');
            });

            it('path should be "/" with empty param', function () {
                var url = new URL();
                expect(url.path.get()).toEqual('/');

                url = new URL('', {token: '~'});
                expect(url.path.get()).toEqual('/');
            });

        });

        describe('.toString()', function () {

            it('should return the right string', function () {
                var str = '../work/search?kw=xxx'
                var url = new URL(str);
                expect(url.toString()).toEqual(str);

                str = 'work/search?';
                url = new URL(str);
                expect(url.toString()).toEqual('work/search');

                str = 'work/search?www#';
                url = new URL(str);
                expect(url.toString()).toEqual('work/search?www');

                str = 'work/search?www#111';
                url = new URL(str);
                expect(url.toString()).toEqual(str);
            });

            it('should return the right string with special token', function () {
                var str = '../work/search~kw=xxx'
                var url = new URL(str, {token: '~'});
                expect(url.toString()).toEqual(str);

                str = 'work/search~';
                url = new URL(str, {token: '~'});
                expect(url.toString()).toEqual('work/search');
            });

        });

        describe('.equal()', function () {

            it('shoud return boolean', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search');

                expect(url1.equal(url2)).toBeFalsy();
                expect(url2.equal(url1)).toBeFalsy();
            });

            it('should ingore query order', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?t=10&kw=xxx');

                expect(url1.equal(url2)).toBeTruthy();
                expect(url2.equal(url1)).toBeTruthy();
            });

            it('should ingore fragment', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?kw=xxx&t=10#www');

                expect(url1.equal(url2)).toBeTruthy();
                expect(url2.equal(url1)).toBeTruthy();
            });

        });

        describe('.equalWithFragment', function () {
            it('shoud return boolean', function () {
                var url1 = new URL('../work/search?kw=xxx&t=10');
                var url2 = new URL('../work/search?kw=xxx&t=10#www');
                var url3 = new URL('../work/search?kw=xxx&t=10#www');

                expect(url1.equalWithFragment(url2)).toBeFalsy();
                expect(url2.equalWithFragment(url1)).toBeFalsy();
                expect(url3.equalWithFragment(url2)).toBeTruthy();
                expect(url2.equalWithFragment(url3)).toBeTruthy();
            });
        });

        describe('.getQuery()', function () {

            it('should return query data', function ()  {
                var url = new URL('work?kw=' + encodeURIComponent('中文') + '&t=10&t=11');

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

    });

});
