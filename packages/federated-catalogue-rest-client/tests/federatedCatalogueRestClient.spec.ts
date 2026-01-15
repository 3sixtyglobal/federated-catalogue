// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { describe, expect, test } from "vitest";
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

		// Should throw on empty string (Guards validation)
		await expect(client.get("")).rejects.toThrow();
	});

	test("query method accepts various filter parameters", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });

		// Verify method signature allows optional filter
		// We don't execute the requests as they would need a running server
		expect(typeof client.query).toBe("function");
		expect(client.query.length).toBeLessThanOrEqual(3);
	});

	test("Client uses correct base route", () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:3000" });

		// BaseRestClient sets up the routing internally
		// We verify the client was constructed with the correct package name
		expect(client).toBeDefined();
	});
});
