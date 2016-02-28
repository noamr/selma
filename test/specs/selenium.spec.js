define(['selenium'], function(browser) {
    describe("Browser API", function() {
        beforeEach(function() {
            document.body.outerHTML = "<BODY/>";
        });

        it("should receive title after it was set via Javascript", function (done) {
            document.title = "some title";
            browser.title().then(function(title) {
                expect(title).toEqual("some title");
            }).then(done);
        });

        it("should set the background to green and verify it is green", function (done) {
            document.body.style.background = "green";
            browser.canvas().then(function(ctx) {
                expect(ctx.pixelAt(100, 100)).toEqual(ctx.color('green'));
            }).then(done);
        });

        it("should create an element and get it by id", function(done) {
            document.body.innerHTML = '<p id="something">ABC</p>';
            browser.element().byId('something').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                }).then(done);
            });
        });

        it("should create an element and get it by tag", function(done) {
            document.body.innerHTML = '<h1 id="something">ABC</h1>';
            browser.element().byTagName('h1').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                }).then(done);
            });
        });

        it("should create an element and get it by class", function(done) {
            document.body.innerHTML = '<h3 class="myClass" id="something">ABC</h3>';
            browser.element().byClass('myClass').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                }).then(done);
            });
        });

        it("should create an element and get it by css selector", function(done) {
            document.body.innerHTML = '<h4 class="myClass" attr="a b" id="something">ABC</h4>';
            browser.element().byCss('h4.myClass[attr~="a"]').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                }).then(done);
            });
        });

        it("should create an element and get it by name", function(done) {
            document.body.innerHTML = '<a name="someName">ABCD</a>';
            browser.element().byName('someName').then(function(e) {
                e.text().then(function(text) {
                    expect(text).toEqual('ABCD');
                }).then(done);
            });
        });

        it("should create an element and get it by linkText", function(done) {
            document.body.innerHTML = '<a name="someName" href="#">ABCD</a>';
            browser.element().byLinkText('ABCD').then(function(e) {
                e.tag().then(function(tag) {
                    expect(tag).toEqual('a');
                }).then(done);
            });
        });

        it("should create an element and get it by partial link text", function(done) {
            document.body.innerHTML = '<a name="someName" href="#">ABCD</a>';
            browser.element().byPartialLinkText('ABC').then(function(e) {
                e.tag().then(function(tag) {
                    expect(tag).toEqual('a');
                }).then(done);
            });
        });

        it("should create two elements and get them with the elements function", function(done) {
            document.body.innerHTML = '<a id="a">ABCD</a><a id="b">123</a>';
            browser.elements().byTagName('a').then(function(elements) {
                expect(elements.length).toBe(2);
            }).then(done);
        });

        it("should try to find a non-existing element and get null", function(done) {
            document.body.innerHTML = '<h4>ABC</h4>';
            browser.element().byId('nothing').then(function(e) {
                expect(e).toBeFalsy();
            }).then(done);
        });

        it("should focus an element and return it as an active element", function(done) {
            document.body.innerHTML = '<a href="#" id="a">A</a>';
            document.querySelector('a').focus();
            browser
              .active()
              .then(function(e) {
                return e.tag();
              })
              .then(function(tag) {
                  expect(tag).toEqual('a');
              })
              .then(done);
        });

        it("should move to an element using moveBy and make sure it is hovered", function(done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<div style="width: 100px; height: 100px; top: 0; left: 0; position: absolute" onMouseEnter="this.style.background=\'green\';"></div>';
            browser.moveBy(50, 50)
                .canvas(100, 100)
                .then(function(ctx) {
                    expect(ctx.pixelAt(30, 54)).toEqual(ctx.color('green'));
                })
                .then(done);
        });

        it("should move to an element using moveToElement and make sure it is hovered", function(done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<div id="a" style="width: 100px; height: 100px; top: 100px; position: absolute" onMouseEnter="this.style.background=\'green\';"></div>';
            browser
                .element().byTagName('DIV')
                  .then(browser.moveToElement)
                .canvas(200, 300)
                .then(function(ctx) {
                    expect(ctx.pixelAt(50, 150)).toEqual(ctx.color("green"));
                })
                .then(done);
        });

        it("should set the background to green on a link click and verify it is green", function (done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<a onclick="document.body.style.background=\'green\'" id="a">HELLO</a>';
            browser
              .element().byId('a')
                .then(browser.click)
              .canvas()
              .then(function(ctx) {
                  expect(ctx.pixelAt(100, 100)).toEqual(ctx.color("green"));
              })
              .then(done);
        });

        it("should change the backround to green on mouse down", function (done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<a onmousedown="document.body.style.background=\'green\'" id="a">HELLO</a>';
            browser
              .element().byId('a')
                .then(browser.moveToElement)
              .buttonDown()
              .canvas(100, 200)
              .then(function (ctx) {
                  expect(ctx.pixelAt(50, 150)).toEqual(ctx.color("green"));
              })
              .then(done);
        });


        it("should set keys to a text input", function (done) {
            document.body.innerHTML = '<input type="text" id="input" />';
            browser
              .element().byId('input')
              .then(function(e) {
                return e.keys(['a', 'b', 'c']).then(function() {
                  return e.attribute("value").then(function(text) {
                    expect(text).toEqual('abc');
                  });

                });
              })
              .then(done);
        });
        it("should set keys to the focused text input", function (done) {
            document.body.innerHTML = '<input type="text" id="input" />';
            document.getElementById('input').focus();
            browser
              .keys(['a', 'b', 'c'])
              .element().byId('input')
              .then(function(e) {
                  return e.attribute("value").then(function(text) {
                    expect(text).toEqual('abc');
                  });
              })
              .then(done);
        });

        it("should change the backround to green on mouse up", function (done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<a onmouseup="document.body.style.background=\'green\'" id="a">HELLO</a>';

            browser
                .element()
                  .byId('a')
                    .then(browser.moveToElement)
                  .buttonDown()
                  .buttonUp()
                  .canvas(100, 200)
                  .then(function(ctx) {
                      expect(ctx.pixelAt(50, 150)).toEqual(ctx.color("green"));
                  })
                  .then(done);
        });

        it("should get a sub element", function (done) {
            document.body.innerHTML = '<div id="a"><div id="b">ABC</div></div>';
            browser
              .element().byId('a')
              .then(function(e) {
                return e.element().byId('b').then(function(e) {
                  return e.text().then(function(text) {
                    expect(text).toEqual('ABC');
                  })
                });
              })
              .then(done);
        });

        it("should get multiple sub elements", function (done) {
            document.body.innerHTML = '<div id="a"><div id="b">ABC</div><div id="c">C</div></div><div id="d">D</D>';
            browser
              .element().byId('a')
              .then(function(e) {
                return e.elements().byTagName('DIV').then(function(e) {
                    expect(e.length).toEqual(2);
                });
              })
              .then(done);
        });

        fit("should select and unselect a checkbox", function(done) {
          var cb = document.createElement("INPUT");
          cb.setAttribute("type", "checkbox");
          cb.setAttribute("id", "cb");
          document.body.appendChild(cb);
          browser
              .element().byId('cb')
                .then(function(cb) {
                  return cb.selected()
                  .then(function(isSelected) {
                    expect(isSelected).toBeFalsy();
                    return cb.click();
                  }).then(function() {
                    return cb.selected();
                  }).then(function(s) {
                    expect(s).toBeTruthy();
                    return Promise.resolve();
                  });
              }).then(done);
        });
    });
});
