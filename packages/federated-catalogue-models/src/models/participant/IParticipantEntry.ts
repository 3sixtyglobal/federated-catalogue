// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ILegalPerson } from "@twin.org/standards-gaia-x";
import type { FederatedCatalogueContextType } from "../federatedCatalogueContextType.js";
import type { ICatalogueBase } from "../ICatalogueBase.js";

/**
 * Interface describing a participant.
 */
export interface IParticipantEntry extends ILegalPerson, ICatalogueBase {
	/**
	 * The LD Context
	 */
	"@context": FederatedCatalogueContextType;
}
