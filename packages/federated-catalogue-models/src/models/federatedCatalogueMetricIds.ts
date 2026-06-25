// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Metric IDs for the federated catalogue service.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FederatedCatalogueMetricIds = {
	/**
	 * Number of datasets retrieved.
	 */
	DatasetsRetrieved: "fc_datasets_retrieved",

	/**
	 * Number of datasets stored.
	 */
	DatasetsStored: "fc_datasets_stored",

	/**
	 * Number of datasets removed.
	 */
	DatasetsRemoved: "fc_datasets_removed",

	/**
	 * Number of queries executed.
	 */
	QueriesExecuted: "fc_queries_executed",

	/**
	 * Number of filter indexes created.
	 */
	FilterIndexesCreated: "fc_filter_indexes_created",

	/**
	 * Number of filter index failures.
	 */
	FilterIndexFailures: "fc_filter_index_failures"
} as const;

/**
 * Metric IDs for the federated catalogue service.
 */
export type FederatedCatalogueMetricIds =
	(typeof FederatedCatalogueMetricIds)[keyof typeof FederatedCatalogueMetricIds];
