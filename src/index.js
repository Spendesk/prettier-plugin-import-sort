"use strict";

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

const { parsers: typescriptParsers } = _interopDefault(
  require("prettier/parser-typescript")
);
const sortImports = _interopDefault(require("import-sort"));
const path = _interopDefault(require("path"));

function throwIf(condition, message) {
  if (condition) {
    throw new Error(`prettier-plugin-import-sort:  ${message}`);
  }
}

function getAndCheckConfig(extension, fileDirectory) {
  const resolvedConfig = {
    config: { parser: "typescript", style: "module" },
    parser: _interopDefault(require("./parser")),
    style: _interopDefault(require("./style")),
  };

  throwIf(!resolvedConfig, `No configuration found for file type ${extension}`);

  const rawParser = resolvedConfig.config.parser;
  const rawStyle = resolvedConfig.config.style;

  throwIf(!rawParser, `No parser defined for file type ${extension}`);
  throwIf(!rawStyle, `No style defined for file type ${extension}`);

  const { parser, style } = resolvedConfig;

  throwIf(!parser, `Parser "${rawParser}" could not be resolved`);
  throwIf(
    !style || style === rawStyle,
    `Style "${rawStyle}" could not be resolved`
  );

  return resolvedConfig;
}

function organizeImports(unsortedCode, extension) {
  // this throw exceptions up to prettier
  const config = getAndCheckConfig(
    extension,
    path.resolve(__dirname, "..", "..")
  );
  const { parser, style, config: rawConfig } = config;

  const sortResult = sortImports(
    unsortedCode,
    parser,
    style,
    `dummy${extension}`,
    rawConfig.options
  );

  return sortResult.code;
}

console.log("exporting parser");

const parsers = {
  typescript: {
    ...typescriptParsers.typescript,
    preprocess(text) {
      console.log("gonna preprocess");
      return organizeImports(text, ".ts");
    },
  },
};

module.exports = {
  parsers,
};
