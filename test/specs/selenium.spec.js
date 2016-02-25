define(['selenium'], function(browser) {
    describe("Browser API", function() {
        beforeEach(function() {
            document.body.outerHTML = "<BODY/>";
        });

        it("should receive title after it was set via Javascript", function (done) {
            document.title = "some title";
            browser.title().then(function(title) {
                expect(title).toEqual("some title");
                done();
            });
        });

        it("should set the background to green and verify it is green", function (done) {
            document.body.style.background = "green";
            browser.canvas().then(function(ctx) {
                expect([].slice.call(ctx.getImageData(100, 100, 1, 1).data)).toEqual([0, 128, 0, 255]);
                done();
            });
        });

        it("should create an element and get it by id", function(done) {
            document.body.innerHTML = '<p id="something">ABC</p>';
            browser.element().byId('something').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                    done();
                });
            });
        });

        it("should create an element and get it by tag", function(done) {
            document.body.innerHTML = '<h1 id="something">ABC</h1>';
            browser.element().byTagName('h1').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                    done();
                });
            });
        });

        it("should create an element and get it by class", function(done) {
            document.body.innerHTML = '<h3 class="myClass" id="something">ABC</h3>';
            browser.element().byClass('myClass').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                    done();
                });
            });
        });

        it("should create an element and get it by css selector", function(done) {
            document.body.innerHTML = '<h4 class="myClass" attr="a b" id="something">ABC</h4>';
            browser.element().byCss('h4.myClass[attr~="a"]').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                    done();
                });
            });
        });

        it("should create an element and get it by name", function(done) {
            document.body.innerHTML = '<a name="someName">ABCD</a>';
            browser.element().byName('someName').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABCD');
                    done();
                });
            });
        });

        it("should create an element and get it by linkText", function(done) {
            document.body.innerHTML = '<a name="someName" href="#">ABCD</a>';
            browser.element().byLinkText('ABCD').then(function(e) {
                e.tag().then(function(tag) {
                    expect(tag).toEqual('a');
                    done();
                });
            });
        });

        it("should create an element and get it by partial link text", function(done) {
            document.body.innerHTML = '<a name="someName" href="#">ABCD</a>';
            browser.element().byPartialLinkText('ABC').then(function(e) {
                e.tag().then(function(tag) {
                    expect(tag).toEqual('a');
                    done();
                });
            });
        });

        it("should create two elements and get them with the elements function", function(done) {
            document.body.innerHTML = '<a id="a">ABCD</a><a id="b">123</a>';
            browser.elements().byTagName('a').then(function(elements) {
                expect(elements.length).toBe(2);
                done();
            });
        });

        it("should try to find a non-existing element and get null", function(done) {
            document.body.innerHTML = '<h4>ABC</h4>';
            browser.element().byId('nothing').then(function(e) {
                expect(e).toBeFalsy();
                done();
            });
        });

        it("should focus an element and return it as an active element", function(done) {
            document.body.innerHTML = '<a href="#" id="a">A</a>';
            document.querySelector('a').focus();
            browser.active().then(function(e) {
                return e.tag();
            }).then(function(tag) {
                expect(tag).toEqual('a');
                done();
            });;
        });

        it("should move to an element using moveBy and make sure it is hovered", function(done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<div style="width: 100px; height: 100px; top: 0; left: 0; position: absolute" onMouseEnter="this.style.background=\'green\';"></div>';
            browser.moveBy(50, 50).then(function() {
                return browser.canvas();
            }).then(function(ctx) {
                expect([].slice.call(ctx.getImageData(50, 50, 1, 1).data)).toEqual([0, 128, 0, 255]);
                done();
            });
        });

        fit("should move to an element using moveToElement and make sure it is hovered", function(done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<div style="width: 100px; height: 100px; top: 100px; left: 0; position: absolute" onMouseEnter="this.style.background=\'green\';"></div>';
            browser.element().byTagName('DIV').then(function(element) {
                browser.moveToElement(element).then(function() {
                    return browser.canvas();
                }).then(function(ctx) {
                    expect([].slice.call(ctx.getImageData(50, 150, 1, 1).data)).toEqual([0, 128, 0, 255]);
                    done();
                });

            });
        });

        it("should set the background to green on a link click and verify it is green", function (done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<a onclick="document.body.style.background=\'green\'" id="a">HELLO</a>';
            var p = browser.element().byId('a').then(function(element) {
                element.click().then(function() {
                    setTimeout(function() {
                        browser.canvas().then(function(ctx) {
                            expect([].slice.call(ctx.getImageData(100, 100, 1, 1).data)).toEqual([0, 128, 0, 255]);
                            done();
                        });

                    }, 500);
                });
            });
        });
    });
});
