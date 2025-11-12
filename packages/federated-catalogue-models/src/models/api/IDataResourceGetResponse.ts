// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataResourceEntry } from "../data-resource/IDataResourceEntry.js";

/**
 * Service Offering response
 */
export interface IDataResourceGetResponse {
	/**
	 * The response payload.
	 */
	body: IDataResourceEntry;
}
