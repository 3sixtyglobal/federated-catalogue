// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	IHostingComponent,
	IHttpRequestContext,
	IRestRoute,
	ITag
} from "@twin.org/api-models";
import { Coerce, ComponentFactory, Guards, Is } from "@twin.org/core";
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
	DataspaceProtocolContexts
} from "@twin.org/standards-dataspace-protocol";
import { DcatClasses, type DcatContextType } from "@twin.org/standards-w3c-dcat";
import { PolicyType } from "@twin.org/standards-w3c-odrl";
import { HeaderHelper, HeaderTypes, HttpStatusCode } from "@twin.org/web";
import { transformErrorToStatusCode, transformToCatalogError } from "./utils/catalogErrorUtils.js";

/**
 * The source used when communicating about these routes.
 */
const ROUTES_SOURCE = "federatedCatalogueRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsFederatedCatalogue: ITag[] = [
	{
		name: "Federated Catalogue",
		description:
			"Service providing Dataspace Protocol-compliant catalogue endpoints for dataset discovery and query."
	}
];

/**
 * The REST routes for federated catalogue.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesFederatedCatalogue(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const catalogRequestRoute: IRestRoute<ICatalogRequestRequest, ICatalogRequestResponse> = {
		operationId: "catalogRequest",
		summary: "Query the federated catalogue for datasets",
		tag: tagsFederatedCatalogue[0].name,
		method: "POST",
		path: `${baseRouteName}/request`,
		handler: async (httpRequestContext, request) =>
			catalogRequest(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<ICatalogRequestRequest>(),
			examples: [
				{
					id: "catalogRequestExample",
					request: {
						body: {
							"@context": [DataspaceProtocolContexts.Context],
							"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage,
							filter: [
								{
									"dcterms:title": "Energy Consumption Data"
								}
							]
						}
					}
				},
				{
					id: "catalogRequestNoFilterExample",
					request: {
						body: {
							"@context": [DataspaceProtocolContexts.Context],
							"@type": DataspaceProtocolCatalogTypes.CatalogRequestMessage
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICatalogRequestResponse>(),
				examples: [
					{
						id: "catalogRequestResponseExample",
						response: {
							body: {
								"@context": [DataspaceProtocolContexts.Context],
								"@id":
									"urn:x-catalog:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
								"@type": "Catalog",
								participantId: "did:example:node-identity-123",
								dataset: [
									{
										"@id": "urn:uuid:dataset-123",
										"@type": "Dataset",
										"dcterms:title": "Energy Consumption Data",
										"dcterms:description": "Historical energy consumption data",
										hasPolicy: {
											"@id": "urn:uuid:policy-456",
											"@type": PolicyType.Offer,
											assigner: "did:example:data-provider-789"
										},
										distribution: {
											"@id": "urn:uuid:distribution-789",
											"@type": "Distribution",
											format: "application/json",
											accessService: {
												"@id": "urn:uuid:access-service-321",
												"@type": "DataService",
												endpointURL: "https://example.com/data-access"
											}
										}
									}
								]
							}
						}
					}
				]
			}
		]
	};

	const getDatasetRoute: IRestRoute<IGetDatasetRequest, IGetDatasetResponse> = {
		operationId: "getDataset",
		summary: "Retrieve a specific dataset by ID",
		tag: tagsFederatedCatalogue[0].name,
		method: "GET",
		path: `${baseRouteName}/datasets/:datasetId`,
		handler: async (httpRequestContext, request) =>
			getDataset(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IGetDatasetRequest>(),
			examples: [
				{
					id: "getDatasetRequestExample",
					request: {
						pathParams: {
							datasetId: "urn:uuid:dataset-123"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IGetDatasetResponse>(),
				examples: [
					{
						id: "getDatasetResponseExample",
						response: {
							body: {
								"@context": DataspaceProtocolContexts.Context as unknown as DcatContextType,
								"@id": "urn:uuid:dataset-123",
								"@type": DcatClasses.Dataset,
								"dcterms:title": "Energy Consumption Data",
								"dcterms:description": "Historical energy consumption data"
							}
						}
					}
				]
			}
		]
	};

	return [catalogRequestRoute, getDatasetRoute];
}

/**
 * Handle the catalog request operation.
 * @param httpRequestContext The request context for the operation.
 * @param componentName The name of the component to use.
 * @param request The request.
 * @returns The response.
 */
async function catalogRequest(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: ICatalogRequestRequest
): Promise<ICatalogRequestResponse> {
	try {
		Guards.object<ICatalogRequestRequest>(ROUTES_SOURCE, nameof(request), request);
		Guards.object(ROUTES_SOURCE, nameof(request.body), request.body);
		Guards.stringValue(ROUTES_SOURCE, "@type", request.body["@type"]);

		const hostingComponent = ComponentFactory.get<IHostingComponent>(
			httpRequestContext.hostingComponentType ?? "hosting"
		);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.query(
			request.body.filter,
			request.query?.cursor,
			Coerce.integer(request.query?.limit)
		);

		const headers: ICatalogRequestResponse["headers"] = {};

		if (Is.stringValue(result.cursor)) {
			headers[HeaderTypes.Link] = HeaderHelper.createLinkHeader(
				await hostingComponent.buildPublicUrl(httpRequestContext.serverRequest.url),
				{ cursor: result.cursor },
				"next"
			);
		}

		return {
			headers,
			statusCode: transformErrorToStatusCode(result.result),
			body: result.result
		};
	} catch (error) {
		const catalogError = transformToCatalogError(error);
		return {
			statusCode: transformErrorToStatusCode(catalogError) ?? HttpStatusCode.badRequest,
			body: catalogError
		};
	}
}

/**
 * Handle the get dataset operation.
 * @param httpRequestContext The request context for the operation.
 * @param componentName The name of the component to use.
 * @param request The request.
 * @returns The response.
 */
async function getDataset(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IGetDatasetRequest
): Promise<IGetDatasetResponse> {
	try {
		Guards.object<IGetDatasetRequest>(ROUTES_SOURCE, nameof(request), request);
		Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
		Guards.stringValue(
			ROUTES_SOURCE,
			nameof(request.pathParams.datasetId),
			request.pathParams.datasetId
		);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.get(request.pathParams.datasetId);

		return {
			statusCode: transformErrorToStatusCode(result),
			body: result
		};
	} catch (error) {
		const catalogError = transformToCatalogError(error);
		return {
			statusCode: transformErrorToStatusCode(catalogError) ?? HttpStatusCode.badRequest,
			body: catalogError
		};
	}
}
