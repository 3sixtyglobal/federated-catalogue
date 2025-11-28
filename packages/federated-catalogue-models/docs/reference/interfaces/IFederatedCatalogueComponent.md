# Interface: IFederatedCatalogueComponent

Interface describing a federated catalogue component.
Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.

## Extends

- `IComponent`

## Methods

### get()

> **get**(`dataSetId`): `Promise`\<`IDataset`\>

Retrieve a dataset by its unique identifier.

#### Parameters

##### dataSetId

`string`

The unique identifier of the dataset.

#### Returns

`Promise`\<`IDataset`\>

The dataset if found.

#### Throws

NotFoundError if the dataset does not exist.

***

### set()

> **set**(`dataSet`): `Promise`\<`void`\>

Insert or update a dataset in the catalogue.
This method is internal and should not be exposed via REST endpoints.

#### Parameters

##### dataSet

`IDataset`

The dataset to store.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### query()

> **query**(`filter?`): `Promise`\<`ICatalog`\>

Execute a query against the catalogue using registered filter plugins.
Returns a complete DCAT Catalog object with proper JSON-LD context, metadata, and datasets.
Filter plugins must be registered in FilterFactory before service initialization.
The filter payload is evaluated by the appropriate filter plugin based on its structure.
Pagination properties (cursor, limit) and filter type (@type) should be included
within the filter object per Eclipse Dataspace Protocol JSON-LD extension patterns.

#### Parameters

##### filter?

`unknown`[]

The filter criteria containing @type, optional cursor and limit properties.

#### Returns

`Promise`\<`ICatalog`\>

Complete ICatalog object with @context, @id, @type, dcat:dataset, and optional cursor.

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
