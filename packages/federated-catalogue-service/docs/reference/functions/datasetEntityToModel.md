# Function: datasetEntityToModel()

> **datasetEntityToModel**(`entity`): `IDataset`

Convert a Dataset entity to an IDataset model.
Removes internal entity properties that should not be exposed in API responses.

## Parameters

### entity

The dataset entity from storage (may be partial from query results).

[`Dataset`](../classes/Dataset.md) | `Partial`\<[`Dataset`](../classes/Dataset.md)\>

## Returns

`IDataset`

The IDataset model for API responses.
