/**
 * @file hash test spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var INTERVAL_TIME = 100;
    var hashController = require('saber-router/controller/hash');

    describe('Hash Controller', function () {

        afterEach(function () {
            location.hash = '';
        });

        describe('init/dipose', function () {

            it('should apply handler with current hash', function () {
                var urlStr = '/home~name=treelite&w=1';
                location.hash = '#' + urlStr;
                var fn = jasmine.createSpy('fn');

                hashController.init(fn);
                hashController.dispose();

                expect(fn).toHaveBeenCalled();

                var args = fn.calls.argsFor(0);
                expect(args.length).toBe(2);

                var url = args[0];
                expect(url.toString()).toEqual(urlStr);
                expect(url.path.get()).toEqual('/home');
                expect(url.query.get()).toEqual({name: 'treelite', w: '1'});
            });

            it('should monitor hashchange', function (done) {
                var fn = jasmine.createSpy('fn');
                location.hash = '#/index';

                hashController.init(fn);

                setTimeout(function () {
                    location.hash = '#/home';
                    setTimeout(function () {
                        expect(fn.calls.count()).toBe(2);
                        hashController.dispose();
                        location.hash = '#/somewhere';
                        setTimeout(function () {
                            expect(fn.calls.count()).toBe(2);
                            done();
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

        });

        describe('redirect', function () {

            var handler = jasmine.createSpy('handler');

            beforeEach(function () {
                hashController.init(handler);
                handler.calls.reset();
            });

            afterEach(function () {
                hashController.dispose();
                location.hash = '';
            });

            it('should call the handler and change the hash', function (done) {
                var path = '/abc';
                hashController.redirect(path);
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    expect(location.hash).toEqual('#' + path);
                    done();
                }, INTERVAL_TIME);
            });

            it('with query should call the handler and change the hash', function (done) {
                var path = '/abc';
                hashController.redirect(path, {name: 'treelite'});
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    expect(location.hash).toEqual('#' + path + '~name=treelite');
                    done();
                }, INTERVAL_TIME);
            });

            it('to the same path do not fire the handler repeatedly', function (done) {
                var path = '/abc';
                hashController.redirect(path);
                setTimeout(function () {
                    hashController.redirect(path);
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(1);
                        done();
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path with different query should fire the handler repeatedly', function (done) {
                var path = '/abc';
                hashController.redirect(path);
                setTimeout(function () {
                    hashController.redirect(path, {name: 'treelite'});
                    setTimeout(function () {
                        hashController.redirect(path + '~name=saber');
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(3);
                            done();
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path width `force` params should fire the handler repeatedly', function (done) {
                var path = '/abc';
                hashController.redirect(path);
                setTimeout(function () {
                    hashController.redirect(path, null, {force: true});
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(2);
                        done();
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);

            });

            it('do not change the hash while call it with `silent` param', function (done) {
                hashController.redirect('/abc', null, {silent: true});
                setTimeout(function () {
                    expect(location.hash).toEqual('');
                    done();
                }, INTERVAL_TIME);
            });

            it('fire the handler with URL param', function (done) {
                hashController.redirect('/abc~name=treelite');
                setTimeout(function () {
                    var url = handler.calls.argsFor(0)[0];
                    expect(url.getPath()).toEqual('/abc');
                    expect(url.getQuery()).toEqual({name: 'treelite'});

                    hashController.redirect('/bbb', {query: 'abc'});
                    setTimeout(function () {
                        var url = handler.calls.argsFor(1)[0];
                        expect(url.getPath()).toEqual('/bbb');
                        expect(url.getQuery()).toEqual({query: 'abc'});
                        done();
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('support relative path', function (done) {
                hashController.redirect('/a/b/c');
                setTimeout(function () {
                    hashController.redirect('d');
                    expect(handler.calls.count()).toBe(2);
                    var url = handler.calls.argsFor(1)[0];
                    expect(url.toString()).toEqual('/a/b/d');
                    setTimeout(function () {
                        hashController.redirect('../b/d');
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(2);
                            done();
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

        });

    });

});
