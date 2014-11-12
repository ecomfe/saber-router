define(function (require) {
    var router = require('saber-router');

    it('monitor history back', function (done) {
        var fn1 = jasmine.createSpy('fn1');
        var fn2 = jasmine.createSpy('fn2');
        router.add('/test/runner.html', fn1);
        router.add('/detail', fn2);

        router.start();
        router.redirect('/detail');

        history.back();
        setTimeout(function () {
            expect(fn1.calls.count()).toBe(2);
            expect(fn2.calls.count()).toBe(1);
            history.forward();
            setTimeout(function () {
                expect(fn1.calls.count()).toBe(2);
                expect(fn2.calls.count()).toBe(2);
                history.replaceState({}, '', '/test/runner.html');
                done();
            }, 100)
        }, 100);
    });
});
