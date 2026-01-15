# Function: datasetEntityToModel()

> **datasetEntityToModel**(`entity`): `IDcatDataset`

Convert a Dataset entity to an IDcatDataset model.
Removes internal entity properties that should not be exposed in API responses.

## Parameters

### entity

The dataset entity from storage (may be partial from query results).

[`Dataset`](../classes/Dataset.md) | `Partial`\<[`Dataset`](../classes/Dataset.md)\>

## Returns

`IDcatDataset`

The IDcatDataset model for API responses.
