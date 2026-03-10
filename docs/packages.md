# Federated Catalogue Packages

## federated-catalogue-models

This package defines the shared contracts used by the catalogue stack, including request and response shapes and extension points for filters. It keeps interoperability predictable across components that consume [Dataspace Protocol](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/) messages and [DCAT](https://www.w3.org/TR/vocab-dcat-3/) dataset metadata.

- [README](../packages/federated-catalogue-models/README.md)
- [Examples](../packages/federated-catalogue-models/docs/examples.md)
- [Changelog](../packages/federated-catalogue-models/docs/changelog.md)

## federated-catalogue-service

This package provides the core catalogue service operations for validating, storing and querying datasets, while coordinating filter plugins and protocol-compatible output. It is the main runtime component for implementing catalogue behaviour that aligns with [Dataspace Protocol](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/).

- [README](../packages/federated-catalogue-service/README.md)
- [Examples](../packages/federated-catalogue-service/docs/examples.md)
- [Changelog](../packages/federated-catalogue-service/docs/changelog.md)

## federated-catalogue-rest-client

This package exposes a client abstraction for calling catalogue REST endpoints and handling dataset and catalogue responses in a consistent way. It helps consumers integrate remote catalogue operations without reimplementing protocol and endpoint handling.

- [README](../packages/federated-catalogue-rest-client/README.md)
- [Examples](../packages/federated-catalogue-rest-client/docs/examples.md)
- [Changelog](../packages/federated-catalogue-rest-client/docs/changelog.md)

## federated-catalogue-filters

This package contains reusable filtering components that can be registered and executed by the service layer to select datasets by domain criteria. It enables catalogue deployments to add or replace filter logic while keeping query behaviour structured and maintainable.

- [README](../packages/federated-catalogue-filters/README.md)
- [Examples](../packages/federated-catalogue-filters/docs/examples.md)
- [Changelog](../packages/federated-catalogue-filters/docs/changelog.md)
