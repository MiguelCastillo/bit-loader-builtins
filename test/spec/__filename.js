import { expect } from "chai";
import builtinsFactory from "../../index";

var builtins = builtinsFactory.create();

describe("__filename test suite", function() {
  describe("When resolving with __filename", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.resolve(meta));

    describe("and module name is __filename", () => {
      beforeEach(() => {
        meta = {
          name: "__filename"
        };

        act();
      });

      it("then result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });

  describe("When transform source with __filename", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.transform(meta));

    describe("And the source has __filename and a path", () => {
      beforeEach(() => {
        meta = {
          path: "test/path/iii.js",
          source: " __filename "
        };

        act();
      });

      it("then the result is an object", () => {
        expect(result).to.be.an("object");
      });

      it("then the result.source has __filename injected", () => {
        expect(result.source).to.be.equal("(function(__filename) {\n __filename \n})(\'/test/path/iii.js\')");
      });
    });

    describe("And the source has __filename but no path", () => {
      beforeEach(() => {
        meta = {
          source: " __filename "
        };
      });

      it("then an exception is thrown", () => {
        expect(act).to.throw(Error);
      });
    });

    describe("And the source does not have __filename", () => {
      beforeEach(() => {
        meta = {
          source: " mmmmkay "
        };

        act();
      });

      it("then the result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });
});

