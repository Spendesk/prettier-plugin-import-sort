# prettier-plugin-import-sort

This is [Prettier] plugin to sort imports using [import-sort] for typescript files. Based on [this package](https://github.com/ggascoigne/prettier-plugin-import-sort).

As of the first iteration, the 3 files in `src/` are directly lifted from both `renke/import-sort` and `ggascoigne/prettier-plugin-import-sort`. Here's the match for these files:

- `index.js` -> [https://github.com/ggascoigne/prettier-plugin-import-sort/blob/master/src/index.js](https://github.com/ggascoigne/prettier-plugin-import-sort/blob/master/src/index.js)
- `parser.js` -> [https://github.com/renke/import-sort/blob/master/packages/import-sort-parser-typescript/src/index.ts](https://github.com/renke/import-sort/blob/master/packages/import-sort-parser-typescript/src/index.ts)
- `style.js` -> [https://github.com/renke/import-sort/blob/master/packages/import-sort-style-module/src/index.ts](https://github.com/renke/import-sort/blob/master/packages/import-sort-style-module/src/index.ts)

## Style

The imports are sorted in two groups, separated by a blank line:

1. Effectful imports (`import "my-module";`)
2. Regular imports (`import x from "y";`)

Inside those groups, imports are sorted like so:

1. Absolute imports (`import x from "y";`)
2. Relative imports (`import a from "../a";` or `import {apples} from "./fruits";`)

Inside the regular imports, the imports are sorted alphabetically. Here's an example:

```ts
// Effectful imports are only sorted with absolute and local
import "c";

import "./b";
import "./a";

// Regular imports are sorted with absolute first, then local
// Inside those groups, the order is alphabetical
import someDep from "an-absolute-dep";
import someOtherDep from "some-other-absolute-dep";
// Inside the groups {}, the members are ordered alphabetically
import { x, y, z } from "../local-dep";
```

## Working with Jest mocks

In some tests, when we need to rely on `jest.mock()` for some modules, we sometimes need to place imports specifically after the `jest.mock()` calls. The default behavior of `sort-import` breaks that, so we added a workaround to ignore `import` statements after the first `jest.mock()` call. In future, we might support ordering imports after `jest.mock()` calls as a group.

[prettier]: https://github.com/prettier/prettier
[import-sort]: https://github.com/renke/import-sort
[prettier-plugin-import-sort]: https://github.com/ggascoigne/prettier-plugin-import-sort


## Running the plugin's tests

Since we want to use the installed `prettier` and `typescript` versions, and not add a new version as a dependency when using this plugin, those are listed as `peerDependencies`. This means that, when cloning this repository and running `yarn`, they won't get installed. `yarn test` will then fail.

In order to run `yarn test` locally, one needs to copy the `prettier` and `typescript` lines from `peerDependencies` to `devDependencies` and run `yarn` again. Don't forget to remove these lines before committing! This is a well known issue that [many have been asking the yarn team to solve](https://github.com/yarnpkg/yarn/issues/1503).

