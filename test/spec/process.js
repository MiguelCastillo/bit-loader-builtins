import { expect } from "chai";
import builtinsFactory from "../../index";

var builtins = builtinsFactory();

describe("process test suite", function() {
  describe("When resolving process", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.resolve(meta));

    describe("and the module name is process", () => {
      beforeEach(() => {
        meta = {
          name: "process"
        };

        act();
      });

      it("then result is an object", () => {
        expect(result).to.be.an("object");
      });

      it("then result has the path to the shimmed process module", () => {
        expect(result.path).to.contain("bit-loader-builtins/node_modules/browser-builtins/node_modules/process/browser.js");
      });
    });

    describe("and the module name is not process", () => {
      beforeEach(() => {
        meta = {
          name: "rash-desh"
        };

        act();
      });

      it("then result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });

  describe("When injecting the process module dependency", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.transform(meta));

    describe("and the module has name process source has process.nextTick", () => {
      beforeEach(() => {
        meta = {
          name: "process",
          source: " process.nextTick "
        };

        act();
      });

      it("then the result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });

    describe("and the module source has process.nextTick", () => {
      beforeEach(() => {
        meta = {
          source: " process.nextTick "
        };

        act();
      });

      it("then the dependency is properly injected", () => {
        expect(result.source).to.be.equal("(function(process) {\n process.nextTick \n})(require(\'process\'))");
      });

      it("then result has an undefined path", () => {
        expect(result.path).to.be.undefined;
      });
    });

    describe("and the module source has process.cwd", () => {
      beforeEach(() => {
        meta = {
          source: " process.cwd "
        };

        act();
      });

      it("then the dependency is properly injected", () => {
        expect(result.source).to.be.equal("(function(process) {\n process.cwd \n})(require(\'process\'))");
      });

      it("then result has an undefined path", () => {
        expect(result.path).to.be.undefined;
      });
    });

    describe("and the module source has process.platform", () => {
      beforeEach(() => {
        meta = {
          source: " process.platform "
        };

        act();
      });

      it("then the dependency is properly injected", () => {
        expect(result.source).to.be.equal("(function(process) {\n process.platform \n})(require(\'process\'))");
      });

      it("then result has an undefined path", () => {
        expect(result.path).to.be.undefined;
      });
    });

    describe("and the module source has process.somethingelse", () => {
      beforeEach(() => {
        meta = {
          name: "process",
          source: " process.somethingelse "
        };

        act();
      });

      it("then the dependency is not injected", () => {
        expect(result).to.be.undefined;
      });
    });
  });

});
