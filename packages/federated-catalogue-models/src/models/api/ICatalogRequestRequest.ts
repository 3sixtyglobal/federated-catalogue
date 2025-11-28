// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ICatalogRequestMessage } from "@twin.org/standards-dataspace-protocol";

/**
 * The request parameters for the catalog request method.
 */
export interface ICatalogRequestRequest {
	/**
	 * The request body containing the catalog query.
	 */
	body: ICatalogRequestMessage;
}
