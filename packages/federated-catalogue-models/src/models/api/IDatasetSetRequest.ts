// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import type { HeaderTypes } from "@twin.org/web";

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
	 * The response payload containing the dataset or error.
	 */
	body: IDcatDataset;
}
