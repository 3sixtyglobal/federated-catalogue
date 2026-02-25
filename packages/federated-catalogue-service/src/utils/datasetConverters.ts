// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import type { Dataset } from "../entities/dataset.js";

/**
 * Convert a Dataset entity to an IDcatDataset model.
 * Maps entity.id back to model["@id"] and strips sync-only fields.
 * @param entity The dataset entity from storage (may be partial from query results).
 * @returns The IDcatDataset model for API responses.
 */
export function datasetEntityToModel(entity: Dataset | Partial<Dataset>): IDcatDataset {
	const model = { ...entity };
	const { id } = model;

	delete model.id;
	delete model.nodeIdentity;
	delete model.dateModified;

	return {
		...model,
		"@id": id
	} as IDcatDataset;
}

/**
 * Convert an IDcatDataset model to a Dataset entity.
 * Maps model["@id"] to entity.id and sets sync fields from provided values.
 * @param model The IDcatDataset model from API requests.
 * @param nodeIdentity The node identity to set on the entity.
 * @param dateModified The dateModified timestamp to set on the entity.
 * @returns The Dataset entity for storage.
 */
export function datasetModelToEntity(
	model: IDcatDataset,
	nodeIdentity: string,
	dateModified: string
): Dataset {
	const { "@id": atId, ...datasetModel } = model;

	return {
		...datasetModel,
		id: atId,
		nodeIdentity,
		dateModified
	} as Dataset;
}
