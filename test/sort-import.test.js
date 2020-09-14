const organizeImports = require("../src/index").organizeImports;

describe(`Custom sort import`, () => {
  describe(`organizeImports()`, () => {
    it(`should leave imports after jest.mocks in their place`, () => {
      const originalFileContent = `import b from "b-dep";

jest.mock("some-dep");

import a from "a-dep";
`;
      const result = organizeImports(originalFileContent);

      expect(result).toEqual(originalFileContent);
    });
  });
});
