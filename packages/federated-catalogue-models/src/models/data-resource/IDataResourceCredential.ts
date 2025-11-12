// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataResource } from "@twin.org/standards-gaia-x";
import type { ICredential } from "../ICredential.js";

/**
 * Data Resource Credential
 */
export interface IDataResourceCredential extends ICredential {
	/**
	 * The subject of the Credential
	 */
	credentialSubject: IDataResource;
}
