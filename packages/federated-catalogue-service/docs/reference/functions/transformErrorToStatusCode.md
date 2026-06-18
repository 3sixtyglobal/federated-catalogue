# Function: transformErrorToStatusCode()

> **transformErrorToStatusCode**(`result`): `HttpStatusCode` \| `undefined`

Map a Dataspace Protocol result to an HTTP status code.

## Parameters

### result

`unknown`

The result to evaluate.

## Returns

`HttpStatusCode` \| `undefined`

The HTTP status code if the result is a CatalogError or an error object, otherwise undefined.
