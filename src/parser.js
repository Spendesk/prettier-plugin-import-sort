const parser = require("prettier/parser-typescript");
const typescript = require("typescript");

function parseImports(code) {
  const host = {
    fileExists: () => true,
    readFile: () => "",

    getSourceFile: () => {
      return typescript.createSourceFile(
        "",
        code,
        typescript.ScriptTarget.Latest,
        true
      );
    },

    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: () => null,
    getCurrentDirectory: () => "",
    getDirectories: () => [],
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => typescript.sys.newLine,
  };

  const program = typescript.createProgram(
    ["foo.ts"],
    {
      noResolve: true,
      target: typescript.ScriptTarget.Latest,
      experimentalDecorators: true,
      experimentalAsyncFunctions: true,
    },
    host
  );

  const sourceFile = program.getSourceFile("foo.ts");

  if (!sourceFile) {
    throw new Error("Source file not found. This should not happen.");
  }

  const imports = [];

  typescript.forEachChild(sourceFile, (node) => {
    switch (node.kind) {
      case typescript.SyntaxKind.ImportDeclaration: {
        const parsed = parseImportDeclaration(code, sourceFile, node);

        if (parsed) {
          imports.push(parsed);
        }

        break;
      }
      case typescript.SyntaxKind.ImportEqualsDeclaration: {
        break;
      }
      default: {
        break;
      }
    }
  });

  return imports;
}

function parseImportDeclaration(code, sourceFile, importDeclaration) {
  const firstJestMockPosition = code.indexOf("jest.mock");

  const importStart =
    importDeclaration.pos + importDeclaration.getLeadingTriviaWidth();
  const importEnd = importDeclaration.end;

  if (firstJestMockPosition !== -1 && firstJestMockPosition < importStart) {
    return null;
  }

  let start = importStart;
  let end = importEnd;

  const leadingComments = getComments(sourceFile, importDeclaration, false);
  const trailingComments = getComments(sourceFile, importDeclaration, true);

  if (leadingComments) {
    const comments = leadingComments;

    let current = leadingComments.length - 1;
    let previous;

    while (comments[current] && comments[current].end + 1 === start) {
      if (
        code
          .substring(comments[current].pos, comments[current].end)
          .startsWith("#!")
      ) {
        break;
      }

      previous = current;
      start = comments[previous].pos;
      current -= 1;
    }
  }

  if (trailingComments) {
    const comments = trailingComments;

    let current = 0;
    let previous;

    while (comments[current] && comments[current].pos - 1 === end) {
      // TODO: Why is this not needed?
      // if (comments[current].loc.start.line !== node.loc.start.line) {
      //   break;
      // }

      previous = current;
      ({ end } = comments[previous]);
      current += 1;
    }
  }

  const type = "import";

  const moduleName = importDeclaration.moduleSpecifier
    .getText()
    .replace(/["']/g, "");

  const imported = {
    start,
    end,
    importStart,
    importEnd,
    type,
    moduleName,
    namedMembers: [],
  };

  const { importClause } = importDeclaration;

  if (importClause) {
    if (importClause.name) {
      imported.defaultMember = importClause.name.text;
    }

    const { namedBindings } = importClause;

    if (namedBindings) {
      if (namedBindings.kind === typescript.SyntaxKind.NamespaceImport) {
        const namespaceImport = namedBindings;
        imported.namespaceMember = namespaceImport.name.text;
      }

      if (namedBindings.kind === typescript.SyntaxKind.NamedImports) {
        const namedImports = namedBindings;

        for (const element of namedImports.elements) {
          const alias = element.name.text;
          let name = alias;

          if (element.propertyName) {
            name = element.propertyName.text;
          }

          imported.namedMembers.push({
            name: fixMultipleUnderscore(name),
            alias: fixMultipleUnderscore(alias),
          });
        }
      }
    }
  }

  return imported;
}

// This hack circumvents a bug (?) in the TypeScript parser where a named
// binding's name or alias that consists only of underscores contains an
// additional underscore. We just remove the superfluous underscore here.
//
// See https://github.com/renke/import-sort/issues/18 for more details.
function fixMultipleUnderscore(name) {
  if (name.match(/^_{2,}$/)) {
    return name.substring(1);
  }

  return name;
}

// Taken from https://github.com/fkling/astexplorer/blob/master/src/parsers/js/typescript.js#L68
function getComments(sourceFile, node, isTrailing) {
  if (node.parent) {
    const nodePos = isTrailing ? node.end : node.pos;
    const parentPos = isTrailing ? node.parent.end : node.parent.pos;

    if (
      node.parent.kind === typescript.SyntaxKind.SourceFile ||
      nodePos !== parentPos
    ) {
      let comments;

      if (isTrailing) {
        comments = typescript.getTrailingCommentRanges(
          sourceFile.text,
          nodePos
        );
      } else {
        comments = typescript.getLeadingCommentRanges(sourceFile.text, nodePos);
      }

      if (Array.isArray(comments)) {
        return comments;
      }
    }
  }

  return undefined;
}

function formatImport(code, imported, eol = "\n") {
  const importStart = imported.importStart || imported.start;
  const importEnd = imported.importEnd || imported.end;

  const importCode = code.substring(importStart, importEnd);

  const { namedMembers } = imported;

  if (namedMembers.length === 0) {
    return code.substring(imported.start, imported.end);
  }

  const newImportCode = importCode.replace(
    /\{[\s\S]*\}/g,
    (namedMembersString) => {
      const useMultipleLines = namedMembersString.indexOf(eol) !== -1;

      let prefix;

      if (useMultipleLines) {
        [prefix] = namedMembersString.split(eol)[1].match(/^\s*/);
      }

      const useSpaces = namedMembersString.charAt(1) === " ";

      const userTrailingComma = namedMembersString
        .replace("}", "")
        .trim()
        .endsWith(",");

      return formatNamedMembers(
        namedMembers,
        useMultipleLines,
        useSpaces,
        userTrailingComma,
        prefix,
        eol
      );
    }
  );

  return (
    code.substring(imported.start, importStart) +
    newImportCode +
    code.substring(importEnd, importEnd + (imported.end - importEnd))
  );
}

function formatNamedMembers(
  namedMembers,
  useMultipleLines,
  useSpaces,
  useTrailingComma,
  prefix,
  eol = "\n"
) {
  if (useMultipleLines) {
    return (
      "{" +
      eol +
      namedMembers
        .map(({ name, alias }, index) => {
          const lastImport = index === namedMembers.length - 1;
          const comma = !useTrailingComma && lastImport ? "" : ",";

          if (name === alias) {
            return `${prefix}${name}${comma}` + eol;
          }

          return `${prefix}${name} as ${alias}${comma}` + eol;
        })
        .join("") +
      "}"
    );
  }

  const space = useSpaces ? " " : "";
  const comma = useTrailingComma ? "," : "";

  return (
    "{" +
    space +
    namedMembers
      .map(({ name, alias }) => {
        if (name === alias) {
          return `${name}`;
        }

        return `${name} as ${alias}`;
      })
      .join(", ") +
    comma +
    space +
    "}"
  );
}

module.exports = {
  parseImports,
  formatImport,
};
