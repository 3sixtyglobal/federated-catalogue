# Federated Catalogue Filters Examples

Use these snippets when you want practical filtering behaviour for dataset lookups, from simple page reads through to structured index generation.

## FilterByExample

```typescript
import { MemoryEntityStorageConnector } from '@twin.org/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@twin.org/entity-storage-models';
import { FilterByExample } from '@twin.org/federated-catalogue-filters';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const filter = new FilterByExample({
  datasetStorageConnectorType: 'dataset'
});

console.log(filter.className() === FilterByExample.CLASS_NAME); // true
```

```typescript
import { MemoryEntityStorageConnector } from '@twin.org/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@twin.org/entity-storage-models';
import { FilterByExample } from '@twin.org/federated-catalogue-filters';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const filter = new FilterByExample({
  datasetStorageConnectorType: 'dataset'
});

const index = await filter.createIndex({
  '@context': ['https://www.w3.org/ns/dcat3.jsonld'],
  '@type': 'dcat:Dataset',
  '@id': 'urn:dataset:air-quality-2026',
  'dcterms:title': { '@value': 'Air quality readings' },
  'dcterms:description': { '@value': 'Hourly PM2.5 values' },
  'dcterms:publisher': { '@id': 'did:web:publisher.example' },
  'dcat:keyword': [{ '@value': 'air' }, { '@value': 'pm25' }]
});

console.log(Object.keys(index).length); // 4
```

```typescript
import { MemoryEntityStorageConnector } from '@twin.org/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@twin.org/entity-storage-models';
import { FilterByExample } from '@twin.org/federated-catalogue-filters';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const filter = new FilterByExample({
  datasetStorageConnectorType: 'dataset'
});

const result = await filter.query(
  {
    'dcterms:publisher': { '@id': 'did:web:publisher.example' }
  },
  'cursor-1',
  10
);

console.log(Array.isArray(result.datasets)); // true
console.log(typeof result.cursor === 'string' || result.cursor === undefined); // true
```
