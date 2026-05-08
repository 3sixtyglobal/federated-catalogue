// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";

/**
 * Class describing a DCAT dataset for entity storage.
 * This wrapper enables efficient database indexing and querying while preserving
 * the full IDcatDataset JSON-LD structure.
 */
@entity()
export class Dataset {
	/**
	 * The unique identifier for the dataset (mapped from JSON-LD identifier).
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The identity of the node that owns this entity (required for sync).
	 */
	@property({ type: "string", isSecondary: true })
	public nodeIdentity!: string;

	/**
	 * The date the entity was last modified (required for sync).
	 */
	@property({ type: "string", isSecondary: true })
	public dateModified!: string;

	/**
	 * The tenant id of the publisher captured at write time.
	 */
	@property({ type: "string", optional: true })
	public tenantId?: string;

	/**
	 * The JSON-LD context for the dataset.
	 */
	@property({ type: "object" })
	public "@context"!: IDcatDataset["@context"];

	/**
	 * The type of the resource (typically "Dataset").
	 */
	@property({ type: "string" })
	public "@type"!: IDcatDataset["@type"];

	/**
	 * A name given to the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:title"?: IDcatDataset["dcterms:title"];

	/**
	 * A free-text account of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:description"?: IDcatDataset["dcterms:description"];

	/**
	 * A unique identifier of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:identifier"?: IDcatDataset["dcterms:identifier"];

	/**
	 * Date of formal issuance (publication) of the resource.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:issued"?: IDcatDataset["dcterms:issued"];

	/**
	 * Most recent date on which the resource was changed, updated or modified.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:modified"?: IDcatDataset["dcterms:modified"];

	/**
	 * A language of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:language"?: IDcatDataset["dcterms:language"];

	/**
	 * An entity responsible for making the resource available.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:publisher"?: IDcatDataset["dcterms:publisher"];

	/**
	 * An entity responsible for producing the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:creator"?: IDcatDataset["dcterms:creator"];

	/**
	 * Information about who can access the resource or an indication of its security status.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:accessRights"?: IDcatDataset["dcterms:accessRights"];

	/**
	 * A legal document under which the resource is made available.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:license"?: IDcatDataset["dcterms:license"];

	/**
	 * Information about rights held in and over the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:rights"?: IDcatDataset["dcterms:rights"];

	/**
	 * An established standard to which the resource conforms.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:conformsTo"?: IDcatDataset["dcterms:conformsTo"];

	/**
	 * The nature or genre of the resource.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:type"?: IDcatDataset["dcterms:type"];

	/**
	 * Relevant contact information for the catalogued resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:contactPoint"?: IDcatDataset["dcat:contactPoint"];

	/**
	 * A keyword or tag describing the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:keyword"?: IDcatDataset["dcat:keyword"];

	/**
	 * A main category of the resource. A resource can have multiple themes.
	 */
	@property({ type: "object", optional: true })
	public "dcat:theme"?: IDcatDataset["dcat:theme"];

	/**
	 * A Web page that can be navigated to gain access to the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:landingPage"?: IDcatDataset["dcat:landingPage"];

	/**
	 * Link to a description of a relationship with another resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:qualifiedRelation"?: IDcatDataset["dcat:qualifiedRelation"];

	/**
	 * An ODRL conformant policy expressing the rights associated with the resource.
	 */
	@property({ type: "object", optional: true })
	public "odrl:hasPolicy"?: IDcatDataset["odrl:hasPolicy"];

	/**
	 * An available distribution of the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcat:distribution"?: IDcatDataset["dcat:distribution"];

	/**
	 * The frequency at which the dataset is published.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:accrualPeriodicity"?: IDcatDataset["dcterms:accrualPeriodicity"];

	/**
	 * A dataset series of which the dataset is part.
	 */
	@property({ type: "string", optional: true })
	public "dcat:inSeries"?: IDcatDataset["dcat:inSeries"];

	/**
	 * The geographical area covered by the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:spatial"?: IDcatDataset["dcterms:spatial"];

	/**
	 * Minimum spatial separation resolvable in a dataset, measured in meters.
	 */
	@property({ type: "object", optional: true })
	public "dcat:spatialResolutionInMeters"?: IDcatDataset["dcat:spatialResolutionInMeters"];

	/**
	 * The temporal period that the dataset covers.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:temporal"?: IDcatDataset["dcterms:temporal"];

	/**
	 * Minimum time period resolvable in the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcat:temporalResolution"?: IDcatDataset["dcat:temporalResolution"];

	/**
	 * An activity that generated, or provides the business context for, the creation of the dataset.
	 */
	@property({ type: "object", optional: true })
	public "prov:wasGeneratedBy"?: IDcatDataset["prov:wasGeneratedBy"];
}
