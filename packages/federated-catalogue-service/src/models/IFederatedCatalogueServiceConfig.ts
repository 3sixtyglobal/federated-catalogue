// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the FederatedCatalogueService.
 */
export interface IFederatedCatalogueServiceConfig {
	/**
	 * Timeout in milliseconds for acquiring a mutex lock, defaults to 5000ms.
	 */
	mutexTimeoutMs?: number;
}
