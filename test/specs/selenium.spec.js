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

        it("should set the background to green on a link double-click and verify it is green", function (done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<a ondblclick="document.body.style.background=\'green\'" id="a">HELLO</a>';
            browser
              .element().byId('a')
                .then(browser.moveToElement)
              .doubleClick()
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

        it("should clear a text input", function (done) {
            document.body.innerHTML = '<input type="text" value="abc" id="input" />';
            browser
              .element().byId('input')
              .then(function(e) {
                return e.clear().then(function() {
                  return e.attribute("value").then(function(text) {
                    expect(text).toEqual('');
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

        it("should select a checkbox after it was unselected", function(done) {
          var cb = document.createElement("INPUT");
          cb.setAttribute("type", "checkbox");
          cb.setAttribute("id", "cb");
          document.body.appendChild(cb);
          browser
              .element().byId('cb')
                .then(function(cb) {
                  return cb
                    .selected()
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

        it("should check that an element is enabled", function(done) {
            document.body.innerHTML = '<input id="a" type="text"></input>';
            browser.element().byId('a').then(function(e) {
                e.enabled().then(function(en) {
                    expect(en).toBeTruthy();
                    document.getElementById('a').setAttribute('disabled', 'disabled');
                    return e.enabled();
                }).then(function(en) {
                  expect(en).toBeFalsy();
                  return Promise.resolve();
                }).then(done);
            });
        });

        it("should check that an element is displayed", function(done) {
            document.body.innerHTML = '<div id="a" type="text">A</div><div id="b" style="opacity: 0">B</div>';
            browser.element().byId('a').then(function(e) {
                return e.displayed();
            }).then(function(en) {
              expect(en).toBeTruthy();
              return browser.element().byId('b');
            }).then(function(b) {
              return b.displayed();
            }).then(function(en) {
              expect(en).toBeFalsy();
              return Promise.resolve();
            }).then(done);
        });

        it("should check element location", function(done) {
            document.body.innerHTML = '<div id="a" type="text" style="position: absolute; left: 100px; top: 10px; display: block">&nbsp;</div>';
            browser.element().byId('a').then(function(e) {
                return e.location();
            }).then(function(loc) {
              expect(loc).toEqual({x: 100, y: 10});
              return Promise.resolve();
            }).then(done);
        });

        it("should check element size", function(done) {
            document.body.innerHTML = '<div id="a" type="text" style="position: absolute; width: 200px; height: 150px; display: block">&nbsp;</div>';
            browser.element().byId('a').then(function(e) {
                return e.size();
            }).then(function(loc) {
              expect(loc).toEqual({width: 200, height: 150});
              return Promise.resolve();
            }).then(done);
        });

        it("should check element computed style", function(done) {
            document.body.innerHTML = '<style>#a{ background: green}</style><div id="a" style="position: absolute; width: 200px; height: 150px; display: block">&nbsp;</div>';
            browser.element().byId('a').then(function(e) {
                return e.css('background-color');
            }).then(function(color) {
              expect(color).toEqual('rgba(0, 128, 0, 1)');
              return Promise.resolve();
            }).then(done);
        });

        it("should check element equality", function(done) {
          document.body.innerHTML = "<div id='a'>ABC</div><div id='c'>D</div>";
          browser
            .element().byId("a")
            .then(function(a) {
              return browser.element().byTagName("DIV").then(function(b) {
                return a.equals(b);
              }).then(function(ie) {
                expect(ie).toBeTruthy();
                return browser.element().byId("c");
              }).then(function(c) {
                return (a.equals(c)).then(function(ie) {
                  expect(ie).toBeFalsy();
                  return Promise.resolve();
                })
              });
            }).then(done);
        });

        it("should submit a form", function(done) {
          var form = document.createElement("FORM");
          form.addEventListener("submit", done);
          form.innerHTML = '<input type="text" id="a" />';
          document.body.appendChild(form);
          browser.element().byId('a').then(function(a) { return a.submit(); });
        });

        xit("should move to an element using moveBy and make sure it is hovered", function(done) {
            document.body.style.background = "red";
            document.body.innerHTML = '<div style="width: 100px; height: 100px; top: 0; left: 0; position: absolute" onMouseEnter="this.style.background=\'green\';"></div>';
            browser.moveBy(50, 50)
                .canvas(100, 100)
                .then(function(ctx) {
                    expect(ctx.pixelAt(30, 54)).toEqual(ctx.color('green'));
                })
                .then(done);
        });

        describe("with touch", function() {
          xit("should set the background to green on a link click and verify it is green", function (done) {
              document.body.style.background = "red";
              document.body.innerHTML = '<a onclick="document.body.style.background=\'green\'" id="a">HELLO</a>';
              browser
                .element().byId('a')
                  .then(function(a) {
                    return a.tap();
                  }).then(function() {
                    return browser.canvas()
                    .then(function(ctx) {
                        expect(ctx.pixelAt(100, 100)).toEqual(ctx.color("green"));
                        return Promise.resolve();
                    })
                  })
                .then(done);
          });
        })
    });
});
