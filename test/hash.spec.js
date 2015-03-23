/**
 * @file hash test spec
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {

    var INTERVAL_TIME = 100;
    var controller = require('saber-router/controller/hash');

    describe('Hash Controller', function () {

        afterEach(function () {
            location.hash = '';
        });

        describe('init/dipose', function () {

            it('should apply handler with current hash', function () {
                var urlStr = '/home~name=treelite&w=1';
                location.hash = '#' + urlStr;
                var fn = jasmine.createSpy('fn');

                controller.init(fn);
                controller.dispose();

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

                controller.init(fn);

                setTimeout(function () {
                    location.hash = '#/home';
                    setTimeout(function () {
                        expect(fn.calls.count()).toBe(2);
                        controller.dispose();
                        location.hash = '#/somewhere';
                        setTimeout(function () {
                            expect(fn.calls.count()).toBe(2);
                            done();
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('should handle relative path', function (done) {
                var fn = jasmine.createSpy('fn');
                location.hash = '#/a/b/c';

                controller.init(fn);

                setTimeout(function () {
                    location.hash = '#../d';
                    setTimeout(function () {
                        expect(fn.calls.count()).toBe(2);
                        expect(location.hash).toEqual('#/a/d');
                        done();
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

        });

        describe('redirect', function () {

            var handler = jasmine.createSpy('handler');

            function finish(done) {
                controller.dispose();
                location.hash = '';
                setTimeout(done, INTERVAL_TIME);
            }

            beforeEach(function () {
                controller.init(handler);
                handler.calls.reset();
            });

            it('should call the handler and change the hash', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    expect(location.hash).toEqual('#' + path);
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('with query should call the handler and change the hash', function (done) {
                var path = '/abc';
                controller.redirect(path, {name: 'treelite'});
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    expect(location.hash).toEqual('#' + path + '~name=treelite');
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('to the same path do not fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path);
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(1);
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path with different query should fire the handler repeatedly', function (done) {
                var path = '/abc';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path, {name: 'treelite'});
                    setTimeout(function () {
                        controller.redirect(path + '~name=saber');
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(3);
                            finish(done);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('to the same path width `force` params should fire the handler repeatedly', function (done) {
                var path = '/force';
                controller.redirect(path);
                setTimeout(function () {
                    controller.redirect(path, null, {force: true});
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(2);
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);

            });

            it('do not change the hash while call it with `silent` param', function (done) {
                controller.redirect('/silent', null, {silent: true});
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    expect(location.hash).toEqual('#/');
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('fire the handler with URL param', function (done) {
                controller.redirect('/abc~name=treelite');
                setTimeout(function () {
                    var url = handler.calls.argsFor(0)[0];
                    expect(url.getPath()).toEqual('/abc');
                    expect(url.getQuery()).toEqual({name: 'treelite'});

                    controller.redirect('/bbb', {query: 'abc'});
                    setTimeout(function () {
                        var url = handler.calls.argsFor(1)[0];
                        expect(url.getPath()).toEqual('/bbb');
                        expect(url.getQuery()).toEqual({query: 'abc'});
                        finish(done);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('fire the handler with options', function (done) {
                controller.redirect('/abc', {name: 'treelite'}, {foo: 'bar'});
                setTimeout(function () {
                    var url = handler.calls.argsFor(0)[0];
                    var options = handler.calls.argsFor(0)[1];
                    expect(url.toString()).toEqual('/abc~name=treelite');
                    expect(options).toEqual({foo: 'bar'});
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('support relative path', function (done) {
                controller.redirect('/a/b/c');
                setTimeout(function () {
                    controller.redirect('d');
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(2);
                        expect(location.hash).toEqual('#/a/b/d');
                        var url = handler.calls.argsFor(1)[0];
                        expect(url.toString()).toEqual('/a/b/d');
                        controller.redirect('../b/d');
                        setTimeout(function () {
                            setTimeout(function () {
                                expect(handler.calls.count()).toBe(2);
                                expect(location.hash).toEqual('#/a/b/d');
                                finish(done);
                            }, INTERVAL_TIME);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('support empty path', function (done) {
                var url = '/a/b/c';
                var query = '~name=treelite';
                controller.redirect(url);
                setTimeout(function () {
                    controller.redirect(query);
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(2);
                        expect(location.hash).toEqual('#' + url + query);
                        controller.redirect('', {name: 'saber'});
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(3);
                            expect(location.hash).toEqual('#' + url + '~name=saber');
                            finish(done);
                        });
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

        });

        describe('reset', function () {

            var handler = jasmine.createSpy('handler');

            function finish(done) {
                controller.dispose();
                location.hash = '';
                setTimeout(done, INTERVAL_TIME);
            }

            beforeEach(function () {
                controller.init(handler);
                handler.calls.reset();
            });

            it('should call the handler and not increase history', function (done) {
                controller.redirect('/somewehre');
                setTimeout(function () {
                    controller.reset('/reset');
                    setTimeout(function () {
                        expect(location.hash).toEqual('#/reset');
                        expect(handler.calls.count()).toBe(2);
                        controller.redirect('/reset');
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(2);
                            history.back();
                            setTimeout(function () {
                                expect(location.hash).toEqual('#/');
                                expect(handler.calls.count()).toBe(3);
                                finish(done);
                            }, INTERVAL_TIME);
                        });
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });

            it('with silent param should not call the handler', function (done) {
                controller.reset('/reset', null, {silent: true});
                setTimeout(function () {
                    expect(location.hash).toEqual('#/reset');
                    expect(handler).not.toHaveBeenCalled();
                    finish(done);
                }, INTERVAL_TIME);
            });

            it('the same path do not fire handler repeatedly', function (done) {
                controller.reset('/reset');
                setTimeout(function () {
                    expect(handler.calls.count()).toBe(1);
                    controller.reset(('/reset'));
                    setTimeout(function () {
                        expect(handler.calls.count()).toBe(1);
                        location.hash = '#/somewhere';
                        setTimeout(function () {
                            expect(handler.calls.count()).toBe(2);
                            finish(done);
                        }, INTERVAL_TIME);
                    }, INTERVAL_TIME);
                }, INTERVAL_TIME);
            });
        });

    });

});
