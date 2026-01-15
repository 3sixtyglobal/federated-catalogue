// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";

/**
 * Interface describing a filter plugin for the federated catalogue.
 * Filter plugins provide extensible query semantics and indexing strategies.
 * Filters are registered by name in the FilterFactory and do not need to self-identify.
 */
export interface IFederatedCatalogueFilter extends IComponent {
	/**
	 * Execute a filter-specific query over the catalogue.
	 * Each filter interprets the payload according to its own semantics.
	 * @param filter The filter criteria (structure depends on the filter implementation).
	 * @param cursor The pagination cursor from the previous query, if any.
	 * @param limit The maximum number of results to return.
	 * @returns Object containing datasets matching the filter criteria and optional cursor for next page.
	 */
	query(
		filter: unknown,
		cursor?: string,
		limit?: number
	): Promise<{ datasets: IDcatDataset[]; cursor?: string }>;

	/**
	 * Generate filter indexes for a dataset to optimize future queries.
	 * Indexes are stored as properties on the dataset entity itself.
	 * @param dataSet The dataset to index.
	 * @returns Record mapping filter-specific index keys to values.
	 */
	createIndex(dataSet: IDcatDataset): Promise<{ [key: string]: unknown }>;
}
