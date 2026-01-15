# Interface: IFederatedCatalogueFilter

Interface describing a filter plugin for the federated catalogue.
Filter plugins provide extensible query semantics and indexing strategies.
Filters are registered by name in the FilterFactory and do not need to self-identify.

## Extends

- `IComponent`

## Methods

### query()

> **query**(`filter`, `cursor?`, `limit?`): `Promise`\<\{ `datasets`: `IDcatDataset`[]; `cursor?`: `string`; \}\>

Execute a filter-specific query over the catalogue.
Each filter interprets the payload according to its own semantics.

#### Parameters

##### filter

`unknown`

The filter criteria (structure depends on the filter implementation).

##### cursor?

`string`

The pagination cursor from the previous query, if any.

##### limit?

`number`

The maximum number of results to return.

#### Returns

`Promise`\<\{ `datasets`: `IDcatDataset`[]; `cursor?`: `string`; \}\>

Object containing datasets matching the filter criteria and optional cursor for next page.

***

### createIndex()

> **createIndex**(`dataSet`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Generate filter indexes for a dataset to optimize future queries.
Indexes are stored as properties on the dataset entity itself.

#### Parameters

##### dataSet

`IDcatDataset`

The dataset to index.

#### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Record mapping filter-specific index keys to values.
