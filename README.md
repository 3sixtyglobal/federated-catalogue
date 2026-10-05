# TWIN Federated Catalogue

This repository provides a modular catalogue stack for publishing, querying and integrating dataset metadata across distributed environments. The workspace is organised so shared contracts, core service behaviour, client access and filtering extensions can evolve independently while still working together as a coherent platform.

The packages and app are designed to support protocol-aligned catalogue flows, from schema and request modelling through to runtime operations exposed over HTTP. This structure helps teams compose deployments that are easier to maintain, test and extend over time.

## Packages

- [federated-catalogue-models](packages/federated-catalogue-models/README.md) - Shared contracts for catalogue requests, responses and filter interfaces.
- [federated-catalogue-service](packages/federated-catalogue-service/README.md) - Core catalogue operations for dataset validation, storage and query orchestration.
- [federated-catalogue-rest-client](packages/federated-catalogue-rest-client/README.md) - HTTP client for querying catalogues and retrieving datasets from REST endpoints.
- [federated-catalogue-filters](packages/federated-catalogue-filters/README.md) - Pluggable dataset filtering implementations for catalogue query pipelines.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-federated-catalogue](https://github.com/iotaledger/twin-federated-catalogue) repository.
