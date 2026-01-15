// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import type { Dataset } from "../entities/dataset.js";

/**
 * Convert a Dataset entity to an IDcatDataset model.
 * Removes internal entity properties that should not be exposed in API responses.
 * @param entity The dataset entity from storage (may be partial from query results).
 * @returns The IDcatDataset model for API responses.
 */
export function datasetEntityToModel(entity: Dataset | Partial<Dataset>): IDcatDataset {
	return { ...entity } as IDcatDataset;
}

/**
 * Convert an IDcatDataset model to a Dataset entity.
 * Prepares the model for storage by converting to entity type.
 * Creates a shallow copy to avoid mutating the input model.
 * @param model The IDcatDataset model from API requests.
 * @returns The Dataset entity for storage.
 */
export function datasetModelToEntity(model: IDcatDataset): Dataset {
	return { ...model } as Dataset;
}
