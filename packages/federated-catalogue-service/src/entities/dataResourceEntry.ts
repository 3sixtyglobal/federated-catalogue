// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { entity, property, SortDirection } from "@twin.org/entity";
import type { IOdrlPolicy } from "@twin.org/standards-w3c-odrl";

/**
 * Data Resource Entry.
 */
@entity()
export class DataResourceEntry {
	/**
	 * The Id.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The trusted issuer of the compliance credential
	 */
	@property({ type: "string" })
	public issuer!: string;

	/**
	 * The name.
	 */
	@property({ type: "string" })
	public name!: string;

	/**
	 * The description.
	 */
	@property({ type: "string", optional: true })
	public description?: string;

	/**
	 * The Id of the producer of the data described by this Data Resource.
	 */
	@property({ type: "string", isSecondary: true })
	public producedBy!: string;

	/**
	 * The copyright owner
	 */
	@property({ type: "string" })
	public copyrightOwnedBy!: string;

	/**
	 * The license
	 */
	@property({ type: "string" })
	public license!: string;

	/**
	 * The data exchange component used to expose the Data Resource.
	 * Only a URL pointing to the resource is stored
	 */
	@property({ type: "string" })
	public exposedThrough!: string;

	/**
	 * The Data Resource policy
	 */
	@property({ type: "array" })
	public resourcePolicy!: IOdrlPolicy[];

	/**
	 * Valid from
	 */
	@property({ type: "string", format: "date-time" })
	public validFrom!: string;

	/**
	 * Valid to
	 */
	@property({ type: "string", format: "date-time" })
	public validUntil!: string;

	/**
	 * Date created
	 */
	@property({ type: "string", format: "date-time", sortDirection: SortDirection.Descending })
	public dateCreated!: string;

	/**
	 * Evidences
	 */
	@property({ type: "array" })
	public evidence!: string[];

	/**
	 * Extended data of a Data Resource entry.
	 */
	@property({ type: "object", optional: true })
	public extraData?: IJsonLdNodeObject;
}
