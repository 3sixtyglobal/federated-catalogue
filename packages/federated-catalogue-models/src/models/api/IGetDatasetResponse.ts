// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataset } from "@twin.org/standards-w3c-dcat";

/**
 * The response payload for the get dataset method.
 */
export interface IGetDatasetResponse {
	/**
	 * The response payload containing the dataset.
	 */
	body: IDataset;
}
