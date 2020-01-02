# node-cli-arguments-options

Comparing available parsers for node cli options and arguments

There are so many options and arguments for picking one of them, so I want to support making a decision based on data.

To goal is something like a mono repo, where the same checks are implemented in an executable way for each approach/lib

## What data to collect

**Dependencies:**
- list of dependencies
  - outdated ones
  - size of all packages to download
- usage inside the packages in this repo

**Features:** (not sure about the format yet)
- code size (to support the feature)
- execution time (TBD, persisting them is causing to many changes)

**Ideas**  
- TBD availability of type definitions (quality/completeness ?)
- TBD (existing?) score for maintenance/community

## Contribute

Run `npm i` to get started with code changes, it also set's up all the sub folders.

Support is very welcome, please file PRs and issues for

- a lib to add for comparison (run `npm run add <pkg-name>` for a starting point)
- a metric to add (see `about.js` that writes to `pkg/about.json` as an example)
- an idea where to gather data from ([file an issue](https://github.com/karfau/runex/issues/new))
- data visualisation
- ...?
