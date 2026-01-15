# Function: datasetModelToEntity()

> **datasetModelToEntity**(`model`): [`Dataset`](../classes/Dataset.md)

Convert an IDcatDataset model to a Dataset entity.
Prepares the model for storage by converting to entity type.
Creates a shallow copy to avoid mutating the input model.

## Parameters

### model

`IDcatDataset`

The IDcatDataset model from API requests.

## Returns

[`Dataset`](../classes/Dataset.md)

The Dataset entity for storage.
