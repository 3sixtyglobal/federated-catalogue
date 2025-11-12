// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { SchemaOrgTypes } from "@twin.org/standards-schema-org";
import type { IDataResourceEntry } from "./IDataResourceEntry.js";
import type { FederatedCatalogueContextType } from "../federatedCatalogueContextType.js";

/**
 * Interface describing a list of Data Resource entries.
 */
export interface IDataResourceList {
	/**
	 * The LD Context.
	 */
	"@context": FederatedCatalogueContextType;

	/**
	 * The type
	 */
	type: typeof SchemaOrgTypes.ItemList;

	/**
	 * The components of the Collection
	 *
	 */
	[SchemaOrgTypes.ItemListElement]: Omit<IDataResourceEntry, "@context">[];

	/**
	 * Next item cursor.
	 */
	[SchemaOrgTypes.NextItem]?: string;
}
