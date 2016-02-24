define(['selenium'], function(selenium) {
    describe("Selenium API", function() {
        it("should receive title after it was set via Javascript", function (done) {
            document.title = "some title";
            selenium.title().then(function(title) {
                expect(title).toEqual("some title");
                done();
            });
        });
        it("should set the background to green and verify it is green", function (done) {
            document.body.style.background = "green";
            selenium.canvas().then(function(ctx) {
                expect([].slice.call(ctx.getImageData(100, 100, 1, 1).data)).toEqual([0, 128, 0, 255]);
                done();
            });
        });
    });
});
