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

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IFederatedCatalogueComponent.className`

***

### get() {#get}

> **get**(`datasetId`, `trustPayload`): `Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

Retrieve a specific dataset by its unique identifier.

#### Parameters

##### datasetId

`string`

The unique identifier of the dataset.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

The dataset if found, or a CatalogError if not found or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.get`

***

### set() {#set}

> **set**(`dataset`, `trustPayload`): `Promise`\<`string` \| `IDataspaceProtocolCatalogError`\>

Insert or update a dataset in the catalogue.
This method is internal and is not exposed via REST endpoints.

#### Parameters

##### dataset

`IDcatDataset`

The dataset to store.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<`string` \| `IDataspaceProtocolCatalogError`\>

The unique identifier of the stored dataset, or a CatalogError if an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.set`

***

### remove() {#remove}

> **remove**(`datasetId`, `trustPayload`): `Promise`\<`IDataspaceProtocolCatalogError` \| `undefined`\>

Remove a dataset from the catalogue by its unique identifier.
This method is internal and is not exposed via REST endpoints.

#### Parameters

##### datasetId

`string`

The unique identifier of the dataset to remove.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<`IDataspaceProtocolCatalogError` \| `undefined`\>

Nothing.

#### Implementation of

`IFederatedCatalogueComponent.remove`

***

### query() {#query}

> **query**(`filter`, `cursor`, `limit`, `trustPayload`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

Query the federated catalogue with an optional filter.

#### Parameters

##### filter

`unknown`[] \| `undefined`

Optional filter criteria for querying datasets.

##### cursor

`string` \| `undefined`

Optional cursor for pagination.

##### limit

`number` \| `undefined`

Optional limit for pagination.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

The catalog containing matching datasets (or CatalogError if none found), with cursor if more pages exist.

#### Implementation of

`IFederatedCatalogueComponent.query`
