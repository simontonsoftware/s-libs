- copy in remaining libs
- CI
- coveralls
- standard version
  - get features added in the other repos since release in the changelog
- release script
- update links between readmes
- rename in NPM? (and if so, publish)
- update readmes in old repos
- copy over issues
- add issue about UMD bundle names

For an individual lib:

- ng generate library --prefix-s <name>
  - run prettier
- copy in code & config from <name>
  - mark source root directories
- fix build errors
  - launch config
- get tests running
  - launch config
- see if eslint should be disabled?
- get dtslint running
  - launch config
- get typedoc running
  - launch config
  - mark the generated directory as excluded
