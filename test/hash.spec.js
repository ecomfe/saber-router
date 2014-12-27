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

    });

});
