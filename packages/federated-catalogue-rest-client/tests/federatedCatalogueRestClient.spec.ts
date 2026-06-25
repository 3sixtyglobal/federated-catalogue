// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { FederatedCatalogueRestClient } from "../src/federatedCatalogueRestClient.js";

describe("FederatedCatalogueRestClient", () => {
	test("Can create an instance", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		expect(client).toBeDefined();
	});

	test("query method exists and is callable", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		expect(client.query).toBeDefined();
		expect(typeof client.query).toBe("function");
	});

	test("get method exists and is callable", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		expect(client.get).toBeDefined();
		expect(typeof client.get).toBe("function");
	});

	test("get method validates datasetId parameter", async () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		await expect(client.get("", "token")).rejects.toThrow();
	});

	test("set method validates dataset parameter", async () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		await expect(client.set(null as never, "token")).rejects.toThrow();
	});

	test("remove method validates datasetId parameter", async () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		await expect(client.remove("", "token")).rejects.toThrow();
	});

	test("query method has filter, cursor, limit and trustPayload parameters", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });
		expect(typeof client.query).toBe("function");
		expect(client.query.length).toBe(4);
	});
});
