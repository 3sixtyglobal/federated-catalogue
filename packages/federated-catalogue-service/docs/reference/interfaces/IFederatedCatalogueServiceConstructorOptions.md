# Interface: IFederatedCatalogueServiceConstructorOptions

Options for the FederatedCatalogueService constructor.

## Properties

### datasetEntityStorageType? {#datasetentitystoragetype}

> `optional` **datasetEntityStorageType?**: `string`

The entity storage for datasets.

#### Default

```ts
dataset
```

***

### loggingComponentType? {#loggingcomponenttype}

> `optional` **loggingComponentType?**: `string`

The logging component for the service.

***

### urlTransformerComponentType? {#urltransformercomponenttype}

> `optional` **urlTransformerComponentType?**: `string`

URL transformer component type used to encrypt the per-publisher tenant token into
distribution accessService URLs at write time.

#### Default

```ts
url-transformer
```

***

### config? {#config}

> `optional` **config?**: [`IFederatedCatalogueServiceConfig`](IFederatedCatalogueServiceConfig.md)

Configuration for the federated catalogue service.
