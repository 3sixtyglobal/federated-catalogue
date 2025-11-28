// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, GuardError, Is, NotFoundError } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	FederatedCatalogueFilterFactory,
	type IBaseFilter
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { DcatClasses, DcatContexts } from "@twin.org/standards-w3c-dcat";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { Dataset } from "../src/entities/dataset.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;

describe("FederatedCatalogueService", () => {
	beforeAll(async () => {
		initSchema();

		datasetEntityStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});

		EntityStorageConnectorFactory.register("dataset", () => datasetEntityStorage);
	});

	beforeEach(async () => {
		// Clear factory before each test to remove all registrations
		FederatedCatalogueFilterFactory.clear();

		// Clear dataset storage
		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset["@id"]) {
				await datasetEntityStorage.remove(dataset["@id"]);
			}
		}
	});

	test("Can create federated catalogue service", () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		expect(service).toBeDefined();
	});

	test("Can register filter in factory and use in service", async () => {
		// Register filter in factory BEFORE creating service
		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Verify the filter is accessible by the service (won't throw NotFoundError)
		const catalog = await service.query([{ "@type": "FilterByExample" }]);
		expect(catalog).toBeDefined();
		const datasets = ArrayHelper.fromObjectOrArray(
			(catalog as { dataset?: unknown }).dataset ?? []
		);
		expect(Is.array(datasets)).toBe(true);
	});

	test("Can set and get a dataset", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		const testDataset = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/test-dataset-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Test Dataset",
			"dcterms:description": "A test dataset for unit testing"
		};

		await service.set(testDataset);

		const retrieved = await service.get("https://example.com/datasets/test-dataset-1");

		expect(retrieved).toEqual(testDataset);
	});

	test("Get throws NotFoundError for non-existent dataset", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		await expect(service.get("https://example.com/datasets/non-existent")).rejects.toThrow(
			NotFoundError
		);
	});

	test("Can query datasets with no filter", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Add test datasets
		const dataset1 = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/query-test-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Query Test Dataset 1"
		};

		const dataset2 = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/query-test-2",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Query Test Dataset 2"
		};

		await service.set(dataset1);
		await service.set(dataset2);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [dataset1, dataset2],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		const catalog = await service.query([{ "@type": "FilterByExample" }]);
		const datasets = ArrayHelper.fromObjectOrArray(
			(catalog as { dataset?: unknown }).dataset ?? []
		);

		expect(datasets.length).toBeGreaterThanOrEqual(2);
		expect(
			datasets.some(d => {
				if (!d || typeof d !== "object") {
					return false;
				}
				const dataset = d as { [key: string]: unknown };
				return dataset["@id"] === dataset1["@id"];
			})
		).toBe(true);
		expect(
			datasets.some(d => {
				if (!d || typeof d !== "object") {
					return false;
				}
				const dataset = d as { [key: string]: unknown };
				return dataset["@id"] === dataset2["@id"];
			})
		).toBe(true);
	});

	test("Can query datasets with filter", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Add a dataset with specific properties
		const dataset = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/filter-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Filterable Dataset",
			"dcterms:identifier": "FILTER-TEST-123"
		};

		await service.set(dataset);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [dataset],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Query with filter matching the identifier
		const filter = {
			"@type": "FilterByExample",
			"dcterms:identifier": "FILTER-TEST-123"
		};

		const catalog = await service.query([filter]);
		const datasets = ArrayHelper.fromObjectOrArray(
			(catalog as { dataset?: unknown }).dataset ?? []
		);

		expect(datasets.length).toBeGreaterThanOrEqual(1);
		expect(
			datasets.some(d => {
				if (!d || typeof d !== "object") {
					return false;
				}
				const datasetObj = d as { [key: string]: unknown };
				return datasetObj["@id"] === dataset["@id"];
			})
		).toBe(true);
	});

	test("Can query datasets without no filters registered", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		await expect(service.query([{}] as IBaseFilter[])).rejects.toThrow(GuardError);
	});

	test("Cursor is retained after JSON-LD compaction", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Create a mock filter that returns a cursor
		const mockFilter = {
			className: () => "MockFilterWithCursor",
			async query() {
				return {
					datasets: [],
					cursor: "test-cursor-123"
				};
			},
			async createIndex() {
				return {};
			}
		};

		FederatedCatalogueFilterFactory.register("MockFilterWithCursor", () => mockFilter);

		// Query with the mock filter
		const catalog = await service.query([
			{
				"@type": "MockFilterWithCursor"
			}
		]);

		// Verify cursor is present after compaction
		expect(catalog.cursor).toBeDefined();
		expect(catalog.cursor).toBe("test-cursor-123");
	});

	test("Cursor is retained when query returns datasets with cursor", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Add test datasets
		const dataset1 = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/cursor-test-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Cursor Test Dataset 1"
		};

		const dataset2 = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/cursor-test-2",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Cursor Test Dataset 2"
		};

		await service.set(dataset1);
		await service.set(dataset2);

		// Create a mock filter that returns datasets with a cursor
		const mockFilter = {
			className: () => "MockFilterWithCursorAndData",
			async query() {
				return {
					datasets: [dataset1],
					cursor: "next-page-cursor-456"
				};
			},
			async createIndex() {
				return {};
			}
		};

		FederatedCatalogueFilterFactory.register("MockFilterWithCursorAndData", () => mockFilter);

		// Query with the mock filter
		const catalog = await service.query([
			{
				"@type": "MockFilterWithCursorAndData"
			}
		]);

		// Verify cursor is present after compaction
		expect(catalog.cursor).toBeDefined();
		expect(catalog.cursor).toBe("next-page-cursor-456");

		// Verify datasets are also present
		const datasets = ArrayHelper.fromObjectOrArray(
			(catalog as { dataset?: unknown }).dataset ?? []
		);
		expect(datasets.length).toBe(1);
		if (datasets[0] && typeof datasets[0] === "object") {
			const datasetObj = datasets[0] as { [key: string]: unknown };
			expect(datasetObj["@id"]).toBe(dataset1["@id"]);
		}
	});

	test("Catalog without cursor does not include cursor property after compaction", async () => {
		const service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Add a dataset
		const dataset = {
			"@context": {
				dcat: DcatContexts.ContextRoot,
				dcterms: DublinCoreContexts.ContextTerms
			},
			"@id": "https://example.com/datasets/no-cursor-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "No Cursor Test Dataset"
		};

		await service.set(dataset);

		// Query without cursor (FilterByExample doesn't return cursor by default)
		const catalog = await service.query([
			{
				"@type": "FilterByExample"
			}
		]);

		// Verify cursor is not present when filter doesn't return one
		expect(catalog.cursor).toBeUndefined();
	});

	afterAll(() => {
		FederatedCatalogueFilterFactory.clear();
		EntityStorageConnectorFactory.clear();
	});
});
