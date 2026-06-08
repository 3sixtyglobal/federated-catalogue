# Interface: IDatasetGetResponse

The response payload for the get dataset method.

## Properties

### statusCode? {#statuscode}

> `optional` **statusCode?**: `HttpStatusCode`

Response status code.

***

### body {#body}

> **body**: `IDcatDataset` \| `IDataspaceProtocolCatalogError`

The response payload containing the dataset or error.
