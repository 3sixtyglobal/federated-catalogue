// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Base filter interface with pagination support.
 * All filter objects in the federated catalogue extend this base.
 *
 * Per Eclipse Dataspace Protocol constraints, cursor and limit cannot be
 * top-level properties in CatalogRequestMessage. They must be embedded
 * within the filter object using a custom JSON-LD vocabulary.
 *
 * After JSON-LD compaction, properties use direct names (cursor, limit) rather
 * than prefixed names. Each filter implementation should extend this interface
 * to define its own filter-specific properties.
 */
export interface IBaseFilter extends IJsonLdNodeObject {
	/**
	 * Filter type discriminator.
	 * Used to route filter to appropriate filter implementation.
	 * Example: "FilterByExample", "FilterByPolicy", etc.
	 * Required for filter routing.
	 */
	"@type": string;

	/**
	 * Optional cursor for pagination.
	 * When provided, returns results starting after this cursor.
	 * Namespace: https://schema.twindev.org/federated-catalogue/cursor
	 */
	cursor?: string;

	/**
	 * Optional limit for number of results.
	 * Defaults to implementation-specific value if not provided.
	 * Namespace: https://schema.twindev.org/federated-catalogue/limit
	 */
	limit?: number;
}
