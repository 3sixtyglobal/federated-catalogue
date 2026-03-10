# Federated Catalogue REST Client Examples

Use these snippets to call catalogue endpoints consistently, including paged queries, dataset retrieval and unsupported mutation handling.

## FederatedCatalogueRestClient

```typescript
import { FederatedCatalogueRestClient } from '@twin.org/federated-catalogue-rest-client';

const client = new FederatedCatalogueRestClient({
  endpoint: 'http://localhost:3000'
});

console.log(client.className() === FederatedCatalogueRestClient.CLASS_NAME); // true
```

```typescript
import { FederatedCatalogueRestClient } from '@twin.org/federated-catalogue-rest-client';

const client = new FederatedCatalogueRestClient({
  endpoint: 'http://localhost:3000'
});

const queryResponse = await client.query(
  [
    {
      '@type': 'FilterByExample',
      'dcterms:publisher': {
        '@id': 'did:web:publisher.example'
      }
    }
  ],
  'page-1',
  25
);

console.log(queryResponse.result['@type']); // Catalog
console.log(typeof queryResponse.cursor === 'string' || queryResponse.cursor === undefined); // true
```

```typescript
import { FederatedCatalogueRestClient } from '@twin.org/federated-catalogue-rest-client';

const client = new FederatedCatalogueRestClient({
  endpoint: 'http://localhost:3000'
});

const dataset = await client.get('urn:dataset:air-quality-2026');

console.log(dataset['@id']); // urn:dataset:air-quality-2026
```

```typescript
import { FederatedCatalogueRestClient } from '@twin.org/federated-catalogue-rest-client';

const client = new FederatedCatalogueRestClient({
  endpoint: 'http://localhost:3000'
});

try {
  await client.set({
    '@context': ['https://www.w3.org/ns/dcat3.jsonld'],
    '@type': 'dcat:Dataset',
    '@id': 'urn:dataset:air-quality-2026'
  });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.name); // NotSupportedError
  }
}

try {
  await client.remove('urn:dataset:air-quality-2026');
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.name); // NotSupportedError
  }
}
```
