// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataspaceProtocolCatalogError } from "@twin.org/standards-dataspace-protocol";
import type { HeaderTypes, HttpStatusCode } from "@twin.org/web";

/**
 * The response payload for the set dataset method.
 */
export interface IDatasetSetResponse {
	/**
	 * Response status code.
	 */
	statusCode?: HttpStatusCode;

	/**
	 * Optional headers.
	 */
	headers?: {
		[HeaderTypes.Location]?: string;
	};

	/**
	 * The response payload containing the dataset or error.
	 */
	body?: IDataspaceProtocolCatalogError;
}
