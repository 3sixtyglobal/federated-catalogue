# Interface: IFederatedCatalogueComponent

Interface describing a federated catalogue component.
Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.

## Extends

- `IComponent`

## Methods

### get() {#get}

> **get**(`datasetId`, `trustPayload`): `Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

Retrieve a dataset by its unique identifier.

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

***

### set() {#set}

> **set**(`dataset`, `trustPayload`): `Promise`\<`string` \| `IDataspaceProtocolCatalogError`\>

Insert or update a dataset in the catalogue.
This method is internal and should not be exposed via REST endpoints.

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

***

### query() {#query}

> **query**(`filter`, `cursor`, `limit`, `trustPayload`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`; `cursor?`: `string`; \}\>

Execute a query against the catalogue using registered filter plugins.
Returns a DS Protocol compliant Catalog object with participantId.

The root catalog's participantId is the requesting participant (from context).
Own datasets (matching requestingParticipantId) go directly in root dataset[].
Other participants' datasets are grouped in nested catalog[] entries.

For anonymous requests (no context), uses the first publisher found as fallback.
Returns CatalogError 404 when no datasets exist.

#### Parameters

##### filter

`unknown`[] \| `undefined`

The filter criteria containing @type.

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

`Promise`\<\{ `result`: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`; `cursor?`: `string`; \}\>

Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
or IDataspaceProtocolCatalogError if no datasets found.

***

### remove() {#remove}

> **remove**(`datasetId`, `trustPayload`): `Promise`\<`IDataspaceProtocolCatalogError` \| `undefined`\>

Remove a dataset from the catalogue by its unique identifier.

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
