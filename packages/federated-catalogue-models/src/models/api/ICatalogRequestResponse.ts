// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatCatalog } from "@twin.org/standards-w3c-dcat";

/**
 * The response payload for the catalog request method.
 */
export interface ICatalogRequestResponse {
	/**
	 * The response payload containing the catalog with matching datasets.
	 */
	body: IDcatCatalog;
}
