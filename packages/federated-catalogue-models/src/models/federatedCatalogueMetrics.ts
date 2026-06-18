// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { type ITelemetryMetric, MetricType } from "@twin.org/telemetry-models";
import { FederatedCatalogueMetricIds } from "./federatedCatalogueMetricIds.js";

/**
 * Metrics registered by the federated catalogue service.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FederatedCatalogueMetrics: ITelemetryMetric[] = [
	{
		id: FederatedCatalogueMetricIds.DatasetsRetrieved,
		label: "Datasets retrieved",
		type: MetricType.Counter
	},
	{
		id: FederatedCatalogueMetricIds.DatasetsStored,
		label: "Datasets stored",
		type: MetricType.Counter
	},
	{
		id: FederatedCatalogueMetricIds.DatasetsRemoved,
		label: "Datasets removed",
		type: MetricType.Counter
	},
	{
		id: FederatedCatalogueMetricIds.QueriesExecuted,
		label: "Queries executed",
		type: MetricType.Counter
	},
	{
		id: FederatedCatalogueMetricIds.FilterIndexesCreated,
		label: "Filter indexes created",
		type: MetricType.Counter
	},
	{
		id: FederatedCatalogueMetricIds.FilterIndexFailures,
		label: "Filter index failures",
		type: MetricType.Counter
	}
];
