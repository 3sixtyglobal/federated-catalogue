# Class: FilterByExample

Filter plugin that matches datasets by example attributes using partial matching.
Supports nested properties and array matching.

## Implements

- `IFederatedCatalogueFilter`

## Constructors

### Constructor

> **new FilterByExample**(`options?`): `FilterByExample`

Create a new instance of FilterByExample.

#### Parameters

##### options?

[`IFilterByExampleConstructorOptions`](../interfaces/IFilterByExampleConstructorOptions.md)

The options for the filter.

#### Returns

`FilterByExample`

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

`IFederatedCatalogueFilter.className`

***

### query()

> **query**(`filter`): `Promise`\<\{ `datasets`: `IDataset`[]; `cursor?`: `string`; \}\>

Execute a filter-specific query over the catalogue.
Uses database-level filtering with query conditions.

#### Parameters

##### filter

`unknown`

The filter criteria (Partial<IDataset> with example values).

#### Returns

`Promise`\<\{ `datasets`: `IDataset`[]; `cursor?`: `string`; \}\>

Object containing datasets matching the filter criteria and optional cursor for next page.

#### Implementation of

`IFederatedCatalogueFilter.query`

***

### createIndex()

> **createIndex**(`dataSet`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Generate filter indexes for a dataset to optimize future queries.
Creates indexes for common searchable properties.
Indexes are stored as properties on the dataset entity itself.

#### Parameters

##### dataSet

`IDataset`

The dataset to index.

#### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Record mapping property names to their values for indexing.

#### Implementation of

`IFederatedCatalogueFilter.createIndex`
