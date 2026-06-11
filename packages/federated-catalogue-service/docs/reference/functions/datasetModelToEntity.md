# Function: datasetModelToEntity()

> **datasetModelToEntity**(`model`, `ownerId`): [`Dataset`](../classes/Dataset.md)

Convert an IDcatDataset model to a Dataset entity.
Maps model["@id"] to entity.id.

## Parameters

### model

`IDcatDataset`

The IDcatDataset model from API requests.

### ownerId

`string`

The owner ID to associate with the dataset entity.

## Returns

[`Dataset`](../classes/Dataset.md)

The Dataset entity for storage.
