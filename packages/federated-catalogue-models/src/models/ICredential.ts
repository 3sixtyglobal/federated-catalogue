// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDidVerifiableCredentialV2 } from "@twin.org/standards-w3c-did";

/**
 * A credential with subject.
 */
export interface ICredential extends IDidVerifiableCredentialV2 {
	/**
	 * The Id of the credential, it is mandatory.
	 */
	id: string;

	/**
	 * The issuer of the credential, it is mandatory.
	 */
	issuer: string;

	/**
	 * Credential subject must always include id and type
	 */
	credentialSubject: IDidVerifiableCredentialV2["credentialSubject"] & {
		id: string;
		type: string | string[];
	};
}
