// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServiceOfferingList } from "../service-offering/IServiceOfferingList.js";

/**
 * Response for Service Offering list
 */
export interface IServiceOfferingListResponse {
	/**
	 * The response payload.
	 */
	body: IServiceOfferingList;
}
