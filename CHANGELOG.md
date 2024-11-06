# Changes

## Version 3.13.6

- fix: move script back to its original location

## Version 3.13.5

- fix: MODULE_NOT_FOUND error #368

## Version 3.13.4

- fix: MODULE_NOT_FOUND error #368

## Version 3.13.3

- fix: MODULE_NOT_FOUND error #368

## Version 3.13.2

- fix: MODULE_NOT_FOUND error #368

## Version 3.13.1

- fix: MODULE_NOT_FOUND error #368

## Version 3.13.0

- feat: anchor link checks support HTML tags like `<a name="foo"></a>` #331 @dklimpel
- ✨ add support for additional test reporters #364 @dudeofawesome
- feat: support iterate link check over directories in CLI #334 @dklimpel
- Update hook names #366 @henrygerardmoore
- chore(deps): remove lodash #332 @dklimpel
- fix: add used `@eslint/js` to dev dependencies in package.json #330 @dklimpel
- fix: remove not used const url #329 @dklimpel
- feat: add support for unicode characters in anchor links #328 @dklimpel
- docs(readme): explain named regex groups in replacementPatterns #327 @AndreyNautilus
- ci: bump nodejs #367 @dklimpel
- update dependencies

## Version 3.12.2

- fix status badge in README by @dklimpel in https://github.com/tcort/markdown-link-check/pull/303
- enable skipped tests for hash links by @dklimpel in https://github.com/tcort/markdown-link-check/pull/306
- chore: Upgrade to ESLint 9 by @nschonni in https://github.com/tcort/markdown-link-check/pull/318
- Check GitHub markdown section links by @rkitover in https://github.com/tcort/markdown-link-check/pull/312
- docs: add example for GitLab pipeline by @dklimpel in https://github.com/tcort/markdown-link-check/pull/309
- ci: Use matrix for cross-OS testing by @nschonni in https://github.com/tcort/markdown-link-check/pull/307

## Version 3.12.1

- fix: fix crash #297 @CanadaHonk
- Set `ipv4first` for tests in CI @dklimpel
- Bump node for release @dklimpel

## Version 3.12.0

- feat: add basic ignore subpaths argument @CanadaHonk
- feat: add global option to replacementPatterns @CanadaHonk
- refactor: replace url.parse with new URL @CanadaHonk
- docs: update readme to be clearer for projectBaseUrl opt @nwcm
- feat: Add support to load md files via proxy @dklimpel
- chore: upgrade dependencies

## Version 3.11.2

* chore(deps-dev): bump eslint from 8.38.0 to 8.39.0 (@dependabot)
* fixed the error when there is no --config option (@mkusaka)
* chore(deps): bump commander from 10.0.0 to 10.0.1 (@dependabot)
* Updated elgohr/Publish-Docker-Github-Action to a supported version (v5) (@elgohr)
* chore: upgrade dependencies (@tcort)

## Version 3.11.1

* fix:Config-file-and-others-options-ignored (@kevinvalleau)
* chore(deps-dev): bump eslint from 8.35.0 to 8.38.0 (@dependabot)

## Version 3.11.0

* tests: add test for link to a header with special character #227 (@kayman-mk)
* fix: make --quiet flag only output errors #230 (@tcrasset)
* feat: Add CLI arg for projectBaseUrl #232 (@pvallone)
* chore: Add Dependabot for version updates #234 (@nschonni)
* ci: Add current Node versions to matrix build #235 (@nschonni)
* ci: Remove disabled Docker workflow #242 (@nschonni)
* chore: Convert JSHint to ESLint #243 (@nschonni)
* ci: Use array for release type schema #244 (@nschonni)
* docs: Add how to run as pre-commit to README #245 (@vorburger)
* chore: upgrade dependencies (@tcort)
* fix: broken link in `README.md` (@tcort)

## Version 3.10.3

* upgrade dependencies

## Version 3.10.2

* fix missing dependency

## Version 3.10.1

* upgrade dependencies
* fix anchor regressions (@reyang)
* fix ci build (@chenrui333 @ nschonni)

## Version 3.10.0

* #91 check anchor links.

## Version 3.9.3

* #184 fix issue with config loading.  (@kenji-miyake)

## Version 3.9.2

* #182 fix issue with markdown-link-check utility.  set baseUrl for each file. (@kenji-miyake)

## Version 3.9.1

* #78/#179 support multi inputs (@kenji-miyake)
* #181 Update marked and markdown-link-extractor dependencies. (@tcort)

## Version 3.9.0

* #149 add -V, --version command line flags (@tcort)
* #164 indent console output (@brandones)
* #170 pre-commit support (@janosh)
* #173 update docs (@karl-johan-grahn)
* #174 Symlink executable into PATH (@carlsmedstad)
* #177 upgrade command line tool from request to needle (@tcort)

## Version 3.8.8

* Update docs with respect to recursive scan

## Version 3.8.7

* update dependencies #161

## Version 3.8.6

* support env vars in http headers (#146)
* add `{{BASEURL}}` as replacement pattern (#145)

## Version 3.8.5

* #142 update link-check dependency

## Version 3.8.4

* #106 / #114 / #126 better 429 handling
* #129 / #135 add timeout option
* #122 fix typo
* #139 add other tools and linters
* #121 / #132 github actions
* #110 / #127 / #113 / #133 / #140 docker images 
* update dependencies

## Version 3.8.3

* update dependencies (Fixes #86)

## Version 3.8.2

* update dependencies

## Version 3.8.1

* update dependencies
* Remove unnecessary files in the package published to npmjs #92

## Version 3.8.0

* update dependencies #81
* Surface dead links in results output #82
* Add support for disable comments #83
* Suggest `--save-dev` rather than `--save` in `README.md` #63

## Version 3.7.3

* update dependencies #74

## Version 3.7.2

* Fix fs access anti pattern #62

## Version 3.7.1

* Fix accessing fs.constants.F_OK #58

## Version 3.7.0

* Add verbose mode for showing detailed error information #55
* Fix issue with fs constants #53
* Fix invalid argument errors #54

## Version 3.6.2

* fix crash when 1st link is ignored/replaced

## Version 3.6.1

* ignore query string in links to local files

## Version 3.6.0

* replacement patterns

## Version 3.5.5

* better handling of malformed URLs and unsupported protocols.
* support RFC6068 style hfields in mailto: links.

## Version 3.5.4

* update markdown-link-extractor dependency to support image links with image size attributes

## Version 3.5.3

* docker run fixes

## Version 3.5.2

* support for parentheses in URLs

## Version 3.5.1

* don't show 'No hyperlinks found!' when quiet

## Version 3.5.0

* introduce `--quiet` mode that displays errors (dead links) only
* support for ignore patterns to skip the link check for certain links

## Version 3.4.0

* support for providing custom HTTP headers

## Version 3.3.1

* update dependencies to avoid CVE-2018-3728
