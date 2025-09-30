// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { entity, property, SortDirection } from "@twin.org/entity";
import type { IAddress, IRegistrationNumber } from "@twin.org/standards-gaia-x";

/**
 * Participant entry.
 */
@entity()
export class ParticipantEntry {
	/**
	 * The participant Id.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The trusted issuer of the compliance credential
	 */
	@property({ type: "string" })
	public issuer!: string;

	/**
	 * The legal registration number.
	 */
	@property({ type: "object", isSecondary: true })
	public registrationNumber!: IRegistrationNumber;

	/**
	 * The legal name.
	 */
	@property({ type: "string", isSecondary: true })
	public legalName!: string;

	/**
	 * Address
	 */
	@property({ type: "object" })
	public legalAddress!: IAddress;

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
	 * Extended data of a Participant entry.
	 */
	@property({ type: "object", optional: true })
	public extraData?: IJsonLdNodeObject;
}
