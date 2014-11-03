/**
 * @file router测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var router = require('saber-router');

    var KEY_DECODE = '中文';
    var KEY_ENCODE = encodeURIComponent(KEY_DECODE);

    describe('router.redirect', function () {

        afterEach(function () {
            router.clear();
            location.hash = '';
        });

        it('no handler, throw exception', function () {
            var hadThrowed;
            try {
                router.redirect('/');
            }
            catch (e) {
                if (e.message.indexOf('route') >= 0) {
                    hadThrowed = true;
                }
                else {
                    throw e;
                }
            }

            expect(hadThrowed).toBeTruthy();
        });

        it('default handler', function () {
            var fn = jasmine.createSpy('fn');
            var handler = jasmine.createSpy('handler');
            var error;

            router.add('/test', handler);
            router.add('', fn);

            try {
                router.redirect('/test');
                router.redirect('/');
            }
            catch (e) {
                error = true;
            }

            expect(fn).toHaveBeenCalled();
            expect(handler).toHaveBeenCalled();
            expect(error).toBeFalsy();
        });

        it('default index is empty', function () {
            var fn = jasmine.createSpy('fn');

            router.add('/index', fn);

            try {
                router.redirect('/');
            }
            catch (e) {}

            expect(fn).not.toHaveBeenCalled();
        });

        it('support silent redirect', function () {
            var fn1 = jasmine.createSpy('fn1');
            var fn2 = jasmine.createSpy('fn2');

            router.add('/', fn1);
            router.add('/test', fn2);

            router.redirect('/');
            expect(fn1).toHaveBeenCalled();
            expect(location.hash).toEqual('#/');

            router.redirect('/test', null, { silent: true });
            expect(fn2).toHaveBeenCalled()
            expect(location.hash).toEqual('#/');
        });

        it('can transfer path, query, url and options', function () {
            var fn = jasmine.createSpy('fn');
            var query = {name: 'treelite'};
            var options = {more: 'str'};

            router.add('/', fn);

            router.redirect('/', null, options);

            expect(fn).toHaveBeenCalled();
            expect(fn.calls.argsFor(0)).toEqual(['/', {}, '/', options]);

            router.redirect('/', query, options);
            expect(fn.calls.argsFor(1)).toEqual(['/', query, '/~name=treelite', options]);

        });

        describe('has', function () {
            it('one handler but not found route, throw exception', function () {
                var fn = jasmine.createSpy('fn');
                var exception;
                router.add('/', fn);

                try {
                    router.redirect('/index');
                }
                catch (e) {
                    if (e.message.indexOf('route') >= 0) {
                        exception = true;
                    }
                    else {
                        throw e;
                    }
                }

                expect(exception).toBeTruthy();
                expect(fn).not.toHaveBeenCalled();
            });

            it('one handler, with `thisArg`', function () {
                var res;
                var obj = {name: 'saber'};

                router.add(
                    '/', 
                    function () {
                        res = this.name;
                    },
                    obj
                );

                router.redirect('/');

                expect(res).toBe(obj.name);
            });

            it('one handler, without querystring', function () {
                var called;
                router.add('/', function (url, query) {
                    expect(url).toBe('/');
                    expect(query).toEqual({});
                    called = true;
                });

                router.redirect('/');

                expect(called).toBeTruthy();
            });

            it('one handler, with querystring', function () {
                var called;
                router.add('/', function (url, query) {
                    expect(url).toBe('/');
                    expect(query).toEqual({uid: '100'});
                    called = true;
                });

                router.redirect('/~uid=100');

                expect(called).toBeTruthy();
            });

            it('one handler with querystring should decode', function () {
                var called;
                router.add('/', function (url, query) {
                    expect(query.name).toEqual(KEY_DECODE);
                });

                router.redirect('/~name=' + KEY_ENCODE);
                router.redirect('/', {name: KEY_ENCODE});
            });

            it('one handler, multi call with the same path', function () {
                var called = 0;
                router.add('/', function () {
                    called++;
                });

                router.redirect('/');
                router.redirect('/');
                router.redirect('/');

                expect(called).toBe(1);
            });

            it('one handler, multi call with the same querystring', function () {
                var called = 0;
                router.add('/', function () {
                    called++;
                });

                router.redirect('/~kw=w&t=10');
                router.redirect('/~t=10&kw=w');
                router.redirect('/~kw=w&t=10');

                expect(called).toBe(1);
            });

            it('one handler, multi call with defferent querystring', function () {
                var called = 0;
                router.add('/', function () {
                    called++;
                });

                router.redirect('/~uid=100');
                router.redirect('/');
                router.redirect('/~uid=200');
                router.redirect('/~name=treelite');

                expect(called).toBe(4);
            });

            it('one handler, force call with the same path', function () {
                var called = 0;

                router.add('/', function () {
                    called++;
                });

                router.redirect('/');
                router.redirect('/');
                router.redirect('/', true);

                expect(called).toBe(2);
            });

            it('one handler with query object', function () {
                router.add('/', function (url, query) {
                    expect(Object.keys(query).length).toBe(2);
                    expect(query.name).toEqual('treelite');
                    expect(query.ke).toEqual('ww');
                });

                router.redirect('/~ke=ww', {name: 'treelite'});
            });

            it('one handler, with query object and fore', function () {
                var called = 0;

                router.add('/', function (url, query) {
                    called++;
                    expect(Object.keys(query).length).toBe(1);
                    expect(query.kw).toEqual('ww');
                });

                router.redirect('/~kw=ww');
                router.redirect('/~kw=ww');
                router.redirect('/', {kw: 'ww'}, true);

                expect(called).toBe(2);
            });

            it('one handler, add the same handler will throw exception', function () {
                var hadThrowed;

                router.add('/', function () {});
                try {
                    router.add('/', function () {});
                }
                catch (e) {
                    hadThrowed = true;
                }

                expect(hadThrowed).toBeTruthy();
            });

            it('one handler with RegExp', function () {
                var called = 0;

                router.add(/^.*\.action$/, function () {
                    called++;
                });

                router.redirect('/add.action');
                router.redirect('/work/list.action');

                expect(called).toBe(2);
            });

            it('one handler with RegExp but not found route, throw exception', function () {
                var fn = jasmine.createSpy('fn');
                var exception;
                router.add(/^.*\.action$/, fn);

                try {
                    router.redirect('/index');
                }
                catch (e) {
                    if (e.message.indexOf('route') >= 0) {
                        exception = true;
                    }
                    else {
                        throw e;
                    }
                }

                expect(exception).toBeTruthy();
                expect(fn).not.toHaveBeenCalled();
            });

            it('one handler with RegExp and capturing group', function () {
                var handler = jasmine.createSpy('hander');

                router.add(new RegExp('item/([^~/]+)/comments'), handler);

                router.redirect('/item/100/comments');

                expect(handler).toHaveBeenCalled();

                var query = handler.calls.mostRecent().args[1];
                expect(query).toEqual({'$1': '100'});
            });

            it('one RESTful handler', function () {
                var handler = jasmine.createSpy('handler');

                router.add('/item/:id/comments/:page/re', handler);

                var path = '/item/100/comments/2/re';
                router.redirect(path + '~name=saber');

                expect(handler).toHaveBeenCalled();

                var url = handler.calls.mostRecent().args[0];
                var query = handler.calls.mostRecent().args[1];
                expect(url).toBe(path);
                expect(query).toEqual({id: '100', page: '2', name: 'saber'});
            });

            it('one RESTful handler, query param should decode', function () {
                router.add('/item/:name', function (url, query) {
                    expect(query.name).toEqual(KEY_DECODE);
                });

                router.redirect('/item/' + KEY_DECODE);
                router.redirect('/item/' + KEY_ENCODE);
            });

            it('two RESTful handlers', function () {
                var fn1 = jasmine.createSpy('fn1');
                var fn2 = jasmine.createSpy('fn2');

                router.add('/item/:id', fn1);
                router.add('/item/:id/detail', fn2);

                router.redirect('/item/100');
                expect(fn1).toHaveBeenCalled();
                expect(fn2).not.toHaveBeenCalled();

                router.redirect('/item/100~name=w');
                expect(fn1.calls.count()).toBe(2);
                expect(fn2).not.toHaveBeenCalled();

                router.redirect('/item/100/detail');
                expect(fn1.calls.count()).toBe(2);
                expect(fn2).toHaveBeenCalled();

                router.redirect('/item/100/detail~name=w');
                expect(fn1.calls.count()).toBe(2);
                expect(fn2.calls.count()).toBe(2);
            });

            it('two handlers, called correctly', function () {
                var first;
                var second;

                router.add('/', function () {
                    first = true;
                });

                router.add('/home', function () {
                    second = true;
                });

                router.redirect('/');

                expect(first).toBeTruthy();
                expect(second).toBeFalsy();
            });
            
            it('two RegExp handlers match the same path, only call the first handler', function () {
                var first;
                var second;

                router.add(/^.*\.action$/, function () {
                    first = true;
                });

                router.add(/^\/home\/.*\.action$/, function () {
                    second = true;
                });

                router.redirect('/home/welcome.action');

                expect(first).toBeTruthy();
                expect(second).toBeFalsy();
            });
        });
    });

    describe('router.remove', function () {

        afterEach(function () {
            router.clear();
            location.hash = '';
        });

        it('it can work', function () {
            var rootCalled;
            var homeCalled;

            router.add('/', function () {
                rootCalled = true;
            });
            
            router.add('/home', function () {
                homeCalled = true;
            });

            router.remove('/');

            var notFound;
            try {
                router.redirect('/');
            }
            catch (e) {
                notFound = true;
            }

            expect(notFound).toBeTruthy();

            router.redirect('/home');

            expect(homeCalled).toBeTruthy();
        });
    });

    describe('router.start', function () {

        afterEach(function () {
            router.stop();
            router.clear();
            location.hash = '';
        });

        it('default path is `/`', function () {
            var fn = jasmine.createSpy('fn');

            router.add('/', fn);
            router.start();

            expect(fn).toHaveBeenCalled();
        });
        
        it('absolute path', function (done) {
            var called;

            router.add('/', function () {});

            router.add('/index', function () {
                called = true;
            });

            router.start();

            location.hash = '#/index';

            setTimeout(function () {
                expect(called).toBeTruthy(); 
                done();
            }, 100);

        });

        it('absolute path width query', function (done) {
            var called;
            var querystring;

            router.add('/', function () {});

            router.add('/index', function (url, query) {
                called = true;
                querystring = query;
            });

            router.start();

            location.hash = '#/index~uid=100';

            setTimeout(function () {
                expect(called).toBeTruthy(); 
                expect(querystring).toEqual({uid: '100'}); 
                done();
            }, 100);
        });

        it('relative path', function (done) {
            var fn = jasmine.createSpy();

            router.config({
                path: '/work/list'
            });
            router.add('/work/list', function () {});
            router.add('/index', fn);

            router.start();

            location.hash = '#./../index';

            setTimeout(function () {
                expect(fn.calls.count()).toBe(1);
                expect(location.hash).toEqual('#/index');
                router.config({
                    path: '/'
                });
                done();
            }, 100);
        });

        it('same path do not fire twice', function (done) {
            var called = 0;

            router.add('/', function () {});
            router.add('/index', function () {
                called++;
            });

            router.start();
                
            location.hash = '#/index';

            setTimeout(function () {
                location.hash = '#/index';
                setTimeout(function () {
                    expect(called).toBe(1);
                    done();
                }, 100);
            }, 100);

        });

    });

    describe('router.config', function () {

        afterEach(function () {
            // reset
            router.config({
                index: '',
                path: '/'
            });

            router.clear();
            location.hash = '';
        });

        it('should set default home path', function () {
            var defCalled;
            var called;

            router.config({
                path: '/index'
            });

            router.add('/', function () {
                defCalled = true;
            });

            router.add('/index', function () {
                called = true;
            });

            router.start();

            expect(defCalled).toBeFalsy();
            expect(called).toBeTruthy();

            router.stop();
        });

        it('use `router.config` to set index name', function () {
            var fn = jasmine.createSpy('fn');

            router.config({
                index: 'index'
            });
            router.add('/index', fn);

            router.redirect('/');
            expect(fn.calls.count()).toBe(1);

            router.remove('/index');

            try {
                router.redirect('/', true);
            }
            catch (e) {}
            expect(fn.calls.count()).toBe(1);

            router.add('/', fn);
            router.redirect('/index', true);
            expect(fn.calls.count()).toBe(2);
        });

    });


    describe('router.reset', function () {

        afterEach(function () {
            router.clear();
            location.hash = '';
        });

        it('should reset the current location', function () {
            var def = jasmine.createSpy('def');
            var fn = jasmine.createSpy('fn');
            var query = {name: 'treelite'};

            router.add('/', def);
            router.add('/fn', fn);

            router.redirect('/', query);
            expect(def.calls.count()).toBe(1);
            expect(def.calls.argsFor(0)[0]).toEqual('/');
            expect(def.calls.argsFor(0)[1]).toEqual(query);

            router.reset('/fn');
            expect(fn.calls.count()).toBe(1);
            expect(location.hash).toEqual('#/fn');

            router.redirect('/fn');
            expect(fn.calls.count()).toBe(1);

            router.redirect('/fn', query);
            expect(fn.calls.count()).toBe(2);
            expect(fn.calls.argsFor(1)[0]).toEqual('/fn');
            expect(fn.calls.argsFor(1)[1]).toEqual(query);
        });

        it('support silent reset', function () {
            var def = jasmine.createSpy('def');
            var fn = jasmine.createSpy('fn');

            router.add('/', def);
            router.add('/fn', fn);

            router.redirect('/');

            router.reset('/fn', null, {silent: true});
            expect(location.hash).toEqual('#/fn');
            expect(fn.calls.count()).toEqual(0);
        });

    });
});
