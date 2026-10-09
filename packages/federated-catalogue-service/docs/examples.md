# Federated Catalogue Service Examples

These snippets show a realistic service flow for bootstrapping, storing and querying datasets, then removing records when lifecycle events require cleanup.

## FederatedCatalogueService

```typescript
import { MemoryEntityStorageConnector } from '@3sixty/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@3sixty/entity-storage-models';
import { FederatedCatalogueService } from '@3sixty/federated-catalogue-service';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const service = new FederatedCatalogueService({
  datasetEntityStorageType: 'dataset'
});

console.log(service.className() === FederatedCatalogueService.CLASS_NAME); // true
```

```typescript
import { ContextIdKeys, ContextIdStore } from '@3sixty/context';
import { MemoryEntityStorageConnector } from '@3sixty/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@3sixty/entity-storage-models';
import { FederatedCatalogueService } from '@3sixty/federated-catalogue-service';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const service = new FederatedCatalogueService({
  datasetEntityStorageType: 'dataset'
});

await ContextIdStore.set('request-1', {
  [ContextIdKeys.Node]: 'did:web:node.example',
  [ContextIdKeys.Organization]: 'did:web:publisher.example'
});

await service.start();

await service.set({
  '@context': ['https://w3id.org/dspace/2024/1/context.json', 'https://www.w3.org/ns/dcat3.jsonld'],
  '@type': 'dcat:Dataset',
  '@id': 'urn:dataset:air-quality-2026',
  'dcterms:identifier': 'urn:dataset:air-quality-2026',
  'dcterms:publisher': {
    '@id': 'did:web:publisher.example'
  },
  'dcterms:title': {
    '@value': 'Air quality readings'
  }
});

const dataset = await service.get('urn:dataset:air-quality-2026');

console.log(dataset['@id']); // urn:dataset:air-quality-2026
```

```typescript
import { ContextIdKeys, ContextIdStore } from '@3sixty/context';
import { MemoryEntityStorageConnector } from '@3sixty/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@3sixty/entity-storage-models';
import { FederatedCatalogueService } from '@3sixty/federated-catalogue-service';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const service = new FederatedCatalogueService({
  datasetEntityStorageType: 'dataset'
});

await ContextIdStore.set('request-2', {
  [ContextIdKeys.Node]: 'did:web:node.example',
  [ContextIdKeys.Organization]: 'did:web:publisher.example'
});

await service.start();

const queryResult = await service.query(
  [
    {
      '@type': 'FilterByMetadata',
      'dcterms:publisher': {
        '@id': 'did:web:publisher.example'
      }
    }
  ],
  'cursor-0',
  20
);

console.log(queryResult.result['@type']); // Catalog
console.log(typeof queryResult.cursor === 'string' || queryResult.cursor === undefined); // true
```

```typescript
import { MemoryEntityStorageConnector } from '@3sixty/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@3sixty/entity-storage-models';
import { FederatedCatalogueService } from '@3sixty/federated-catalogue-service';

EntityStorageConnectorFactory.register('dataset', () => new MemoryEntityStorageConnector());

const service = new FederatedCatalogueService({
  datasetEntityStorageType: 'dataset'
});

await service.remove('urn:dataset:air-quality-2026');

console.log('removed'.toUpperCase()); // REMOVED
```

## Dataset

```typescript
import { Dataset } from '@3sixty/federated-catalogue-service';

const datasetEntity = new Dataset();
datasetEntity.id = 'urn:dataset:air-quality-2026';
datasetEntity.nodeIdentity = 'did:web:node.example';
datasetEntity.dateModified = '2026-03-10T12:00:00.000Z';
datasetEntity['@context'] = ['https://www.w3.org/ns/dcat3.jsonld'];
datasetEntity['@type'] = 'dcat:Dataset';
datasetEntity['dcterms:title'] = { '@value': 'Air quality readings' };
datasetEntity['dcterms:publisher'] = { '@id': 'did:web:publisher.example' };

console.log(datasetEntity.id); // urn:dataset:air-quality-2026
console.log(datasetEntity['@type']); // dcat:Dataset
```
