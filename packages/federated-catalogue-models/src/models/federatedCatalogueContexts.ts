// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The contexts of federated catalogue data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FederatedCatalogueContexts = {
	/**
	 * The context root for the federated catalogue types.
	 */
	ContextRoot: "https://schema.twindev.org/federated-catalogue/"
} as const;

/**
 * The contexts of federated catalogue data.
 */
export type FederatedCatalogueContexts =
	(typeof FederatedCatalogueContexts)[keyof typeof FederatedCatalogueContexts];
