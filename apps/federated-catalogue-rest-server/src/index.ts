// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { run } from "@twin.org/node-core";

await run({
	serverName: "Federated Catalogue Server",
	serverVersion: "0.0.3-next.16", // x-release-please-version
	envPrefix: "FEDERATED_CATALOGUE_",
	localesDirectory: path.resolve("dist/locales"),
	openApiSpecFile: path.resolve("docs/open-api/spec.json")
});
