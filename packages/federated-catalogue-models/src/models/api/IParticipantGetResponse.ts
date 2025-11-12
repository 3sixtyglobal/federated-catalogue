// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IParticipantEntry } from "../participant/IParticipantEntry.js";

/**
 * Response for a Participant Entry.
 */
export interface IParticipantGetResponse {
	/**
	 * The response payload.
	 */
	body: IParticipantEntry;
}
