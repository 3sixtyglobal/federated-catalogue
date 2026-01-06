// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IDcatCatalog, IDcatDataset } from "@twin.org/standards-w3c-dcat";

/**
 * Interface describing a federated catalogue component.
 * Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.
 */
export interface IFederatedCatalogueComponent extends IComponent {
	/**
	 * Retrieve a dataset by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset.
	 * @returns The dataset if found.
	 * @throws NotFoundError if the dataset does not exist.
	 */
	get(dataSetId: string): Promise<IDcatDataset>;

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and should not be exposed via REST endpoints.
	 * @param dataSet The dataset to store.
	 * @returns Nothing.
	 */
	set(dataSet: IDcatDataset): Promise<void>;

	/**
	 * Execute a query against the catalogue using registered filter plugins.
	 * Returns a complete DCAT Catalog object with proper JSON-LD context, metadata, and datasets.
	 * Filter plugins must be registered in FilterFactory before service initialization.
	 * The filter payload is evaluated by the appropriate filter plugin based on its structure.
	 * Pagination properties (cursor, limit) and filter type (@type) should be included
	 * within the filter object per Eclipse Dataspace Protocol JSON-LD extension patterns.
	 * @param filter The filter criteria containing @type, optional cursor and limit properties.
	 * @returns Complete ICatalog object with @context, @id, @type, dcat:dataset, and optional cursor.
	 * @throws NotFoundError if the @type field is missing or if the filter type is not registered.
	 */
	query(filter?: unknown[]): Promise<IDcatCatalog>;

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset to remove.
	 * @returns Nothing.
	 */
	remove(dataSetId: string): Promise<void>;
}
