// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HeaderTypes } from "@3sixty/web";

/**
 * The request parameters for the get dataset method.
 */
export interface IDatasetGetRequest {
	/**
	 * The request headers. Authorization header carries the trust token (Bearer scheme).
	 */
	headers?: {
		[HeaderTypes.Authorization]?: string;
	};

	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The unique identifier of the dataset.
		 */
		datasetId: string;
	};
}
