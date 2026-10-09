# Federated Catalogue Models Examples

These examples show how to register, discover and resolve filter components so catalogue services can select filtering logic at runtime.

## FederatedCatalogueFilterFactory

```typescript
import { FederatedCatalogueFilterFactory } from '@3sixty/federated-catalogue-models';

FederatedCatalogueFilterFactory.clear();

FederatedCatalogueFilterFactory.register('PublisherFilter', () => ({
  className() {
    return 'PublisherFilter';
  },
  async query() {
    return { datasets: [] };
  },
  async createIndex() {
    return {};
  }
}));

FederatedCatalogueFilterFactory.clear();

FederatedCatalogueFilterFactory.register('PublisherFilter', () => ({
  className() {
    return 'PublisherFilter';
  },
  async query() {
    return { datasets: [] };
  },
  async createIndex() {
    return {};
  }
}));

const filterNames = FederatedCatalogueFilterFactory.names();

console.log(filterNames.includes('PublisherFilter')); // true
```

```typescript
import { FederatedCatalogueFilterFactory } from '@3sixty/federated-catalogue-models';

const filter = FederatedCatalogueFilterFactory.get('PublisherFilter');
const queryResult = await filter.query([
  {
    '@type': 'PublisherFilter'
  }
]);

console.log(filter.className()); // PublisherFilter
console.log(queryResult.datasets.length); // 0
```
