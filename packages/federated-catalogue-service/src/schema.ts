// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@3sixty/entity";
import { nameof } from "@3sixty/nameof";
import { Dataset } from "./entities/dataset.js";
import { DatasetV0 } from "./entities/datasetV0.js";

/**
 * Initialize the schema for the federated catalogue entity storage.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Dataset>(), () => EntitySchemaHelper.getSchema(Dataset));
	EntitySchemaFactory.register(nameof<DatasetV0>(), () => EntitySchemaHelper.getSchema(DatasetV0));
}
