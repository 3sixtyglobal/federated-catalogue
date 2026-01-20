# Function: transformToCatalogError()

> **transformToCatalogError**(`error`): `IDataspaceProtocolCatalogError`

Transform an error to DS Protocol CatalogError format.
Used by both service and route layers to ensure consistent error responses.

## Parameters

### error

`unknown`

The error to transform.

## Returns

`IDataspaceProtocolCatalogError`

The CatalogError.
