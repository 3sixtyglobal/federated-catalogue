// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { run } from "@twin.org/node-core";

await run({
	serverName: "Federated Catalogue Server",
	serverVersion: "0.0.2-next.5", // x-release-please-version
	envPrefix: "FEDERATED_CATALOGUE_",
	localesDirectory: path.resolve("dist/locales"),
	openApiSpecFile: path.resolve("docs/open-api/spec.json")
});
