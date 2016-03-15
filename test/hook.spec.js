var hook = require("../lib"),
    expect = require("expect.js");


describe("sails-hook-routefactory test suite", function() {

  var sails;

  beforeEach(function() {
    sails = { config: {} };

    sails.after = function(deps, cb) { cb(); }
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

    beforeEach(function() {
      sails.config.routefactory = factory;
      sequence = null;
      registered_routes = null;
    })LogLogoo;

    it("should bind \"GET /stuff\" on factory.get", function() {
      sequence = function(gen) {
        gen.get("/stuff", "StuffController.index");
      };

      hook(sails).initialize(finished);

      expect(routes["GET /stuff"]).to.equal("StuffController.index");
    });

    it("should bind \"POST /stuff\" on factory.post", function() {
      sequence = function(gen) {
        gen.post("/stuff", "StuffController.create");
      };

      hook(sails).initialize(finished);

      expect(routes["POST /stuff"]).to.equal("StuffController.create");
    });

    it("should bind \"DELETE /stuff\" on factory.destroy", function() {
      sequence = function(gen) {
        gen.destroy("/stuff", "StuffController.destroy");
      };

      hook(sails).initialize(finished);

      expect(routes["DELETE /stuff"]).to.equal("StuffController.destroy");
    });

    it("should bind \"PATCH /stuff\" on factory.patch", function() {
      sequence = function(gen) {
        gen.patch("/stuff", "StuffController.update");
      };

      hook(sails).initialize(finished);

      expect(routes["PATCH /stuff"]).to.equal("StuffController.update");
    });

  });

});
