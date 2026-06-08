# Class: FederatedCatalogueService

Service for managing federated catalogue operations.
Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.

## Implements

- `IFederatedCatalogueComponent`

## Constructors

### Constructor

> **new FederatedCatalogueService**(`options?`): `FederatedCatalogueService`

Create a new instance of FederatedCatalogueService.

#### Parameters

##### options?

[`IFederatedCatalogueServiceConstructorOptions`](../interfaces/IFederatedCatalogueServiceConstructorOptions.md)

The options for the service.

#### Returns

`FederatedCatalogueService`

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

> **get**(`datasetId`, `trustPayload`): `Promise`\<`IDataspaceProtocolCatalogError` \| `IDcatDataset`\>

Retrieve a dataset by its unique identifier.

#### Parameters

##### datasetId

`string`

The unique identifier of the dataset.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<`IDataspaceProtocolCatalogError` \| `IDcatDataset`\>

The dataset if found, or a CatalogError if not found or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.get`

***

### set() {#set}

> **set**(`dataset`, `trustPayload`): `Promise`\<`string` \| `IDataspaceProtocolCatalogError`\>

Insert or update a dataset in the catalogue.

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
Indexes are automatically removed as they are stored with the dataset.

#### Parameters

##### datasetId

`string`

The unique identifier of the dataset to remove.

##### trustPayload

`unknown`

Optional payload for trust evaluation, if applicable.

#### Returns

`Promise`\<`IDataspaceProtocolCatalogError` \| `undefined`\>

Nothing, or a CatalogError if an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.remove`

***

### query() {#query}

> **query**(`filter`, `cursor`, `limit`, `trustPayload`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

Execute a query against the catalogue using registered filter plugins.
Returns a DS Protocol compliant Catalog object with participantId.

The root catalog's participantId is the requesting participant (from context).
Own datasets (matching requestingParticipantId) go directly in root dataset[].
Other participants' datasets are grouped in nested catalog[] entries.

For anonymous requests (no context), uses the first publisher found as fallback.
Returns CatalogError 404 when no datasets exist, CatalogError 400 for invalid requests.

#### Parameters

##### filter

`unknown`[] \| `undefined`

The filter criteria containing @type, optional cursor and limit properties.

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

Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
or CatalogError if validation fails or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.query`
