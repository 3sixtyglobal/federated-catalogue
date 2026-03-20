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

### id {#id}

> **id**: `string`

The unique identifier for the dataset (mapped from JSON-LD identifier).

***

### nodeIdentity {#nodeidentity}

> **nodeIdentity**: `string`

The identity of the node that owns this entity (required for sync).

***

### dateModified {#datemodified}

> **dateModified**: `string`

The date the entity was last modified (required for sync).

***

### @context {#context}

> **@context**: `DcatContextType`

The JSON-LD context for the dataset.

***

### @type {#type}

> **@type**: `"dcat:Dataset"` \| `"dcat:Catalog"` \| `"dcat:DatasetSeries"`

The type of the resource (typically "Dataset").

***

### dcterms:title? {#dctermstitle}

> `optional` **dcterms:title?**: `ObjectOrArray`\<`string`\>

A name given to the resource.

***

### dcterms:description? {#dctermsdescription}

> `optional` **dcterms:description?**: `ObjectOrArray`\<`string`\>

A free-text account of the resource.

***

### dcterms:identifier? {#dctermsidentifier}

> `optional` **dcterms:identifier?**: `ObjectOrArray`\<`string`\>

A unique identifier of the resource.

***

### dcterms:issued? {#dctermsissued}

> `optional` **dcterms:issued?**: `string`

Date of formal issuance (publication) of the resource.

***

### dcterms:modified? {#dctermsmodified}

> `optional` **dcterms:modified?**: `string`

Most recent date on which the resource was changed, updated or modified.

***

### dcterms:language? {#dctermslanguage}

> `optional` **dcterms:language?**: `ObjectOrArray`\<`string`\>

A language of the resource.

***

### dcterms:publisher? {#dctermspublisher}

> `optional` **dcterms:publisher?**: `string` \| `IFoafAgentWithAliases`

An entity responsible for making the resource available.

***

### dcterms:creator? {#dctermscreator}

> `optional` **dcterms:creator?**: `string` \| `IFoafAgentWithAliases`

An entity responsible for producing the resource.

***

### dcterms:accessRights? {#dctermsaccessrights}

> `optional` **dcterms:accessRights?**: `string` \| `IJsonLdNodeObject`

Information about who can access the resource or an indication of its security status.

***

### dcterms:license? {#dctermslicense}

> `optional` **dcterms:license?**: `string` \| `IJsonLdNodeObject`

A legal document under which the resource is made available.

***

### dcterms:rights? {#dctermsrights}

> `optional` **dcterms:rights?**: `string` \| `IJsonLdNodeObject`

Information about rights held in and over the resource.

***

### dcterms:conformsTo? {#dctermsconformsto}

> `optional` **dcterms:conformsTo?**: `ObjectOrArray`\<`string`\>

An established standard to which the resource conforms.

***

### dcterms:type? {#dctermstype}

> `optional` **dcterms:type?**: `string`

The nature or genre of the resource.

***

### dcat:contactPoint? {#dcatcontactpoint}

> `optional` **dcat:contactPoint?**: `string` \| `IJsonLdNodeObject`

Relevant contact information for the catalogued resource.

***

### dcat:keyword? {#dcatkeyword}

> `optional` **dcat:keyword?**: `ObjectOrArray`\<`string`\>

A keyword or tag describing the resource.

***

### dcat:theme? {#dcattheme}

> `optional` **dcat:theme?**: `ObjectOrArray`\<`string`\>

A main category of the resource. A resource can have multiple themes.

***

### dcat:landingPage? {#dcatlandingpage}

> `optional` **dcat:landingPage?**: `ObjectOrArray`\<`string`\>

A Web page that can be navigated to gain access to the resource.

***

### dcat:qualifiedRelation? {#dcatqualifiedrelation}

> `optional` **dcat:qualifiedRelation?**: `string` \| `IDcatRelationship`

Link to a description of a relationship with another resource.

***

### odrl:hasPolicy? {#odrlhaspolicy}

> `optional` **odrl:hasPolicy?**: `IOdrlPolicy`

An ODRL conformant policy expressing the rights associated with the resource.

***

### dcat:distribution? {#dcatdistribution}

> `optional` **dcat:distribution?**: `ObjectOrArray`\<`IDcatDistributionBase`\>

An available distribution of the dataset.

***

### dcterms:accrualPeriodicity? {#dctermsaccrualperiodicity}

> `optional` **dcterms:accrualPeriodicity?**: `string`

The frequency at which the dataset is published.

***

### dcat:inSeries? {#dcatinseries}

> `optional` **dcat:inSeries?**: `string`

A dataset series of which the dataset is part.

***

### dcterms:spatial? {#dctermsspatial}

> `optional` **dcterms:spatial?**: `string` \| `string`[] \| `IJsonLdNodeObject`

The geographical area covered by the dataset.

***

### dcat:spatialResolutionInMeters? {#dcatspatialresolutioninmeters}

> `optional` **dcat:spatialResolutionInMeters?**: `number`

Minimum spatial separation resolvable in a dataset, measured in meters.

***

### dcterms:temporal? {#dctermstemporal}

> `optional` **dcterms:temporal?**: `IDublinCorePeriodOfTime`

The temporal period that the dataset covers.

***

### dcat:temporalResolution? {#dcattemporalresolution}

> `optional` **dcat:temporalResolution?**: `string`

Minimum time period resolvable in the dataset.

***

### prov:wasGeneratedBy? {#provwasgeneratedby}

> `optional` **prov:wasGeneratedBy?**: `string` \| `IJsonLdNodeObject`

An activity that generated, or provides the business context for, the creation of the dataset.
