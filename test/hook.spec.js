var hook = process.env.JS_COV ? require("../lib-cov") : require("../lib"),
    expect = require("expect.js");


describe("sails-hook-routefactory test suite", function() {

  var sails,
      bound_routes;

  beforeEach(function() {
    sails = { config: {} };
    bound_routes = {};

    sails.after = function(deps, cb) { cb(); }
    sails.router = {};
    sails.router.bind = function(path, target) { bound_routes[path] = target; };
  });

  describe("when sails.config.routefactory is a function", function() {

    var sequence,
        routes;

    function factory(gen) {
      sequence(gen);
    }

    function finished(err, registered_routes) {
      routes = registered_routes;
    }

    function lookup(method_path) {
      var route_count = routes ? (routes.length ? routes.length : 0) : 0,
          parts = method_path.split(" "),
          route = null,
          method = parts[0],
          path = parts[1];


      for(var i = 0; i < route_count; i++) {
        var r = routes[i],
            m = r.method === method && r.path == path;

        if(m) route = r;
      }

      return route ? route.target : void 0;
    }

    beforeEach(function() {
      sails.config.routefactory = factory;
      sequence = null;
      registered_routes = null;
    });

    it("should bind \"GET /stuff\" on factory.get", function() {
      sequence = function(gen) {
        gen.get("/stuff", "StuffController.index");
      };

      hook(sails).initialize(finished);
      expect(lookup("GET /stuff")).to.be("StuffController.index");
    });

    it("should bind \"POST /stuff\" on factory.post", function() {
      sequence = function(gen) {
        gen.post("/stuff", "StuffController.create");
      };

      hook(sails).initialize(finished);

      expect(lookup("POST /stuff")).to.equal("StuffController.create");
    });

    it("should bind \"DELETE /stuff\" on factory.destroy", function() {
      sequence = function(gen) {
        gen.destroy("/stuff", "StuffController.destroy");
      };

      hook(sails).initialize(finished);

      expect(lookup("DELETE /stuff")).to.equal("StuffController.destroy");
    });

    it("should bind \"PATCH /stuff\" on factory.patch", function() {
      sequence = function(gen) {
        gen.patch("/stuff", "StuffController.update");
      };

      hook(sails).initialize(finished);

      expect(lookup("PATCH /stuff")).to.equal("StuffController.update");
    });

    describe("when using the resource function", function() {

      describe("when using no extras", function() {

        beforeEach(function() {
          sequence = function(gen) {
            gen.resource("users", "UserController");
          }
        });

        it("should bind \"POST /users\" to \"UserController.create\"", function() {
          hook(sails).initialize(finished);
          expect(lookup("POST /users")).to.be("UserController.create");
        });

        it("should bind \"GET /users\" to \"UserController.find\"", function() {
          hook(sails).initialize(finished);
          expect(lookup("GET /users")).to.equal("UserController.find");
        });

        it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
          hook(sails).initialize(finished);
          expect(lookup("GET /users/:id")).to.equal("UserController.findOne");
        });

        it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
          hook(sails).initialize(finished);
          expect(lookup("PATCH /users/:id")).to.equal("UserController.update");
        });

        it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
          hook(sails).initialize(finished);
          expect(lookup("DELETE /users/:id")).to.equal("UserController.destroy");
        });

        describe("when using extras", function() {

          var extras;

          beforeEach(function() {
            extras = {};
            sequence = function(gen) {
              gen.resource("users", "UserController", extras);
            }
          });

          describe("using an \"excludes\" array", function() {

            describe("[\"create\"]", function() {

              beforeEach(function() {
                extras.excludes = ["create"];
              });

              it("should NOT bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be(undefined);
              });

              it("should bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be("UserController.find");
              });

              it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.equal("UserController.findOne");
              });

              it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.equal("UserController.update");
              });

              it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.equal("UserController.destroy");
              });

            });

            describe("[\"find\"]", function() {

              beforeEach(function() {
                extras.excludes = ["find"];
              });

              it("should bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.equal("UserController.create");
              });

              it("should NOT bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be(undefined);
              });

              it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.equal("UserController.findOne");
              });

              it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.equal("UserController.update");
              });

              it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.equal("UserController.destroy");
              });

            });

            describe("[\"findOne\"]", function() {

              beforeEach(function() {
                extras.excludes = ["findOne"];
              });

              it("should bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be("UserController.create");
              });

              it("should bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be("UserController.find");
              });

              it("should NOT bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be(undefined);
              });

              it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.equal("UserController.update");
              });

              it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.equal("UserController.destroy");
              });

            });

            describe("[\"update\"]", function() {

              beforeEach(function() {
                extras.excludes = ["update"];
              });

              it("should bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be("UserController.create");
              });

              it("should bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be("UserController.find");
              });

              it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be("UserController.findOne");
              });

              it("should NOT bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be(undefined);
              });

              it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be("UserController.destroy");
              });

            });

            describe("[\"destroy\"]", function() {

              beforeEach(function() {
                extras.excludes = ["destroy"];
              });

              it("should bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be("UserController.create");
              });

              it("should bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be("UserController.find");
              });

              it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be("UserController.findOne");
              });

              it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.equal("UserController.update");
              });

              it("should NOT bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be(undefined);
              });

            });

          });

          describe("using an \"only\" array", function() {

            describe("[\"create\"]", function() {

              beforeEach(function() {
                extras = {};
                extras.only = ["create"];
              });

              it("should bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be("UserController.create");
              });

              it("should NOT bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be(undefined);
              });

              it("should NOT bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be(undefined);
              });

            });

            describe("[\"find\"]", function() {

              beforeEach(function() {
                extras.only = ["find"];
              });

              it("should NOT bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be(undefined);
              });

              it("should bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be("UserController.find");
              });

              it("should NOT bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be(undefined);
              });

            });

            describe("[\"findOne\"]", function() {

              beforeEach(function() {
                extras.only = ["findOne"];
              });

              it("should NOT bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be(undefined);
              });

              it("should NOT bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be(undefined);
              });

              it("should bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be("UserController.findOne");
              });

              it("should NOT bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be(undefined);
              });

            });

            describe("[\"update\"]", function() {

              beforeEach(function() {
                extras.only = ["update"];
              });

              it("should NOT bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be(undefined);
              });

              it("should NOT bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be(undefined);
              });

              it("should NOT bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be(undefined);
              });

              it("should bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be("UserController.update");
              });

              it("should NOT bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be(undefined);
              });

            });

            describe("[\"destroy\"]", function() {

              beforeEach(function() {
                extras.only = ["destroy"];
              });

              it("should NOT bind \"POST /users\" to \"UserController.create\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("POST /users")).to.be(undefined);

              });

              it("should NOT bind \"GET /users\" to \"UserController.find\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users")).to.be(undefined);
              });

              it("should NOT bind \"GET /users/:id\" to \"UserController.findOne\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("GET /users/:id")).to.be(undefined);
              });

              it("should NOT bind \"PATCH /users/:id\" to \"UserController.update\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("PATCH /users/:id")).to.be(undefined);
              });

              it("should bind \"DELETE /users/:id\" to \"UserController.destroy\"", function() {
                hook(sails).initialize(finished);
                expect(lookup("DELETE /users/:id")).to.be("UserController.destroy");
              });

            });

          });

        });

      });

    });

  });

});
