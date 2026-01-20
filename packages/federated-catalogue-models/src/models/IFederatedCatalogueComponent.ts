// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type {
	IDataspaceProtocolCatalog,
	IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";

/**
 * Interface describing a federated catalogue component.
 * Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.
 */
export interface IFederatedCatalogueComponent extends IComponent {
	/**
	 * Retrieve a dataset by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset.
	 * @returns The dataset if found, or a CatalogError if not found or an error occurs.
	 */
	get(dataSetId: string): Promise<IDcatDataset | IDataspaceProtocolCatalogError>;

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and should not be exposed via REST endpoints.
	 * @param dataSet The dataset to store.
	 * @returns Nothing.
	 */
	set(dataSet: IDcatDataset): Promise<void>;

	/**
	 * Execute a query against the catalogue using registered filter plugins.
	 * Returns a DS Protocol compliant Catalog object with participantId.
	 *
	 * The root catalog's participantId is the requesting participant (from context).
	 * Own datasets (matching requestingParticipantId) go directly in root dataset[].
	 * Other participants' datasets are grouped in nested catalog[] entries.
	 *
	 * For anonymous requests (no context), uses the first publisher found as fallback.
	 * Returns CatalogError 404 when no datasets exist.
	 *
	 * @param filter The filter criteria containing @type.
	 * @param cursor Optional cursor for pagination.
	 * @param limit Optional limit for pagination.
	 * @returns Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
	 * or IDataspaceProtocolCatalogError if no datasets found.
	 */
	query(
		filter?: unknown[],
		cursor?: string,
		limit?: number
	): Promise<{
		result: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;
		cursor?: string;
	}>;

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset to remove.
	 * @returns Nothing.
	 */
	remove(dataSetId: string): Promise<void>;
}
