# Function: datasetModelToEntity()

> **datasetModelToEntity**(`model`): [`Dataset`](../classes/Dataset.md)

Convert an IDataset model to a Dataset entity.
Prepares the model for storage by converting to entity type.
Creates a shallow copy to avoid mutating the input model.

## Parameters

### model

`IDataset`

The IDataset model from API requests.

## Returns

[`Dataset`](../classes/Dataset.md)

The Dataset entity for storage.
