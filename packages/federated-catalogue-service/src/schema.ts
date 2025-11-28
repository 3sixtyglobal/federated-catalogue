// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { nameof } from "@twin.org/nameof";
import { Dataset } from "./entities/dataset.js";

/**
 * Initialize the schema for the federated catalogue entity storage.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Dataset>(), () => EntitySchemaHelper.getSchema(Dataset));
}
