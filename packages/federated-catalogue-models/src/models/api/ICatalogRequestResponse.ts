// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IDataspaceProtocolCatalog,
	IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import type { HeaderTypes, HttpStatusCode } from "@twin.org/web";

/**
 * The response payload for the catalog request method.
 * Returns a DS Protocol compliant Catalog with participantId, or CatalogError if no datasets found.
 */
export interface ICatalogRequestResponse {
	/**
	 * Response status code.
	 * Per DS Protocol: Returns appropriate HTTP code (e.g., 404) when returning CatalogError.
	 */
	statusCode?: HttpStatusCode;

	/**
	 * The response payload containing the DS Protocol compliant catalog with participantId,
	 * or a CatalogError if no datasets are found (404).
	 * Per DS Protocol: Single participant returns flat catalog, multiple participants return nested catalogs.
	 */
	body: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;

	/**
	 * Optional headers including RFC 8288 Link header for pagination.
	 */
	headers?: {
		[HeaderTypes.Link]?: string | string[];
	};
}
