# Interface: IDatasetSetRequest

The request parameters for the set dataset method.

## Properties

### headers? {#headers}

> `optional` **headers?**: `object`

The request headers. Authorization header carries the trust token (Bearer scheme).

#### authorization?

> `optional` **authorization?**: `string`

***

### body {#body}

> **body**: `IDcatDataset`

The request body containing the dataset to store.
