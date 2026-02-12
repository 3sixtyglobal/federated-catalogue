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

### start()

> **start**(): `Promise`\<`void`\>

Start the federated catalogue service.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`IFederatedCatalogueComponent.start`

***

### get()

> **get**(`dataSetId`): `Promise`\<`IDataspaceProtocolCatalogError` \| `IDcatDataset`\>

Retrieve a dataset by its unique identifier.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset.

#### Returns

`Promise`\<`IDataspaceProtocolCatalogError` \| `IDcatDataset`\>

The dataset if found, or a CatalogError if not found or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.get`

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

#### Implementation of

`IFederatedCatalogueComponent.set`

***

### query()

> **query**(`filter?`, `cursor?`, `limit?`): `Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

Execute a query against the catalogue using registered filter plugins.
Returns a DS Protocol compliant Catalog object with participantId.

The root catalog's participantId is the requesting participant (from context).
Own datasets (matching requestingParticipantId) go directly in root dataset[].
Other participants' datasets are grouped in nested catalog[] entries.

For anonymous requests (no context), uses the first publisher found as fallback.
Returns CatalogError 404 when no datasets exist, CatalogError 400 for invalid requests.

#### Parameters

##### filter?

`unknown`[]

The filter criteria containing @type, optional cursor and limit properties.

##### cursor?

`string`

Optional cursor for pagination.

##### limit?

`number`

Optional limit for pagination.

#### Returns

`Promise`\<\{ `result`: `IDataspaceProtocolCatalogError` \| `IDataspaceProtocolCatalog`; `cursor?`: `string`; \}\>

Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
or CatalogError if validation fails or an error occurs.

#### Implementation of

`IFederatedCatalogueComponent.query`

***

### remove()

> **remove**(`dataSetId`): `Promise`\<`void`\>

Remove a dataset from the catalogue by its unique identifier.
Indexes are automatically removed as they are stored with the dataset.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset to remove.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`IFederatedCatalogueComponent.remove`
