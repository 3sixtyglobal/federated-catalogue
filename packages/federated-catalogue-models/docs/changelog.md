# Changelog

## [0.10.1-next.2](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.10.1-next.1...federated-catalogue-models-v0.10.1-next.2) (2026-09-18)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.10.1-next.1](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.10.1-next.0...federated-catalogue-models-v0.10.1-next.1) (2026-09-17)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Features

* add context id features ([#32](https://github.com/iotaledger/twin-federated-catalogue/issues/32)) ([277e64b](https://github.com/iotaledger/twin-federated-catalogue/commit/277e64bb507db0948e83c44e8282e09f1865fe0b))
* add data types with fully qualified names ([993eb09](https://github.com/iotaledger/twin-federated-catalogue/commit/993eb09e25f6caad5d82a3908a2ba648900f5ca7))
* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))
* add validate-locales ([3d8d60d](https://github.com/iotaledger/twin-federated-catalogue/commit/3d8d60d9291e5a6f8c6d4562d6a862456a9917bc))
* consistent component naming with other repos ([83fc03d](https://github.com/iotaledger/twin-federated-catalogue/commit/83fc03dee3846600ae6a45d710248a0ae60af570))
* eslint migration to flat config ([b5990d9](https://github.com/iotaledger/twin-federated-catalogue/commit/b5990d9ebdf403ac999da456052bee72787745de))
* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))
* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))
* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))
* simplify node ([e80db0e](https://github.com/iotaledger/twin-federated-catalogue/commit/e80db0e1b4935daaa7ff7d4343280efaa6250bf8))
* synchronise with gaia-x types ([3e0d7f2](https://github.com/iotaledger/twin-federated-catalogue/commit/3e0d7f2f277ec0adef79d71165b6db778e15e315))
* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))
* update dependencies ([24ff3d7](https://github.com/iotaledger/twin-federated-catalogue/commit/24ff3d772cf7bd7f60547c5b314355e75ba55424))
* update framework core ([68293b6](https://github.com/iotaledger/twin-federated-catalogue/commit/68293b68aaf594d51431b942fa91e7cf7020a8d7))
* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))
* update schemas ([58d8581](https://github.com/iotaledger/twin-federated-catalogue/commit/58d85813231f6576490937d4394e7be0f6d8c58d))
* update to latest framework components ([aa30543](https://github.com/iotaledger/twin-federated-catalogue/commit/aa30543cef1309769d359d64fba0a85db490d69b))
* update ts-to-schema generation ([41bdde7](https://github.com/iotaledger/twin-federated-catalogue/commit/41bdde7ff9f0cfa1ea4376b7a952bbaed9988d0a))
* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))
* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))


### Bug Fixes

* broken docs ([4588d86](https://github.com/iotaledger/twin-federated-catalogue/commit/4588d861575522da5374291167d57bacd1b21867))
* default rest path ([#115](https://github.com/iotaledger/twin-federated-catalogue/issues/115)) ([08c386c](https://github.com/iotaledger/twin-federated-catalogue/commit/08c386c01f978397a6c07d6c47889102d2cf87cc))
* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))
* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))
* query params force coercion ([a532329](https://github.com/iotaledger/twin-federated-catalogue/commit/a532329089b2b95c7f18cd8bd56ee47482755dc0))
* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.10.0](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.10.0...federated-catalogue-models-v0.10.0) (2026-09-16)


### Features

* release to production ([c9b5702](https://github.com/iotaledger/twin-federated-catalogue/commit/c9b570207fae4b31d43fa99e4df99be4baa34db2))
* release to production ([#103](https://github.com/iotaledger/twin-federated-catalogue/issues/103)) ([2a36084](https://github.com/iotaledger/twin-federated-catalogue/commit/2a36084a70bd51014e93fb5502443a460928301d))
* release to production ([#120](https://github.com/iotaledger/twin-federated-catalogue/issues/120)) ([d137bc4](https://github.com/iotaledger/twin-federated-catalogue/commit/d137bc49bd1e563e469005825a2da6705c6c350a))
* release to production ([#128](https://github.com/iotaledger/twin-federated-catalogue/issues/128)) ([9ccf18e](https://github.com/iotaledger/twin-federated-catalogue/commit/9ccf18e193d4ecd1bb90a46961b00764bce58a0f))
* release to production [skip ci] ([#134](https://github.com/iotaledger/twin-federated-catalogue/issues/134)) ([3cd1114](https://github.com/iotaledger/twin-federated-catalogue/commit/3cd1114096e2bb3882790485ec8c68887747e9ca))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))

## [0.9.2](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.2...federated-catalogue-models-v0.9.2) (2026-08-24)


### Features

* release to production ([c9b5702](https://github.com/iotaledger/twin-federated-catalogue/commit/c9b570207fae4b31d43fa99e4df99be4baa34db2))
* release to production ([#103](https://github.com/iotaledger/twin-federated-catalogue/issues/103)) ([2a36084](https://github.com/iotaledger/twin-federated-catalogue/commit/2a36084a70bd51014e93fb5502443a460928301d))
* release to production ([#120](https://github.com/iotaledger/twin-federated-catalogue/issues/120)) ([d137bc4](https://github.com/iotaledger/twin-federated-catalogue/commit/d137bc49bd1e563e469005825a2da6705c6c350a))
* release to production ([#128](https://github.com/iotaledger/twin-federated-catalogue/issues/128)) ([9ccf18e](https://github.com/iotaledger/twin-federated-catalogue/commit/9ccf18e193d4ecd1bb90a46961b00764bce58a0f))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))

## [0.9.2-next.2](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.2-next.1...federated-catalogue-models-v0.9.2-next.2) (2026-08-07)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Features

* add context id features ([#32](https://github.com/iotaledger/twin-federated-catalogue/issues/32)) ([277e64b](https://github.com/iotaledger/twin-federated-catalogue/commit/277e64bb507db0948e83c44e8282e09f1865fe0b))
* add data types with fully qualified names ([993eb09](https://github.com/iotaledger/twin-federated-catalogue/commit/993eb09e25f6caad5d82a3908a2ba648900f5ca7))
* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))
* add validate-locales ([3d8d60d](https://github.com/iotaledger/twin-federated-catalogue/commit/3d8d60d9291e5a6f8c6d4562d6a862456a9917bc))
* consistent component naming with other repos ([83fc03d](https://github.com/iotaledger/twin-federated-catalogue/commit/83fc03dee3846600ae6a45d710248a0ae60af570))
* eslint migration to flat config ([b5990d9](https://github.com/iotaledger/twin-federated-catalogue/commit/b5990d9ebdf403ac999da456052bee72787745de))
* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))
* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))
* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))
* simplify node ([e80db0e](https://github.com/iotaledger/twin-federated-catalogue/commit/e80db0e1b4935daaa7ff7d4343280efaa6250bf8))
* synchronise with gaia-x types ([3e0d7f2](https://github.com/iotaledger/twin-federated-catalogue/commit/3e0d7f2f277ec0adef79d71165b6db778e15e315))
* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))
* update dependencies ([24ff3d7](https://github.com/iotaledger/twin-federated-catalogue/commit/24ff3d772cf7bd7f60547c5b314355e75ba55424))
* update framework core ([68293b6](https://github.com/iotaledger/twin-federated-catalogue/commit/68293b68aaf594d51431b942fa91e7cf7020a8d7))
* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))
* update schemas ([58d8581](https://github.com/iotaledger/twin-federated-catalogue/commit/58d85813231f6576490937d4394e7be0f6d8c58d))
* update to latest framework components ([aa30543](https://github.com/iotaledger/twin-federated-catalogue/commit/aa30543cef1309769d359d64fba0a85db490d69b))
* update ts-to-schema generation ([41bdde7](https://github.com/iotaledger/twin-federated-catalogue/commit/41bdde7ff9f0cfa1ea4376b7a952bbaed9988d0a))
* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))
* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))


### Bug Fixes

* broken docs ([4588d86](https://github.com/iotaledger/twin-federated-catalogue/commit/4588d861575522da5374291167d57bacd1b21867))
* default rest path ([#115](https://github.com/iotaledger/twin-federated-catalogue/issues/115)) ([08c386c](https://github.com/iotaledger/twin-federated-catalogue/commit/08c386c01f978397a6c07d6c47889102d2cf87cc))
* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))
* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))
* query params force coercion ([a532329](https://github.com/iotaledger/twin-federated-catalogue/commit/a532329089b2b95c7f18cd8bd56ee47482755dc0))
* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.9.2-next.1](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.2-next.0...federated-catalogue-models-v0.9.2-next.1) (2026-08-07)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Features

* add context id features ([#32](https://github.com/iotaledger/twin-federated-catalogue/issues/32)) ([277e64b](https://github.com/iotaledger/twin-federated-catalogue/commit/277e64bb507db0948e83c44e8282e09f1865fe0b))
* add data types with fully qualified names ([993eb09](https://github.com/iotaledger/twin-federated-catalogue/commit/993eb09e25f6caad5d82a3908a2ba648900f5ca7))
* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))
* add validate-locales ([3d8d60d](https://github.com/iotaledger/twin-federated-catalogue/commit/3d8d60d9291e5a6f8c6d4562d6a862456a9917bc))
* consistent component naming with other repos ([83fc03d](https://github.com/iotaledger/twin-federated-catalogue/commit/83fc03dee3846600ae6a45d710248a0ae60af570))
* eslint migration to flat config ([b5990d9](https://github.com/iotaledger/twin-federated-catalogue/commit/b5990d9ebdf403ac999da456052bee72787745de))
* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))
* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))
* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))
* simplify node ([e80db0e](https://github.com/iotaledger/twin-federated-catalogue/commit/e80db0e1b4935daaa7ff7d4343280efaa6250bf8))
* synchronise with gaia-x types ([3e0d7f2](https://github.com/iotaledger/twin-federated-catalogue/commit/3e0d7f2f277ec0adef79d71165b6db778e15e315))
* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))
* update dependencies ([24ff3d7](https://github.com/iotaledger/twin-federated-catalogue/commit/24ff3d772cf7bd7f60547c5b314355e75ba55424))
* update framework core ([68293b6](https://github.com/iotaledger/twin-federated-catalogue/commit/68293b68aaf594d51431b942fa91e7cf7020a8d7))
* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))
* update schemas ([58d8581](https://github.com/iotaledger/twin-federated-catalogue/commit/58d85813231f6576490937d4394e7be0f6d8c58d))
* update to latest framework components ([aa30543](https://github.com/iotaledger/twin-federated-catalogue/commit/aa30543cef1309769d359d64fba0a85db490d69b))
* update ts-to-schema generation ([41bdde7](https://github.com/iotaledger/twin-federated-catalogue/commit/41bdde7ff9f0cfa1ea4376b7a952bbaed9988d0a))
* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))
* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))


### Bug Fixes

* broken docs ([4588d86](https://github.com/iotaledger/twin-federated-catalogue/commit/4588d861575522da5374291167d57bacd1b21867))
* default rest path ([#115](https://github.com/iotaledger/twin-federated-catalogue/issues/115)) ([08c386c](https://github.com/iotaledger/twin-federated-catalogue/commit/08c386c01f978397a6c07d6c47889102d2cf87cc))
* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))
* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))
* query params force coercion ([a532329](https://github.com/iotaledger/twin-federated-catalogue/commit/a532329089b2b95c7f18cd8bd56ee47482755dc0))
* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.9.1](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1...federated-catalogue-models-v0.9.1) (2026-07-27)


### Features

* release to production ([c9b5702](https://github.com/iotaledger/twin-federated-catalogue/commit/c9b570207fae4b31d43fa99e4df99be4baa34db2))
* release to production ([#103](https://github.com/iotaledger/twin-federated-catalogue/issues/103)) ([2a36084](https://github.com/iotaledger/twin-federated-catalogue/commit/2a36084a70bd51014e93fb5502443a460928301d))
* release to production ([#120](https://github.com/iotaledger/twin-federated-catalogue/issues/120)) ([d137bc4](https://github.com/iotaledger/twin-federated-catalogue/commit/d137bc49bd1e563e469005825a2da6705c6c350a))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))

## [0.9.1-next.5](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1-next.4...federated-catalogue-models-v0.9.1-next.5) (2026-07-20)


### Bug Fixes

* default rest path ([#115](https://github.com/iotaledger/twin-federated-catalogue/issues/115)) ([08c386c](https://github.com/iotaledger/twin-federated-catalogue/commit/08c386c01f978397a6c07d6c47889102d2cf87cc))

## [0.9.1-next.4](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1-next.3...federated-catalogue-models-v0.9.1-next.4) (2026-07-02)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.9.1-next.3](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1-next.2...federated-catalogue-models-v0.9.1-next.3) (2026-06-30)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.9.1-next.2](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1-next.1...federated-catalogue-models-v0.9.1-next.2) (2026-06-29)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.9.1-next.1](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.1-next.0...federated-catalogue-models-v0.9.1-next.1) (2026-06-26)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Features

* add context id features ([#32](https://github.com/iotaledger/twin-federated-catalogue/issues/32)) ([277e64b](https://github.com/iotaledger/twin-federated-catalogue/commit/277e64bb507db0948e83c44e8282e09f1865fe0b))
* add data types with fully qualified names ([993eb09](https://github.com/iotaledger/twin-federated-catalogue/commit/993eb09e25f6caad5d82a3908a2ba648900f5ca7))
* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))
* add validate-locales ([3d8d60d](https://github.com/iotaledger/twin-federated-catalogue/commit/3d8d60d9291e5a6f8c6d4562d6a862456a9917bc))
* consistent component naming with other repos ([83fc03d](https://github.com/iotaledger/twin-federated-catalogue/commit/83fc03dee3846600ae6a45d710248a0ae60af570))
* eslint migration to flat config ([b5990d9](https://github.com/iotaledger/twin-federated-catalogue/commit/b5990d9ebdf403ac999da456052bee72787745de))
* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))
* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))
* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))
* simplify node ([e80db0e](https://github.com/iotaledger/twin-federated-catalogue/commit/e80db0e1b4935daaa7ff7d4343280efaa6250bf8))
* synchronise with gaia-x types ([3e0d7f2](https://github.com/iotaledger/twin-federated-catalogue/commit/3e0d7f2f277ec0adef79d71165b6db778e15e315))
* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))
* update dependencies ([24ff3d7](https://github.com/iotaledger/twin-federated-catalogue/commit/24ff3d772cf7bd7f60547c5b314355e75ba55424))
* update framework core ([68293b6](https://github.com/iotaledger/twin-federated-catalogue/commit/68293b68aaf594d51431b942fa91e7cf7020a8d7))
* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))
* update schemas ([58d8581](https://github.com/iotaledger/twin-federated-catalogue/commit/58d85813231f6576490937d4394e7be0f6d8c58d))
* update to latest framework components ([aa30543](https://github.com/iotaledger/twin-federated-catalogue/commit/aa30543cef1309769d359d64fba0a85db490d69b))
* update ts-to-schema generation ([41bdde7](https://github.com/iotaledger/twin-federated-catalogue/commit/41bdde7ff9f0cfa1ea4376b7a952bbaed9988d0a))
* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))
* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))


### Bug Fixes

* broken docs ([4588d86](https://github.com/iotaledger/twin-federated-catalogue/commit/4588d861575522da5374291167d57bacd1b21867))
* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))
* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))
* query params force coercion ([a532329](https://github.com/iotaledger/twin-federated-catalogue/commit/a532329089b2b95c7f18cd8bd56ee47482755dc0))
* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.9.0](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.0...federated-catalogue-models-v0.9.0) (2026-06-25)


### Features

* release to production ([c9b5702](https://github.com/iotaledger/twin-federated-catalogue/commit/c9b570207fae4b31d43fa99e4df99be4baa34db2))
* release to production ([#103](https://github.com/iotaledger/twin-federated-catalogue/issues/103)) ([2a36084](https://github.com/iotaledger/twin-federated-catalogue/commit/2a36084a70bd51014e93fb5502443a460928301d))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))

## [0.9.0-next.1](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.9.0-next.0...federated-catalogue-models-v0.9.0-next.1) (2026-06-24)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Features

* add context id features ([#32](https://github.com/iotaledger/twin-federated-catalogue/issues/32)) ([277e64b](https://github.com/iotaledger/twin-federated-catalogue/commit/277e64bb507db0948e83c44e8282e09f1865fe0b))
* add data types with fully qualified names ([993eb09](https://github.com/iotaledger/twin-federated-catalogue/commit/993eb09e25f6caad5d82a3908a2ba648900f5ca7))
* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))
* add validate-locales ([3d8d60d](https://github.com/iotaledger/twin-federated-catalogue/commit/3d8d60d9291e5a6f8c6d4562d6a862456a9917bc))
* consistent component naming with other repos ([83fc03d](https://github.com/iotaledger/twin-federated-catalogue/commit/83fc03dee3846600ae6a45d710248a0ae60af570))
* eslint migration to flat config ([b5990d9](https://github.com/iotaledger/twin-federated-catalogue/commit/b5990d9ebdf403ac999da456052bee72787745de))
* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))
* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))
* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))
* simplify node ([e80db0e](https://github.com/iotaledger/twin-federated-catalogue/commit/e80db0e1b4935daaa7ff7d4343280efaa6250bf8))
* synchronise with gaia-x types ([3e0d7f2](https://github.com/iotaledger/twin-federated-catalogue/commit/3e0d7f2f277ec0adef79d71165b6db778e15e315))
* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))
* update dependencies ([24ff3d7](https://github.com/iotaledger/twin-federated-catalogue/commit/24ff3d772cf7bd7f60547c5b314355e75ba55424))
* update framework core ([68293b6](https://github.com/iotaledger/twin-federated-catalogue/commit/68293b68aaf594d51431b942fa91e7cf7020a8d7))
* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))
* update schemas ([58d8581](https://github.com/iotaledger/twin-federated-catalogue/commit/58d85813231f6576490937d4394e7be0f6d8c58d))
* update to latest framework components ([aa30543](https://github.com/iotaledger/twin-federated-catalogue/commit/aa30543cef1309769d359d64fba0a85db490d69b))
* update ts-to-schema generation ([41bdde7](https://github.com/iotaledger/twin-federated-catalogue/commit/41bdde7ff9f0cfa1ea4376b7a952bbaed9988d0a))
* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))
* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))
* version 0 federated catalogue ([#2](https://github.com/iotaledger/twin-federated-catalogue/issues/2)) ([93fb8bd](https://github.com/iotaledger/twin-federated-catalogue/commit/93fb8bdbb03aa781ef9e8dc4053beea1b397cc36))


### Bug Fixes

* broken docs ([4588d86](https://github.com/iotaledger/twin-federated-catalogue/commit/4588d861575522da5374291167d57bacd1b21867))
* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))
* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))
* query params force coercion ([a532329](https://github.com/iotaledger/twin-federated-catalogue/commit/a532329089b2b95c7f18cd8bd56ee47482755dc0))
* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.0.3-next.24](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.23...federated-catalogue-models-v0.0.3-next.24) (2026-06-23)


### ⚠ BREAKING CHANGES

* filter plugins that read the array shape must update (twin-supply-chain FilterByRole).

### Bug Fixes

* pass filter criteria object (not the array) to catalogue filter handlers ([#97](https://github.com/iotaledger/twin-federated-catalogue/issues/97)) ([6b0cd54](https://github.com/iotaledger/twin-federated-catalogue/commit/6b0cd54626a01910c2a1fb6af9e16027542e4824))

## [0.0.3-next.23](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.22...federated-catalogue-models-v0.0.3-next.23) (2026-06-19)


### Features

* add telemetry metrics to federated catalogue ([#93](https://github.com/iotaledger/twin-federated-catalogue/issues/93)) ([abd8965](https://github.com/iotaledger/twin-federated-catalogue/commit/abd89657d3991e6a50f8ed3845186069549df769))

## [0.0.3-next.22](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.21...federated-catalogue-models-v0.0.3-next.22) (2026-06-18)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.21](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.20...federated-catalogue-models-v0.0.3-next.21) (2026-06-12)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.20](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.19...federated-catalogue-models-v0.0.3-next.20) (2026-06-11)


### Features

* organization identifiers ([#84](https://github.com/iotaledger/twin-federated-catalogue/issues/84)) ([1e02971](https://github.com/iotaledger/twin-federated-catalogue/commit/1e02971a12e40bd20a0034ee1de0988a689d3dc8))

## [0.0.3-next.19](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.18...federated-catalogue-models-v0.0.3-next.19) (2026-06-08)


### Features

* replace sync storage with shared DB and trust-token auth ([#79](https://github.com/iotaledger/twin-federated-catalogue/issues/79)) ([3a07f02](https://github.com/iotaledger/twin-federated-catalogue/commit/3a07f02aba8d6f3540a23e5c2cebc7b0e579ef30))

## [0.0.3-next.18](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.17...federated-catalogue-models-v0.0.3-next.18) (2026-06-01)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.17](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.16...federated-catalogue-models-v0.0.3-next.17) (2026-05-20)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.16](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.15...federated-catalogue-models-v0.0.3-next.16) (2026-05-12)


### Features

* typescript 6 update ([ead042d](https://github.com/iotaledger/twin-federated-catalogue/commit/ead042d09f4e6b03a2db46ace2ea95d197f0f4b0))

## [0.0.3-next.15](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.14...federated-catalogue-models-v0.0.3-next.15) (2026-05-08)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.14](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.13...federated-catalogue-models-v0.0.3-next.14) (2026-03-20)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.13](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.12...federated-catalogue-models-v0.0.3-next.13) (2026-03-12)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.12](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.11...federated-catalogue-models-v0.0.3-next.12) (2026-03-06)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.11](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.10...federated-catalogue-models-v0.0.3-next.11) (2026-03-05)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.10](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.9...federated-catalogue-models-v0.0.3-next.10) (2026-02-25)


### Features

* update json-ld patterns ([172aff0](https://github.com/iotaledger/twin-federated-catalogue/commit/172aff07d0f0b780f72d1be3a4896bbf12f6173a))

## [0.0.3-next.9](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.8...federated-catalogue-models-v0.0.3-next.9) (2026-02-12)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.8](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.7...federated-catalogue-models-v0.0.3-next.8) (2026-01-26)


### Features

* use new hosting url for cursor links ([e42c934](https://github.com/iotaledger/twin-federated-catalogue/commit/e42c934b9c8748ec5bdd4803c1cdc05c82ccace8))

## [0.0.3-next.7](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.6...federated-catalogue-models-v0.0.3-next.7) (2026-01-22)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.6](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.5...federated-catalogue-models-v0.0.3-next.6) (2026-01-20)


### Bug Fixes

* transform GuardError to CatalogError for DS Protocol compliance ([#49](https://github.com/iotaledger/twin-federated-catalogue/issues/49)) ([d0f1090](https://github.com/iotaledger/twin-federated-catalogue/commit/d0f10900c251b9abc18e58c90562c393c3265727))

## [0.0.3-next.5](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.4...federated-catalogue-models-v0.0.3-next.5) (2026-01-15)


### Bug Fixes

* pagination and ld context ([#45](https://github.com/iotaledger/twin-federated-catalogue/issues/45)) ([e36f096](https://github.com/iotaledger/twin-federated-catalogue/commit/e36f096aa4fdc61eb5b929a0fc4403247dbd41ce))

## [0.0.3-next.4](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.3...federated-catalogue-models-v0.0.3-next.4) (2026-01-06)


### Features

* updates standards dependencies ([62f5d9c](https://github.com/iotaledger/twin-federated-catalogue/commit/62f5d9c6180bc27497ac43624ffd714e7ce65ce6))

## [0.0.3-next.3](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.2...federated-catalogue-models-v0.0.3-next.3) (2025-11-28)


### Miscellaneous Chores

* **federated-catalogue-models:** Synchronize repo versions

## [0.0.3-next.2](https://github.com/iotaledger/twin-federated-catalogue/compare/federated-catalogue-models-v0.0.3-next.1...federated-catalogue-models-v0.0.3-next.2) (2025-11-28)


### Features

* implement Dataspace Protocol federated catalogue ([#36](https://github.com/iotaledger/twin-federated-catalogue/issues/36)) ([4765aba](https://github.com/iotaledger/twin-federated-catalogue/commit/4765aba4485ef8ad61e7ec1affbf0e454d974d36))

## v0.0.1-next.1

- Initial Release
