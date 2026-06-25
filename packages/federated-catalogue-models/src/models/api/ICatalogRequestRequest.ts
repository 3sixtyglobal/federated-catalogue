// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataspaceProtocolCatalogRequestMessage } from "@twin.org/standards-dataspace-protocol";
import type { HeaderTypes } from "@twin.org/web";

/**
 * The request parameters for the catalog request method.
 */
export interface ICatalogRequestRequest {
	/**
	 * The request headers. Authorization header carries the trust token (Bearer scheme).
	 */
	headers?: {
		[HeaderTypes.Authorization]?: string;
	};

	/**
	 * The request body containing the catalog query.
	 */
	body: IDataspaceProtocolCatalogRequestMessage;

	/**
	 * Optional query parameters for pagination.
	 * Used when following Link header URLs per DS Protocol spec.
	 */
	query?: {
		/**
		 * Opaque cursor token for pagination.
		 */
		cursor?: string;

		/**
		 * Limit for pagination.
		 */
		limit?: string;
	};
}
