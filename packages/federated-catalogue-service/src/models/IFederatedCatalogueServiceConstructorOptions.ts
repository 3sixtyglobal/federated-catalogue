// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Options for the FederatedCatalogueService constructor.
 */
export interface IFederatedCatalogueServiceConstructorOptions {
	/**
	 * The type of the entity storage connector for datasets.
	 */
	datasetStorageConnectorType?: string;

	/**
	 * The logging component for the service.
	 */
	loggingComponentType?: string;
}
