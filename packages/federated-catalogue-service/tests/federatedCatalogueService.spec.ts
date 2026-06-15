// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { ArrayHelper, ComponentFactory, Is } from "@twin.org/core";
import { JsonLdDataTypes, JsonLdHelper } from "@twin.org/data-json-ld";
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
import type { ITrustVerificationInfo } from "@twin.org/trust-models";
import type { Dataset } from "../src/entities/dataset.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;

describe("FederatedCatalogueService", () => {
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
		// Pass a JSON-encoded object with at least { identity } to set the identity.
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
		const querySpy = vi.fn(
			async (
				trustInfo: ITrustVerificationInfo,
				filter: unknown,
				cursor?: string,
				limit?: number
			) => ({
				datasets: [],
				cursor: undefined
			})
		);

		// Register filter in factory BEFORE creating service
		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: querySpy,
			createIndex: async () => ({})
		}));

		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		// Verify the filter is accessible by the service (won't throw NotFoundError)
		const catalog = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			"mock-trust-token"
		);
		expect(catalog).toBeDefined();
		expect(querySpy).toHaveBeenCalledWith(
			expect.objectContaining({ identity: "mock-trust-token" }),
			expect.any(Array),
			undefined,
			undefined
		);
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

		await service.set(testDataset, "mock-trust-token");

		const retrieved = await service.get(
			"https://example.com/datasets/test-dataset-1",
			"mock-trust-token"
		);

		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe("https://example.com/datasets/test-dataset-1");
	});

	test("Get returns CatalogError for non-existent dataset", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const result = await service.get(
			"https://example.com/datasets/non-existent",
			"mock-trust-token"
		);

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

		await service.set(dataset1, "mock-trust-token");
		await service.set(dataset2, "mock-trust-token");

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset1, dataset2],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		const queryResult = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			"https://example.com/participants/test-publisher"
		);
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

	test("Query returns flat catalog when requester identity is the single publisher", async () => {
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

		await service.set(dataset, "mock-trust-token");

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		const queryResult = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			publisherId
		);

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

	test("Query returns nested catalogs for other participants when requesting as one publisher", async () => {
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

		await service.set(dataset1, "mock-trust-token");
		await service.set(dataset2, "mock-trust-token");

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset1, dataset2],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		// Request as publisher1 — publisher1's datasets appear at root, publisher2's in nested catalog
		const queryResult = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			publisher1
		);

		// Verify catalog structure for multi-participant query
		expect(queryResult.result).toBeDefined();
		expect(queryResult.result["@type"]).toBe("Catalog");

		// Type guard: verify it's a catalog, not an error
		const catalog = queryResult.result as IDataspaceProtocolCatalog;

		// Root catalog has publisher1 as participantId (matches the trust identity)
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

		await service.set(ownDataset, "mock-trust-token");
		await service.set(otherDataset, "mock-trust-token");

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [ownDataset, otherDataset],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		const queryResult = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			requestingParticipant
		);

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

		await service.set(dataset, "mock-trust-token");

		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		// Query with filter matching the identifier
		const filter = {
			"@type": "FilterByMetadata",
			"dcterms:identifier": "FILTER-TEST-123"
		};

		const queryResult = await service.query(
			[filter],
			undefined,
			undefined,
			"https://example.com/participants/test-publisher"
		);
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

	test("Query result datasets each include @id field", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const datasetId = "https://example.com/datasets/consignment-1";
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": datasetId,
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Consignment Dataset",
			"dcterms:type": "https://vocabulary.uncefact.org/Consignment",
			"dcterms:publisher": "https://example.com/participants/publisher-1",
			"dcat:distribution": {
				"@type": DcatClasses.Distribution,
				"@id": "https://example.com/distributions/consignment-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": OdrlPolicyType.Offer,
				uid: "https://example.com/policies/consignment-policy",
				assigner: "https://example.com/participants/publisher-1",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, "mock-trust-token");

		// The real FilterByMetadata calls datasetEntityToModel() internally before returning.
		// Returning a true IDcatDataset model (with "@id") mirrors that behavior.
		// The service must not strip "@id" by re-applying datasetEntityToModel on a model.
		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset] as IDcatDataset[],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		const queryResult = await service.query(
			[
				{
					"@type": "FilterByMetadata",
					"dcterms:type": "https://vocabulary.uncefact.org/Consignment"
				}
			],
			undefined,
			undefined,
			"https://example.com/participants/publisher-1"
		);

		expect(queryResult.result["@type"]).toBe("Catalog");

		const catalog = queryResult.result as IDataspaceProtocolCatalog;
		const datasets = ArrayHelper.fromObjectOrArray(catalog.dataset ?? []);

		expect(datasets.length).toBeGreaterThan(0);

		// Every dataset in the catalog query response must carry @id
		for (const d of datasets) {
			const datasetObj = d as { "@id"?: string };
			expect(datasetObj["@id"]).toBe(datasetId);
		}
	});

	test("Query returns CatalogError 400 when filter type is missing", async () => {
		const service = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset"
		});

		const queryResult = await service.query([{}], undefined, undefined, "mock-trust-token");

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
		const queryResult = await service.query(
			"" as unknown as unknown[],
			undefined,
			undefined,
			"mock-trust-token"
		);

		expect(queryResult.result).toEqual({
			"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
			"@type": "CatalogError",
			code: "GeneralError:federatedCatalogueService.filterMustBeArray",
			reason: [
				{
					name: "GeneralError",
					source: "FederatedCatalogueService",
					message: "federatedCatalogueService.filterMustBeArray",
					cause: undefined,
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
			async query(trustInfo: ITrustVerificationInfo) {
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
		const queryResult = await service.query(
			[{ "@type": "MockEmptyFilter" }],
			undefined,
			undefined,
			"mock-trust-token"
		);

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

		await service.set(dataset1, "mock-trust-token");
		await service.set(dataset2, "mock-trust-token");

		// Create a mock filter that returns datasets with a cursor
		const mockFilter = {
			className: () => "MockFilterWithCursorAndData",
			async query(trustInfo: ITrustVerificationInfo) {
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
		const queryResult = await service.query(
			[{ "@type": "MockFilterWithCursorAndData" }],
			undefined,
			undefined,
			"https://example.com/participants/test-publisher"
		);

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

		await service.set(dataset, "mock-trust-token");

		// Register filter that returns the dataset but no cursor
		FederatedCatalogueFilterFactory.register("FilterByMetadata", () => ({
			className: () => "FilterByMetadata",
			query: async (trustInfo, filter) => ({
				datasets: [dataset],
				cursor: undefined
			}),
			createIndex: async () => ({})
		}));

		// Query without cursor (FilterByMetadata doesn't return cursor by default)
		const queryResult = await service.query(
			[{ "@type": "FilterByMetadata" }],
			undefined,
			undefined,
			"mock-trust-token"
		);

		// Verify cursor is not present when filter doesn't return one
		expect(queryResult.cursor).toBeUndefined();
		// Verify it's a valid catalog, not an error
		expect(queryResult.result["@type"]).toBe("Catalog");
	});

	test("Set returns CatalogError when dataset is missing @type", async () => {
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

		const result = await service.set(invalidDataset, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when dataset is missing @id", async () => {
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

		const result = await service.set(invalidDataset, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when dataset is missing dcterms:publisher", async () => {
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

		const result = await service.set(datasetMissingPublisher, "mock-trust-token");
		expect(result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("datasetMissingPublisher")
		});
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

		await expect(service.set(validMinimalDataset, "mock-trust-token")).resolves.toBe(
			"https://example.com/datasets/minimal-valid"
		);

		const retrieved = await service.get(
			"https://example.com/datasets/minimal-valid",
			"mock-trust-token"
		);
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

		await expect(service.set(validDsProtocolDataset, "mock-trust-token")).resolves.toBe(
			"https://example.com/datasets/ds-protocol-compliant"
		);

		const retrieved = await service.get(
			"https://example.com/datasets/ds-protocol-compliant",
			"mock-trust-token"
		);
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe(
			"https://example.com/datasets/ds-protocol-compliant"
		);
	});

	test("Set returns CatalogError when dataset is missing distribution (prefixed form)", async () => {
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

		const result = await service.set(datasetMissingDistribution, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when dataset is missing hasPolicy (prefixed form)", async () => {
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

		const result = await service.set(datasetMissingPolicy, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when dataset is missing distribution (unprefixed form)", async () => {
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

		const result = await service.set(datasetMissingDistribution, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when dataset is missing hasPolicy (unprefixed form)", async () => {
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

		const result = await service.set(datasetMissingPolicy, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
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

		await expect(service.set(validDataset, "mock-trust-token")).resolves.toBe(
			"https://example.com/datasets/valid-prefixed"
		);

		const retrieved = await service.get(
			"https://example.com/datasets/valid-prefixed",
			"mock-trust-token"
		);
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

		await expect(service.set(validDataset, "mock-trust-token")).resolves.toBe(
			"https://example.com/datasets/valid-unprefixed"
		);

		const retrieved = await service.get(
			"https://example.com/datasets/valid-unprefixed",
			"mock-trust-token"
		);
		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe(
			"https://example.com/datasets/valid-unprefixed"
		);
	});

	test("Set returns CatalogError when distribution is missing dcterms:format", async () => {
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

		const result = await service.set(datasetMissingFormat, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when distribution is missing dcat:accessService", async () => {
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

		const result = await service.set(datasetMissingAccessService, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set returns CatalogError when distribution array is empty", async () => {
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

		const result = await service.set(datasetEmptyDistribution, "mock-trust-token");
		expect(result).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set always writes to storage even when called twice with unchanged content", async () => {
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

		await service.set(dataset, "mock-trust-token");

		const setSpy = vi.spyOn(datasetEntityStorage, "set");
		const result = await service.set(dataset, "mock-trust-token");
		expect(result).toBe("https://example.com/datasets/unchanged-test");
		expect(setSpy).toHaveBeenCalledTimes(1);
		setSpy.mockRestore();
	});

	test("Set writes again when entity content changes", async () => {
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

		await service.set(dataset, "mock-trust-token");

		const setSpy = vi.spyOn(datasetEntityStorage, "set");
		const updatedDataset = {
			...dataset,
			"dcterms:title": "Updated Title"
		} as unknown as IDcatDataset;
		await service.set(updatedDataset, "mock-trust-token");
		expect(setSpy).toHaveBeenCalledTimes(1);
		setSpy.mockRestore();

		// Verify the new title is persisted — DS Protocol normalisation compacts dcterms:title → dct:title
		const retrieved = await service.get(
			"https://example.com/datasets/changed-test",
			"mock-trust-token"
		);
		const retrievedNode = JsonLdHelper.toNodeObject(retrieved as IDcatDataset);
		expect(retrievedNode["dct:title"]).toBe("Updated Title");
	});

	test("Set returns CatalogError when updating a dataset owned by a different identity", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/owner-mismatch-set",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Owner Mismatch Set Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/owner-mismatch-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/owner-mismatch-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, "did:node:original-owner");

		const result = await service.set(
			{ ...dataset, "dcterms:title": "Attempted Update" },
			"did:node:different-owner"
		);

		expect(result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("datasetOwnerMismatch")
		});
	});

	test("Set succeeds when updating a dataset with the same owner identity", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/same-owner-update",
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Same Owner Update Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/same-owner-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/same-owner-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, "did:node:consistent-owner");
		const result = await service.set(
			{ ...dataset, "dcterms:title": "Updated by Same Owner" },
			"did:node:consistent-owner"
		);

		expect(result).toBe("https://example.com/datasets/same-owner-update");
	});

	test("Remove returns CatalogError when caller is not the dataset owner", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const datasetId = "https://example.com/datasets/owner-remove-mismatch";
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": datasetId,
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Remove Owner Mismatch Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/remove-mismatch-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/remove-mismatch-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, "did:node:dataset-owner");

		const result = await service.remove(datasetId, "did:node:non-owner");

		expect(result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("datasetRemoveNotOwner")
		});
	});

	test("Remove succeeds when caller is the dataset owner", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const datasetId = "https://example.com/datasets/owner-remove-success";
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": datasetId,
			"@type": DcatClasses.Dataset,
			"dcterms:title": "Remove Owner Success Test",
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/remove-success-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/remove-success-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, "did:node:actual-owner");
		const removeResult = await service.remove(datasetId, "did:node:actual-owner");
		expect(removeResult).toBeUndefined();

		const retrieved = await service.get(datasetId, "did:node:actual-owner");
		expect(retrieved).toMatchObject({ "@type": "CatalogError" });
	});

	test("Set uses dcterms:identifier as @id when @id is absent", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const datasetId = "https://example.com/datasets/from-identifier";
		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			// No "@id" — should be derived from dcterms:identifier
			"@type": DcatClasses.Dataset,
			"dcterms:identifier": datasetId,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/ident-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/ident-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await expect(service.set(dataset, "mock-trust-token")).resolves.toBe(datasetId);

		const retrieved = await service.get(datasetId, "mock-trust-token");
		expect((retrieved as IDcatDataset)["@id"]).toBe(datasetId);
	});

	test("Set returns CatalogError when @id is not a valid URI", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "not-a-valid-uri",
			"@type": DcatClasses.Dataset,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/invalid-uri-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/invalid-uri-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		const result = await service.set(dataset, "mock-trust-token");
		expect(result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("datasetIdInvalidUri")
		});
	});

	test("Set bakes organization into distribution accessService URL", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const datasetId = "https://example.com/datasets/tenant-baking-test";
		const accessServiceUrl = "https://example.com/services/tenant-service";
		const organizationId = "my-organization-id";

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": datasetId,
			"@type": DcatClasses.Dataset,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/tenant-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": accessServiceUrl
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/tenant-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, JSON.stringify({ identity: organizationId }));

		const entity = await datasetEntityStorage.get(datasetId);
		const distributions = ArrayHelper.fromObjectOrArray(entity?.["dcat:distribution"]);
		const bakedUrl = (distributions[0] as { "dcat:accessService"?: string })["dcat:accessService"];
		expect(bakedUrl).toContain(`${ContextIdKeys.Organization}=${organizationId}`);
		expect(bakedUrl).toContain(accessServiceUrl);
	});

	test("Set bakes organization into object-form accessService endpoint URL", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const datasetId = "https://example.com/datasets/object-access-service-baking-test";
		const endpointUrl = "https://example.com/data/";
		const organizationId = "my-organization-id";

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": datasetId,
			"@type": DcatClasses.Dataset,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/object-access-service-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": {
					"@id": "https://example.com/services/object-service",
					"@type": "dcat:DataService",
					"dcat:endpointURL": endpointUrl
				}
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/object-access-service-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		await service.set(dataset, JSON.stringify({ identity: organizationId }));

		const entity = await datasetEntityStorage.get(datasetId);
		const distributions = ArrayHelper.fromObjectOrArray(entity?.["dcat:distribution"]);
		const accessService = (
			distributions[0] as {
				"dcat:accessService"?: { "dcat:endpointURL"?: string };
			}
		)["dcat:accessService"];
		const bakedUrl = accessService?.["dcat:endpointURL"];
		expect(bakedUrl).toContain(`${ContextIdKeys.Organization}=${organizationId}`);
		expect(bakedUrl).toContain(endpointUrl);
	});

	test("Set ownerId is identity — different identity causes mismatch on update", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const dataset = {
			"@context": {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			},
			"@id": "https://example.com/datasets/composite-owner-test",
			"@type": DcatClasses.Dataset,
			"dcterms:publisher": "https://example.com/participants/test-publisher",
			"dcat:distribution": {
				"@type": "dcat:Distribution",
				"@id": "https://example.com/distributions/composite-dist",
				"dcterms:format": "application/json",
				"dcat:accessService": "https://example.com/services/test-service"
			},
			"odrl:hasPolicy": {
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: "https://example.com/policies/composite-policy",
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		} as unknown as IDcatDataset;

		// Set with identity-a
		await service.set(dataset, JSON.stringify({ identity: "did:node:owner-a" }));

		// Try to update with a different identity — ownerId differs, so update is rejected
		const result = await service.set(
			{ ...dataset, "dcterms:title": "Modified" },
			JSON.stringify({ identity: "did:node:owner-b" })
		);
		expect(result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("datasetOwnerMismatch")
		});
	});

	test("Query with undefined filter returns all datasets from storage directly", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const makeDataset = (id: string): IDcatDataset =>
			({
				"@context": {
					dcat: DcatContexts.Namespace,
					dcterms: DublinCoreContexts.NamespaceTerms,
					odrl: OdrlContexts.Namespace
				},
				"@id": id,
				"@type": DcatClasses.Dataset,
				"dcterms:publisher": "https://example.com/participants/test-publisher",
				"dcat:distribution": {
					"@type": "dcat:Distribution",
					"@id": `${id}/dist`,
					"dcterms:format": "application/json",
					"dcat:accessService": "https://example.com/services/test-service"
				},
				"odrl:hasPolicy": {
					"@context": OdrlContexts.Context,
					"@type": "Offer",
					uid: `${id}/policy`,
					assigner: "https://example.com/participants/test-publisher",
					permission: [{ action: "use" }]
				}
			}) as unknown as IDcatDataset;

		await service.set(makeDataset("https://example.com/datasets/nofilter-1"), "mock-trust-token");
		await service.set(makeDataset("https://example.com/datasets/nofilter-2"), "mock-trust-token");

		// No filter registered — passing undefined bypasses the filter path entirely
		const result = await service.query(
			undefined,
			undefined,
			undefined,
			"https://example.com/participants/test-publisher"
		);

		expect(result.result["@type"]).toBe("Catalog");
		const catalog = result.result as IDataspaceProtocolCatalog;
		const datasets = ArrayHelper.fromObjectOrArray(catalog.dataset ?? []);
		expect(datasets.length).toBeGreaterThanOrEqual(2);
	});

	test("Query with undefined filter forwards cursor and limit to storage", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const querySpy = vi.spyOn(datasetEntityStorage, "query");

		const result = await service.query(undefined, "next-page-cursor", 5, "mock-trust-token");

		expect(querySpy).toHaveBeenCalledWith(undefined, undefined, undefined, "next-page-cursor", 5);
		expect(result.cursor).toBeUndefined();
	});

	test("Query returns CatalogError when multiple filters are provided", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const result = await service.query(
			[{ "@type": "FilterA" }, { "@type": "FilterB" }],
			undefined,
			undefined,
			"mock-trust-token"
		);

		expect(result.result).toMatchObject({
			"@type": "CatalogError",
			code: expect.stringContaining("multipleFiltersNotSupported")
		});
	});

	test("Remove does not error when dataset does not exist", async () => {
		const service = new FederatedCatalogueService({ datasetEntityStorageType: "dataset" });

		const result = await service.remove(
			"https://example.com/datasets/non-existent-remove",
			"mock-trust-token"
		);
		expect(result).toBeUndefined();
	});

	afterAll(() => {
		FederatedCatalogueFilterFactory.clear();
		ComponentFactory.clear();
		EntityStorageConnectorFactory.clear();
	});
});
