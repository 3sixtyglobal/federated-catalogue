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

### trustComponentType? {#trustcomponenttype}

> `optional` **trustComponentType?**: `string`

Trust component type for trust verification.

#### Default

```ts
trust
```

***

### telemetryComponentType? {#telemetrycomponenttype}

> `optional` **telemetryComponentType?**: `string`

The component type for the optional telemetry component used for event metrics, defaults to no telemetry.

***

### config? {#config}

> `optional` **config?**: [`IFederatedCatalogueServiceConfig`](IFederatedCatalogueServiceConfig.md)

Configuration for the federated catalogue service.
