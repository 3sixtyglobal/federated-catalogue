# Interface: IFederatedCatalogueFilter

Interface describing a filter plugin for the federated catalogue.
Filter plugins provide extensible query semantics and indexing strategies.
Filters are registered by name in the FilterFactory and do not need to self-identify.

## Extends

- `IComponent`

## Methods

### query()

> **query**(`filter`): `Promise`\<\{ `datasets`: `IDataset`[]; `cursor?`: `string`; \}\>

Execute a filter-specific query over the catalogue.
Each filter interprets the payload according to its own semantics.
Pagination properties (cursor, limit) are extracted from the filter object by the service layer.

#### Parameters

##### filter

`unknown`

The filter criteria (structure depends on the filter implementation).

#### Returns

`Promise`\<\{ `datasets`: `IDataset`[]; `cursor?`: `string`; \}\>

Object containing datasets matching the filter criteria and optional cursor for next page.

***

### createIndex()

> **createIndex**(`dataSet`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Generate filter indexes for a dataset to optimize future queries.
Indexes are stored as properties on the dataset entity itself.

#### Parameters

##### dataSet

`IDataset`

The dataset to index.

#### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Record mapping filter-specific index keys to values.
