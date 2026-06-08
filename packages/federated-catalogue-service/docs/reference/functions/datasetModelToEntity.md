# Function: datasetModelToEntity()

> **datasetModelToEntity**(`model`): [`Dataset`](../classes/Dataset.md)

Convert an IDcatDataset model to a Dataset entity.
Maps model["@id"] to entity.id.

## Parameters

### model

`IDcatDataset`

The IDcatDataset model from API requests.

## Returns

[`Dataset`](../classes/Dataset.md)

The Dataset entity for storage.
