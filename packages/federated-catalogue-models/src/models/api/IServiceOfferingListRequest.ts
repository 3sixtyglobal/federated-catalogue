// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFederatedCatalogueGetRequest } from "./IFederatedCatalogueGetRequest.js";

/**
 * Get the a list of the service offering entries.
 */
export interface IServiceOfferingListRequest extends IFederatedCatalogueGetRequest {
	/**
	 * The query parameters.
	 */
	query?: {
		/**
		 * The Service Offering Id.
		 */
		id?: string;

		/**
		 * The service provider.
		 */
		providedBy?: string;

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
