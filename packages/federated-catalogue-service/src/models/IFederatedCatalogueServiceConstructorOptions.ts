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
	 * URL transformer component type used to encrypt the per-publisher tenant token into
	 * distribution accessService URLs at write time.
	 * @default url-transformer
	 */
	urlTransformerComponentType?: string;

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
