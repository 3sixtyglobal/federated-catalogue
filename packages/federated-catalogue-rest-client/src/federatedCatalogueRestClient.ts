// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type { IBaseRestClientConfig } from "@twin.org/api-models";
import { Guards, NotSupportedError } from "@twin.org/core";
import {
	FederatedCatalogueContexts,
	type IFederatedCatalogueComponent,
	type ICatalogRequestRequest,
	type ICatalogRequestResponse,
	type IGetDatasetRequest,
	type IGetDatasetResponse
} from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import { DataspaceProtocolCatalogTypes, DataspaceProtocolContexts } from "@twin.org/standards-dataspace-protocol";
import type { IDcatCatalog, IDcatDataset } from "@twin.org/standards-w3c-dcat";

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
	 * @returns The catalog containing matching datasets.
	 */
	public async query(filter?: unknown[]): Promise<IDcatCatalog> {
		const response = await this.fetch<ICatalogRequestRequest, ICatalogRequestResponse>(
			"/request",
			"POST",
			{
				body: {
					"@context": [
						DataspaceProtocolContexts.ContextRoot,
						FederatedCatalogueContexts.ContextRoot
					],
					"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
					filter
				}
			}
		);

		return response.body;
	}

	/**
	 * Retrieve a specific dataset by its unique identifier.
	 * @param datasetId The unique identifier of the dataset.
	 * @returns The dataset if found.
	 */
	public async get(datasetId: string): Promise<IDcatDataset> {
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
