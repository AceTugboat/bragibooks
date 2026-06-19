# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/AceTugboat/bragibooks/compare/v1.2.3...v2.0.0) (2026-06-19)


### Features

* :lipstick: add versions to footer ([0969087](https://github.com/AceTugboat/bragibooks/commit/0969087b1f96e3dd4e81960e938329e1758dc9b2))
* :sparkles: add settings page ([bf90b57](https://github.com/AceTugboat/bragibooks/commit/bf90b57fed20e57ed1f23ef82bad0a378a80cc10))
* :sparkles: Allow setting CSRF origins for reverse proxies ([ad91f25](https://github.com/AceTugboat/bragibooks/commit/ad91f25050d796ca8ea5bda1e5416f50df4fa1a5))
* :sparkles: connect output scheme setting to m4b-merge path format ([5521be4](https://github.com/AceTugboat/bragibooks/commit/5521be486a260222f01b9ac492f16223b6cdc524))
* add 'x' to remove search selection ([#166](https://github.com/AceTugboat/bragibooks/issues/166)) ([f1f8f6d](https://github.com/AceTugboat/bragibooks/commit/f1f8f6ddfcf30a945f263a69ac949c9ed728b460))
* Add auto search for books and Add Celery queue and task runner ([#145](https://github.com/AceTugboat/bragibooks/issues/145)) ([fb17706](https://github.com/AceTugboat/bragibooks/commit/fb17706b9e8e3a50546545ff16d730b7affedcde))
* add cover images to search results ([#167](https://github.com/AceTugboat/bragibooks/issues/167)) ([e5acbc0](https://github.com/AceTugboat/bragibooks/commit/e5acbc0e32b2a3e4d2803994f2352db0763080d0))
* add login, register, and logout auth system ([cf9c2c2](https://github.com/AceTugboat/bragibooks/commit/cf9c2c2b8c8a821c8632611c3418d5e98d917a5d))
* allow setting CSRF_TRUSTED_ORIGINS via envvar ([f5c68c4](https://github.com/AceTugboat/bragibooks/commit/f5c68c46ab3747f340a048ee96781bda7fa70303))
* **auth:** passkey frontend — SecurityPage, login button, webauthn utils ([#55](https://github.com/AceTugboat/bragibooks/issues/55)) ([4848c6b](https://github.com/AceTugboat/bragibooks/commit/4848c6b9b528db37ba2afdbf9933ddf26cfa0fd9)), closes [#17](https://github.com/AceTugboat/bragibooks/issues/17)
* **auth:** show friendly message when no passkey is registered ([#67](https://github.com/AceTugboat/bragibooks/issues/67)) ([ce2d654](https://github.com/AceTugboat/bragibooks/commit/ce2d654d82cb1c297ef2e84e1153912f18917a59)), closes [#61](https://github.com/AceTugboat/bragibooks/issues/61)
* **auth:** WebAuthn passkey authentication — model, settings, 6 API endpoints ([#50](https://github.com/AceTugboat/bragibooks/issues/50)) ([6263e40](https://github.com/AceTugboat/bragibooks/commit/6263e40fc7e7d2a922f5b267636890a2ac316c5e)), closes [#16](https://github.com/AceTugboat/bragibooks/issues/16)
* book deletion — DELETE /api/books/&lt;id&gt;/ + confirmation modal [T-17] ([#45](https://github.com/AceTugboat/bragibooks/issues/45)) ([a1e11d2](https://github.com/AceTugboat/bragibooks/commit/a1e11d2d953b2c50cd75a67b6fddea8ad5676689)), closes [#23](https://github.com/AceTugboat/bragibooks/issues/23)
* **books:** add Recently Added sort option ([#66](https://github.com/AceTugboat/bragibooks/issues/66)) ([f71e171](https://github.com/AceTugboat/bragibooks/commit/f71e1718cccaa4bb157d0e9abab4ca56b88e9288)), closes [#60](https://github.com/AceTugboat/bragibooks/issues/60)
* **books:** chapter editor — GET/PUT /api/books/&lt;id&gt;/chapters/ + expandable table ([#57](https://github.com/AceTugboat/bragibooks/issues/57)) ([d8a2264](https://github.com/AceTugboat/bragibooks/commit/d8a2264720147f456741668706e4789a5c0f1207)), closes [#31](https://github.com/AceTugboat/bragibooks/issues/31)
* **books:** cover art replacement — POST /api/books/&lt;id&gt;/cover/ + modal ([#58](https://github.com/AceTugboat/bragibooks/issues/58)) ([59aa44c](https://github.com/AceTugboat/bragibooks/commit/59aa44ca51a4cfcb947e277a4bb37d1aa7a0bc59)), closes [#32](https://github.com/AceTugboat/bragibooks/issues/32)
* **books:** metadata editor — PUT /api/books/&lt;id&gt;/metadata/ + modal ([#56](https://github.com/AceTugboat/bragibooks/issues/56)) ([26861f0](https://github.com/AceTugboat/bragibooks/commit/26861f048788d168a792661650cb89414e824dca)), closes [#30](https://github.com/AceTugboat/bragibooks/issues/30)
* **config:** m4b processing option controls [T-23] ([#53](https://github.com/AceTugboat/bragibooks/issues/53)) ([3d4d283](https://github.com/AceTugboat/bragibooks/commit/3d4d283643ba0d5b906825b8f7515fa9a727657d))
* configuration page — field renames, help text, archive warning, Test Paths [T-05, T-06] ([#36](https://github.com/AceTugboat/bragibooks/issues/36)) ([5e213be](https://github.com/AceTugboat/bragibooks/commit/5e213be8234b35aa8340381e1e54e2f634df9294))
* **frontend:** BooksPage library empty state ([#43](https://github.com/AceTugboat/bragibooks/issues/43)) ([bf835dc](https://github.com/AceTugboat/bragibooks/commit/bf835dc879f816e94671ee729811431dc4f22bcc)), closes [#8](https://github.com/AceTugboat/bragibooks/issues/8)
* **frontend:** ConfigurationPage client-side validation ([#44](https://github.com/AceTugboat/bragibooks/issues/44)) ([20074d0](https://github.com/AceTugboat/bragibooks/commit/20074d06e4f3f533a4a8080ea59a2a4d13485cf9)), closes [#22](https://github.com/AceTugboat/bragibooks/issues/22)
* **frontend:** DataContext polling + toast notifications [T-19] ([#47](https://github.com/AceTugboat/bragibooks/issues/47)) ([a8366c4](https://github.com/AceTugboat/bragibooks/commit/a8366c4868379795ea68360a2a1646768e854757)), closes [#25](https://github.com/AceTugboat/bragibooks/issues/25)
* **frontend:** implement ProcessingPage ([#42](https://github.com/AceTugboat/bragibooks/issues/42)) ([2cd9764](https://github.com/AceTugboat/bragibooks/commit/2cd97640a73a694bdbf6116a6908a440751c904e)), closes [#9](https://github.com/AceTugboat/bragibooks/issues/9)
* **import:** DirectoryListAPI lazy loading [T-14] ([#54](https://github.com/AceTugboat/bragibooks/issues/54)) ([f3f407f](https://github.com/AceTugboat/bragibooks/commit/f3f407f5fa91ff7ae78b6a05e7646351d2d3e606))
* **import:** merge ASIN matching into ImportPage as 2-step wizard ([#49](https://github.com/AceTugboat/bragibooks/issues/49)) ([492b553](https://github.com/AceTugboat/bragibooks/commit/492b553633fefa649a601d9e4138c47c6c9c9016)), closes [#10](https://github.com/AceTugboat/bragibooks/issues/10)
* **import:** show cover art thumbnails in ASIN result list ([#51](https://github.com/AceTugboat/bragibooks/issues/51)) ([756e9e7](https://github.com/AceTugboat/bragibooks/commit/756e9e731edd42428d83ecaf2939eddbf7017590)), closes [#26](https://github.com/AceTugboat/bragibooks/issues/26)
* **import:** Step 1 selection panel, card-footer Next button (btn-success) ([#68](https://github.com/AceTugboat/bragibooks/issues/68)) ([a5b2a81](https://github.com/AceTugboat/bragibooks/commit/a5b2a81bc5f64c1f80687f206c493f352e2e227c)), closes [#62](https://github.com/AceTugboat/bragibooks/issues/62)
* **import:** Step 2 redesign — Match Audiobook dropdown, fix AsinSearchResult type ([#69](https://github.com/AceTugboat/bragibooks/issues/69)) ([4e47f8b](https://github.com/AceTugboat/bragibooks/commit/4e47f8bb71978e5f4bd608f7d60979f5ec6bb079)), closes [#63](https://github.com/AceTugboat/bragibooks/issues/63)
* merge frontend-rewrite into rebuild ([2f798eb](https://github.com/AceTugboat/bragibooks/commit/2f798eb6207869beb562b3799ae92e8467bc2c6e))
* **merge:** apply m4b Setting fields via BragiM4bMerge subclass ([#52](https://github.com/AceTugboat/bragibooks/issues/52)) ([26c6516](https://github.com/AceTugboat/bragibooks/commit/26c65163f068bb6983c2d0bcac127100d32f742d)), closes [#28](https://github.com/AceTugboat/bragibooks/issues/28)
* **processing:** 1s live poll, progress bar, elapsed time, expandable error logs ([#70](https://github.com/AceTugboat/bragibooks/issues/70)) ([dcdbdd8](https://github.com/AceTugboat/bragibooks/commit/dcdbdd8c4350fa2af2c30309ed7133a311f56f1e)), closes [#64](https://github.com/AceTugboat/bragibooks/issues/64)
* **processing:** expandable job cards, cancel button, milestone log ([#71](https://github.com/AceTugboat/bragibooks/issues/71)) ([576c2b4](https://github.com/AceTugboat/bragibooks/commit/576c2b4bff766d393a1f5baffd9572d47cd26640))
* reprocess — POST /api/books/&lt;id&gt;/reprocess/ + UI wiring [T-18] ([#46](https://github.com/AceTugboat/bragibooks/issues/46)) ([454115e](https://github.com/AceTugboat/bragibooks/commit/454115e3fcbed746d55f5ac295ee9b0f615b58fb)), closes [#24](https://github.com/AceTugboat/bragibooks/issues/24)
* rewrite frontend as React SPA ([236c60c](https://github.com/AceTugboat/bragibooks/commit/236c60cba0200ade644c0cb0edaad0557d59406e))
* server side pagination, filtering, and sorting ([#73](https://github.com/AceTugboat/bragibooks/issues/73)) ([ec840ee](https://github.com/AceTugboat/bragibooks/commit/ec840ee4cc422fba73fecb2c41621a8109f6e611))
* settings page ([9d629b1](https://github.com/AceTugboat/bragibooks/commit/9d629b1627472fb24a717a0ff658bd49f699188d))
* **settings:** expose m4b processing options via API and model ([#48](https://github.com/AceTugboat/bragibooks/issues/48)) ([09b30fc](https://github.com/AceTugboat/bragibooks/commit/09b30fc2a585c65ee5461b15f27bb3fef999718b)), closes [#27](https://github.com/AceTugboat/bragibooks/issues/27)
* sidebar restructure, ErrorBoundary, loading state [T-01, T-15] ([#35](https://github.com/AceTugboat/bragibooks/issues/35)) ([66f9c3b](https://github.com/AceTugboat/bragibooks/commit/66f9c3b8d6f766765a824694bb018173d27d7785))
* **ui:** app refresh — dark-first, semantic colors, icon audit, import redesign ([#72](https://github.com/AceTugboat/bragibooks/issues/72)) ([3a697fa](https://github.com/AceTugboat/bragibooks/commit/3a697faeb0b08018051d2d40c94679c4c47af459))
* **ui:** remove sidebar search bars, fix btn-outline-secondary dark mode ([#65](https://github.com/AceTugboat/bragibooks/issues/65)) ([b7c6b65](https://github.com/AceTugboat/bragibooks/commit/b7c6b650394eee7e8acbf3dfc20088ae6d08d8ff)), closes [#59](https://github.com/AceTugboat/bragibooks/issues/59)
* updated the file picker ([#153](https://github.com/AceTugboat/bragibooks/issues/153)) ([aed75dd](https://github.com/AceTugboat/bragibooks/commit/aed75ddbffc939e0b394fe7fc063fcc92cffeac4))
* wire up REST API routes and replace Django templates with React SPA shell ([1654378](https://github.com/AceTugboat/bragibooks/commit/1654378807e1036a0bf3db3960db1700e0133686))


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
* **build:** add setuptools package discovery to exclude non-Python directories ([#40](https://github.com/AceTugboat/bragibooks/issues/40)) ([38e0271](https://github.com/AceTugboat/bragibooks/commit/38e02714f445c86f56a21a43b944eae728d6182b))
* button disabled bug [#178](https://github.com/AceTugboat/bragibooks/issues/178) ([#183](https://github.com/AceTugboat/bragibooks/issues/183)) ([ab378d5](https://github.com/AceTugboat/bragibooks/commit/ab378d518b37c22535ef4ccae5a2832b093e94b2))
* correct API URLs, proxy target, and missing import in frontend ([0b73371](https://github.com/AceTugboat/bragibooks/commit/0b73371ee2f7b28b0f3f49f5a4bc4ee5dfb046cd))
* correct BookDetailAPI URL parameter from asin to pk ([c9e8740](https://github.com/AceTugboat/bragibooks/commit/c9e8740b5edafa496785de5bc22e1a0e922f2557))
* **docker:** :ambulance: fix pip package location ([644a422](https://github.com/AceTugboat/bragibooks/commit/644a4221512abf844877e56dcdac5b90df3acb3e))
* **docker:** :bug: fix for Docker permissions initialization ([8b8386f](https://github.com/AceTugboat/bragibooks/commit/8b8386f7a22c43c6b6532cebbbc8fa65cfc1e277))
* **docker:** correctly set permissions of mounts during image start ([4e4774b](https://github.com/AceTugboat/bragibooks/commit/4e4774b61232587208e4ee0ec4b4a8388a551e30))
* **docker:** properly initialize permissions ([36e9591](https://github.com/AceTugboat/bragibooks/commit/36e9591d105dbf4faecc02d59c7af1c016b1df58))
* **model:** :bug: allow runtime to be 0 for podcasts ([8e99513](https://github.com/AceTugboat/bragibooks/commit/8e99513643ddaebe27e4c66b73cf4bd673993363))
* remove stale celery import from __init__.py ([a8f98e4](https://github.com/AceTugboat/bragibooks/commit/a8f98e4fbc2b9679cca7a60c6e3e8d4f4de579b0))
* **security:** auth on all API views, remove csrf_exempt, parameterise DB credentials ([#37](https://github.com/AceTugboat/bragibooks/issues/37)) ([fa7f69d](https://github.com/AceTugboat/bragibooks/commit/fa7f69d01c9e8e594af7350b9f6c631798fce056))
* show durations longer than 24hrs on post process page ([a8f0e58](https://github.com/AceTugboat/bragibooks/commit/a8f0e58f38a1ab937eeddc097703047138607fb8))
* update repo and issues links to AceTugboat/bragibooks ([dd09735](https://github.com/AceTugboat/bragibooks/commit/dd09735e14b8e796e869eaad6bae4f6c360278c8))
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
* add PR links to Wave 1 tickets and security fix ([3fa3a9d](https://github.com/AceTugboat/bragibooks/commit/3fa3a9df7b04501a4b017599c44dcf6a739afb42))
* add sandreas as a contributor for tool ([#171](https://github.com/AceTugboat/bragibooks/issues/171)) ([2a9c2bd](https://github.com/AceTugboat/bragibooks/commit/2a9c2bd77f184790e4f40478d9a2aebc6a6b7116))
* create .all-contributorsrc [skip ci] ([0ac9694](https://github.com/AceTugboat/bragibooks/commit/0ac96940e0c00f42f1e741e03f565c45e8ff430e))
* **merge:** clarify config.junk_dir is upstream m4b_merge naming ([#39](https://github.com/AceTugboat/bragibooks/issues/39)) ([d5d1d52](https://github.com/AceTugboat/bragibooks/commit/d5d1d52b07952c33bd3f676483bd07953d0749fa))
* **readme:** :memo: add in updated info ([dc9a463](https://github.com/AceTugboat/bragibooks/commit/dc9a4630f1fabcf7b6f8e432fde27ae2aef8a919))
* rewrite README for React SPA rebuild ([ac488c8](https://github.com/AceTugboat/bragibooks/commit/ac488c8d22f49fa141791e03ceafb3a7008468cc))
* update README to use the new application images ([#155](https://github.com/AceTugboat/bragibooks/issues/155)) ([9e9b060](https://github.com/AceTugboat/bragibooks/commit/9e9b060ac4a3c6922b75e46c45ffa5f87dbed44b))
* update README with Docker Hub username and deployment examples ([67274f0](https://github.com/AceTugboat/bragibooks/commit/67274f08774e91a7802f0e8c95e8f1ff1439a535))
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
