/**
 * @file router测试用例
 * @author treelite(c.xinle@gmail.com)
 */

define(function (require) {
    var router = require('saber-router');

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
                hadThrowed = true;
            }

            expect(hadThrowed).toBeTruthy();
        });

        describe('has', function () {
            it('one handler, without `thisArg`', function () {
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

            it('one handler, multi call with the same querystring', function () {
                var called = 0;
                router.add('/', function () {
                    called++;
                });

                router.redirect('/');
                router.redirect('/');
                router.redirect('/');

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

            it('one handler, force call with the same querystring', function () {
                var called = 0;

                router.add('/', function () {
                    called++;
                });

                router.redirect('/');
                router.redirect('/');
                router.redirect('/', true);

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

                var exception;
                try {
                    router.redirect('/add');
                }
                catch (e) {
                    exception = true;
                }

                expect(exception).toBeTruthy();
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
            router.index = '/';
            location.hash = '';
        });

        it('use `router.index` as default home path', function () {
            var defCalled;
            var called;

            router.index = '/index';

            router.add('/', function () {
                defCalled = true;
            });

            router.add('/index', function () {
                called = true;
            });

            router.start();

            expect(defCalled).toBeFalsy();
            expect(called).toBeTruthy();
        });

        it('absolute path', function () {
            var called;

            router.add('/', function () {});

            router.add('/index', function () {
                called = true;
            });

            router.start();

            location.hash = '#/index';

            waitsFor(
                function () {
                    return called;
                }, 
                'timeout',
                500
            );

            runs(function () {
                expect(called).toBeTruthy(); 
            });
        });

        it('absolute path width query', function () {
            var called;
            var querystring;

            router.add('/', function () {});

            router.add('/index', function (url, query) {
                called = true;
                querystring = query;
            });

            router.start();

            location.hash = '#/index~uid=100';

            waitsFor(
                function () {
                    return called;
                }, 
                'timeout',
                500
            );

            runs(function () {
                expect(called).toBeTruthy(); 
                expect(querystring).toEqual({uid: '100'}); 
            });
        });

        it('relative path', function () {
            var called;

            router.index = '/work/list';
            router.add('/work/list', function () {});
            router.add('/index', function () {
                called = true;
            });

            router.start();

            location.hash = '#./../index';

            waitsFor(
                function () {
                    return called;
                }, 
                'timeout',
                500
            );

            runs(function () {
                expect(called).toBeTruthy(); 
            });
        });

        it('same path do not fire twice', function () {
            var called = 0;

            router.add('/', function () {});
            router.add('/index', function () {
                called++;
            });

            router.start();
                
            location.hash = '#/index';

            var tick = new Date();
            waitsFor(
                function () {
                    var now = new Date();
                    return now.getTime() - tick.getTime() > 400;
                }, 
                'timeout', 
                500
            );

            runs(function () {
                location.hash = '#/index';
            });

            tick = new Date();
            waitsFor(
                function () {
                    var now = new Date();
                    return now.getTime() - tick.getTime() > 400;
                },
                'timeout',
                500
            );

            runs(function () {
                expect(called).toBe(1);
            });

        });

    });
});
