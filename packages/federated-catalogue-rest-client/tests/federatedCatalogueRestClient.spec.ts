// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { FederatedCatalogueRestClient } from "../src/federatedCatalogueRestClient.js";

describe("FederatedCatalogueRestClient", () => {
	test("Can create an instance", async () => {
		const client = new FederatedCatalogueRestClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
