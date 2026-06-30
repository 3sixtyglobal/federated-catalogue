// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdStore } from "@twin.org/context";
import { AlreadyExistsError, ComponentFactory, Is } from "@twin.org/core";
import { JsonLdDataTypes } from "@twin.org/data-json-ld";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { FederatedCatalogueFilterFactory } from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import { DataspaceProtocolDataTypes } from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import { DcatClasses, DcatContexts, type IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { OdrlContexts, OdrlDataTypes, OdrlPolicyType } from "@twin.org/standards-w3c-odrl";
import {
	MetricType,
	type ITelemetryComponent,
	type ITelemetryMetric
} from "@twin.org/telemetry-models";
import type { Dataset } from "../src/entities/dataset.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";

interface MetricValueEntry {
	id: string;
	value: "inc" | "dec" | number;
	customData?: { [key: string]: unknown };
}

function makeMockTelemetry(): {
	component: ITelemetryComponent;
	created: ITelemetryMetric[];
	values: MetricValueEntry[];
} {
	const created: ITelemetryMetric[] = [];
	const values: MetricValueEntry[] = [];
	const component: ITelemetryComponent = {
		className: () => "MockTelemetry",
		start: async () => {},
		stop: async () => {},
		createMetric: async m => {
			created.push({ ...m });
		},
		getMetric: async () => ({ metric: {} as never, value: {} as never }),
		updateMetric: async () => {},
		addMetricValue: async (id, value, customData) => {
			values.push({ id, value, customData });
			return "v";
		},
		getMetricValue: async (id, valueId) => ({
			id: valueId,
			metricId: id,
			value: 0,
			ts: Date.now()
		}),
		removeMetric: async () => {},
		query: async () => ({ entities: [] }),
		queryValues: async () => ({ metric: {} as never, entities: [] })
	};
	return { component, created, values };
}

/**
 * Build a valid DS Protocol dataset for storage.
 * @param id The dataset id.
 * @returns The dataset.
 */
function makeDataset(id: string): IDcatDataset {
	return {
		"@context": {
			dcat: DcatContexts.Namespace,
			dcterms: DublinCoreContexts.NamespaceTerms,
			odrl: OdrlContexts.Namespace
		},
		"@id": id,
		"@type": DcatClasses.Dataset,
		"dcterms:title": "Metrics Test Dataset",
		"dcterms:description": "A dataset used for telemetry metric tests",
		"dcterms:publisher": "https://example.com/participants/test-publisher",
		"dcat:distribution": {
			"@type": DcatClasses.Distribution,
			"@id": `${id}/dist-1`,
			"dcterms:format": "application/json",
			"dcat:accessService": "https://example.com/services/test-service"
		},
		"odrl:hasPolicy": {
			"@context": OdrlContexts.Context,
			"@type": OdrlPolicyType.Offer,
			uid: `${id}/policy-1`,
			assigner: "https://example.com/participants/test-publisher",
			permission: [{ action: "use" }]
		}
	};
}

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;

describe("FederatedCatalogueService — metrics", () => {
	beforeAll(async () => {
		initSchema();
		DataspaceProtocolDataTypes.registerTypes();
		JsonLdDataTypes.registerTypes();
		OdrlDataTypes.registerTypes();
		await addAllContextsToDocumentCache();

		datasetEntityStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>(),
			config: { storageKey: "dataset" }
		});
		EntityStorageConnectorFactory.register("dataset", () => datasetEntityStorage);

		// Mock trust component: uses the token string as identity.
		ComponentFactory.register("trust", () => ({
			className: () => "MockTrustComponent",
			verify: async (token: unknown) => {
				if (Is.stringValue(token)) {
					try {
						return { verified: true, info: JSON.parse(token) };
					} catch {
						return { verified: true, info: { identity: token } };
					}
				}
				return { verified: true, info: { identity: "anonymous" } };
			},
			generate: async () => "mock-trust-token"
		}));

		ContextIdStore.getContextIds = vi.fn().mockResolvedValue(undefined);
	});

	beforeEach(async () => {
		FederatedCatalogueFilterFactory.clear();
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue(undefined);

		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset.id) {
				await datasetEntityStorage.remove(dataset.id);
			}
		}
	});

	test("start() registers all 6 counters", async () => {
		const { component, created } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});
		await service.start();

		expect(created).toHaveLength(6);
		for (const m of created) {
			expect(m.type).toBe(MetricType.Counter);
		}
		const ids = created.map(m => m.id);
		expect(ids).toContain("fc_datasets_retrieved");
		expect(ids).toContain("fc_datasets_stored");
		expect(ids).toContain("fc_datasets_removed");
		expect(ids).toContain("fc_queries_executed");
		expect(ids).toContain("fc_filter_indexes_created");
		expect(ids).toContain("fc_filter_index_failures");
	});

	test("start() is idempotent — AlreadyExistsError is swallowed", async () => {
		let callCount = 0;
		const component: ITelemetryComponent = {
			...makeMockTelemetry().component,
			createMetric: async () => {
				if (callCount++ > 0) {
					throw new AlreadyExistsError("test", "metric", "id");
				}
			}
		};
		ComponentFactory.register("test-telemetry-idempotent", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry-idempotent"
		});
		await service.start();
		await expect(service.start()).resolves.toBeUndefined();
	});

	test("get() emits fc_datasets_retrieved", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		const datasetId = "https://example.com/datasets/metrics-get-1";
		await service.set(makeDataset(datasetId), "mock-trust-token");
		await service.get(datasetId, "mock-trust-token");

		expect(values.filter(v => v.id === "fc_datasets_retrieved")).toHaveLength(1);
	});

	test("set() emits fc_datasets_stored", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		await service.set(
			makeDataset("https://example.com/datasets/metrics-set-1"),
			"mock-trust-token"
		);

		const stored = values.filter(v => v.id === "fc_datasets_stored");
		expect(stored).toHaveLength(1);
		expect(stored[0].value).toBe("inc");
	});

	test("set() emits fc_filter_indexes_created with filterType and indexCount", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async () => ({ datasets: [], cursor: undefined }),
			createIndex: async () => ({ "dcterms:title": "metrics test dataset" })
		}));

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		await service.set(
			makeDataset("https://example.com/datasets/metrics-index-1"),
			"mock-trust-token"
		);

		const created = values.filter(v => v.id === "fc_filter_indexes_created");
		expect(created).toHaveLength(1);
		expect(created[0].customData?.filterType).toBe("FilterByMetadata");
		expect(created[0].customData?.indexCount).toBe(1);
		expect(values.filter(v => v.id === "fc_filter_index_failures")).toHaveLength(0);
	});

	test("set() emits fc_filter_index_failures when a filter index fails", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async () => ({ datasets: [], cursor: undefined }),
			createIndex: async () => {
				throw new Error("index boom");
			}
		}));

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		await service.set(
			makeDataset("https://example.com/datasets/metrics-index-fail-1"),
			"mock-trust-token"
		);

		const failures = values.filter(v => v.id === "fc_filter_index_failures");
		expect(failures).toHaveLength(1);
		expect(failures[0].customData?.filterType).toBe("FilterByMetadata");
		expect(values.filter(v => v.id === "fc_filter_indexes_created")).toHaveLength(0);
		// The dataset is still stored even though indexing failed.
		expect(values.filter(v => v.id === "fc_datasets_stored")).toHaveLength(1);
	});

	test("remove() emits fc_datasets_removed", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		const datasetId = "https://example.com/datasets/metrics-remove-1";
		await service.set(makeDataset(datasetId), "mock-trust-token");
		await service.remove(datasetId, "mock-trust-token");

		expect(values.filter(v => v.id === "fc_datasets_removed")).toHaveLength(1);
	});

	test("query() emits fc_queries_executed with resultCount and hasMore", async () => {
		const { component, values } = makeMockTelemetry();
		ComponentFactory.register("test-telemetry", () => component);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset",
			telemetryComponentType: "test-telemetry"
		});

		await service.set(
			makeDataset("https://example.com/datasets/metrics-query-1"),
			"mock-trust-token"
		);
		await service.set(
			makeDataset("https://example.com/datasets/metrics-query-2"),
			"mock-trust-token"
		);

		await service.query(undefined, undefined, undefined, "mock-trust-token");

		const queries = values.filter(v => v.id === "fc_queries_executed");
		expect(queries).toHaveLength(1);
		expect(queries[0].customData?.resultCount).toBe(2);
		expect(typeof queries[0].customData?.hasMore).toBe("boolean");
	});

	test("service works without telemetry component — no errors", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetId = "https://example.com/datasets/metrics-no-telemetry-1";
		const setResult = await service.set(makeDataset(datasetId), "mock-trust-token");
		expect(setResult).toBe(datasetId);

		const getResult = await service.get(datasetId, "mock-trust-token");
		expect((getResult as IDcatDataset)["@id"]).toBe(datasetId);

		const removeResult = await service.remove(datasetId, "mock-trust-token");
		expect(removeResult).toBeUndefined();
	});
});
