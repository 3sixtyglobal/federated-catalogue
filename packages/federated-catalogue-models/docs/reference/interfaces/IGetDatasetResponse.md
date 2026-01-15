# Interface: IGetDatasetResponse

The response payload for the get dataset method.

## Properties

### statusCode?

> `optional` **statusCode**: `HttpStatusCode`

Response status code.

***

### body

> **body**: `IDcatDataset` \| `IDataspaceProtocolCatalogError`

The response payload containing the dataset or error.
