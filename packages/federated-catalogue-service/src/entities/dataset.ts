// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";
import type { IDataset } from "@twin.org/standards-w3c-dcat";

/**
 * Class describing a DCAT dataset for entity storage.
 * This wrapper enables efficient database indexing and querying while preserving
 * the full IDataset JSON-LD structure.
 */
@entity()
export class Dataset {
	/**
	 * The unique identifier for the dataset (@id from JSON-LD).
	 */
	@property({ type: "string", isPrimary: true })
	public "@id"!: string;

	/**
	 * The JSON-LD context for the dataset.
	 */
	@property({ type: "object" })
	public "@context"!: IDataset["@context"];

	/**
	 * The type of the resource (typically "Dataset").
	 */
	@property({ type: "string" })
	public "@type"!: IDataset["@type"];

	/**
	 * A name given to the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:title"?: IDataset["dcterms:title"];

	/**
	 * A free-text account of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:description"?: IDataset["dcterms:description"];

	/**
	 * A unique identifier of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:identifier"?: IDataset["dcterms:identifier"];

	/**
	 * Date of formal issuance (publication) of the resource.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:issued"?: IDataset["dcterms:issued"];

	/**
	 * Most recent date on which the resource was changed, updated or modified.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:modified"?: IDataset["dcterms:modified"];

	/**
	 * A language of the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:language"?: IDataset["dcterms:language"];

	/**
	 * An entity responsible for making the resource available.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:publisher"?: IDataset["dcterms:publisher"];

	/**
	 * An entity responsible for producing the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:creator"?: IDataset["dcterms:creator"];

	/**
	 * Information about who can access the resource or an indication of its security status.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:accessRights"?: IDataset["dcterms:accessRights"];

	/**
	 * A legal document under which the resource is made available.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:license"?: IDataset["dcterms:license"];

	/**
	 * Information about rights held in and over the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:rights"?: IDataset["dcterms:rights"];

	/**
	 * An established standard to which the resource conforms.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:conformsTo"?: IDataset["dcterms:conformsTo"];

	/**
	 * The nature or genre of the resource.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:type"?: IDataset["dcterms:type"];

	/**
	 * Relevant contact information for the catalogued resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:contactPoint"?: IDataset["dcat:contactPoint"];

	/**
	 * A keyword or tag describing the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:keyword"?: IDataset["dcat:keyword"];

	/**
	 * A main category of the resource. A resource can have multiple themes.
	 */
	@property({ type: "object", optional: true })
	public "dcat:theme"?: IDataset["dcat:theme"];

	/**
	 * A Web page that can be navigated to gain access to the resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:landingPage"?: IDataset["dcat:landingPage"];

	/**
	 * Link to a description of a relationship with another resource.
	 */
	@property({ type: "object", optional: true })
	public "dcat:qualifiedRelation"?: IDataset["dcat:qualifiedRelation"];

	/**
	 * An ODRL conformant policy expressing the rights associated with the resource.
	 */
	@property({ type: "object", optional: true })
	public "odrl:hasPolicy"?: IDataset["odrl:hasPolicy"];

	/**
	 * An available distribution of the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcat:distribution"?: IDataset["dcat:distribution"];

	/**
	 * The frequency at which the dataset is published.
	 */
	@property({ type: "string", optional: true })
	public "dcterms:accrualPeriodicity"?: IDataset["dcterms:accrualPeriodicity"];

	/**
	 * A dataset series of which the dataset is part.
	 */
	@property({ type: "string", optional: true })
	public "dcat:inSeries"?: IDataset["dcat:inSeries"];

	/**
	 * The geographical area covered by the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:spatial"?: IDataset["dcterms:spatial"];

	/**
	 * Minimum spatial separation resolvable in a dataset, measured in meters.
	 */
	@property({ type: "object", optional: true })
	public "dcat:spatialResolutionInMeters"?: IDataset["dcat:spatialResolutionInMeters"];

	/**
	 * The temporal period that the dataset covers.
	 */
	@property({ type: "object", optional: true })
	public "dcterms:temporal"?: IDataset["dcterms:temporal"];

	/**
	 * Minimum time period resolvable in the dataset.
	 */
	@property({ type: "object", optional: true })
	public "dcat:temporalResolution"?: IDataset["dcat:temporalResolution"];

	/**
	 * An activity that generated, or provides the business context for, the creation of the dataset.
	 */
	@property({ type: "object", optional: true })
	public "prov:wasGeneratedBy"?: IDataset["prov:wasGeneratedBy"];
}
