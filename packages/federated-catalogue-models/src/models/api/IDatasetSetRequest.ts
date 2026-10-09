// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatDataset } from "@3sixty/standards-w3c-dcat";
import type { HeaderTypes } from "@3sixty/web";

/**
 * The request parameters for the set dataset method.
 */
export interface IDatasetSetRequest {
	/**
	 * The request headers. Authorization header carries the trust token (Bearer scheme).
	 */
	headers?: {
		[HeaderTypes.Authorization]?: string;
	};

	/**
	 * The request body containing the dataset to store.
	 */
	body: IDcatDataset;
}
