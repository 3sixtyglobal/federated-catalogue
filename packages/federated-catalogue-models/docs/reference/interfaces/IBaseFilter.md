# Interface: IBaseFilter

Base filter interface with pagination support.
All filter objects in the federated catalogue extend this base.

Per Eclipse Dataspace Protocol constraints, cursor and limit cannot be
top-level properties in CatalogRequestMessage. They must be embedded
within the filter object using a custom JSON-LD vocabulary.

After JSON-LD compaction, properties use direct names (cursor, limit) rather
than prefixed names. Each filter implementation should extend this interface
to define its own filter-specific properties.

## Extends

- `IJsonLdNodeObject`

## Indexable

\[`key`: `string`\]: `string` \| `number` \| `boolean` \| `IJsonLdNodeObject` \| `IJsonLdGraphObject` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `IJsonLdListObject` \| `IJsonLdSetObject` \| `IJsonLdNodePrimitive`[] \| `IJsonLdLanguageMap` \| `IJsonLdIndexMap` \| `IJsonLdNodeObject`[] \| `IJsonLdIdMap` \| `IJsonLdTypeMap` \| `IJsonLdContextDefinition` \| `IJsonLdContextDefinitionElement`[] \| `string`[] \| `IJsonLdJsonObject` \| `IJsonLdJsonObject`[] \| \{\[`key`: `string`\]: `string`; \} \| `null` \| `undefined`

## Properties

### @type

> **@type**: `string`

Filter type discriminator.
Used to route filter to appropriate filter implementation.
Example: "FilterByExample", "FilterByPolicy", etc.
Required for filter routing.

#### Overrides

`IJsonLdNodeObject.@type`

***

### cursor?

> `optional` **cursor**: `string`

Optional cursor for pagination.
When provided, returns results starting after this cursor.
Namespace: https://schema.twindev.org/federated-catalogue/cursor

***

### limit?

> `optional` **limit**: `number`

Optional limit for number of results.
Defaults to implementation-specific value if not provided.
Namespace: https://schema.twindev.org/federated-catalogue/limit
