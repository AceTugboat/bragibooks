# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.3.0](https://github.com/AceTugboat/bragibooks/compare/v1.2.3...v1.3.0) (2025-03-08)


### Features

* :lipstick: add versions to footer ([0969087](https://github.com/AceTugboat/bragibooks/commit/0969087b1f96e3dd4e81960e938329e1758dc9b2))
* :sparkles: add settings page ([bf90b57](https://github.com/AceTugboat/bragibooks/commit/bf90b57fed20e57ed1f23ef82bad0a378a80cc10))
* :sparkles: Allow setting CSRF origins for reverse proxies ([ad91f25](https://github.com/AceTugboat/bragibooks/commit/ad91f25050d796ca8ea5bda1e5416f50df4fa1a5))
* :sparkles: connect output scheme setting to m4b-merge path format ([5521be4](https://github.com/AceTugboat/bragibooks/commit/5521be486a260222f01b9ac492f16223b6cdc524))
* add 'x' to remove search selection ([#166](https://github.com/AceTugboat/bragibooks/issues/166)) ([f1f8f6d](https://github.com/AceTugboat/bragibooks/commit/f1f8f6ddfcf30a945f263a69ac949c9ed728b460))
* Add auto search for books and Add Celery queue and task runner ([#145](https://github.com/AceTugboat/bragibooks/issues/145)) ([fb17706](https://github.com/AceTugboat/bragibooks/commit/fb17706b9e8e3a50546545ff16d730b7affedcde))
* add cover images to search results ([#167](https://github.com/AceTugboat/bragibooks/issues/167)) ([e5acbc0](https://github.com/AceTugboat/bragibooks/commit/e5acbc0e32b2a3e4d2803994f2352db0763080d0))
* allow setting CSRF_TRUSTED_ORIGINS via envvar ([f5c68c4](https://github.com/AceTugboat/bragibooks/commit/f5c68c46ab3747f340a048ee96781bda7fa70303))
* settings page ([9d629b1](https://github.com/AceTugboat/bragibooks/commit/9d629b1627472fb24a717a0ff658bd49f699188d))
* updated the file picker ([#153](https://github.com/AceTugboat/bragibooks/issues/153)) ([aed75dd](https://github.com/AceTugboat/bragibooks/commit/aed75ddbffc939e0b394fe7fc063fcc92cffeac4))


### Bug Fixes

* :bug: avoid using split for url checking ([c934c61](https://github.com/AceTugboat/bragibooks/commit/c934c61dc674bfa62de70d1a140d87caa1f7b489))
* :bug: entrypoint wasn't setting user permissions for processes ([b3bd8a7](https://github.com/AceTugboat/bragibooks/commit/b3bd8a765c040ce14d57e0b483fdf689669b976b))
* :bug: fix cpu count not being set correctly ([748f980](https://github.com/AceTugboat/bragibooks/commit/748f98005e8ce0a7852ce84b9ffad48d49f1fba1))
* :bug: fix order of setting import ([100853a](https://github.com/AceTugboat/bragibooks/commit/100853a6202a1d54cc0e8b9538500f26f521566b))
* :bug: pass original path to `m4b-merge` so it knows what to move to the completed folder ([101e8f2](https://github.com/AceTugboat/bragibooks/commit/101e8f25b6c2ecae5715e129e33f425ac485e048))
* :bug: search single file now removes extension ([d05a97a](https://github.com/AceTugboat/bragibooks/commit/d05a97a322ba8873d63ea55b7e59bc24fe70f229))
* :bug: searches with `&` character could fail ([3ac90c1](https://github.com/AceTugboat/bragibooks/commit/3ac90c1c8196db2b63242c9e52af23ca69e6500c))
* :bug: show durations longer than 24hrs ([098f376](https://github.com/AceTugboat/bragibooks/commit/098f37672ce3f0a1677b016811c0d70c88c26b97))
* 🐛 fix redirect check ([#321](https://github.com/AceTugboat/bragibooks/issues/321)) ([5a9429d](https://github.com/AceTugboat/bragibooks/commit/5a9429dbdd6859509761eff1054d57168ea1616a))
* 🐛 required attr was in the wrong place  ([#319](https://github.com/AceTugboat/bragibooks/issues/319)) ([1cd064a](https://github.com/AceTugboat/bragibooks/commit/1cd064aad41a192a42c2697bf665198f6a8770c6))
* button disabled bug [#178](https://github.com/AceTugboat/bragibooks/issues/178) ([#183](https://github.com/AceTugboat/bragibooks/issues/183)) ([ab378d5](https://github.com/AceTugboat/bragibooks/commit/ab378d518b37c22535ef4ccae5a2832b093e94b2))
* **docker:** :ambulance: fix pip package location ([644a422](https://github.com/AceTugboat/bragibooks/commit/644a4221512abf844877e56dcdac5b90df3acb3e))
* **docker:** :bug: fix for Docker permissions initialization ([8b8386f](https://github.com/AceTugboat/bragibooks/commit/8b8386f7a22c43c6b6532cebbbc8fa65cfc1e277))
* **docker:** correctly set permissions of mounts during image start ([4e4774b](https://github.com/AceTugboat/bragibooks/commit/4e4774b61232587208e4ee0ec4b4a8388a551e30))
* **docker:** properly initialize permissions ([36e9591](https://github.com/AceTugboat/bragibooks/commit/36e9591d105dbf4faecc02d59c7af1c016b1df58))
* **model:** :bug: allow runtime to be 0 for podcasts ([8e99513](https://github.com/AceTugboat/bragibooks/commit/8e99513643ddaebe27e4c66b73cf4bd673993363))
* show durations longer than 24hrs on post process page ([a8f0e58](https://github.com/AceTugboat/bragibooks/commit/a8f0e58f38a1ab937eeddc097703047138607fb8))
* updates to Dockerfile and fix bugs ([#163](https://github.com/AceTugboat/bragibooks/issues/163)) ([3e0a7b3](https://github.com/AceTugboat/bragibooks/commit/3e0a7b3f13b96307e43ad47222f1b3d4fd1fc726))


### Documentation

* :memo: add all-contributors ([ac359e8](https://github.com/AceTugboat/bragibooks/commit/ac359e813e44982912c6a408458b027d05de251e))
* :memo: add all-contributors ([#168](https://github.com/AceTugboat/bragibooks/issues/168)) ([36d566e](https://github.com/AceTugboat/bragibooks/commit/36d566eac1c02917c59aed27ae59aa060d9ff7bc))
* :memo: add CONTRIBUTING.md ([66c239e](https://github.com/AceTugboat/bragibooks/commit/66c239ea72dd821f5a7397ed2d07a1d7717a9fe1))
* :memo: add info about UID and GID support ([d116246](https://github.com/AceTugboat/bragibooks/commit/d11624627e004b7cb820820b1a738182c26b99ec))
* :memo: consolodate sections ([4780acf](https://github.com/AceTugboat/bragibooks/commit/4780acf7da396be1c34b2bbf76141d20a8822e2f))
* :memo: fix bots meltdown ([37034e6](https://github.com/AceTugboat/bragibooks/commit/37034e661e2e861a3c6eeb4efc6bb02cca25e96f))
* :memo: remove duplicate license badge ([9f3f8f6](https://github.com/AceTugboat/bragibooks/commit/9f3f8f6e4bac566c457a4ab28ee7a33c58239dd7))
* :memo: remove unused links ([0f55015](https://github.com/AceTugboat/bragibooks/commit/0f55015016e4e6bb812c0193e2d3b2edcf24ee65))
* :memo: use correct logo ([e90fe28](https://github.com/AceTugboat/bragibooks/commit/e90fe286e9752abecab39fd1ed00cd88a086ebdd))
* :memo: use standardized  README ([fa784e0](https://github.com/AceTugboat/bragibooks/commit/fa784e076d95bce993516bb098d725d18192e79c))
* add AceTugboat as a contributor for code, ideas, and doc ([1e80c45](https://github.com/AceTugboat/bragibooks/commit/1e80c455f89e5eb53259143d19e99b033b79e3da))
* add sandreas as a contributor for tool ([#171](https://github.com/AceTugboat/bragibooks/issues/171)) ([2a9c2bd](https://github.com/AceTugboat/bragibooks/commit/2a9c2bd77f184790e4f40478d9a2aebc6a6b7116))
* create .all-contributorsrc [skip ci] ([0ac9694](https://github.com/AceTugboat/bragibooks/commit/0ac96940e0c00f42f1e741e03f565c45e8ff430e))
* **readme:** :memo: add in updated info ([dc9a463](https://github.com/AceTugboat/bragibooks/commit/dc9a4630f1fabcf7b6f8e432fde27ae2aef8a919))
* update README to use the new application images ([#155](https://github.com/AceTugboat/bragibooks/issues/155)) ([9e9b060](https://github.com/AceTugboat/bragibooks/commit/9e9b060ac4a3c6922b75e46c45ffa5f87dbed44b))
* update README.md [skip ci] ([b745fcd](https://github.com/AceTugboat/bragibooks/commit/b745fcdf2da8bfdcb386e56dcd9ef8514e1428f6))

## [1.2.3](https://github.com/djdembeck/bragibooks/compare/v1.2.2...v1.2.3) (2024-08-07)


### Bug Fixes

* 🐛 fix redirect check ([#321](https://github.com/djdembeck/bragibooks/issues/321)) ([5a9429d](https://github.com/djdembeck/bragibooks/commit/5a9429dbdd6859509761eff1054d57168ea1616a))
* 🐛 required attr was in the wrong place  ([#319](https://github.com/djdembeck/bragibooks/issues/319)) ([1cd064a](https://github.com/djdembeck/bragibooks/commit/1cd064aad41a192a42c2697bf665198f6a8770c6))

## [1.2.2](https://github.com/djdembeck/bragibooks/compare/v1.2.1...v1.2.2) (2024-08-07)


### Bug Fixes

* :bug: avoid using split for url checking ([c934c61](https://github.com/djdembeck/bragibooks/commit/c934c61dc674bfa62de70d1a140d87caa1f7b489))

### [1.2.1](https://github.com/djdembeck/bragibooks/compare/v1.2.0...v1.2.1) (2023-06-09)


### Bug Fixes

* button disabled bug [#178](https://github.com/djdembeck/bragibooks/issues/178) ([#183](https://github.com/djdembeck/bragibooks/issues/183)) ([ab378d5](https://github.com/djdembeck/bragibooks/commit/ab378d518b37c22535ef4ccae5a2832b093e94b2))

## [1.2.0](https://github.com/djdembeck/bragibooks/compare/v1.0.0...v1.2.0) (2023-05-18)


### Features

* add 'x' to remove search selection ([#166](https://github.com/djdembeck/bragibooks/issues/166)) ([f1f8f6d](https://github.com/djdembeck/bragibooks/commit/f1f8f6ddfcf30a945f263a69ac949c9ed728b460))
* add cover images to search results ([#167](https://github.com/djdembeck/bragibooks/issues/167)) ([e5acbc0](https://github.com/djdembeck/bragibooks/commit/e5acbc0e32b2a3e4d2803994f2352db0763080d0))
* updated the file picker ([#153](https://github.com/djdembeck/bragibooks/issues/153)) ([aed75dd](https://github.com/djdembeck/bragibooks/commit/aed75ddbffc939e0b394fe7fc063fcc92cffeac4))


### Bug Fixes

* :bug: entrypoint wasn't setting user permissions for processes ([b3bd8a7](https://github.com/djdembeck/bragibooks/commit/b3bd8a765c040ce14d57e0b483fdf689669b976b))
* updates to Dockerfile and fix bugs ([#163](https://github.com/djdembeck/bragibooks/issues/163)) ([3e0a7b3](https://github.com/djdembeck/bragibooks/commit/3e0a7b3f13b96307e43ad47222f1b3d4fd1fc726))

## [1.0.0](https://github.com/djdembeck/bragibooks/compare/v0.3.7...v1.0.0) (2023-04-18)


### Features

* Add auto search for books and Add Celery queue and task runner ([#145](https://github.com/djdembeck/bragibooks/issues/145)) ([fb17706](https://github.com/djdembeck/bragibooks/commit/fb17706b9e8e3a50546545ff16d730b7affedcde)), closes [#27](https://github.com/djdembeck/bragibooks/issues/27) [#85](https://github.com/djdembeck/bragibooks/issues/85)


### Bug Fixes

* :bug: search single file now removes extension ([d05a97a](https://github.com/djdembeck/bragibooks/commit/d05a97a322ba8873d63ea55b7e59bc24fe70f229))
* :bug: searches with `&` character could fail ([3ac90c1](https://github.com/djdembeck/bragibooks/commit/3ac90c1c8196db2b63242c9e52af23ca69e6500c))

### [0.3.7](https://github.com/djdembeck/bragibooks/compare/v0.3.6...v0.3.7) (2023-02-24)

### [0.3.6](https://github.com/djdembeck/bragibooks/compare/v0.3.5...v0.3.6) (2022-09-21)


### Features

* allow setting CSRF_TRUSTED_ORIGINS via envvar ([f5c68c4](https://github.com/djdembeck/bragibooks/commit/f5c68c46ab3747f340a048ee96781bda7fa70303))


### Bug Fixes

* :bug: pass original path to `m4b-merge` so it knows what to move to the completed folder ([101e8f2](https://github.com/djdembeck/bragibooks/commit/101e8f25b6c2ecae5715e129e33f425ac485e048))

### [0.3.5](https://github.com/djdembeck/bragibooks/compare/v0.3.4...v0.3.5) (2022-06-12)


### Features

* :sparkles: Allow setting CSRF origins for reverse proxies ([ad91f25](https://github.com/djdembeck/bragibooks/commit/ad91f25050d796ca8ea5bda1e5416f50df4fa1a5))


### Bug Fixes

* :bug: fix cpu count not being set correctly ([748f980](https://github.com/djdembeck/bragibooks/commit/748f98005e8ce0a7852ce84b9ffad48d49f1fba1))
* **docker:** :bug: fix for Docker permissions initialization ([8b8386f](https://github.com/djdembeck/bragibooks/commit/8b8386f7a22c43c6b6532cebbbc8fa65cfc1e277))

### [0.3.4](https://github.com/djdembeck/bragibooks/compare/v0.3.3...v0.3.4) (2022-01-11)


### Features

* :lipstick: add versions to footer ([0969087](https://github.com/djdembeck/bragibooks/commit/0969087b1f96e3dd4e81960e938329e1758dc9b2))

### [0.3.3](https://github.com/djdembeck/bragibooks/compare/v0.3.2...v0.3.3) (2021-12-06)


### Features

* :sparkles: connect output scheme setting to m4b-merge path format ([5521be4](https://github.com/djdembeck/bragibooks/commit/5521be486a260222f01b9ac492f16223b6cdc524))

### [0.3.2](https://github.com/djdembeck/bragibooks/compare/v0.3.1...v0.3.2) (2021-11-18)


### Features

* :sparkles: add settings page ([bf90b57](https://github.com/djdembeck/bragibooks/commit/bf90b57fed20e57ed1f23ef82bad0a378a80cc10))


### Bug Fixes

* :bug: fix order of setting import ([100853a](https://github.com/djdembeck/bragibooks/commit/100853a6202a1d54cc0e8b9538500f26f521566b))
* :bug: show durations longer than 24hrs ([098f376](https://github.com/djdembeck/bragibooks/commit/098f37672ce3f0a1677b016811c0d70c88c26b97))
* **docker:** :ambulance: fix pip package location ([644a422](https://github.com/djdembeck/bragibooks/commit/644a4221512abf844877e56dcdac5b90df3acb3e))
* **model:** :bug: allow runtime to be 0 for podcasts ([8e99513](https://github.com/djdembeck/bragibooks/commit/8e99513643ddaebe27e4c66b73cf4bd673993363))

### [0.4.1](https://github.com/djdembeck/bragibooks/compare/v0.3.1...v0.4.1) (2021-10-18)


### Bug Fixes

* :bug: show durations longer than 24hrs ([098f376](https://github.com/djdembeck/bragibooks/commit/098f37672ce3f0a1677b016811c0d70c88c26b97))
* **model:** :bug: allow runtime to be 0 for podcasts ([8e99513](https://github.com/djdembeck/bragibooks/commit/8e99513643ddaebe27e4c66b73cf4bd673993363))
