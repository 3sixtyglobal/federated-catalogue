// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRequestContext } from "@twin.org/api-models";
import { ContextIdStore } from "@twin.org/context";
import { ComponentFactory, Is } from "@twin.org/core";
import type { IJsonLdContextDefinitionRoot } from "@twin.org/data-json-ld";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	FederatedCatalogueFilterFactory,
	type ICatalogRequestRequest,
	type ICatalogRequestResponse,
	type IFederatedCatalogueComponent,
	type IGetDatasetRequest,
	type IGetDatasetResponse
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import {
	DcatClasses,
	DcatContexts,
	type DcatContextType,
	type IDcatDataset
} from "@twin.org/standards-w3c-dcat";
import { OdrlContexts } from "@twin.org/standards-w3c-odrl";
import { HeaderTypes } from "@twin.org/web";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
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

		// Mock ContextIdStore.getContextIds to return undefined (anonymous) by default
		ContextIdStore.getContextIds = vi.fn().mockResolvedValue(undefined);

		ComponentFactory.register("hosting", () => ({
			className: () => "HostingComponent",
			buildPublicUrl: async (url: string) => url
		}));
	});

	beforeEach(async () => {
		// Reset ContextIdStore mock to return undefined (anonymous) by default
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue(undefined);

		// Clear dataset storage
		const allDatasets = await datasetEntityStorage.query();
		for (const dataset of allDatasets.entities) {
			if (dataset.id) {
				await datasetEntityStorage.remove(dataset.id);
			}
		}

		// Clear filter factory before registering
		FederatedCatalogueFilterFactory.clear();

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
					dcat: DcatContexts.Namespace,
					dcterms: DublinCoreContexts.NamespaceTerms,
					odrl: OdrlContexts.Namespace
				},
				"@id": "urn:uuid:dataset-context-test",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Test Dataset for Context",
				"dcterms:publisher": "https://example.com/participants/test-publisher",
				"dcat:distribution": {
					"@type": "dcat:Distribution",
					"@id": "urn:uuid:dist-context-test",
					"dcterms:format": "application/json",
					"dcat:accessService": "https://example.com/services/test-service"
				},
				"odrl:hasPolicy": {
					"@context": OdrlContexts.Context,
					"@type": "Offer",
					uid: "urn:uuid:policy-context-test",
					permission: [{ action: "use" }]
				}
			} as unknown as IDcatDataset;

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
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
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
				expect(context).toContain(DataspaceProtocolContexts.Context);
			} else if (Is.object(context)) {
				// After compaction, context might be an object
				expect(context).toBeDefined();
			}
		});

		test("Validates request structure and returns CatalogError for invalid request", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Test with invalid request (missing body) - should return CatalogError, not throw
			const invalidRequest = {} as ICatalogRequestRequest;

			const response = (await catalogRequestRoute.handler(
				{} as never,
				invalidRequest
			)) as ICatalogRequestResponse;

			// Should return CatalogError with 400 status
			expect(response.statusCode).toBe(400);
			expect(response.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);
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
					dcat: DcatContexts.Namespace,
					dcterms: DublinCoreContexts.NamespaceTerms,
					odrl: OdrlContexts.Namespace
				},
				"@id": "urn:uuid:dataset-123",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Energy Consumption Data",
				"dcterms:description": "Historical energy consumption data",
				"dcterms:publisher": "https://example.com/participants/test-publisher",
				"dcat:distribution": {
					"@type": "dcat:Distribution",
					"@id": "urn:uuid:dist-123",
					"dcterms:format": "application/json",
					"dcat:accessService": "https://example.com/services/test-service"
				},
				"odrl:hasPolicy": {
					"@context": OdrlContexts.Context,
					"@type": "Offer",
					uid: "urn:uuid:policy-123",
					permission: [{ action: "use" }]
				}
			} as unknown as IDcatDataset;

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
			// DS Protocol context compacts dcat:Dataset to just Dataset
			expect(response.body["@type"]).toBe("Dataset");

			// Type narrow to IDataset
			const retrievedDataset = response.body as unknown as IDcatDataset;
			expect(retrievedDataset["@id"]).toBe("urn:uuid:dataset-123");
			// DS Protocol context compacts dcterms: to dct:
			expect(retrievedDataset["dct:title"]).toBe("Energy Consumption Data");
			expect(retrievedDataset["dct:description"]).toBe("Historical energy consumption data");
		});

		test("Returns CatalogError with 404 status when dataset ID does not exist", async () => {
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

			// Execute handler - should return CatalogError
			const response = (await getDatasetRoute.handler({} as never, request)) as IGetDatasetResponse;

			// Verify it's a CatalogError with 404 status
			expect(response.statusCode).toBe(404);
			expect(response.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);
		});

		test("Validates request path parameters and returns CatalogError for invalid request", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			if (!getDatasetRoute) {
				throw new Error("getDataset route not found");
			}

			// Test with missing pathParams - should return CatalogError, not throw
			const invalidRequest1 = {} as IGetDatasetRequest;
			const response1 = (await getDatasetRoute.handler(
				{} as never,
				invalidRequest1
			)) as IGetDatasetResponse;

			expect(response1.statusCode).toBe(400);
			expect(response1.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);

			// Test with empty datasetId - should return CatalogError, not throw
			const invalidRequest2 = {
				pathParams: {
					datasetId: ""
				}
			} as IGetDatasetRequest;
			const response2 = (await getDatasetRoute.handler(
				{} as never,
				invalidRequest2
			)) as IGetDatasetResponse;

			expect(response2.statusCode).toBe(400);
			expect(response2.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);
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

	describe("Link Header (RFC 5988 / DS Protocol)", () => {
		test("No Link header when no cursor in catalog", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Prepare request
			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
				}
			};

			// Mock context with URL
			const mockContext = {
				serverRequest: { url: "https://provider.com/catalog/request" }
			} as IHttpRequestContext;

			// Execute handler
			const response = await catalogRequestRoute.handler(mockContext, request);

			// Verify no Link header when no pagination needed
			expect(response.headers).toEqual({});
		});

		test("Link header includes cursor as query parameter when cursor exists", async () => {
			// This test verifies Link header generation when catalog has a cursor
			// We'll manually create a catalog with cursor to test the Link header logic
			const testService: IFederatedCatalogueComponent = ComponentFactory.get("federated-catalogue");

			// Add a few datasets
			for (let i = 0; i < 5; i++) {
				const dataset = {
					"@context": [
						DataspaceProtocolContexts.Context,
						{
							dcat: DcatContexts.Namespace,
							dcterms: DublinCoreContexts.NamespaceTerms,
							odrl: OdrlContexts.Namespace
						}
					] as IJsonLdContextDefinitionRoot as DcatContextType,
					"@id": `urn:uuid:link-test-${i}`,
					"@type": DcatClasses.Dataset,
					"dcterms:title": `Link Test Dataset ${i}`,
					"dcterms:publisher": "https://example.com/participants/test-publisher",
					"dcat:distribution": {
						"@type": "dcat:Distribution",
						"@id": `urn:uuid:dist-link-${i}`,
						"dcterms:format": "application/json",
						"dcat:accessService": "https://example.com/services/test-service"
					},
					"odrl:hasPolicy": {
						"@context": OdrlContexts.Context,
						"@type": "Offer",
						uid: `urn:uuid:policy-link-${i}`,
						permission: [{ action: "use" }]
					}
				} as unknown as IDcatDataset;
				await testService.set(dataset);
			}

			// Call service.query directly with no filter to get catalog with all datasets
			const catalog = await testService.query();

			// Manually add a cursor to simulate pagination
			(catalog as { cursor?: string }).cursor = "test-cursor-token-abc123";

			// Now test that route handler generates Link header from this cursor
			// We'll create a mock component that returns our catalog with cursor
			const mockComponent = {
				className: () => "MockComponent",
				query: async () => catalog
			};

			ComponentFactory.register("test-federated-catalogue", () => mockComponent);

			// Generate routes with test component
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "test-federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
				}
			};

			const mockContext = {
				serverRequest: { url: "https://provider.com/catalog/request" }
			} as IHttpRequestContext;

			const response = await catalogRequestRoute.handler(mockContext, request);

			// Verify Link header is present
			expect(response.headers).toBeDefined();
			expect(response.headers?.[HeaderTypes.Link]).toBeDefined();

			// Verify Link header format: <url?cursor=...>; rel="next"
			const linkHeader = response.headers?.[HeaderTypes.Link];
			expect(linkHeader).toBe(
				'<https://provider.com/catalog/request?cursor=test-cursor-token-abc123>; rel="next"'
			);

			// Verify cursor is in the URL as query parameter
			expect(linkHeader).toContain("cursor=test-cursor-token-abc123");

			// Verify cursor is NOT in response body (DS Protocol: cursor in Link header only)
			expect((response.body as { cursor?: string }).cursor).toBeUndefined();
		});

		test("Link header URL can be used to fetch next page", async () => {
			// This test verifies that cursor from Link header can be used in next request
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Create a mock component that returns different catalogs based on cursor
			const mockComponent = {
				className: () => "MockPaginatedComponent",
				query: async (filter?: unknown[], cursor?: string) => {
					const hasCursor = cursor === "page2-cursor";

					return {
						result: {
							"@context": [DataspaceProtocolContexts.Context],
							"@id": "urn:x-catalog:test",
							"@type": DcatClasses.Catalog,
							"dcat:dataset": hasCursor
								? []
								: [
										{
											"@id": "urn:uuid:test-1",
											"@type": DcatClasses.Dataset,
											"dcterms:title": "Test 1"
										}
									]
						},
						cursor: hasCursor ? undefined : "page2-cursor"
					};
				}
			};

			ComponentFactory.register("test-paginated-catalogue", () => mockComponent);

			const testRoutes = generateRestRoutesFederatedCatalogue(
				"/catalog",
				"test-paginated-catalogue"
			);
			const testRoute = testRoutes.find(r => r.operationId === "catalogRequest");

			if (!testRoute) {
				throw new Error("test route not found");
			}

			const mockContext = {
				serverRequest: { url: "https://provider.com/catalog/request" }
			} as IHttpRequestContext;

			// First request
			const firstRequest: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
				}
			};

			const firstResponse = await testRoute.handler(mockContext, firstRequest);

			// Extract cursor from Link header
			const linkHeader = firstResponse.headers?.[HeaderTypes.Link];

			expect(linkHeader).toBeDefined();

			const urlMatch = linkHeader?.match(/<([^>]+)>/);
			const linkUrl = new URL(urlMatch?.[1] ?? "");
			const cursorFromLink = linkUrl.searchParams.get("cursor");

			expect(cursorFromLink).toBe("page2-cursor");

			// Second request using cursor from Link header query parameter
			const secondRequest: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
				},
				query: {
					cursor: cursorFromLink ?? undefined
				}
			};

			const secondResponse = await testRoute.handler(mockContext, secondRequest);

			// Verify second page was fetched (mock returns empty datasets for page 2)
			expect(secondResponse.body["dcat:dataset"]).toBeDefined();
			expect(Array.isArray(secondResponse.body["dcat:dataset"])).toBe(true);
			expect((secondResponse.body["dcat:dataset"] as unknown[]).length).toBe(0);

			// Verify second page has no cursor (last page)
			expect((secondResponse.body as { cursor?: string }).cursor).toBeUndefined();
			expect(secondResponse.headers).toEqual({});
		});

		test("Link header format is RFC 5988 compliant", async () => {
			// This test verifies the exact format per DS Protocol spec example
			const mockComponent = {
				className: () => "MockRfcComponent",
				query: async () => ({
					"@context": [DataspaceProtocolContexts.Context],
					"@id": "urn:x-catalog:test",
					"@type": DcatClasses.Catalog,
					"dcat:dataset": [],
					cursor: "rfc-test-cursor"
				})
			};

			ComponentFactory.register("test-rfc-catalogue", () => mockComponent);

			const routes = generateRestRoutesFederatedCatalogue("/catalog", "test-rfc-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
				}
			};

			const mockContext = {
				serverRequest: { url: "https://provider.com/catalog/request" }
			} as IHttpRequestContext;

			const response = await catalogRequestRoute.handler(mockContext, request);

			// Verify RFC 5988 format: <URL>; rel="next"
			const linkHeader = response.headers?.[HeaderTypes.Link];
			expect(linkHeader).toMatch(/^<[^>]+>; rel="next"$/);

			// Verify URL is absolute
			expect(linkHeader).toMatch(/^<https:\/\//);

			// Verify rel parameter uses quotes
			expect(linkHeader).toContain('rel="next"');

			// Verify cursor is in URL query parameter
			expect(linkHeader).toContain("?cursor=rfc-test-cursor");
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

	describe("CatalogError Transformation (DS Protocol Compliance)", () => {
		test("GET /datasets/:datasetId returns CatalogError for non-existent dataset", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");

			if (!getDatasetRoute) {
				throw new Error("getDataset route not found");
			}

			// Prepare request with non-existent ID
			const request: IGetDatasetRequest = {
				pathParams: {
					datasetId: "urn:uuid:non-existent-dataset"
				}
			};

			// Execute handler - should return CatalogError with 404 status
			const response = (await getDatasetRoute.handler({} as never, request)) as IGetDatasetResponse;

			// Verify it's a CatalogError
			expect(response.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);
			expect(response.body["@context"]).toBe(DataspaceProtocolContexts.Context);
			expect(response.statusCode).toBe(404);

			expect(response.body).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "NotFoundError:federatedCatalogueService.datasetNotFound",
				reason: [
					{
						name: "NotFoundError",
						source: "FederatedCatalogueService",
						message: "federatedCatalogueService.datasetNotFound",
						properties: {
							notFoundId: "urn:uuid:non-existent-dataset"
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("POST /request with missing @context throws GuardError", async () => {
			// Missing @context should throw GuardError
			const invalidDataset = {
				// Missing @context
				"@id": "urn:uuid:invalid-dataset",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Invalid Dataset",
				"dcterms:publisher": "https://example.com/participants/test-publisher"
			} as IDcatDataset;

			// Attempt to set invalid dataset - should throw GuardError
			await expect(service.set(invalidDataset)).rejects.toThrow();
		});

		test("POST /request with empty body returns CatalogError", async () => {
			// Generate routes
			const routes = generateRestRoutesFederatedCatalogue("/catalog", "federated-catalogue");
			const catalogRequestRoute = routes.find(r => r.operationId === "catalogRequest");

			if (!catalogRequestRoute) {
				throw new Error("catalogRequest route not found");
			}

			// Test with missing body - should return CatalogError, not throw
			const invalidRequest = {} as ICatalogRequestRequest;

			const response = (await catalogRequestRoute.handler(
				{} as never,
				invalidRequest
			)) as ICatalogRequestResponse;

			expect(response.statusCode).toBe(400);
			expect(response.body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);
		});

		test("Service transforms errors to CatalogError format", async () => {
			// This test verifies service.get() returns CatalogError for non-existent datasets
			const result = await service.get("urn:uuid:test-123");

			// Verify transformation to ICatalogError
			expect(result["@context"]).toBe(DataspaceProtocolContexts.Context);
			expect(result["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogError);

			expect(result).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "NotFoundError:federatedCatalogueService.datasetNotFound",
				reason: [
					{
						name: "NotFoundError",
						source: "FederatedCatalogueService",
						message: "federatedCatalogueService.datasetNotFound",
						properties: {
							notFoundId: "urn:uuid:test-123"
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("Service returns dataset for successful get", async () => {
			// Add a test dataset
			const testDataset = {
				"@context": {
					dcat: DcatContexts.Namespace,
					dcterms: DublinCoreContexts.NamespaceTerms,
					odrl: OdrlContexts.Namespace
				},
				"@id": "urn:uuid:success-test",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Success Test Dataset",
				"dcterms:publisher": "https://example.com/participants/test-publisher",
				"dcat:distribution": {
					"@type": "dcat:Distribution",
					"@id": "urn:uuid:dist-success",
					"dcterms:format": "application/json",
					"dcat:accessService": "https://example.com/services/test-service"
				},
				"odrl:hasPolicy": {
					"@context": OdrlContexts.Context,
					"@type": "Offer",
					uid: "urn:uuid:policy-success",
					permission: [{ action: "use" }]
				}
			} as unknown as IDcatDataset;

			await service.set(testDataset);

			// Retrieve the dataset
			const result = await service.get("urn:uuid:success-test");

			// DS Protocol context compacts dcat:Dataset to just Dataset
			expect(result["@type"]).toBe("Dataset");
			expect((result as IDcatDataset)["@id"]).toBe("urn:uuid:success-test");
		});
	});

	describe("Request Validation", () => {
		test("POST /request with empty body returns CatalogError with 400 status", async () => {
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			const request: ICatalogRequestRequest = {
				body: {} as ICatalogRequestRequest["body"]
			};

			const result = (await catalogRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as ICatalogRequestResponse;

			// Should return CatalogError, not throw GuardError
			expect(result.statusCode).toBe(400);
			expect(result.body).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "GuardError:guard.string",
				reason: [
					{
						name: "GuardError",
						source: "federatedCatalogueRoutes",
						message: "guard.string",
						properties: {
							property: "@type",
							value: "undefined"
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("POST /request with missing @type returns CatalogError with 400 status", async () => {
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			const request: ICatalogRequestRequest = {
				body: {
					filter: []
				} as unknown as ICatalogRequestRequest["body"]
			};

			const result = (await catalogRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as ICatalogRequestResponse;

			// Should return CatalogError, not throw GuardError
			expect(result.statusCode).toBe(400);
			expect(result.body).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "GuardError:guard.string",
				reason: [
					{
						name: "GuardError",
						source: "federatedCatalogueRoutes",
						message: "guard.string",
						properties: {
							property: "@type",
							value: "undefined"
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("POST /request with only @context (missing @type) returns CatalogError", async () => {
			// Empty Catalog Request Payload Leads to Uncontrolled GuardError
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			// Request with only @context (missing @type)
			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context]
				} as unknown as ICatalogRequestRequest["body"]
			};

			const result = (await catalogRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as ICatalogRequestResponse;

			// Should return CatalogError, not throw GuardError
			expect(result.statusCode).toBe(400);
			expect(result.body).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "GuardError:guard.string",
				reason: [
					{
						name: "GuardError",
						source: "federatedCatalogueRoutes",
						message: "guard.string",
						properties: {
							property: "@type",
							value: "undefined"
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("GET /datasets/:datasetId with empty datasetId returns CatalogError", async () => {
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const getDatasetRoute = routes.find(r => r.operationId === "getDataset");
			expect(getDatasetRoute).toBeDefined();

			const request: IGetDatasetRequest = {
				pathParams: {
					datasetId: ""
				}
			};

			const result = (await getDatasetRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as IGetDatasetResponse;

			// Should return CatalogError, not throw GuardError
			expect(result.statusCode).toBe(400);
			expect(result.body).toEqual({
				"@context": "https://w3id.org/dspace/2025/1/context.jsonld",
				"@type": "CatalogError",
				code: "GuardError:guard.stringEmpty",
				reason: [
					{
						name: "GuardError",
						source: "federatedCatalogueRoutes",
						message: "guard.stringEmpty",
						properties: {
							property: "request.pathParams.datasetId",
							value: ""
						},
						stack: expect.any(String)
					}
				]
			});
		});

		test("POST /request returns HTTP 404 status when no datasets found", async () => {
			// Clear any existing datasets to ensure empty result
			const allDatasets = await datasetEntityStorage.query();
			for (const dataset of allDatasets.entities) {
				if (dataset.id) {
					await datasetEntityStorage.remove(dataset.id);
				}
			}

			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter: []
				}
			};

			const result = (await catalogRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as ICatalogRequestResponse;

			// Return appropriate HTTP code when returning CatalogError
			expect(result.statusCode).toBe(404);
			expect(result.body).toEqual({
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

		test("POST /request returns HTTP 400 status for invalid filter (missing @type)", async () => {
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			// Valid CatalogRequestMessage but with filter missing @type
			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter: [{ "dcterms:title": "Test" }] // Missing @type in filter
				}
			};

			const result = (await catalogRoute?.handler(
				{} as IHttpRequestContext,
				request
			)) as ICatalogRequestResponse;

			// Guard errors should return CatalogError, not throw
			expect(result.statusCode).toBe(400);
			expect(result.body).toEqual({
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

		test("POST /request with valid CatalogRequestMessage succeeds", async () => {
			const routes = generateRestRoutesFederatedCatalogue("/test-catalogue", "test-component");
			ComponentFactory.register("test-component", () => service);

			// Add a dataset first so the query returns a Catalog instead of CatalogError
			const testDataset = {
				"@context": {
					dcat: DcatContexts.Namespace,
					dcterms: DublinCoreContexts.NamespaceTerms,
					odrl: OdrlContexts.Namespace
				},
				"@id": "urn:uuid:catalog-request-test",
				"@type": DcatClasses.Dataset,
				"dcterms:title": "Catalog Request Test Dataset",
				"dcterms:publisher": "https://example.com/participants/test-publisher",
				"dcat:distribution": {
					"@type": "dcat:Distribution",
					"@id": "urn:uuid:dist-catalog-request",
					"dcterms:format": "application/json",
					"dcat:accessService": "https://example.com/services/test-service"
				},
				"odrl:hasPolicy": {
					"@context": OdrlContexts.Context,
					"@type": "Offer",
					uid: "urn:uuid:policy-catalog-request",
					permission: [{ action: "use" }]
				}
			};
			await service.set(testDataset as unknown as IDcatDataset);

			const catalogRoute = routes.find(r => r.operationId === "catalogRequest");
			expect(catalogRoute).toBeDefined();

			const request: ICatalogRequestRequest = {
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter: []
				}
			};

			const result = await catalogRoute?.handler({} as IHttpRequestContext, request);

			expect(result.body).toBeDefined();
			// DS Protocol context compacts dcat:Catalog to just Catalog
			expect(result.body["@type"]).toBe("Catalog");
		});
	});
});
