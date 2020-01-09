# node-cli-arguments-options

Comparing available parsers for node cli options and arguments

There are so many options and arguments for picking one of them, so I want to support making a decision based on data.

To goal is something like a mono repo, where the same checks are implemented in an executable way for each approach/lib

## What data to collect

**Dependencies:**

`npm run about [pkg ...]`: stores all collected information for each package in `<pkg>/about.json`  
(running it again later can change the result, especially when new versions come out)

- list of dependencies
  - outdated ones
  - size of all packages to download (might be higher then in reality, but it's an indicator)
- usage inside the packages in this repo
- usage inside well known and widely used tool

**(comparable) Usage Examples:**

`npm run dump [pkg ...]`: stores the output of the same commands for each package `<pkg>/dump.json`

The commands to execute are in `./dump.json`.
For this to work the `<pkg>/dump.js` file needs to be implemented.

**Features:**

`npm run test [pkg ...]` verifies the features specified in `<pkg>/features.json`.
Each of these files has to follow the JSON-Schema that is defined in `./features.json`.
There are inline comments that describe each feature.
Feel free to add one to the schema (`npm run features` will keep all the files in sync)


**Ideas**  
- code size (to support the feature)
- execution time (TBD, persisting them is causing to many changes)
- TBD availability of type definitions (quality/completeness ?)
- TBD (existing?) score for maintenance/community
<!-- 
https://stackoverflow.com/questions/34071621/query-npmjs-registry-via-api 
-->

## Contribute

Run `npm i` to get started with code changes, it also set's up all the sub folders.

Support is very welcome, please file PRs and issues for

- a lib to add for comparison (run `npm run add <pkg>` for a starting point)
- a metric to add (see `about.js` that writes to `<pkg>/about.json` as an example)
- adding a feature to compare (see `./feature.json` for the schema) 
- an idea where to gather data from ([file an issue](https://github.com/karfau/runex/issues/new))
- data visualisation (e.g. some gatsby page that allows comparison/filtering based on the existing data?)
- ...?
