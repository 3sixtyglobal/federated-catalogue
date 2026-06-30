// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GuardError } from "@twin.org/core";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts,
	type IDataspaceProtocolCatalog,
	type IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { DcatClasses, DcatContexts } from "@twin.org/standards-w3c-dcat";
import { HttpMethod } from "@twin.org/web";
import { FederatedCatalogueRestClient } from "../src/federatedCatalogueRestClient.js";
import {
	createdResponse,
	jsonResponse,
	noContentResponse,
	setupFetchMock,
	teardownFetchMock
} from "./helpers/restClientTestHelpers.js";

// OpenAPI spec: ../../federated-catalogue-service/docs/open-api/spec.json
const ENDPOINT = "http://localhost:8080";
const PREFIX = "federated-catalogue";

const DATASET_ID = "dataset-001";
const TRUST_PAYLOAD = "test-trust-token";
const LOCATION = `${ENDPOINT}/${PREFIX}/datasets/${DATASET_ID}`;

const TEST_DATASET: IDcatDataset = {
	"@context": {
		dcat: DcatContexts.Namespace,
		dcterms: DublinCoreContexts.NamespaceTerms
	},
	"@type": DcatClasses.Dataset,
	"@id": DATASET_ID,
	"dcterms:title": "Test Dataset"
};

const TEST_CATALOG: IDataspaceProtocolCatalog = {
	"@context": DataspaceProtocolContexts.Context,
	"@type": DataspaceProtocolCatalogTypes.Catalog,
	"@id": "catalog-001",
	participantId: "participant-001"
};

const TEST_CATALOG_ERROR: IDataspaceProtocolCatalogError = {
	"@context": DataspaceProtocolContexts.Context,
	"@type": DataspaceProtocolCatalogTypes.CatalogError,
	code: "500",
	reason: ["Internal error"]
};

const fetchMock = vi.fn();

describe("FederatedCatalogueRestClient", () => {
	let client: FederatedCatalogueRestClient;

	beforeEach(() => {
		setupFetchMock(fetchMock);
		client = new FederatedCatalogueRestClient({ endpoint: ENDPOINT });
	});

	afterEach(() => {
		teardownFetchMock(fetchMock);
	});

	describe("get", () => {
		test("throws when datasetId is empty", async () => {
			await expect(client.get("", TRUST_PAYLOAD)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when trustPayload is empty", async () => {
			await expect(client.get(DATASET_ID, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/datasets/:datasetId", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_DATASET));

			await client.get(DATASET_ID, TRUST_PAYLOAD);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/datasets/${DATASET_ID}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns the dataset from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_DATASET));

			const result = await client.get(DATASET_ID, TRUST_PAYLOAD);

			expect(result).toEqual(TEST_DATASET);
		});

		test("returns the catalog error from the response body when an error occurs", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG_ERROR));

			const result = await client.get(DATASET_ID, TRUST_PAYLOAD);

			expect(result).toEqual(TEST_CATALOG_ERROR);
		});
	});

	describe("set", () => {
		test("throws when dataset is not an object", async () => {
			await expect(client.set(null as never, TRUST_PAYLOAD)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.object"
			});
		});

		test("throws when trustPayload is empty", async () => {
			await expect(client.set(TEST_DATASET, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/datasets", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.set(TEST_DATASET, TRUST_PAYLOAD);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/datasets`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the dataset in the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.set(TEST_DATASET, TRUST_PAYLOAD);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body["@type"]).toBe(DcatClasses.Dataset);
			expect(body["@id"]).toBe(DATASET_ID);
		});

		test("returns the Location header value as the dataset id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			const result = await client.set(TEST_DATASET, TRUST_PAYLOAD);

			expect(result).toBe(DATASET_ID);
		});

		test("returns the response body when no Location header is present", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG_ERROR));

			const result = await client.set(TEST_DATASET, TRUST_PAYLOAD);

			expect(result).toEqual(TEST_CATALOG_ERROR);
		});
	});

	describe("remove", () => {
		test("throws when datasetId is empty", async () => {
			await expect(client.remove("", TRUST_PAYLOAD)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when trustPayload is empty", async () => {
			await expect(client.remove(DATASET_ID, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/datasets/:datasetId", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.remove(DATASET_ID, TRUST_PAYLOAD);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/datasets/${DATASET_ID}`);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("returns undefined on successful removal", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.remove(DATASET_ID, TRUST_PAYLOAD);

			expect(result).toBeUndefined();
		});

		test("returns the catalog error from the response body when removal fails", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG_ERROR));

			const result = await client.remove(DATASET_ID, TRUST_PAYLOAD);

			expect(result).toEqual(TEST_CATALOG_ERROR);
		});
	});

	describe("query", () => {
		test("throws when trustPayload is empty", async () => {
			await expect(client.query(undefined, undefined, undefined, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/request", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			await client.query(undefined, undefined, undefined, TRUST_PAYLOAD);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toContain(`${ENDPOINT}/${PREFIX}/request`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends the catalog request message body with context and type", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			await client.query(undefined, undefined, undefined, TRUST_PAYLOAD);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body["@context"]).toContain(DataspaceProtocolContexts.Context);
			expect(body["@type"]).toBe(DataspaceProtocolCatalogTypes.CatalogRequestMessage);
		});

		test("sends the filter in the request body when provided", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));
			const filter = [
				{ "@type": "Constraint", leftOperand: "region", operator: "eq", rightOperand: "eu" }
			];

			await client.query(filter, undefined, undefined, TRUST_PAYLOAD);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.filter).toEqual(filter);
		});

		test("includes cursor as a query parameter when provided", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			await client.query(undefined, "page1", undefined, TRUST_PAYLOAD);

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("cursor=page1");
		});

		test("includes limit as a query parameter when provided", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			await client.query(undefined, undefined, 10, TRUST_PAYLOAD);

			const [url] = fetchMock.mock.calls[0];
			expect(url).toContain("limit=10");
		});

		test("returns the catalog result from the response body", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			const result = await client.query(undefined, undefined, undefined, TRUST_PAYLOAD);

			expect(result.result).toEqual(TEST_CATALOG);
		});

		test("returns undefined cursor when no Link header is present", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_CATALOG));

			const result = await client.query(undefined, undefined, undefined, TRUST_PAYLOAD);

			expect(result.cursor).toBeUndefined();
		});

		test("extracts cursor from the Link next relation header", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({
					"content-type": "application/json",
					link: `<${ENDPOINT}/${PREFIX}/request?cursor=page2>; rel="next"`
				}),
				json: async () => TEST_CATALOG
			});

			const result = await client.query(undefined, undefined, undefined, TRUST_PAYLOAD);

			expect(result.cursor).toBe("page2");
		});
	});
});
