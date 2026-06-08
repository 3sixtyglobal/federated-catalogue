// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataspaceProtocolCatalogError } from "@twin.org/standards-dataspace-protocol";
import type { HttpStatusCode } from "@twin.org/web";

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
