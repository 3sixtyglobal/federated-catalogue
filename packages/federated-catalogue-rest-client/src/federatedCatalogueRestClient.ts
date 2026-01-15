// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type { IBaseRestClientConfig } from "@twin.org/api-models";
import { Coerce, Guards, NotSupportedError } from "@twin.org/core";
import type {
	ICatalogRequestRequest,
	ICatalogRequestResponse,
	IFederatedCatalogueComponent,
	IGetDatasetRequest,
	IGetDatasetResponse
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts,
	type IDataspaceProtocolCatalog,
	type IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { HeaderHelper, HeaderTypes } from "@twin.org/web";

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
	 * Query the federated catalogue with an optional filter.
	 * @param filter Optional filter criteria for querying datasets.
	 * @param cursor Optional cursor for pagination.
	 * @param limit Optional limit for pagination.
	 * @returns The catalog containing matching datasets (or CatalogError if none found), with cursor if more pages exist.
	 */
	public async query(
		filter?: unknown[],
		cursor?: string,
		limit?: number
	): Promise<{
		catalog: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;
		cursor?: string;
	}> {
		const response = await this.fetch<ICatalogRequestRequest, ICatalogRequestResponse>(
			"/request",
			"POST",
			{
				query: {
					cursor,
					limit: Coerce.string(limit)
				},
				body: {
					"@context": [DataspaceProtocolContexts.JsonLdContext],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter
				}
			}
		);

		return {
			catalog: response.body,
			cursor: HeaderHelper.extractLinkHeaderRelation(response.headers?.[HeaderTypes.Link], "next")
				?.urlQueryParams?.cursor
		};
	}

	/**
	 * Retrieve a specific dataset by its unique identifier.
	 * @param datasetId The unique identifier of the dataset.
	 * @returns The dataset if found, or a CatalogError if not found or an error occurs.
	 */
	public async get(datasetId: string): Promise<IDcatDataset | IDataspaceProtocolCatalogError> {
		Guards.stringValue(FederatedCatalogueRestClient.CLASS_NAME, nameof(datasetId), datasetId);

		const response = await this.fetch<IGetDatasetRequest, IGetDatasetResponse>(
			"/datasets/:datasetId",
			"GET",
			{
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
	 * @param dataSet The dataset to store.
	 * @returns Nothing.
	 */
	public async set(dataSet: IDcatDataset): Promise<void> {
		throw new NotSupportedError(FederatedCatalogueRestClient.CLASS_NAME, "notSupportedOnClient", {
			methodName: "set"
		});
	}

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * This method is internal and is not exposed via REST endpoints.
	 * @param dataSetId The unique identifier of the dataset to remove.
	 * @returns Nothing.
	 */
	public async remove(dataSetId: string): Promise<void> {
		throw new NotSupportedError(FederatedCatalogueRestClient.CLASS_NAME, "notSupportedOnClient", {
			methodName: "remove"
		});
	}
}
