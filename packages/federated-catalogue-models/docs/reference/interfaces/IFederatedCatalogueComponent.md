# Interface: IFederatedCatalogueComponent

Interface describing a federated catalogue component.
Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.

## Extends

- `IComponent`

## Methods

### get()

> **get**(`dataSetId`): `Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

Retrieve a dataset by its unique identifier.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset.

#### Returns

`Promise`\<`IDcatDataset` \| `IDataspaceProtocolCatalogError`\>

The dataset if found, or a CatalogError if not found or an error occurs.

***

### set()

> **set**(`dataSet`): `Promise`\<`void`\>

Insert or update a dataset in the catalogue.
This method is internal and should not be exposed via REST endpoints.

#### Parameters

##### dataSet

`IDcatDataset`

The dataset to store.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### query()

> **query**(`filter?`, `cursor?`, `limit?`): `Promise`\<\{ `catalog`: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`; `cursor?`: `string`; \}\>

Execute a query against the catalogue using registered filter plugins.
Returns a DS Protocol compliant Catalog object with participantId.

The root catalog's participantId is the requesting participant (from context).
Own datasets (matching requestingParticipantId) go directly in root dataset[].
Other participants' datasets are grouped in nested catalog[] entries.

For anonymous requests (no context), uses the first publisher found as fallback.
Returns CatalogError 404 when no datasets exist.

#### Parameters

##### filter?

`unknown`[]

The filter criteria containing @type.

##### cursor?

`string`

Optional cursor for pagination.

##### limit?

`number`

Optional limit for pagination.

#### Returns

`Promise`\<\{ `catalog`: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`; `cursor?`: `string`; \}\>

Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
or IDataspaceProtocolCatalogError if no datasets found.

#### Throws

NotFoundError if the

***

### remove()

> **remove**(`dataSetId`): `Promise`\<`void`\>

Remove a dataset from the catalogue by its unique identifier.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset to remove.

#### Returns

`Promise`\<`void`\>

Nothing.
