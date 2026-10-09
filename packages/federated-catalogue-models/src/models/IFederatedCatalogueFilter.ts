// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";
import type { IDcatDataset } from "@3sixty/standards-w3c-dcat";
import type { ITrustVerificationInfo } from "@3sixty/trust-models";

/**
 * Interface describing a filter plugin for the federated catalogue.
 * Filter plugins provide extensible query semantics and indexing strategies.
 * Filters are registered by name in the FilterFactory and do not need to self-identify.
 */
export interface IFederatedCatalogueFilter extends IComponent {
	/**
	 * Execute a filter-specific query over the catalogue.
	 * Each filter interprets its own criteria, but the dispatch shape is fixed (see the filter parameter).
	 * @param trustInfo The trust verification information for the current request.
	 * @param filter The filter criteria as an object: this single filter's properties with the
	 * routing "@type" selector removed by the service. The wire-level catalogue filter is an array
	 * of such objects; the service selects the handler by "@type", strips it, then passes the
	 * remaining criteria object here. Implementations must read criteria from this object, not from
	 * an array wrapper.
	 * @param cursor The pagination cursor from the previous query, if any.
	 * @param limit The maximum number of results to return.
	 * @returns A promise that resolves with datasets matching the filter criteria and an optional cursor for the next page.
	 */
	query(
		trustInfo: ITrustVerificationInfo,
		filter: unknown,
		cursor?: string,
		limit?: number
	): Promise<{ datasets: IDcatDataset[]; cursor?: string }>;

	/**
	 * Generate filter indexes for a dataset to optimize future queries.
	 * Indexes are stored as properties on the dataset entity itself.
	 * @param dataset The dataset to index.
	 * @returns A promise that resolves with a record mapping filter-specific index keys to values.
	 */
	createIndex(dataset: IDcatDataset): Promise<{ [key: string]: unknown }>;
}
