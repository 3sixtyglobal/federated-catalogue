# Class: Dataset

Class describing a DCAT dataset for entity storage.
This wrapper enables efficient database indexing and querying while preserving
the full IDcatDataset JSON-LD structure.

## Constructors

### Constructor

> **new Dataset**(): `Dataset`

#### Returns

`Dataset`

## Properties

### id

> **id**: `string`

The unique identifier for the dataset (mapped from JSON-LD identifier).

***

### nodeIdentity

> **nodeIdentity**: `string`

The identity of the node that owns this entity (required for sync).

***

### dateModified

> **dateModified**: `string`

The date the entity was last modified (required for sync).

***

### @context

> **@context**: `DcatContextType`

The JSON-LD context for the dataset.

***

### @type

> **@type**: `"dcat:Dataset"` \| `"dcat:Catalog"` \| `"dcat:DatasetSeries"`

The type of the resource (typically "Dataset").

***

### dcterms:title?

> `optional` **dcterms:title**: `DcatLiteralType`

A name given to the resource.

***

### dcterms:description?

> `optional` **dcterms:description**: `DcatLiteralType`

A free-text account of the resource.

***

### dcterms:identifier?

> `optional` **dcterms:identifier**: `DcatLiteralType`

A unique identifier of the resource.

***

### dcterms:issued?

> `optional` **dcterms:issued**: `string`

Date of formal issuance (publication) of the resource.

***

### dcterms:modified?

> `optional` **dcterms:modified**: `string`

Most recent date on which the resource was changed, updated or modified.

***

### dcterms:language?

> `optional` **dcterms:language**: `ObjectOrArray`\<`string`\>

A language of the resource.

***

### dcterms:publisher?

> `optional` **dcterms:publisher**: `string` \| `IFoafAgentWithAliases`

An entity responsible for making the resource available.

***

### dcterms:creator?

> `optional` **dcterms:creator**: `string` \| `IFoafAgentWithAliases`

An entity responsible for producing the resource.

***

### dcterms:accessRights?

> `optional` **dcterms:accessRights**: `string` \| `IJsonLdNodeObject`

Information about who can access the resource or an indication of its security status.

***

### dcterms:license?

> `optional` **dcterms:license**: `string` \| `IJsonLdNodeObject`

A legal document under which the resource is made available.

***

### dcterms:rights?

> `optional` **dcterms:rights**: `string` \| `IJsonLdNodeObject`

Information about rights held in and over the resource.

***

### dcterms:conformsTo?

> `optional` **dcterms:conformsTo**: `ObjectOrArray`\<`string`\>

An established standard to which the resource conforms.

***

### dcterms:type?

> `optional` **dcterms:type**: `string`

The nature or genre of the resource.

***

### dcat:contactPoint?

> `optional` **dcat:contactPoint**: `string` \| `IJsonLdNodeObject`

Relevant contact information for the catalogued resource.

***

### dcat:keyword?

> `optional` **dcat:keyword**: `DcatLiteralType`

A keyword or tag describing the resource.

***

### dcat:theme?

> `optional` **dcat:theme**: `ObjectOrArray`\<`string`\>

A main category of the resource. A resource can have multiple themes.

***

### dcat:landingPage?

> `optional` **dcat:landingPage**: `ObjectOrArray`\<`string`\>

A Web page that can be navigated to gain access to the resource.

***

### dcat:qualifiedRelation?

> `optional` **dcat:qualifiedRelation**: `string` \| `IDcatRelationship`

Link to a description of a relationship with another resource.

***

### odrl:hasPolicy?

> `optional` **odrl:hasPolicy**: `IOdrlPolicy`

An ODRL conformant policy expressing the rights associated with the resource.

***

### dcat:distribution?

> `optional` **dcat:distribution**: `ObjectOrArray`\<`DistributionOptionalContext`\>

An available distribution of the dataset.

***

### dcterms:accrualPeriodicity?

> `optional` **dcterms:accrualPeriodicity**: `string`

The frequency at which the dataset is published.

***

### dcat:inSeries?

> `optional` **dcat:inSeries**: `string`

A dataset series of which the dataset is part.

***

### dcterms:spatial?

> `optional` **dcterms:spatial**: `ObjectOrArray`\<`string`\> \| `IJsonLdNodeObject`

The geographical area covered by the dataset.

***

### dcat:spatialResolutionInMeters?

> `optional` **dcat:spatialResolutionInMeters**: `number`

Minimum spatial separation resolvable in a dataset, measured in meters.

***

### dcterms:temporal?

> `optional` **dcterms:temporal**: `IDublinCorePeriodOfTime`

The temporal period that the dataset covers.

***

### dcat:temporalResolution?

> `optional` **dcat:temporalResolution**: `string`

Minimum time period resolvable in the dataset.

***

### prov:wasGeneratedBy?

> `optional` **prov:wasGeneratedBy**: `string` \| `IJsonLdNodeObject`

An activity that generated, or provides the business context for, the creation of the dataset.
