# Interface: IFederatedCatalogueFilter

Interface describing a filter plugin for the federated catalogue.
Filter plugins provide extensible query semantics and indexing strategies.
Filters are registered by name in the FilterFactory and do not need to self-identify.

## Extends

- `IComponent`

## Methods

### query() {#query}

> **query**(`trustInfo`, `filter`, `cursor?`, `limit?`): `Promise`\<\{ `datasets`: `IDcatDataset`[]; `cursor?`: `string`; \}\>

Execute a filter-specific query over the catalogue.
Each filter interprets its own criteria, but the dispatch shape is fixed (see the filter parameter).

#### Parameters

##### trustInfo

`ITrustVerificationInfo`

The trust verification information for the current request.

##### filter

`unknown`

The filter criteria as an object: this single filter's properties with the
routing "@type" selector removed by the service. The wire-level catalogue filter is an array
of such objects; the service selects the handler by "@type", strips it, then passes the
remaining criteria object here. Implementations must read criteria from this object, not from
an array wrapper.

##### cursor?

`string`

The pagination cursor from the previous query, if any.

##### limit?

`number`

The maximum number of results to return.

#### Returns

`Promise`\<\{ `datasets`: `IDcatDataset`[]; `cursor?`: `string`; \}\>

A promise that resolves with datasets matching the filter criteria and an optional cursor for the next page.

***

### createIndex() {#createindex}

> **createIndex**(`dataset`): `Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

Generate filter indexes for a dataset to optimize future queries.
Indexes are stored as properties on the dataset entity itself.

#### Parameters

##### dataset

`IDcatDataset`

The dataset to index.

#### Returns

`Promise`\<\{\[`key`: `string`\]: `unknown`; \}\>

A promise that resolves with a record mapping filter-specific index keys to values.
