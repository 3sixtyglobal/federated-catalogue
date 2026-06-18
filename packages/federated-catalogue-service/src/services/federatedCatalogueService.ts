// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HttpUrlHelper } from "@twin.org/api-models";
import { ContextIdKeys } from "@twin.org/context";
import {
	ArrayHelper,
	BaseError,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	JsonHelper,
	Mutex,
	NotFoundError,
	ObjectHelper,
	Url,
	Urn,
	Validation
} from "@twin.org/core";
import { Blake2b } from "@twin.org/crypto";
import { JsonLdHelper, JsonLdProcessor } from "@twin.org/data-json-ld";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import {
	FederatedCatalogueFilterFactory,
	FederatedCatalogueMetricIds,
	FederatedCatalogueMetrics,
	type IFederatedCatalogueComponent
} from "@twin.org/federated-catalogue-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolCatalogTypes,
	DataspaceProtocolContexts,
	DataspaceProtocolDataTypes,
	DataspaceProtocolHelper,
	type IDataspaceProtocolCatalog,
	type IDataspaceProtocolCatalogError
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts, DublinCoreDataTypes } from "@twin.org/standards-dublin-core";
import { FoafDataTypes } from "@twin.org/standards-foaf";
import {
	DcatContexts,
	DcatDataTypes,
	type DcatContextType,
	type IDcatDataset
} from "@twin.org/standards-w3c-dcat";
import { OdrlContexts } from "@twin.org/standards-w3c-odrl";
import { MetricHelper, type ITelemetryComponent } from "@twin.org/telemetry-models";
import { TrustHelper, type ITrustComponent } from "@twin.org/trust-models";
import type { Dataset } from "../entities/dataset.js";
import type { IFederatedCatalogueServiceConstructorOptions } from "../models/IFederatedCatalogueServiceConstructorOptions.js";
import { transformToCatalogError } from "../utils/catalogErrorUtils.js";
import { datasetEntityToModel, datasetModelToEntity } from "../utils/datasetConverters.js";

/**
 * Service for managing federated catalogue operations.
 * Provides Dataspace Protocol-compliant catalog endpoints for dataset registry and query.
 */
