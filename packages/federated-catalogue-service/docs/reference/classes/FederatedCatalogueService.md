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

#### Implementation of

`IFederatedCatalogueComponent.get`

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

#### Implementation of

`IFederatedCatalogueComponent.set`

***

### query()

> **query**(`filter?`): `Promise`\<`ICatalog`\>

Execute a query against the catalogue using registered filter plugins.
Returns a complete DCAT Catalog object with proper JSON-LD context, metadata, and datasets.
The filter payload is evaluated by the appropriate filter plugin based on its structure.
Pagination properties (cursor, limit) and filter type (@type) are extracted from the filter object.

#### Parameters

##### filter?

`IBaseFilter`[]

The filter criteria containing @type, optional cursor and limit properties.

#### Returns

`Promise`\<`ICatalog`\>

Complete ICatalog object with @context, @id, @type, dcat:dataset, and optional cursor.

#### Throws

NotFoundError if

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
