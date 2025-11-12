// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import {
	generateRestRoutesFederatedCatalogue,
	tagsFederatedCatalogue
} from "./federatedCatalogueRoutes.js";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "federated-catalogue",
		defaultBaseRoute: "federated-catalogue",
		tags: tagsFederatedCatalogue,
		generateRoutes: generateRestRoutesFederatedCatalogue
	}
];
