// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataResourceEntry } from "./data-resource/IDataResourceEntry.js";
import type { IDataSpaceConnectorEntry } from "./data-space-connector/IDataSpaceConnectorEntry.js";
import type { IParticipantEntry } from "./participant/IParticipantEntry.js";
import type { IServiceOfferingEntry } from "./service-offering/IServiceOfferingEntry.js";

/**
 * Catalogue entry base fields.
 */
export type ICatalogueEntry =
	| IParticipantEntry
	| IDataSpaceConnectorEntry
	| IServiceOfferingEntry
	| IDataResourceEntry;
