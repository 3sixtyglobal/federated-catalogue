# Function: transformErrorToStatusCode()

> **transformErrorToStatusCode**(`result`): `HttpStatusCode` \| `undefined`

Transform the DS Protocol result to an HTTP status code.

## Parameters

### result

`unknown`

The result to transform.

## Returns

`HttpStatusCode` \| `undefined`

The transformed status code or undefined if no transformation was found or not an error.
