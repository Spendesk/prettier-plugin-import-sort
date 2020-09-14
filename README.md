# prettier-plugin-import-sort

This is [Prettier] plugin to sort imports using [import-sort] for typescript files. Based on [this package](https://github.com/ggascoigne/prettier-plugin-import-sort).

As of the first iteration, the 3 files in `src/` are directly lifted from both `renke/import-sort` and `ggascoigne/prettier-plugin-import-sort`. Here's the match for these files:

- `index.js` -> [https://github.com/ggascoigne/prettier-plugin-import-sort/blob/master/src/index.js](https://github.com/ggascoigne/prettier-plugin-import-sort/blob/master/src/index.js)
- `parser.js` -> [https://github.com/renke/import-sort/blob/master/packages/import-sort-parser-typescript/src/index.ts](https://github.com/renke/import-sort/blob/master/packages/import-sort-parser-typescript/src/index.ts)
- `style.js` -> [https://github.com/renke/import-sort/blob/master/packages/import-sort-style-module/src/index.ts](https://github.com/renke/import-sort/blob/master/packages/import-sort-style-module/src/index.ts)

## Working with Jest mocks

In some tests, when we need to rely on `jest.mock()` for some modules, we sometimes need to place imports specifically after the `jest.mock()` calls. The default behavior of `sort-import` breaks that, so we added a workaround to ignore `import` statements after the first `jest.mock()` call. In future, we might support ordering imports after `jest.mock()` calls as a group.

[prettier]: https://github.com/prettier/prettier
[import-sort]: https://github.com/renke/import-sort
[prettier-plugin-import-sort]: https://github.com/ggascoigne/prettier-plugin-import-sort
