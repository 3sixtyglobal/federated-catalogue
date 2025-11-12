// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFederatedCatalogueGetRequest } from "./IFederatedCatalogueGetRequest.js";

/**
 * Get the a list of the data space connector entries.
 */
export interface IDataSpaceConnectorListRequest extends IFederatedCatalogueGetRequest {
	/**
	 * The query parameters.
	 */
	query?: {
		/**
		 * The id of the Data Space Connector.
		 */
		id?: string;

		/**
		 * The maintainer
		 */
		maintainedBy?: string;

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
