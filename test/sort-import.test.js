const organizeImports = require("../src/index").organizeImports;

describe(`Custom sort import`, () => {
  describe(`organizeImports()`, () => {
    it(`should reorder imports`, () => {
      const originalFileContent = `import b from "b-dep";
import a from "a-dep";
import {z, d} from "c-dep";
import {type foo, baz, type bar} from "z-dep";
`;
      const result = organizeImports(originalFileContent);

      expect(result).toEqual(`import a from "a-dep";
import b from "b-dep";
import {d, z} from "c-dep";
import {baz, type bar, type foo} from "z-dep";
`);
    });

    it(`should leave imports after jest.mock in their place`, () => {
      const originalFileContent = `import b from "b-dep";

jest.mock("some-dep");

import a from "a-dep";
`;
      const result = organizeImports(originalFileContent);

      expect(result).toEqual(originalFileContent);
    });
  });
});
