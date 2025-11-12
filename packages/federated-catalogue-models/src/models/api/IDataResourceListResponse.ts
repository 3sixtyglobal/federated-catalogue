// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataResourceList } from "../data-resource/IDataResourceList.js";

/**
 * Response fo data resource list.
 */
export interface IDataResourceListResponse {
	/**
	 * The response payload.
	 */
	body: IDataResourceList;
}
