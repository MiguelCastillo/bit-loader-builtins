import { expect } from "chai";
import builtinsFactory from "../../index";
import combineSourceMap from "combine-source-map";

var builtins = builtinsFactory.create();

describe("global test suite", function() {
  describe("When resolving a module with name global", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.resolve(meta));

    describe("and the module name is global", () => {
      beforeEach(() => {
        meta = {
          name: "global"
        };

        act();
      });

      it("then result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });

  describe("When transform a module with global in its source", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.transform(meta));

    describe("and the module source has global", () => {
      beforeEach(() => {
        meta = {
          source: " global "
        };

        act();
      });

      it("then the global dependency is injected", () => {
        expect(combineSourceMap.removeComments(result.source)).to.be.equal("(function(global) {\n global \n})(typeof global !== \'undefined\' ? global : typeof self !== \'undefined\' ? self : typeof window !== \'undefined\' ? window : {})\n");
      });
    });

    describe("and the module source does not have global", () => {
      beforeEach(() => {
        meta = {
          source: " global23 "
        };

        act();
      });

      it("then result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });
});
