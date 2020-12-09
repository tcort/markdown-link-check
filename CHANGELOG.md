# Changes

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
