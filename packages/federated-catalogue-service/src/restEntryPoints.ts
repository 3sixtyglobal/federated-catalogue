// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import {
	generateRestRoutesFederatedCatalogue,
	tagsFederatedCatalogue
} from "./federatedCatalogueRoutes.js";

/**
 * REST route entry points for the federated catalogue service.
 */
export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "federated-catalogue",
		defaultBaseRoute: "catalog",
		tags: tagsFederatedCatalogue,
		generateRoutes: generateRestRoutesFederatedCatalogue
	}
];
