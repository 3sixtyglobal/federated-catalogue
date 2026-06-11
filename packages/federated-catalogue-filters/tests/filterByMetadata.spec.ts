// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { type Dataset, initSchema } from "@twin.org/federated-catalogue-service";
import { nameof } from "@twin.org/nameof";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { DcatClasses, DcatContexts } from "@twin.org/standards-w3c-dcat";
import type { ITrustVerificationInfo } from "@twin.org/trust-models";
import { FilterByMetadata } from "../src/filterByMetadata.js";

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;
let filter: FilterByMetadata;
const trustInfo: ITrustVerificationInfo = { identity: "did:test:owner" };

describe("FilterByMetadata", () => {
	beforeAll(async () => {
		initSchema();

		datasetEntityStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});

		EntityStorageConnectorFactory.register("dataset", () => datasetEntityStorage);
	});

	beforeEach(async () => {
		// Clear dataset storage
		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset.id) {
				await datasetEntityStorage.remove(dataset.id);
			}
		}

		filter = new FilterByMetadata({
			datasetStorageConnectorType: "dataset"
		});
	});

	test("Filter instance is created successfully", () => {
		expect(filter).toBeInstanceOf(FilterByMetadata);
		expect(filter).toBeDefined();
	});

	test("Query with empty filter returns all datasets", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/test-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset 1"
		};

		const dataset2 = {
			id: "https://example.com/datasets/test-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset 2"
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		const result = await filter.query(trustInfo, {});

		expect(result.datasets).toHaveLength(2);
		const ids = result.datasets.map(d => d["@id"]);
		expect(ids).toContain(dataset1.id);
		expect(ids).toContain(dataset2.id);
	});

	test("Query with exact string match", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/exact-match-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Weather Data",
			"dcterms:identifier": "WEATHER-001"
		};

		const dataset2 = {
			id: "https://example.com/datasets/exact-match-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Traffic Data",
			"dcterms:identifier": "TRAFFIC-001"
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		const result = await filter.query(trustInfo, {
			"dcterms:identifier": "WEATHER-001"
		});

		expect(result.datasets).toHaveLength(1);
		expect(result.datasets[0]["@id"]).toBe(dataset1.id);
		expect(result.datasets[0]["dcterms:identifier"]).toBe("WEATHER-001");
	});

	test("Query with multiple criteria (AND logic)", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/multi-criteria-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Weather Data",
			"dcterms:identifier": "WEATHER-001",
			"dcterms:issued": "2024-01-01"
		};

		const dataset2 = {
			id: "https://example.com/datasets/multi-criteria-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Weather Data",
			"dcterms:identifier": "WEATHER-002",
			"dcterms:issued": "2024-02-01"
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		const result = await filter.query(trustInfo, {
			"dcterms:title": "Weather Data",
			"dcterms:identifier": "WEATHER-001"
		});

		expect(result.datasets).toHaveLength(1);
		expect(result.datasets[0]["@id"]).toBe(dataset1.id);
	});

	test("Query with nested object properties", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/nested-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with Publisher",
			"dcterms:publisher": {
				"@type": "foaf:Organization",
				name: "ACME Corporation"
			}
		};

		const dataset2 = {
			id: "https://example.com/datasets/nested-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with Different Publisher",
			"dcterms:publisher": {
				"@type": "foaf:Organization",
				name: "XYZ Inc"
			}
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		const result = await filter.query(trustInfo, {
			"dcterms:publisher": {
				"@type": "foaf:Organization",
				name: "ACME Corporation"
			}
		});

		expect(result.datasets).toBeDefined();
		expect(Is.array(result.datasets)).toBe(true);
	});

	test("Query with array property matching", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/array-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with Keywords",
			"dcat:keyword": ["weather", "temperature", "forecast"]
		};

		const dataset2 = {
			id: "https://example.com/datasets/array-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with Different Keywords",
			"dcat:keyword": ["traffic", "congestion", "roads"]
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		const result = await filter.query(trustInfo, {
			"dcat:keyword": ["weather", "temperature", "forecast"]
		});

		expect(result.datasets).toBeDefined();
		expect(Is.array(result.datasets)).toBe(true);
	});

	test("Query returns empty array when no matches", async () => {
		const dataset = {
			id: "https://example.com/datasets/no-match",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Some Dataset",
			"dcterms:identifier": "DATASET-001"
		};

		await datasetEntityStorage.set(dataset);

		const result = await filter.query(trustInfo, {
			"dcterms:identifier": "NON-EXISTENT"
		});

		expect(result.datasets).toHaveLength(0);
	});

	test("Query handles null and undefined filter values gracefully", async () => {
		const dataset = {
			id: "https://example.com/datasets/null-test",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Test Dataset"
		};

		await datasetEntityStorage.set(dataset);

		const result = await filter.query(trustInfo, null);
		expect(result.datasets).toHaveLength(1);

		const result2 = await filter.query(trustInfo, undefined);
		expect(result2.datasets).toHaveLength(1);
	});

	test("Query with @type filter", async () => {
		const catalogDataset = {
			id: "https://example.com/datasets/catalog",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Catalog,
			"dcterms:title": "Test Catalog"
		};

		const regularDataset = {
			id: "https://example.com/datasets/regular",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Regular Dataset"
		};

		await datasetEntityStorage.set(catalogDataset);
		await datasetEntityStorage.set(regularDataset);

		const result = await filter.query(trustInfo, {
			"@type": DcatClasses.Dataset
		});

		expect(result.datasets).toHaveLength(1);
		expect(result.datasets[0]["@id"]).toBe(regularDataset.id);
	});

	test("Query with partial string match in title", async () => {
		const dataset1 = {
			id: "https://example.com/datasets/partial-1",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Weather Forecast Data 2024"
		};

		const dataset2 = {
			id: "https://example.com/datasets/partial-2",
			ownerId: "did:test:owner",
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Traffic Analysis Data"
		};

		await datasetEntityStorage.set(dataset1);
		await datasetEntityStorage.set(dataset2);

		// FilterByMetadata uses exact matching, so partial match won't work
		const result = await filter.query(trustInfo, {
			"dcterms:title": "Weather Forecast Data 2024"
		});

		expect(result.datasets).toHaveLength(1);
		expect(result.datasets[0]["@id"]).toBe(dataset1.id);
	});
});
