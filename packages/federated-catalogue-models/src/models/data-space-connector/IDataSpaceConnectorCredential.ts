// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDataSpaceConnector } from "./IDataSpaceConnector.js";
import type { ICredential } from "../ICredential.js";

/**
 * Participant Credential.
 */
export interface IDataSpaceConnectorCredential extends ICredential {
	/**
	 * The Credential Subject
	 */
	credentialSubject: IDataSpaceConnector;
}
