# Class: FederatedCatalogueRestClient

Client for performing federated catalogue operations through REST endpoints.

## Extends

- `BaseRestClient`

## Implements

- `IFederatedCatalogueComponent`

## Constructors

### Constructor

> **new FederatedCatalogueRestClient**(`config`): `FederatedCatalogueRestClient`

Create a new instance of FederatedCatalogueRestClient.

#### Parameters

##### config

`IBaseRestClientConfig`

The configuration for the client.

#### Returns

`FederatedCatalogueRestClient`

#### Overrides

`BaseRestClient.constructor`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className()

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IFederatedCatalogueComponent.className`

***

### query()

> **query**(`filter?`, `cursor?`, `limit?`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

Query the federated catalogue with an optional filter.

#### Parameters

##### filter?

`unknown`[]

Optional filter criteria for querying datasets.

##### cursor?

`string`

Optional cursor for pagination.

##### limit?

`number`

Optional limit for pagination.

#### Returns

`Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

The catalog containing matching datasets (or CatalogError if none found), with cursor if more pages exist.

#### Implementation of

`IFederatedCatalogueComponent.query`

***

### get()

> **get**(`datasetId`): `Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

Retrieve a specific dataset by its unique identifier.

#### Parameters

##### datasetId

`string`

The unique identifier of the dataset.

#### Returns

`Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

The dataset if found, or a CatalogError if not found or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.get`

***

### set()

> **set**(`dataSet`): `Promise`\<`void`\>

Insert or update a dataset in the catalogue.
This method is internal and is not exposed via REST endpoints.

#### Parameters

##### dataSet

`IDcatDataset`

The dataset to store.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IFederatedCatalogueComponent.set`

***

### remove()

> **remove**(`dataSetId`): `Promise`\<`void`\>

Remove a dataset from the catalogue by its unique identifier.
This method is internal and is not exposed via REST endpoints.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset to remove.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IFederatedCatalogueComponent.remove`