export class FederatedCatalogueService implements IFederatedCatalogueComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<FederatedCatalogueService>();

	/**
	 * The logging component for the federated catalogue service.
	 * @internal
	 */
	private readonly _logging?: ILoggingComponent;

	/**
	 * The entity storage connector for datasets.
	 * @internal
	 */
	private readonly _datasetStorage: IEntityStorageConnector<Dataset>;

	/**
	 * The trust component for token verification and generation.
	 * @internal
	 */
	private readonly _trustComponent: ITrustComponent;

	/**
	 * The optional telemetry component for event metrics.
	 * @internal
	 */
	private readonly _telemetryComponent?: ITelemetryComponent;

	/**
	 * Create a new instance of FederatedCatalogueService.
	 * @param options The options for the service.
	 */
	constructor(options?: IFederatedCatalogueServiceConstructorOptions) {
		this._logging = ComponentFactory.getIfExists<ILoggingComponent>(options?.loggingComponentType);

		this._datasetStorage = EntityStorageConnectorFactory.get(
			options?.datasetEntityStorageType ?? "dataset"
		);

		this._trustComponent = ComponentFactory.get<ITrustComponent>(
			options?.trustComponentType ?? "trust"
		);

		this._telemetryComponent = ComponentFactory.getIfExists<ITelemetryComponent>(
			options?.telemetryComponentType
		);

		// Register JSON-LD redirects for offline processing
		DcatDataTypes.registerRedirects();
		DublinCoreDataTypes.registerRedirects();
		FoafDataTypes.registerRedirects();
		DataspaceProtocolDataTypes.registerRedirects();

		// Register DS Protocol data types for conformance checking
		DataspaceProtocolDataTypes.registerTypes();
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FederatedCatalogueService.CLASS_NAME;
	}

	/**
	 * Register all federated catalogue metrics with the telemetry component.
	 * @returns A promise that resolves when all metrics have been registered.
	 */
	public async start(): Promise<void> {
		await MetricHelper.createMetrics(this._telemetryComponent, FederatedCatalogueMetrics);
	}

	/**
	 * Retrieve a dataset by its unique identifier.
	 * @param datasetId The unique identifier of the dataset.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the dataset if found, or a CatalogError if not found or an error occurs.
	 */
	public async get(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDcatDataset | IDataspaceProtocolCatalogError> {
		try {
			Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(datasetId), datasetId);
			await TrustHelper.verifyTrust(this._trustComponent, trustPayload, "get");

			await this._logging?.log({
				level: "info",
				source: FederatedCatalogueService.CLASS_NAME,
				ts: Date.now(),
				message: "datasetRetrieve",
				data: { datasetId }
			});

			const datasetEntity = await this._datasetStorage.get(datasetId);

			if (!datasetEntity) {
				throw new NotFoundError(FederatedCatalogueService.CLASS_NAME, "datasetNotFound", datasetId);
			}

			const dataset = datasetEntityToModel(datasetEntity);

			// Normalize to DS Protocol compliant format
			// This ensures the payload matches exactly what the DS Protocol mandates
			const normalizedDataset = await DataspaceProtocolHelper.normalize(
				JsonLdHelper.toNodeObject(dataset)
			);

			const structured = JsonLdHelper.toStructuredObject<IDcatDataset>(normalizedDataset);

			await MetricHelper.metricIncrement(
				this._telemetryComponent,
				FederatedCatalogueMetricIds.DatasetsRetrieved
			);

			return structured;
		} catch (error) {
			return transformToCatalogError(error);
		}
	}

	/**
	 * Insert or update a dataset in the catalogue.
	 * @param dataset The dataset to store.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with the unique identifier of the stored dataset, or a CatalogError if an error occurs.
	 */
	public async set(
		dataset: IDcatDataset,
		trustPayload: unknown
	): Promise<string | IDataspaceProtocolCatalogError> {
		try {
			Guards.object(FederatedCatalogueService.CLASS_NAME, nameof(dataset), dataset);

			const trustInfo = await TrustHelper.verifyTrust(this._trustComponent, trustPayload, "set");

			// Normalize @id from dcterms:identifier if provided
			const datasetId = dataset["@id"] ?? dataset["dcterms:identifier"];
			Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(datasetId), datasetId);

			// Set @id if it was derived from dcterms:identifier
			if (Is.empty(dataset["@id"]) && !Is.empty(dataset["dcterms:identifier"])) {
				dataset["@id"] = datasetId;
			}

			// Validate @id is a valid URI (URN or URL) per DS Protocol
			const isValidUrn = !Is.empty(Urn.tryParseExact(datasetId));
			const isValidUrl = !Is.empty(Url.tryParseExact(datasetId));
			if (!isValidUrn && !isValidUrl) {
				throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetIdInvalidUri", {
					datasetId
				});
			}

			// Validate @type exists
			Guards.stringValue(FederatedCatalogueService.CLASS_NAME, "@type", dataset["@type"]);

			// Validate dcterms:publisher exists (required for multi-participant catalog)
			// The publisher is used to derive participantId when returning catalog query results
			const publisher = dataset["dcterms:publisher"];
			if (Is.empty(publisher)) {
				throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetMissingPublisher", {
					datasetId
				});
			}

			// DS Protocol compliance validation
			const validationFailures = await DataspaceProtocolHelper.validate(
				JsonLdHelper.toNodeObject(dataset)
			);

			Validation.asValidationError(
				FederatedCatalogueService.CLASS_NAME,
				"dataset",
				validationFailures
			);

			// Normalize dataset for storage using JSON-LD compaction
			// This ensures the dataset uses prefixed properties that entity storage expects
			// Entity storage schema uses DCAT-prefixed properties (dcat:distribution, not distribution)
			// Use a standard context with prefixes to ensure proper normalization
			const storageContext: DcatContextType = {
				dcat: DcatContexts.Namespace,
				dcterms: DublinCoreContexts.NamespaceTerms,
				odrl: OdrlContexts.Namespace
			};
			const normalizedDataset = await JsonLdProcessor.compact(dataset, storageContext);

			const datasetEntity = datasetModelToEntity(normalizedDataset, trustInfo.identity);

			// Serialise the read-check-write cycle so concurrent requests for the
			// same dataset cannot both pass the ownership check and overwrite each other.
			await Mutex.lock(datasetId);
			try {
				const existingEntity = await this._datasetStorage.get(datasetId);
				if (!Is.empty(existingEntity) && existingEntity.ownerId !== trustInfo.identity) {
					throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetOwnerMismatch", {
						datasetId
					});
				}

				// Bake the publishing organization into distribution accessService URLs
				await this.bakeOrganizationIntoDistributions(datasetEntity, trustInfo.identity);

				await this._logging?.log({
					level: "info",
					source: FederatedCatalogueService.CLASS_NAME,
					ts: Date.now(),
					message: "datasetSet",
					data: { datasetId }
				});

				const filterNames = FederatedCatalogueFilterFactory.names();
				for (const filterType of filterNames) {
					try {
						const filter = FederatedCatalogueFilterFactory.get(filterType);
						const filterIndexes = await filter.createIndex(normalizedDataset);

						await this._logging?.log({
							level: "info",
							source: FederatedCatalogueService.CLASS_NAME,
							ts: Date.now(),
							message: "filterIndexPersisted",
							data: { datasetId, filterType, indexCount: Object.keys(filterIndexes).length }
						});

						await MetricHelper.metricIncrement(
							this._telemetryComponent,
							FederatedCatalogueMetricIds.FilterIndexesCreated,
							{ filterType, indexCount: Object.keys(filterIndexes).length }
						);
					} catch (error) {
						await this._logging?.log({
							level: "error",
							source: FederatedCatalogueService.CLASS_NAME,
							ts: Date.now(),
							message: "filterIndexCreationFailed",
							data: { datasetId, filterType },
							error: BaseError.fromError(error)
						});

						await MetricHelper.metricIncrement(
							this._telemetryComponent,
							FederatedCatalogueMetricIds.FilterIndexFailures,
							{ filterType }
						);
					}
				}

				await this._datasetStorage.set(datasetEntity);

				await MetricHelper.metricIncrement(
					this._telemetryComponent,
					FederatedCatalogueMetricIds.DatasetsStored
				);

				return datasetId;
			} finally {
				Mutex.unlock(datasetId);
			}
		} catch (error) {
			return transformToCatalogError(error);
		}
	}

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * Indexes are automatically removed as they are stored with the dataset.
	 * @param datasetId The unique identifier of the dataset to remove.
	 * @param trustPayload Optional payload for trust evaluation, if applicable.
	 * @returns A promise that resolves with undefined on success, or a CatalogError if removal fails.
	 */
	public async remove(
		datasetId: string,
		trustPayload: unknown
	): Promise<IDataspaceProtocolCatalogError | undefined> {
		try {
			Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(datasetId), datasetId);

			const trustInfo = await TrustHelper.verifyTrust(this._trustComponent, trustPayload, "remove");

			await Mutex.lock(datasetId);
			try {
				const existingEntity = await this._datasetStorage.get(datasetId);
				if (!Is.empty(existingEntity) && existingEntity.ownerId !== trustInfo.identity) {
					throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetRemoveNotOwner", {
						datasetId
					});
				}

				await this._logging?.log({
					level: "info",
					source: FederatedCatalogueService.CLASS_NAME,
					ts: Date.now(),
					message: "datasetRemove",
					data: { datasetId }
				});

				await this._datasetStorage.remove(datasetId);

				await MetricHelper.metricIncrement(
					this._telemetryComponent,
					FederatedCatalogueMetricIds.DatasetsRemoved
				);
			} finally {
				Mutex.unlock(datasetId);
			}
		} catch (error) {
			return transformToCatalogError(error);
		}
	}

	/**
	 * Execute a query against the catalogue using registered filter plugins.
	 * Returns a Dataspace Protocol compliant Catalog object with participantId.
	 *
	 * The root catalog's participantId is the requesting participant (from context).
	 * Own datasets (matching requestingParticipantId) go directly in root dataset[].
	 * Other participants' datasets are grouped in nested catalog[] entries.
	 *
	 * For anonymous requests (no context), uses the first publisher found as fallback.
	 * Returns a CatalogError with status 404 when no datasets exist, or status 400 for invalid requests.
	 *
	 * @param filter The filter criteria array, where the first element contains @type.
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
		try {
			const trustInfo = await TrustHelper.verifyTrust(this._trustComponent, trustPayload, "query");

			let datasets: IDcatDataset[];
			let resultCursor: string | undefined;

			if (!Is.empty(filter) && !Is.array(filter)) {
				throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "filterMustBeArray");
			}

			if (!Is.arrayValue(filter)) {
				const result = await this._datasetStorage.query(
					undefined,
					undefined,
					undefined,
					cursor,
					limit
				);
				datasets = result.entities.map(entity => datasetEntityToModel(entity));
				resultCursor = result.cursor;
			} else if (filter.length > 1) {
				throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "multipleFiltersNotSupported");
			} else {
				const singleFilter = filter[0] as { "@type"?: string } | undefined;

				const filterType = singleFilter?.["@type"];

				await this._logging?.log({
					level: "info",
					source: FederatedCatalogueService.CLASS_NAME,
					ts: Date.now(),
					message: "catalogQuery",
					data: { filterType: filterType ?? "", cursor: cursor ?? "", limit: limit ?? "" }
				});

				Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(filterType), filterType);

				const selectedFilter = FederatedCatalogueFilterFactory.get(filterType);

				ObjectHelper.propertyDelete(filter, "@type");
				const result = await selectedFilter.query(trustInfo, filter, cursor, limit);

				datasets = result.datasets;
				resultCursor = result.cursor;
			}

			await this._logging?.log({
				level: "info",
				source: FederatedCatalogueService.CLASS_NAME,
				ts: Date.now(),
				message: "catalogQueryComplete",
				data: { resultCount: datasets.length, hasMore: Is.stringValue(resultCursor) }
			});

			await MetricHelper.metricIncrement(
				this._telemetryComponent,
				FederatedCatalogueMetricIds.QueriesExecuted,
				{ resultCount: datasets.length, hasMore: Is.stringValue(resultCursor) }
			);

			// Return CatalogError 404 when no datasets exist
			if (!Is.arrayValue(datasets)) {
				throw new NotFoundError(FederatedCatalogueService.CLASS_NAME, "noDatasetsFound");
			}

			let requestingParticipantId = trustInfo.identity;

			// Group datasets by dcterms:publisher (participantId)
			const datasetsByParticipant = new Map<string, IDcatDataset[]>();
			for (const dataset of datasets) {
				const publisher = this.extractPublisher(dataset);
				const participantId = publisher ?? "unknown";
				const existing = datasetsByParticipant.get(participantId) ?? [];
				existing.push(dataset);
				datasetsByParticipant.set(participantId, existing);
			}

			const participantIds = [...datasetsByParticipant.keys()];

			// For anonymous requests (no context), use first publisher as fallback
			if (!Is.stringValue(requestingParticipantId)) {
				requestingParticipantId = participantIds[0] ?? "unknown";
			}

			// Separate own datasets from other participants' datasets
			const ownDatasets = datasetsByParticipant.get(requestingParticipantId) ?? [];
			const otherParticipantIds = participantIds.filter(id => id !== requestingParticipantId);

			let catalog: IDataspaceProtocolCatalog;

			if (!Is.arrayValue(otherParticipantIds)) {
				// Only own datasets (or all datasets belong to requesting participant)
				const catalogId = this.generateCatalogId(ownDatasets, requestingParticipantId);

				catalog = {
					"@context": [DataspaceProtocolContexts.Context],
					"@id": catalogId,
					"@type": DataspaceProtocolCatalogTypes.Catalog,
					participantId: requestingParticipantId,
					dataset: ownDatasets as unknown as IDataspaceProtocolCatalog["dataset"]
				};
			} else {
				// Mixed: own datasets at root level, others in nested catalogs
				const nestedCatalogs: IDataspaceProtocolCatalog[] = [];

				for (const participantId of otherParticipantIds) {
					const participantDatasets = datasetsByParticipant.get(participantId) ?? [];
					const subCatalogId = this.generateCatalogId(participantDatasets, participantId);

					const subCatalog: IDataspaceProtocolCatalog = {
						"@context": [DataspaceProtocolContexts.Context],
						"@id": subCatalogId,
						"@type": DataspaceProtocolCatalogTypes.Catalog,
						participantId,
						dataset: participantDatasets as unknown as IDataspaceProtocolCatalog["dataset"]
					};

					nestedCatalogs.push(subCatalog);
				}

				// Root catalog contains own datasets and nested catalogs for others
				const rootCatalogId = this.generateCatalogId(datasets, requestingParticipantId);

				catalog = {
					"@context": [DataspaceProtocolContexts.Context],
					"@id": rootCatalogId,
					"@type": DataspaceProtocolCatalogTypes.Catalog,
					participantId: requestingParticipantId,
					dataset: ownDatasets as unknown as IDataspaceProtocolCatalog["dataset"],
					catalog: nestedCatalogs
				};
			}

			// Normalize to DS Protocol compliant format
			// This ensures the payload matches exactly what the DS Protocol mandates
			const normalizedCatalog = await DataspaceProtocolHelper.normalize(
				JsonLdHelper.toNodeObject(catalog)
			);

			const structuredResult: IDataspaceProtocolCatalog =
				JsonLdHelper.toStructuredObject(normalizedCatalog);

			return {
				result: structuredResult,
				cursor: resultCursor
			};
		} catch (error) {
			return {
				result: transformToCatalogError(error)
			};
		}
	}

	/**
	 * Extract publisher from dataset.
	 * Publisher can be a string or an IFoafAgent object with @id.
	 * @param dataset The dataset to extract publisher from.
	 * @returns The publisher string or undefined if not found.
	 * @internal
	 */
	private extractPublisher(dataset: IDcatDataset): string | undefined {
		const publisher = dataset["dcterms:publisher"];

		// Handle case where publisher is an object with @id (IFoafAgent)
		if (Is.object<{ "@id"?: string }>(publisher)) {
			const publisherId = publisher["@id"];
			return Is.stringValue(publisherId) ? publisherId : undefined;
		}

		return Is.stringValue(publisher) ? publisher : undefined;
	}

	/**
	 * Bake the publishing organization token into each distribution's accessService URL.
	 * @param entity The dataset entity to modify in place.
	 * @param organizationId The publishing organization id to bake.
	 * @returns A promise that resolves when all distribution URLs have been updated.
	 * @internal
	 */
	private async bakeOrganizationIntoDistributions(
		entity: Dataset,
		organizationId: string
	): Promise<void> {
		// Storage uses the prefixed JSON-LD key "dcat:accessService" (not the unprefixed
		// "accessService" that appears in compacted query responses).
		const distributions = ArrayHelper.fromObjectOrArray(entity["dcat:distribution"]) ?? [];
		for (const dist of distributions) {
			const accessService = dist?.["dcat:accessService"];
			if (Is.stringValue(accessService)) {
				dist["dcat:accessService"] = HttpUrlHelper.addQueryStringParam(
					accessService,
					ContextIdKeys.Organization,
					organizationId
				);
			} else if (Is.objectValue(accessService)) {
				// DCAT object form: a dcat:DataService with an endpointURL.
				const dataService = accessService as { "dcat:endpointURL"?: unknown };
				if (Is.stringValue(dataService["dcat:endpointURL"])) {
					dataService["dcat:endpointURL"] = HttpUrlHelper.addQueryStringParam(
						dataService["dcat:endpointURL"],
						ContextIdKeys.Organization,
						organizationId
					);
				}
			}
		}
	}

	/**
	 * Generate a deterministic catalog ID using canonical hash.
	 * @param datasets The datasets to include in the hash.
	 * @param participantId The participant ID to include in the hash.
	 * @returns A URN-formatted catalog ID.
	 * @internal
	 */
	private generateCatalogId(datasets: IDcatDataset[], participantId: string): string {
		const datasetIds = datasets
			.map(d => d["@id"])
			.filter(id => Is.stringValue(id))
			.sort();

		const canonicalContent = JsonHelper.canonicalize({
			"@type": DataspaceProtocolCatalogTypes.Catalog,
			participantId,
			datasets: datasetIds
		});

		const canonicalBytes = Converter.utf8ToBytes(canonicalContent);
		const catalogHash = Converter.bytesToHex(Blake2b.sum256(canonicalBytes));
		return `urn:x-catalog:${catalogHash}`;
	}
}
