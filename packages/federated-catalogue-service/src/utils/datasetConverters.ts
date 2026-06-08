// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import type { Dataset } from "../entities/dataset.js";

/**
 * Convert a Dataset entity to an IDcatDataset model.
 * Maps entity.id back to model["@id"] and strips the storage-only id field.
 * @param entity The dataset entity from storage (may be partial from query results).
 * @returns The IDcatDataset model for API responses.
 */
export function datasetEntityToModel(entity: Dataset | Partial<Dataset>): IDcatDataset {
	const model = { ...entity };
	const { id } = model;

	// Remove storage-specific fields that should not be exposed in the API model
	delete model.id;
	delete model.ownerId;
	delete model.tenantId;

	return {
		...model,
		"@id": id
	} as IDcatDataset;
}

/**
 * Convert an IDcatDataset model to a Dataset entity.
 * Maps model["@id"] to entity.id.
 * @param model The IDcatDataset model from API requests.
 * @returns The Dataset entity for storage.
 */
export function datasetModelToEntity(model: IDcatDataset): Dataset {
	const { "@id": atId, ...datasetModel } = model;

	return {
		...datasetModel,
		id: atId
	} as Dataset;
}
