# Interface: IDatasetSetResponse

The response payload for the set dataset method.

## Properties

### statusCode? {#statuscode}

> `optional` **statusCode?**: `HttpStatusCode`

Response status code.

***

### headers? {#headers}

> `optional` **headers?**: `object`

Optional headers.

#### location?

> `optional` **location?**: `string`

***

### body? {#body}

> `optional` **body?**: `IDataspaceProtocolCatalogError`

The response payload containing the dataset or error.
