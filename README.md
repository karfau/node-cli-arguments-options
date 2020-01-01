# node-cli-arguments-options

Comparing available parsers for node cli options and arguments

There are so many options and arguments for picking one of them, so I want to support making a decision based on data.

To goal is something like a mono repo, where the same checks are implemented in an executable way for each approach/lib

## What data to collect

- number of dependencies (up-to-date?) / dependents
- Features
  - code size (to support the feature)
  - execution time
- TBD (existing?) score for maintenance/community

## Contribute

Support is very welcome, please file PRs and issues for

- a lib to add for comparison (run `npx runex add.js <pkg-name>` for a starting point)
- a metric to add
- an idea where to gether data from
- data visualisation
- ...?
