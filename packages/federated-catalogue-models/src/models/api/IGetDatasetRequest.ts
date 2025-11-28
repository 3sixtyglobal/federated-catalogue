// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The request parameters for the get dataset method.
 */
export interface IGetDatasetRequest {
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
