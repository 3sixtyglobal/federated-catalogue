// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataspaceProtocolCatalogError } from "@3sixty/standards-dataspace-protocol";
import type { HttpStatusCode } from "@3sixty/web";

/**
 * The response payload for the remove dataset method.
 */
export interface IDatasetRemoveResponse {
	/**
	 * Response status code.
	 */
	statusCode?: HttpStatusCode;

	/**
	 * The response payload containing the dataset or error.
	 */
	body?: IDataspaceProtocolCatalogError;
}
