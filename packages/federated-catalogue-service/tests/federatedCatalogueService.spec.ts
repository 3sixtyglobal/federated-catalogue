// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ArrayHelper, ComponentFactory, GeneralError, GuardError, Is } from "@twin.org/core";
import { JsonLdDataTypes } from "@twin.org/data-json-ld";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { FederatedCatalogueFilterFactory } from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolDataTypes,
	type IDataspaceProtocolCatalog
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import { DcatClasses, DcatContexts, type IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { OdrlContexts, OdrlDataTypes, OdrlPolicyType } from "@twin.org/standards-w3c-odrl";
import type { Dataset } from "../src/entities/dataset.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";
import { datasetModelToEntity } from "../src/utils/datasetConverters.js";

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;

describe("FederatedCatalogueService", () => {
	beforeAll(async () => {
		initSchema();
		DataspaceProtocolDataTypes.registerTypes();
		JsonLdDataTypes.registerTypes();
		OdrlDataTypes.registerTypes();
		await addAllContextsToDocumentCache();

		datasetEntityStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});

		EntityStorageConnectorFactory.register("dataset", () => datasetEntityStorage);

		// Register a mock IUrlTransformerComponent that the service resolves at construct time.
		ComponentFactory.register("url-transformer", () => ({
			className: () => "MockUrlTransformerComponent",
			addEncryptedQueryParamToUrl: async (url: string, id: string, value: string) =>
				`${url}${url.includes("?") ? "&" : "?"}x-enc-${id}=${value}`
		}));

		// Mock ContextIdStore.getContextIds to return undefined (anonymous) by default
		ContextIdStore.getContextIds = vi.fn().mockResolvedValue(undefined);
	});

	beforeEach(async () => {
		// Clear factory before each test to remove all registrations
		FederatedCatalogueFilterFactory.clear();

		// Reset ContextIdStore mock to return undefined (anonymous) by default
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue(undefined);

		// Clear dataset storage
		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset.id) {
				await datasetEntityStorage.remove(dataset.id);
			}
		}
	});

	test("Can create federated catalogue service", () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
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
			datasetEntityStorageType: "dataset"
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
			datasetEntityStorageType: "dataset"
		});

		const testDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/test-dataset-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Test Dataset",
			"dcterms:description": "A test dataset for unit testing",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": DcatClasses.Distribution,
				"@id": "https://example.com/distributions/test-dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": OdrlPolicyType.Offer,
				uid: "https://example.com/policies/test-policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		};

		await service.set(testDataset);

		const retrieved = await service.get("https://example.com/datasets/test-dataset-1");

		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe("https://example.com/datasets/test-dataset-1");
	});

	test("Get returns CatalogError for non-existent dataset", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const result = await service.get("https://example.com/datasets/non-existent");

		// Verify it's a CatalogError
		expect(result).toEqual({
			"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
			"@type": "CatalogError",
			code: "NotFoundError:federatedCatalogueService.datasetNotFound",
			reason: [
				{
					source: "FederatedCatalogueService",
					message: "federatedCatalogueService.datasetNotFound",
					name: "NotFoundError",
					properties: {
						notFoundId: "https://example.com/datasets/non-existent"
					},
					stack: expect.any(String)
				}
			]
		});
	});

	test("Can query datasets with no filter", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Add test datasets
		const dataset1 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/query-test-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Query Test Dataset 1",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/query-dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/query-policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		const dataset2 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/query-test-2",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Query Test Dataset 2",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/query-dist-2",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/query-policy-2",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset1);
		await service.set(dataset2);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [dataset1, dataset2].map(
					d => datasetModelToEntity(d, "", new Date().toISOString()) as unknown as IDcatDataset
				),
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		const queryResult = await service.query([{ "@type": "FilterByExample" }]);
		const datasets = ArrayHelper.fromObjectOrArray(
			(queryResult.result as { dataset?: unknown }).dataset ?? []
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

	test("Query returns catalog with participantId derived from dcterms:publisher (single participant)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const publisherId = "https://example.com/participants/participant-1";
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/participant-test-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Participant Test Dataset",
			"dcterms:publisher": publisherId,
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/part-dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/part-policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [datasetModelToEntity(dataset, "", new Date().toISOString())],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		const queryResult = await service.query([{ "@type": "FilterByExample" }]);

		// Verify single participant returns flat catalog with participantId
		expect(queryResult.result).toBeDefined();
		expect(queryResult.result["@type"]).toBe("Catalog");

		// Type guard: verify it's a catalog, not an error
		const catalog = queryResult.result as IDataspaceProtocolCatalog;
		expect(catalog.participantId).toBe(publisherId);
		// Should have dataset array, not nested catalogs
		expect(catalog.dataset).toBeDefined();
		expect(catalog.catalog).toBeUndefined();
	});

	test("Query returns nested catalogs for other participants (anonymous request)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const publisher1 = "https://example.com/participants/participant-1";
		const publisher2 = "https://example.com/participants/participant-2";

		const dataset1 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/multi-part-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Multi Participant Dataset 1",
			"dcterms:publisher": publisher1,
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/mp-dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/mp-policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		const dataset2 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/multi-part-2",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Multi Participant Dataset 2",
			"dcterms:publisher": publisher2,
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/mp-dist-2",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/mp-policy-2",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset1);
		await service.set(dataset2);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [dataset1, dataset2].map(
					d => datasetModelToEntity(d, "", new Date().toISOString()) as unknown as IDcatDataset
				),
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Anonymous request (no context) - first publisher becomes root participantId
		const queryResult = await service.query([{ "@type": "FilterByExample" }]);

		// Verify catalog structure for anonymous multi-participant query
		expect(queryResult.result).toBeDefined();
		expect(queryResult.result["@type"]).toBe("Catalog");

		// Type guard: verify it's a catalog, not an error
		const catalog = queryResult.result as IDataspaceProtocolCatalog;

		// For anonymous requests, first publisher (publisher1) becomes root participantId
		// Root catalog gets publisher1's datasets, publisher2's datasets go in nested catalog
		expect(catalog.participantId).toBe(publisher1);

		// Root catalog should have dataset array for own datasets
		const rootDatasets = ArrayHelper.fromObjectOrArray(catalog.dataset ?? []);
		expect(rootDatasets.length).toBe(1);

		// Root catalog should have nested catalog for other participant
		const nestedCatalogs = ArrayHelper.fromObjectOrArray(catalog.catalog ?? []);
		expect(nestedCatalogs.length).toBe(1);

		// Nested catalog should have publisher2 as participantId
		const nestedCatalog = nestedCatalogs[0] as { participantId?: string };
		expect(nestedCatalog.participantId).toBe(publisher2);
	});

	test("Query returns own datasets at root level when authenticated", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const requestingParticipant = "https://example.com/participants/requesting-org";
		const otherParticipant = "https://example.com/participants/other-org";

		// Mock authenticated context with requesting participant
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({
			[ContextIdKeys.Organization]: requestingParticipant
		});

		const ownDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/own-dataset",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Own Dataset",
			"dcterms:publisher": requestingParticipant,
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/own-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/own-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		const otherDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/other-dataset",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Other Dataset",
			"dcterms:publisher": otherParticipant,
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/other-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/other-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(ownDataset);
		await service.set(otherDataset);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [ownDataset, otherDataset].map(
					d => datasetModelToEntity(d, "", new Date().toISOString()) as unknown as IDcatDataset
				),
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		const queryResult = await service.query([{ "@type": "FilterByExample" }]);

		// Verify catalog structure for authenticated request
		expect(queryResult.result).toBeDefined();
		expect(queryResult.result["@type"]).toBe("Catalog");

		// Type guard: verify it's a catalog, not an error
		const catalog = queryResult.result as IDataspaceProtocolCatalog;

		// Root catalog should have requesting participant as participantId
		expect(catalog.participantId).toBe(requestingParticipant);

		// Root catalog should have own datasets
		const rootDatasets = ArrayHelper.fromObjectOrArray(catalog.dataset ?? []);
		expect(rootDatasets.length).toBe(1);
		expect((rootDatasets[0] as { "@id"?: string })["@id"]).toBe(ownDataset["@id"]);

		// Other participant's datasets should be in nested catalog
		const nestedCatalogs = ArrayHelper.fromObjectOrArray(catalog.catalog ?? []);
		expect(nestedCatalogs.length).toBe(1);
		const nestedCatalog = nestedCatalogs[0] as { participantId?: string; dataset?: unknown[] };
		expect(nestedCatalog.participantId).toBe(otherParticipant);
	});

	test("Can query datasets with filter", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Add a dataset with specific properties
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/filter-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Filterable Dataset",
			"dcterms:identifier": "FILTER-TEST-123",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/filter-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/filter-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [datasetModelToEntity(dataset, "", new Date().toISOString())],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Query with filter matching the identifier
		const filter = {
			"@type": "FilterByExample",
			"dcterms:identifier": "FILTER-TEST-123"
		};

		const queryResult = await service.query([filter]);
		const datasets = ArrayHelper.fromObjectOrArray(
			(queryResult.result as { dataset?: unknown }).dataset ?? []
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

	test("Query returns CatalogError 400 when filter type is missing", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const queryResult = await service.query([{}]);

		expect(queryResult.result).toEqual({
			"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
			"@type": "CatalogError",
			code: "GuardError:guard.string",
			reason: [
				{
					name: "GuardError",
					source: "FederatedCatalogueService",
					message: "guard.string",
					properties: {
						property: "filterType",
						value: "undefined"
					},
					stack: expect.any(String)
				}
			]
		});
	});

	test("Query returns CatalogError 400 when filter is not an array", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Passing a non-array value (e.g., empty string) should return CatalogError
		const queryResult = await service.query("" as unknown as unknown[]);

		expect(queryResult.result).toEqual({
			"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
			"@type": "CatalogError",
			code: "GuardError:guard.array",
			reason: [
				{
					name: "GuardError",
					source: "FederatedCatalogueService",
					message: "guard.array",
					properties: {
						property: "filter",
						value: ""
					},
					stack: expect.any(String)
				}
			]
		});
	});

	test("Query returns CatalogError 404 when no datasets exist", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Create a mock filter that returns empty datasets
		const mockFilter = {
			className: () => "MockEmptyFilter",
			async query() {
				return {
					datasets: [],
					cursor: undefined
				};
			},
			async createIndex() {
				return {};
			}
		};

		FederatedCatalogueFilterFactory.register("MockEmptyFilter", () => mockFilter);

		// Query with the mock filter
		const queryResult = await service.query([
			{
				"@type": "MockEmptyFilter"
			}
		]);

		// Verify it returns a CatalogError with Not found
		expect(queryResult.result).toEqual({
			"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
			"@type": "CatalogError",
			code: "NotFoundError:federatedCatalogueService.noDatasetsFound",
			reason: [
				{
					name: "NotFoundError",
					source: "FederatedCatalogueService",
					message: "federatedCatalogueService.noDatasetsFound",
					properties: {},
					stack: expect.any(String)
				}
			]
		});
	});

	test("Cursor is retained when query returns datasets with cursor", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Add test datasets
		const dataset1 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/cursor-test-1",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Cursor Test Dataset 1",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/cursor-dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/cursor-policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		const dataset2 = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/cursor-test-2",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Cursor Test Dataset 2",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/cursor-dist-2",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/cursor-policy-2",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset1);
		await service.set(dataset2);

		// Create a mock filter that returns datasets with a cursor
		const mockFilter = {
			className: () => "MockFilterWithCursorAndData",
			async query() {
				return {
					datasets: [
						datasetModelToEntity(dataset1, "", new Date().toISOString()) as unknown as IDcatDataset
					],
					cursor: "next-page-cursor-456"
				};
			},
			async createIndex() {
				return {};
			}
		};

		FederatedCatalogueFilterFactory.register("MockFilterWithCursorAndData", () => mockFilter);

		// Query with the mock filter
		const queryResult = await service.query([
			{
				"@type": "MockFilterWithCursorAndData"
			}
		]);

		// Verify cursor is present after compaction
		expect(queryResult.cursor).toBeDefined();
		expect(queryResult.cursor).toBe("next-page-cursor-456");

		// Verify datasets are also present
		const datasets = ArrayHelper.fromObjectOrArray(
			(queryResult.result as { dataset?: unknown }).dataset ?? []
		);
		expect(datasets.length).toBe(1);
		if (datasets[0] && typeof datasets[0] === "object") {
			const datasetObj = datasets[0] as { [key: string]: unknown };
			expect(datasetObj["@id"]).toBe(dataset1["@id"]);
		}
	});

	test("Catalog without cursor does not include cursor property after compaction", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Add a dataset
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/no-cursor-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "No Cursor Test Dataset",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/no-cursor-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/no-cursor-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		// Register filter that returns the dataset but no cursor
		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [datasetModelToEntity(dataset, "", new Date().toISOString())],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Query without cursor (FilterByExample doesn't return cursor by default)
		const queryResult = await service.query([
			{
				"@type": "FilterByExample"
			}
		]);

		// Verify cursor is not present when filter doesn't return one
		expect(queryResult.cursor).toBeUndefined();
		// Verify it's a valid catalog, not an error
		expect(queryResult.result["@type"]).toBe("Catalog");
	});

	test("Set throws GuardError when dataset is missing @type", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const invalidDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@id": "https://example.com/datasets/missing-type"
		} as unknown as IDcatDataset;

		await expect(service.set(invalidDataset)).rejects.toThrow(GuardError);
	});

	test("Set throws GuardError when dataset is missing @id", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const invalidDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset without @id"
		} as unknown as IDcatDataset;

		await expect(service.set(invalidDataset)).rejects.toThrow(GuardError);
	});

	test("Set throws GeneralError when dataset is missing dcterms:publisher", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingPublisher = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/missing-publisher",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset without publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		// dcterms:publisher is required for multi-participant catalog
		// to derive participantId when returning query results
		await expect(service.set(datasetMissingPublisher)).rejects.toThrow(GeneralError);
		await expect(service.set(datasetMissingPublisher)).rejects.toThrow("datasetMissingPublisher");
	});

	test("Set succeeds with valid minimal dataset (all required fields)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const validMinimalDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/minimal-valid",
			"@type": DcatClasses.Dataset,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/minimal-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/minimal-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(validMinimalDataset)).resolves.toBeUndefined();

		const retrieved = await service.get("https://example.com/datasets/minimal-valid");
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe("https://example.com/datasets/minimal-valid");
	});

	test("Set succeeds with valid DS Protocol compliant dataset", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const validDsProtocolDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/ds-protocol-compliant",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "DS Protocol Dataset",
			"dcterms:description": "A dataset compliant with DS Protocol requirements",
			"dcterms:issued": "2025-01-01T00:00:00Z",
			"dcterms:modified": "2025-01-02T00:00:00Z",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/ds-protocol-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/ds-protocol-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(validDsProtocolDataset)).resolves.toBeUndefined();

		const retrieved = await service.get("https://example.com/datasets/ds-protocol-compliant");
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe(
			"https://example.com/datasets/ds-protocol-compliant"
		);
	});

	test("Set throws validation error when dataset is missing distribution (prefixed form)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingDistribution = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/missing-distribution",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset without distribution",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingDistribution)).rejects.toThrow("common.validation");
	});

	test("Set throws validation error when dataset is missing hasPolicy (prefixed form)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingPolicy = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@id": "https://example.com/datasets/missing-policy",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset without hasPolicy",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/dist-1",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingPolicy)).rejects.toThrow("common.validation");
	});

	test("Set throws validation error when dataset is missing distribution (unprefixed form)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingDistribution = {
			"@context": {
				"@vocab": "http://www.w3.org/ns/dcat#",
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/missing-distribution-unprefixed",
			"@type": "Dataset",
			"dcterms:title": "Dataset without distribution (unprefixed)",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-2",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingDistribution)).rejects.toThrow("common.validation");
	});

	test("Set throws validation error when dataset is missing hasPolicy (unprefixed form)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingPolicy = {
			"@context": {
				"@vocab": "http://www.w3.org/ns/dcat#",
				dcterms: DublinCoreContexts.NamespaceTerms
			},
			"@id": "https://example.com/datasets/missing-policy-unprefixed",
			"@type": "Dataset",
			"dcterms:title": "Dataset without hasPolicy (unprefixed)",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			distribution: {
				"@type": "Distribution",
				"@id": "https://example.com/distributions/dist-2",
				"dcterms:format": "application/json",
				accessService: "https://example.com/services/test-service"
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingPolicy)).rejects.toThrow("common.validation");
	});

	test("Set succeeds with valid DS Protocol dataset (prefixed properties)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const validDataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/valid-prefixed",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Valid Dataset with Prefixed Properties",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/dist-3",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-3",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(validDataset)).resolves.toBeUndefined();

		const retrieved = await service.get("https://example.com/datasets/valid-prefixed");
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe("https://example.com/datasets/valid-prefixed");
	});

	test("Set succeeds with valid DS Protocol dataset (unprefixed properties)", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const validDataset = {
			"@context": {
				"@vocab": "http://www.w3.org/ns/dcat#",
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/valid-unprefixed",
			"@type": "Dataset",
			"dcterms:title": "Valid Dataset with Unprefixed Properties",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			distribution: {
				"@type": "Distribution",
				"@id": "https://example.com/distributions/dist-4",
				"dcterms:format": "application/json",
				accessService: "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-4",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(validDataset)).resolves.toBeUndefined();

		const retrieved = await service.get("https://example.com/datasets/valid-unprefixed");
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe(
			"https://example.com/datasets/valid-unprefixed"
		);
	});

	test("Set throws validation error when distribution is missing dcterms:format", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingFormat = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/missing-format",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with distribution missing format",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": [
				{
					"@type": "dcat:Distribution",
					"dcat:accessService": "https://example.com/services/service-1"
				}
			],
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingFormat)).rejects.toThrow("common.validation");
	});

	test("Set throws validation error when distribution is missing dcat:accessService", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetMissingAccessService = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/missing-access-service",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with distribution missing accessService",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": [
				{
					"@type": "dcat:Distribution",
					"dcterms:format": "application/json"
				}
			],
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetMissingAccessService)).rejects.toThrow("common.validation");
	});

	test("Set throws validation error when distribution array is empty", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetEmptyDistribution = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/empty-distribution",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Dataset with empty distribution array",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": [],
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/policy-1",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(datasetEmptyDistribution)).rejects.toThrow("common.validation");
	});

	test("start() captures nodeIdentity from context and sets it on stored entities", async () => {
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({
			node: "did:example:test-node"
		});

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});
		await service.start();

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/node-identity-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Node Identity Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/ni-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/ni-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		const entity = await datasetEntityStorage.get(
			"https://example.com/datasets/node-identity-test"
		);
		expect(entity?.nodeIdentity).toBe("did:example:test-node");
	});

	test("Set preserves dateModified when entity content is unchanged", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/unchanged-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Unchanged Dataset",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/unch-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/unch-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		const entityAfterFirstSet = await datasetEntityStorage.get(
			"https://example.com/datasets/unchanged-test"
		);
		const initialDateModified = entityAfterFirstSet?.dateModified;
		expect(initialDateModified).toBeDefined();

		await new Promise(resolve => setTimeout(resolve, 10));

		await service.set(dataset);

		const entityAfterSecondSet = await datasetEntityStorage.get(
			"https://example.com/datasets/unchanged-test"
		);
		expect(entityAfterSecondSet?.dateModified).toBe(initialDateModified);
	});

	test("Set updates dateModified when entity content changes", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/changed-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Original Title",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/ch-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/ch-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		const entityAfterFirstSet = await datasetEntityStorage.get(
			"https://example.com/datasets/changed-test"
		);
		const initialDateModified = entityAfterFirstSet?.dateModified;

		await new Promise(resolve => setTimeout(resolve, 10));

		const updatedDataset = {
			...dataset,
			"dcterms:title": "Updated Title"
		} as unknown as IDcatDataset;

		await service.set(updatedDataset);

		const entityAfterSecondSet = await datasetEntityStorage.get(
			"https://example.com/datasets/changed-test"
		);
		expect(entityAfterSecondSet?.dateModified).not.toBe(initialDateModified);
	});

	test("start() throws when node context ID is missing", async () => {
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue(undefined);

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		await expect(service.start()).rejects.toThrow(GeneralError);
		await expect(service.start()).rejects.toThrow("contextIdMissing");
	});

	test("Multiple sequential unchanged sets preserve the same dateModified", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/multi-unchanged-test",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Multi Unchanged Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/mu-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/mu-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset);

		const entityAfterFirst = await datasetEntityStorage.get(
			"https://example.com/datasets/multi-unchanged-test"
		);
		const initialDateModified = entityAfterFirst?.dateModified;
		expect(initialDateModified).toBeDefined();

		await new Promise(resolve => setTimeout(resolve, 10));
		await service.set(dataset);

		await new Promise(resolve => setTimeout(resolve, 10));
		await service.set(dataset);

		const entityAfterThird = await datasetEntityStorage.get(
			"https://example.com/datasets/multi-unchanged-test"
		);
		expect(entityAfterThird?.dateModified).toBe(initialDateModified);
	});

	afterAll(() => {
		FederatedCatalogueFilterFactory.clear();
		EntityStorageConnectorFactory.clear();
	});
});
