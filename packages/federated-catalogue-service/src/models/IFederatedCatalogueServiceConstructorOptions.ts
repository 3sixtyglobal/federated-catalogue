// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IFederatedCatalogueServiceConfig } from "./IFederatedCatalogueServiceConfig.js";

/**
 * Options for the FederatedCatalogueService constructor.
 */
export interface IFederatedCatalogueServiceConstructorOptions {
	/**
	 * The entity storage for datasets.
	 * @default dataset
	 */
	datasetEntityStorageType?: string;

	/**
	 * The logging component for the service.
	 */
	loggingComponentType?: string;

	/**
	 * Trust component type for trust verification.
	 * @default trust
	 */
	trustComponentType?: string;

	/**
	 * Configuration for the federated catalogue service.
	 */
	config?: IFederatedCatalogueServiceConfig;
}
