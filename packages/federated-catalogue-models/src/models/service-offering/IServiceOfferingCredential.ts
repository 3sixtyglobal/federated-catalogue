// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServiceOffering } from "@twin.org/standards-gaia-x";
import type { ICredential } from "../ICredential.js";

/**
 * A Service Offering Credential
 */
export interface IServiceOfferingCredential extends ICredential {
	/**
	 * The Credential Subject
	 */
	credentialSubject: IServiceOffering;
}
