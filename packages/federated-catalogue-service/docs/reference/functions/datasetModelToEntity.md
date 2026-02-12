# Function: datasetModelToEntity()

> **datasetModelToEntity**(`model`, `nodeIdentity`, `dateModified`): [`Dataset`](../classes/Dataset.md)

Convert an IDcatDataset model to a Dataset entity.
Maps model["@id"] to entity.id and sets sync fields from provided values.

## Parameters

### model

`IDcatDataset`

The IDcatDataset model from API requests.

### nodeIdentity

`string`

The node identity to set on the entity.

### dateModified

`string`

The dateModified timestamp to set on the entity.

## Returns

[`Dataset`](../classes/Dataset.md)

The Dataset entity for storage.
