// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFederatedCatalogueGetRequest } from "./IFederatedCatalogueGetRequest.js";

/**
 * Get the a list of the participant entries.
 */
export interface IParticipantListRequest extends IFederatedCatalogueGetRequest {
	/**
	 * The query parameters.
	 */
	query?: {
		/**
		 * The participant Id.
		 */
		id?: string;

		/**
		 * The legal registration number.
		 */
		registrationNumber?: string;

		/**
		 * The legal registration number type.
		 */
		lrnType?: string;

		/**
		 * The optional cursor to get next chunk.
		 */
		cursor?: string;

		/**
		 * Limit the number of entities to return.
		 */
		limit?: string;
	};
}
