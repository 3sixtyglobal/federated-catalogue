// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

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
}
