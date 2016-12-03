import { expect } from "chai";
import builtinsFactory from "../../index";

var builtins = builtinsFactory.create();

describe("__dirname test suite", function() {
  describe("When resolving with __dirname", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.resolve(meta));

    describe("and module name is __dirname", () => {
      beforeEach(() => {
        meta = {
          name: "__dirname"
        };

        act();
      });

      it("then result is undefined", () => {
        expect(result).to.be.undefined;
      });
    });
  });

  describe("When transform source with __dirname", () => {
    var act, meta, result;

    beforeEach(() => act = () => result = builtins.transform(meta));

    describe("And the source has __dirname and a directory", () => {
      beforeEach(() => {
        meta = {
          directory: "test/path",
          source: " __dirname "
        };

        act();
      });

      it("then the result is an object", () => {
        expect(result).to.be.an("object");
      });

      it("then the result.source has __dirname injected", () => {
        expect(result.source).to.be.equal("(function(__dirname) {\n __dirname \n})(\'/test/path\')");
      });
    });

    describe("And the source has __dirname but no directory", () => {
      beforeEach(() => {
        meta = {
          source: " __dirname "
        };
      });

      it("then an exception is thrown", () => {
        expect(act).to.throw(Error);
      });
    });

    describe("And the source does not have __dirname", () => {
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

