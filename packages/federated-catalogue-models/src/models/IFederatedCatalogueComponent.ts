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
	 * @param datasetId The unique identifier of the dataset.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the dataset if found, or a CatalogError if not found or an error occurs.
	 */
	get(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDcatDataset | IDataspaceProtocolCatalogError>;

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and should not be exposed via REST endpoints.
	 * @param dataset The dataset to store.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the unique identifier of the stored dataset, or a CatalogError if an error occurs.
	 */
	set(
		dataset: IDcatDataset,
		trustPayload: unknown
	): Promise<string | IDataspaceProtocolCatalogError>;

	/**
	 * Execute a query against the catalogue using registered filter plugins.
	 * Returns a Dataspace Protocol compliant Catalog object with participantId.
	 *
	 * The root catalog's participantId is the requesting participant (from context).
	 * Own datasets (matching requestingParticipantId) go directly in root dataset[].
	 * Other participants' datasets are grouped in nested catalog[] entries.
	 *
	 * For anonymous requests (no context), uses the first publisher found as fallback.
	 * Returns a CatalogError with status 404 when no datasets exist.
	 *
	 * @param filter The filter criteria array, where the first element contains @type.
	 * @param cursor Optional cursor for pagination.
	 * @param limit Optional limit for pagination.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the catalog result and optional next-page cursor.
	 */
	query(
		filter: unknown[] | undefined,
		cursor: string | undefined,
		limit: number | undefined,
		trustPayload: unknown
	): Promise<{
		result: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;
		cursor?: string;
	}>;

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * @param datasetId The unique identifier of the dataset to remove.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with undefined on success, or a CatalogError if removal fails.
	 */
	remove(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDataspaceProtocolCatalogError | undefined>;
}
