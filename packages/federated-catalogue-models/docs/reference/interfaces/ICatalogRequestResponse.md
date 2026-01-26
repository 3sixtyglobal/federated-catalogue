# Interface: ICatalogRequestResponse

The response payload for the catalog request method.
Returns a DS Protocol compliant Catalog with participantId, or CatalogError if no datasets found.

## Properties

### headers?

> `optional` **headers**: `object`

Optional headers including RFC 8288 Link header for pagination.

#### link?

> `optional` **link**: `string` \| `string`[]

***

### statusCode?

> `optional` **statusCode**: `HttpStatusCode`

Response status code.
Per DS Protocol: Returns appropriate HTTP code (e.g., 404) when returning CatalogError.

***

### body

> **body**: `IDataspaceProtocolCatalog` \| `IDataspaceProtocolCatalogError`

The response payload containing the DS Protocol compliant catalog with participantId,
or a CatalogError if no datasets are found (404).
Per DS Protocol: Single participant returns flat catalog, multiple participants return nested catalogs.
