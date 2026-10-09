// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpErrorHelper } from "@3sixty/api-models";
import { BaseError, type IError, Is } from "@3sixty/core";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts,
	type IDataspaceProtocolCatalogError
} from "@3sixty/standards-dataspace-protocol";
import { HttpStatusCode } from "@3sixty/web";

/**
 * Transform an error to Dataspace Protocol CatalogError format.
 * @param error The error to transform.
 * @returns A CatalogError object with the error code and flattened reason array.
 */
export function transformToCatalogError(error: unknown): IDataspaceProtocolCatalogError {
	const flattened = BaseError.flatten(error);

	// We maintain the reason as the flattened array of errors for more context
	// this also helps preserve the original error messages and types
	// The code property can be any machine-readable string, we use the top-level error name
	// The schema allows for an array of any objects for the reason property
	// and is not limited to just strings or specific error formats
	// https://github.com/eclipse-dataspace-protocol-base/DataspaceProtocol/blob/main/artifacts/src/main/resources/catalog/catalog-error-schema.json
	return {
		"@context": DataspaceProtocolContexts.Context,
		"@type": DataspaceProtocolCatalogTypes.CatalogError,
		code: `${flattened[0].name}:${flattened[0].message}`,
		reason: flattened
	};
}

/**
 * Map a Dataspace Protocol result to an HTTP status code.
 * @param result The result to evaluate.
 * @returns The HTTP status code if the result is a CatalogError or an error object, otherwise undefined.
 */
export function transformErrorToStatusCode(result: unknown): HttpStatusCode | undefined {
	// Is this an catalog error?
	if (
		Is.object<IDataspaceProtocolCatalogError>(result) &&
		result["@type"] === DataspaceProtocolCatalogTypes.CatalogError
	) {
		// As per the method above the result.code is the IError name property
		// so we use that to map to status codes
		const codePart = result.code.split(":")[0];
		return HttpErrorHelper.ERROR_TYPE_MAP[codePart] ?? HttpStatusCode.badRequest;
	}

	// Or a regular error
	if (Is.object<IError>(result) && !BaseError.isEmpty(result)) {
		// If this is a regular error, we can use the name property to map to status codes
		return HttpErrorHelper.ERROR_TYPE_MAP[result.name] ?? HttpStatusCode.badRequest;
	}

	return undefined;
}
