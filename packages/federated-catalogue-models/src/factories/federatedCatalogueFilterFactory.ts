// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@twin.org/core";
import type { IFederatedCatalogueFilter } from "../models/IFederatedCatalogueFilter.js";

/**
 * Factory for managing filter plugin registration and retrieval.
 * Follows the TWIN Platform factory pattern used by ComponentFactory and EntityStorageConnectorFactory.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FederatedCatalogueFilterFactory = Factory.createFactory<IFederatedCatalogueFilter>(
	"federated-catalogue-filter"
);
