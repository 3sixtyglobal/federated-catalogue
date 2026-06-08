# Function: datasetEntityToModel()

> **datasetEntityToModel**(`entity`): `IDcatDataset`

Convert a Dataset entity to an IDcatDataset model.
Maps entity.id back to model["@id"] and strips the storage-only id field.

## Parameters

### entity

[`Dataset`](../classes/Dataset.md) \| `Partial`\<[`Dataset`](../classes/Dataset.md)\>

The dataset entity from storage (may be partial from query results).

## Returns

`IDcatDataset`

The IDcatDataset model for API responses.
