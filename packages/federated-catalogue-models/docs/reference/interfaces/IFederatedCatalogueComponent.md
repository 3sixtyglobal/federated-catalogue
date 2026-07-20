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

A promise that resolves with the dataset if found, or a CatalogError if not found or an error occurs.

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

A promise that resolves with the unique identifier of the stored dataset, or a CatalogError if an error occurs.

***

### query() {#query}

> **query**(`filter`, `cursor`, `limit`, `trustPayload`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`; `cursor?`: `string`; \}\>

Execute a query against the catalogue using registered filter plugins.
Returns a Dataspace Protocol compliant Catalog object with participantId.

The root catalog's participantId is the requesting participant (from context).
Own datasets (matching requestingParticipantId) go directly in root dataset[].
Other participants' datasets are grouped in nested catalog[] entries.

For anonymous requests (no context), uses the first publisher found as fallback.
Returns a CatalogError with status 404 when no datasets exist.

#### Parameters

##### filter

`unknown`[] \| `undefined`

The filter criteria array, where the first element contains @type.

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

A promise that resolves with the catalog result and optional next-page cursor.

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

A promise that resolves with undefined on success, or a CatalogError if removal fails.
