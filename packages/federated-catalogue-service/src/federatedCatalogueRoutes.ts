// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HttpContextIdKeys,
	HttpHeaderHelper,
	HttpUrlHelper,
	type IHttpRequestContext,
	type IRestRoute,
	type ITag
} from "@3sixty/api-models";
import { ContextIdStore } from "@3sixty/context";
import { Coerce, ComponentFactory, Guards, Is } from "@3sixty/core";
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
} from "@3sixty/federated-catalogue-models";
import { nameof } from "@3sixty/nameof";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts
} from "@3sixty/standards-dataspace-protocol";
import { DcatClasses, type DcatContextType } from "@3sixty/standards-w3c-dcat";
import { OdrlPolicyType } from "@3sixty/standards-w3c-odrl";
import { HeaderHelper, HeaderTypes, HttpStatusCode, type IHttpHeaders } from "@3sixty/web";
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
						headers: {
							[HeaderTypes.Authorization]: "Bearer <trust-token>"
						},
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
						headers: {
							[HeaderTypes.Authorization]: "Bearer <trust-token>"
						},
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
										hasPolicy: [
											{
												"@id": "urn:uuid:policy-456",
												"@type": OdrlPolicyType.Offer,
												assigner: "did:example:data-provider-789"
											}
										],
										distribution: [
											{
												"@id": "urn:uuid:distribution-789",
												"@type": "Distribution",
												format: "application/json",
												accessService: {
													"@id": "urn:uuid:access-service-321",
													"@type": "DataService",
													endpointURL: "https://example.com/data-access"
												}
											}
										]
									}
								]
							}
						}
					}
				]
			}
		],
		skipAuth: true,
		skipTenant: true
	};

	const getDatasetRoute: IRestRoute<IDatasetGetRequest, IDatasetGetResponse> = {
		operationId: "getDataset",
		summary: "Retrieve a specific dataset by ID",
		tag: tagsFederatedCatalogue[0].name,
		method: "GET",
		path: `${baseRouteName}/datasets/:datasetId`,
		handler: async (httpRequestContext, request) =>
			getDataset(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IDatasetGetRequest>(),
			examples: [
				{
					id: "getDatasetRequestExample",
					request: {
						headers: {
							[HeaderTypes.Authorization]: "Bearer <trust-token>"
						},
						pathParams: {
							datasetId: "urn:uuid:dataset-123"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IDatasetGetResponse>(),
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
		],
		skipAuth: true,
		skipTenant: true
	};

	const setDatasetRoute: IRestRoute<IDatasetSetRequest, IDatasetSetResponse> = {
		operationId: "setDataset",
		summary: "Insert or update a dataset in the catalogue",
		tag: tagsFederatedCatalogue[0].name,
		method: "POST",
		path: `${baseRouteName}/datasets`,
		handler: async (httpRequestContext, request) =>
			setDataset(httpRequestContext, componentName, request, baseRouteName),
		requestType: {
			type: nameof<IDatasetSetRequest>(),
			examples: [
				{
					id: "setDatasetRequestExample",
					request: {
						headers: {
							[HeaderTypes.Authorization]: "Bearer <trust-token>"
						},
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
		},
		responseType: [
			{
				type: nameof<IDatasetSetResponse>(),
				examples: [
					{
						id: "setDatasetResponseExample",
						response: {
							statusCode: HttpStatusCode.noContent
						}
					}
				]
			}
		],
		skipAuth: true,
		skipTenant: true
	};

	const removeDatasetRoute: IRestRoute<IDatasetRemoveRequest, IDatasetRemoveResponse> = {
		operationId: "removeDataset",
		summary: "Remove a dataset from the catalogue by ID",
		tag: tagsFederatedCatalogue[0].name,
		method: "DELETE",
		path: `${baseRouteName}/datasets/:datasetId`,
		handler: async (httpRequestContext, request) =>
			removeDataset(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<IDatasetRemoveRequest>(),
			examples: [
				{
					id: "removeDatasetRequestExample",
					request: {
						headers: {
							[HeaderTypes.Authorization]: "Bearer <trust-token>"
						},
						pathParams: {
							datasetId: "urn:uuid:dataset-123"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<IDatasetRemoveResponse>(),
				examples: [
					{
						id: "removeDatasetResponseExample",
						response: {
							statusCode: HttpStatusCode.noContent
						}
					}
				]
			}
		],
		skipAuth: true,
		skipTenant: true
	};

	return [catalogRequestRoute, getDatasetRoute, setDatasetRoute, removeDatasetRoute];
}

/**
 * Handle the catalog request operation.
 * @param httpRequestContext The request context for the operation.
 * @param componentName The name of the component to use.
 * @param request The request.
 * @returns A promise that resolves with the catalog response, including pagination headers and status code.
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

		const trustPayload = HeaderHelper.extractBearer(request.headers?.[HeaderTypes.Authorization]);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.query(
			request.body.filter,
			request.query?.cursor,
			Coerce.integer(request.query?.limit),
			trustPayload
		);

		const headers: ICatalogRequestResponse["headers"] = {};

		const contextIds = await ContextIdStore.getContextIds();
		HttpHeaderHelper.buildCursor(
			headers,
			httpRequestContext.serverRequest.url,
			contextIds?.[HttpContextIdKeys.PublicOrigin],
			result.cursor
		);

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
 * @returns A promise that resolves with the dataset response, containing the dataset or a CatalogError.
 */
async function getDataset(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IDatasetGetRequest
): Promise<IDatasetGetResponse> {
	try {
		Guards.object<IDatasetGetRequest>(ROUTES_SOURCE, nameof(request), request);
		Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
		Guards.stringValue(
			ROUTES_SOURCE,
			nameof(request.pathParams.datasetId),
			request.pathParams.datasetId
		);

		const trustPayload = HeaderHelper.extractBearer(request.headers?.[HeaderTypes.Authorization]);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.get(request.pathParams.datasetId, trustPayload);

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

/**
 * Handle the set dataset operation.
 * @param httpRequestContext The request context for the operation.
 * @param componentName The name of the component to use.
 * @param request The request.
 * @param baseRouteName The base route name for constructing the Location header.
 * @returns A promise that resolves with the set response, including a Location header on creation or a CatalogError on failure.
 */
async function setDataset(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IDatasetSetRequest,
	baseRouteName: string
): Promise<IDatasetSetResponse> {
	try {
		Guards.object<IDatasetSetRequest>(ROUTES_SOURCE, nameof(request), request);
		Guards.object(ROUTES_SOURCE, nameof(request.body), request.body);

		const trustPayload = HeaderHelper.extractBearer(request.headers?.[HeaderTypes.Authorization]);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.set(request.body, trustPayload);

		if (Is.stringValue(result)) {
			const contextIds = await ContextIdStore.getContextIds();
			const publicOrigin = contextIds?.[HttpContextIdKeys.PublicOrigin];

			const headers: IHttpHeaders = {};
			HttpHeaderHelper.buildId(
				headers,
				result,
				HttpUrlHelper.combineOriginPath(publicOrigin, `${baseRouteName}/datasets/:id`)
			);

			return {
				statusCode: HttpStatusCode.created,
				headers
			};
		}

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

/**
 * Handle the remove dataset operation.
 * @param httpRequestContext The request context for the operation.
 * @param componentName The name of the component to use.
 * @param request The request.
 * @returns A promise that resolves with the remove response, containing no content on success or a CatalogError on failure.
 */
async function removeDataset(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: IDatasetRemoveRequest
): Promise<IDatasetRemoveResponse> {
	try {
		Guards.object<IDatasetRemoveRequest>(ROUTES_SOURCE, nameof(request), request);
		Guards.object(ROUTES_SOURCE, nameof(request.pathParams), request.pathParams);
		Guards.stringValue(
			ROUTES_SOURCE,
			nameof(request.pathParams.datasetId),
			request.pathParams.datasetId
		);

		const trustPayload = HeaderHelper.extractBearer(request.headers?.[HeaderTypes.Authorization]);

		const component: IFederatedCatalogueComponent = ComponentFactory.get(componentName);

		const result = await component.remove(request.pathParams.datasetId, trustPayload);

		return {
			statusCode: transformErrorToStatusCode(result) ?? HttpStatusCode.noContent,
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
