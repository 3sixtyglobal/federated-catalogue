# Interface: ICatalogRequestRequest

The request parameters for the catalog request method.

## Properties

### headers? {#headers}

> `optional` **headers?**: `object`

The request headers. Authorization header carries the trust token (Bearer scheme).

#### authorization?

> `optional` **authorization?**: `string`

***

### body {#body}

> **body**: `IDataspaceProtocolCatalogRequestMessage`

The request body containing the catalog query.

***

### query? {#query}

> `optional` **query?**: `object`

Optional query parameters for pagination.
Used when following Link header URLs per DS Protocol spec.

#### cursor?

> `optional` **cursor?**: `string`

Opaque cursor token for pagination.

#### limit?

> `optional` **limit?**: `string`

Limit for pagination.
