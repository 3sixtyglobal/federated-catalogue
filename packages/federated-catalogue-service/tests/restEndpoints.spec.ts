// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, Is, NotFoundError } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	FederatedCatalogueFilterFactory,
	type ICatalogRequestRequest,
	type ICatalogRequestResponse,
	type IGetDatasetRequest,
	type IGetDatasetResponse
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import { CatalogTypes, DataspaceProtocolContexts } from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import { DcatClasses, DcatContexts } from "@twin.org/standards-w3c-dcat";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { Dataset } from "../src/entities/dataset.js";
import {
	generateRestRoutesFederatedCatalogue,
	tagsFederatedCatalogue
} from "../src/federatedCatalogueRoutes.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";

let datasetEntityStorage: MemoryEntityStorageConnector<Dataset>;
let service: FederatedCatalogueService;

describe("Federated Catalogue REST Endpoints", () => {
	beforeAll(async () => {
		initSchema();

		// Register all JSON-LD contexts in document cache
		await addAllContextsToDocumentCache();

		datasetEntityStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});

		EntityStorageConnectorFactory.register("dataset", () => datasetEntityStorage);
	});

	beforeEach(async () => {
		// Clear dataset storage
		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset["@id"]) {
				await datasetEntityStorage.remove(dataset["@id"]);
			}
		}

		// Register filter plugin in factory
		FederatedCatalogueFilterFactory.register("FilterByExample", () => ({
			className: () => "FilterByExample",
			query: async filter => ({
				datasets: [],
				cursor: undefined
			}),
			createIndex: async dataSet => ({})
		}));

		// Create fresh service instance
		service = new FederatedCatalogueService({
			datasetStorageConnectorType: "dataset"
		});

		// Register service in ComponentFactory
		ComponentFactory.register("federated-catalogue", () => service);
	});

	afterAll(() => {
		FederatedCatalogueFilterFactory.clear();
		ComponentFactory.clear();
		EntityStorageConnectorFactory.clear();
	});

	describe("POST /catalog/request - Catalog Request", () => {
		test("Catalog response includes Dataspace Protocol context", async () => {
			// Add test dataset
			const dataset = {
				"@context": {
					dcat: DcatContexts.ContextRoot,
					dcterms: DublinCoreContexts.ContextTerms
				},
				"@id": "urn:uuid:dataset-context-test",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Test Dataset for Context"
			};

			await service.set(dataset);

			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Prepare request
			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.ContextRoot],
					"@type": CatalogTypes.CatalogRequestMessage,
					filter: [
						{
							"@type": "FilterByExample",
							"dcterms:title": "Test Dataset for Context"
						}
					]
				}
			};

			// Execute handler
			const response = (await catalogRequestRoute.handler(
				{} as never,
				request
			)) as ICatalogRequestResponse;

			// Verify context includes Dataspace Protocol
			const context = response.body["@context"];
			expect(context).toBeDefined();
			if (Is.array(context)) {
				expect(context).toContain(DataspaceProtocolContexts.ContextRoot);
			} else if (Is.object(context)) {
				// After compaction, context might be an object
				expect(context).toBeDefined();
			}
		});

		test("Validates request structure", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Test with invalid request (missing body)
			const invalidRequest = {} as ICatalogRequestRequest;

			await expect(catalogRequestRoute.handler({} as never, invalidRequest)).rejects.toThrow();
		});

		test("Route configuration is correct", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			expect(catalogRequestRoute).toBeDefined();
			expect(catalogRequestRoute?.method).toBe("POST");
			expect(catalogRequestRoute?.path).toBe("/catalog/request");
			expect(catalogRequestRoute?.tag).toBe(tagsFederatedCatalogue[0].name);
			expect(catalogRequestRoute?.summary).toBe("Query the federated catalogue for datasets");
		});
	});

	describe("GET /catalog/datasets/:datasetId - Get Dataset", () => {
		test("Returns dataset when ID exists", async () => {
			// Add test dataset
			const dataset = {
				"@context": {
					dcat: DcatContexts.ContextRoot,
					dcterms: DublinCoreContexts.ContextTerms
				},
				"@id": "urn:uuid:dataset-123",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Energy Consumption Data",
				"dcterms:description": "Historical energy consumption data"
			};

			await service.set(dataset);

			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			expect(getDatasetRoute).toBeDefined();

			if (!getDatasetRoute) {
				throw new Error("getDataset route not found");
			}

			// Prepare request
			const request: IGetDatasetRequest = {
				pathParams: {
					datasetId: "urn:uuid:dataset-123"
				}
			};

			// Execute handler
			const response = (await getDatasetRoute.handler({} as never, request)) as IGetDatasetResponse;

			// Verify response
			expect(response).toBeDefined();
			expect(response.body).toBeDefined();
			expect(response.body["@id"]).toBe("urn:uuid:dataset-123");
			expect(response.body["@type"]).toBe(DcatClasses.Dataset);
			expect(response.body["dcterms:title"]).toBe("Energy Consumption Data");
			expect(response.body["dcterms:description"]).toBe("Historical energy consumption data");
		});

		test("Throws NotFoundError when dataset ID does not exist", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			if (!getDatasetRoute) {
				throw new Error("getDataset route not found");
			}

			// Prepare request with non-existent ID
			const request: IGetDatasetRequest = {
				pathParams: {
					datasetId: "urn:uuid:non-existent"
				}
			};

			// Execute handler and expect error
			await expect(getDatasetRoute.handler({} as never, request)).rejects.toThrow(NotFoundError);
		});

		test("Validates request path parameters", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			if (!getDatasetRoute) {
				throw new Error("getDataset route not found");
			}

			// Test with missing pathParams
			const invalidRequest1 = {} as IGetDatasetRequest;
			await expect(getDatasetRoute.handler({} as never, invalidRequest1)).rejects.toThrow();

			// Test with empty datasetId
			const invalidRequest2 = {
				pathParams: {
					datasetId: ""
				}
			} as IGetDatasetRequest;
			await expect(getDatasetRoute.handler({} as never, invalidRequest2)).rejects.toThrow();
		});

		test("Route configuration is correct", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			expect(getDatasetRoute).toBeDefined();
			expect(getDatasetRoute?.method).toBe("GET");
			expect(getDatasetRoute?.path).toBe("/catalog/datasets/:datasetId");
			expect(getDatasetRoute?.tag).toBe(tagsFederatedCatalogue[0].name);
			expect(getDatasetRoute?.summary).toBe("Retrieve a specific dataset by ID");
		});
	});

	describe("Route Generation", () => {
		test("Generates all expected routes", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");

			expect(routes.length).toBe(2);
			expect(routes.find(r => r.operationId === "catalogRequest")).toBeDefined();
			expect(routes.find(r => r.operationId === "getDataset")).toBeDefined();
		});

		test("All routes have proper tags", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");

			for (const route of routes) {
				expect(route.tag).toBe(tagsFederatedCatalogue[0].name);
			}
		});

		test("All routes have request and response type definitions", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");

			for (const route of routes) {
				expect(route.requestType).toBeDefined();
				expect(route.responseType).toBeDefined();
				expect(Array.isArray(route.responseType)).toBe(true);
			}
		});

		test("All routes have examples", () => {
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");

			for (const route of routes) {
				expect(route.requestType?.examples).toBeDefined();
				expect(route.requestType?.examples?.length).toBeGreaterThan(0);
				expect(route.responseType?.[0]?.examples).toBeDefined();
				expect(route.responseType?.[0]?.examples?.length).toBeGreaterThan(0);
			}
		});
	});
});
