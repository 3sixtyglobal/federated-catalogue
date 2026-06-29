// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import { HttpHeaderHelper, type IBaseRestClientConfig } from "@twin.org/api-models";
import { Coerce, Guards } from "@twin.org/core";
import type {
	ICatalogRequestRequest,
	ICatalogRequestResponse,
	IDatasetGetRequest,
	IDatasetGetResponse,
	IDatasetRemoveRequest,
	IDatasetRemoveResponse,
	IDatasetSetRequest,
	IDatasetSetResponse,
	IFederatedCatalogueComponent
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts,
	type IDataspaceProtocolCatalog,
	type IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { HeaderHelper, HeaderTypes, HttpMethod, HttpStatusCode } from "@twin.org/web";

/**
 * Client for performing federated catalogue operations through REST endpoints.
 */
export class FederatedCatalogueRestClient
	extends BaseRestClient
	implements IFederatedCatalogueComponent
{
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<FederatedCatalogueRestClient>();

	/**
	 * Create a new instance of FederatedCatalogueRestClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<FederatedCatalogueRestClient>(), config, "federated-catalogue");
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FederatedCatalogueRestClient.CLASS_NAME;
	}

	/**
	 * Retrieve a specific dataset by its unique identifier.
	 * @param datasetId The unique identifier of the dataset.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the dataset if found, or a CatalogError if not found or an error occurs.
	 */
	public async get(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDcatDataset | IDataspaceProtocolCatalogError> {
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(datasetId), datasetId);
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(trustPayload), trustPayload);

		const response = await this.fetch<IDatasetGetRequest, IDatasetGetResponse>(
			"/datasets/:datasetId",
			HttpMethod.GET,
			{
				headers: {
					[HeaderTypes.Authorization]: HeaderHelper.createBearer(trustPayload)
				},
				pathParams: {
					datasetId
				}
			}
		);

		return response.body;
	}

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and is not exposed via REST endpoints.
	 * @param dataset The dataset to store.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the unique identifier of the stored dataset, or a CatalogError if an error occurs.
	 */
	public async set(
		dataset: IDcatDataset,
		trustPayload: unknown
	): Promise<string | IDataspaceProtocolCatalogError> {
		Guards.object<IDcatDataset>(FederatedCatalogueRestClient.CLASS_NAME, nameof(dataset), dataset);
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(trustPayload), trustPayload);

		const response = await this.fetch<IDatasetSetRequest, IDatasetSetResponse>(
			"/datasets",
			HttpMethod.POST,
			{
				headers: {
					[HeaderTypes.Authorization]: HeaderHelper.createBearer(trustPayload)
				},
				body: dataset
			}
		);

		return response.statusCode === HttpStatusCode.created
			? HttpHeaderHelper.extractId(response.headers)
			: (response.body ?? "");
	}

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * This method is internal and is not exposed via REST endpoints.
	 * @param datasetId The unique identifier of the dataset to remove.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with undefined on success, or a CatalogError if removal fails.
	 */
	public async remove(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDataspaceProtocolCatalogError | undefined> {
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(datasetId), datasetId);
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(trustPayload), trustPayload);

		const result = await this.fetch<IDatasetRemoveRequest, IDatasetRemoveResponse>(
			"/datasets/:datasetId",
			HttpMethod.DELETE,
			{
				headers: {
					[HeaderTypes.Authorization]: HeaderHelper.createBearer(trustPayload)
				},
				pathParams: {
					datasetId
				}
			}
		);

		return result.body;
	}

	/**
	 * Query the federated catalogue with an optional filter.
	 * @param filter Optional filter criteria for querying datasets.
	 * @param cursor Optional cursor for pagination.
	 * @param limit Optional limit for pagination.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the catalog result and optional next-page cursor.
	 */
	public async query(
		filter: unknown[] | undefined,
		cursor: string | undefined,
		limit: number | undefined,
		trustPayload: unknown
	): Promise<{
		result: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;
		cursor?: string;
	}> {
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(trustPayload), trustPayload);
		const response = await this.fetch<ICatalogRequestRequest, ICatalogRequestResponse>(
			"/request",
			HttpMethod.POST,
			{
				headers: {
					[HeaderTypes.Authorization]: HeaderHelper.createBearer(trustPayload)
				},
				query: {
					cursor,
					limit: Coerce.string(limit)
				},
				body: {
					"@context": [DataspaceProtocolContexts.Context],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter
				}
			}
		);

		return {
			result: response.body,
			cursor: HttpHeaderHelper.extractCursor(response.headers)
		};
	}
}
