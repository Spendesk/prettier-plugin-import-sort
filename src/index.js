"use strict";

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

const { parsers: typescriptParsers } = _interopDefault(
  require("prettier/parser-typescript")
);
const sortImports = _interopDefault(require("import-sort"));
const parser = _interopDefault(require("./parser"));
const style = _interopDefault(require("./style"));

function throwIf(condition, message) {
  if (condition) {
    throw new Error(`prettier-plugin-import-sort:  ${message}`);
  }
}

function organizeImports(unsortedCode, extension) {
  // this throw exceptions up to prettier
  throwIf(
    !["ts", "tsx"].includes(extension),
    `No configuration found for file type ${extension}`
  );

  throwIf(!style, `No style loaded`);
  throwIf(!parser, `No parser loaded`);

  const sortResult = sortImports(
    unsortedCode,
    parser,
    style,
    `dummy${extension}`
  );

  return sortResult.code;
}

const parsers = {
  typescript: {
    ...typescriptParsers.typescript,
    preprocess(text) {
      return organizeImports(text, ".ts");
    },
  },
};

module.exports = {
  parsers,
};
