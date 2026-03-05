// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	BaseError,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	JsonHelper,
	NotFoundError,
	ObjectHelper,
	Url,
	Urn,
	type IValidationFailure
} from "@twin.org/core";
import { Blake2b } from "@twin.org/crypto";
import { JsonLdHelper, JsonLdProcessor } from "@twin.org/data-json-ld";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IFederatedCatalogueComponent } from "@twin.org/federated-catalogue-models";
import { FederatedCatalogueFilterFactory } from "@twin.org/federated-catalogue-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import {
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
	type DcatContextType,
	DcatDataTypes,
	type IDcatDataset
} from "@twin.org/standards-w3c-dcat";
import { OdrlContexts } from "@twin.org/standards-w3c-odrl";
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
	 * The node identity.
	 * @internal
	 */
	private _nodeId?: string;

	/**
	 * Create a new instance of FederatedCatalogueService.
	 * @param options The options for the service.
	 */
	constructor(options?: IFederatedCatalogueServiceConstructorOptions) {
		this._logging = ComponentFactory.getIfExists<ILoggingComponent>(
			options?.loggingComponentType ?? "logging"
		);

		this._datasetStorage = EntityStorageConnectorFactory.get(
			options?.datasetEntityStorageType ?? "dataset"
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
	 * Start the federated catalogue service.
	 * @returns Nothing.
	 */
	public async start(): Promise<void> {
		const contextIds = await ContextIdStore.getContextIds();
		ContextIdHelper.guard(contextIds, ContextIdKeys.Node);
		this._nodeId = contextIds[ContextIdKeys.Node];
	}

	/**
	 * Retrieve a dataset by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset.
	 * @returns The dataset if found, or a CatalogError if not found or an error occurs.
	 */
	public async get(dataSetId: string): Promise<IDcatDataset | IDataspaceProtocolCatalogError> {
		try {
			Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(dataSetId), dataSetId);

			await this._logging?.log({
				level: "info",
				source: FederatedCatalogueService.CLASS_NAME,
				ts: Date.now(),
				message: "datasetRetrieve",
				data: { dataSetId }
			});

			const datasetEntity = await this._datasetStorage.get(dataSetId);

			if (!datasetEntity) {
				throw new NotFoundError(FederatedCatalogueService.CLASS_NAME, "datasetNotFound", dataSetId);
			}

			const dataset = datasetEntityToModel(datasetEntity);

			// Normalize to DS Protocol compliant format
			// This ensures the payload matches exactly what the DS Protocol mandates
			const normalizedDataset = await DataspaceProtocolHelper.normalize(
				JsonLdHelper.toNodeObject(dataset)
			);

			const structured = JsonLdHelper.toStructuredObject<IDcatDataset>(normalizedDataset);
			return structured;
		} catch (error) {
			return transformToCatalogError(error);
		}
	}

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and should not be exposed via REST endpoints.
	 * @param dataSet The dataset to store.
	 */
	public async set(dataSet: IDcatDataset): Promise<void> {
		Guards.object(FederatedCatalogueService.CLASS_NAME, nameof(dataSet), dataSet);

		// Normalize @id from dcterms:identifier if provided
		const dataSetId = dataSet["@id"] ?? dataSet["dcterms:identifier"];
		Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(dataSetId), dataSetId);

		// Set @id if it was derived from dcterms:identifier
		if (!dataSet["@id"] && dataSet["dcterms:identifier"]) {
			dataSet["@id"] = dataSetId;
		}

		// Validate @id is a valid URI (URN or URL) per DS Protocol
		const isValidUrn = Urn.tryParseExact(dataSetId) !== undefined;
		const isValidUrl = Url.tryParseExact(dataSetId) !== undefined;
		if (!isValidUrn && !isValidUrl) {
			throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetIdInvalidUri", {
				dataSetId
			});
		}

		// Validate @type exists
		Guards.stringValue(FederatedCatalogueService.CLASS_NAME, "@type", dataSet["@type"]);

		// Validate dcterms:publisher exists (required for multi-participant catalog)
		// The publisher is used to derive participantId when returning catalog query results
		const publisher = dataSet["dcterms:publisher"];
		if (!publisher) {
			throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetMissingPublisher", {
				dataSetId
			});
		}

		// DS Protocol compliance validation
		const validationFailures: IValidationFailure[] = [];
		const isConformant = await DataspaceProtocolHelper.checkConformance(
			JsonLdHelper.toNodeObject(dataSet),
			validationFailures
		);

		if (!isConformant) {
			throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "datasetNotConformant", {
				dataSetId,
				validationFailures
			});
		}

		// Normalize dataset for storage using JSON-LD compaction
		// This ensures the dataset uses prefixed properties that entity storage expects
		// Entity storage schema uses DCAT-prefixed properties (dcat:distribution, not distribution)
		// Use a standard context with prefixes to ensure proper normalization
		const storageContext: DcatContextType = {
			dcat: DcatContexts.Namespace,
			dcterms: DublinCoreContexts.NamespaceTerms,
			odrl: OdrlContexts.Namespace
		};
		const normalizedDataset = await JsonLdProcessor.compact(dataSet, storageContext);

		const datasetEntity = datasetModelToEntity(
			normalizedDataset,
			this._nodeId ?? "",
			new Date().toISOString()
		);

		// Skip update if entity content hasn't changed to avoid unnecessary sync
		const existingEntity = await this._datasetStorage.get(dataSetId);
		if (existingEntity) {
			const existingContent = ObjectHelper.omit(existingEntity, ["nodeIdentity", "dateModified"]);
			const newContent = ObjectHelper.omit(datasetEntity, ["nodeIdentity", "dateModified"]);

			if (ObjectHelper.equal(existingContent, newContent, false)) {
				return;
			}
		}

		await this._logging?.log({
			level: "info",
			source: FederatedCatalogueService.CLASS_NAME,
			ts: Date.now(),
			message: "datasetSet",
			data: { dataSetId }
		});

		const allIndexes: { [key: string]: unknown } = {};
		const filterNames = FederatedCatalogueFilterFactory.names();
		for (const filterType of filterNames) {
			try {
				const filter = FederatedCatalogueFilterFactory.get(filterType);
				const filterIndexes = await filter.createIndex(dataSet);

				allIndexes[filterType] = filterIndexes;

				await this._logging?.log({
					level: "info",
					source: FederatedCatalogueService.CLASS_NAME,
					ts: Date.now(),
					message: "filterIndexPersisted",
					data: { dataSetId, filterType, indexCount: Object.keys(filterIndexes).length }
				});
			} catch (error) {
				await this._logging?.log({
					level: "error",
					source: FederatedCatalogueService.CLASS_NAME,
					ts: Date.now(),
					message: "filterIndexCreationFailed",
					data: { dataSetId, filterType },
					error: BaseError.fromError(error)
				});
			}
		}

		await this._datasetStorage.set(datasetEntity);
	}

	/**
	 * Execute a query against the catalogue using registered filter plugins.
	 * Returns a DS Protocol compliant Catalog object with participantId.
	 *
	 * The root catalog's participantId is the requesting participant (from context).
	 * Own datasets (matching requestingParticipantId) go directly in root dataset[].
	 * Other participants' datasets are grouped in nested catalog[] entries.
	 *
	 * For anonymous requests (no context), uses the first publisher found as fallback.
	 * Returns CatalogError 404 when no datasets exist, CatalogError 400 for invalid requests.
	 *
	 * @param filter The filter criteria containing @type, optional cursor and limit properties.
	 * @param cursor Optional cursor for pagination.
	 * @param limit Optional limit for pagination.
	 * @returns Complete IDataspaceProtocolCatalog with @context, @id, @type, participantId, dataset/catalog,
	 * or CatalogError if validation fails or an error occurs.
	 */
	public async query(
		filter?: unknown[],
		cursor?: string,
		limit?: number
	): Promise<{
		result: IDataspaceProtocolCatalog | IDataspaceProtocolCatalogError;
		cursor?: string;
	}> {
		try {
			Guards.array(FederatedCatalogueService.CLASS_NAME, nameof(filter), filter);

			let datasets: IDcatDataset[];
			let resultCursor: string | undefined;

			if (!Is.empty(filter) && !Is.array(filter)) {
				throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "filterMustBeArray");
			}

			if (!filter || filter.length === 0) {
				const result = await this._datasetStorage.query();
				datasets = result.entities.map(entity => datasetEntityToModel(entity));
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
				const result = await selectedFilter.query(filter, cursor, limit);

				datasets = result.datasets.map(d => datasetEntityToModel(d));
				resultCursor = result.cursor;
			}

			await this._logging?.log({
				level: "info",
				source: FederatedCatalogueService.CLASS_NAME,
				ts: Date.now(),
				message: "catalogQueryComplete",
				data: { resultCount: datasets.length, hasMore: Is.stringValue(resultCursor) }
			});

			// Return CatalogError 404 when no datasets exist
			if (datasets.length === 0) {
				throw new NotFoundError(FederatedCatalogueService.CLASS_NAME, "noDatasetsFound");
			}

			// Get requesting participant from context (organizationId maps to participantId)
			const contextIds = await ContextIdStore.getContextIds();
			let requestingParticipantId = contextIds?.[ContextIdKeys.Organization];

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

			if (otherParticipantIds.length === 0) {
				// Only own datasets (or all datasets belong to requesting participant)
				const catalogId = this.generateCatalogId(ownDatasets, requestingParticipantId);

				catalog = {
					"@context": [DataspaceProtocolContexts.Context],
					"@id": catalogId,
					"@type": "Catalog",
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
						"@type": "Catalog",
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
					"@type": "Catalog",
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

			return {
				result: JsonLdHelper.toStructuredObject(normalizedCatalog),
				cursor: resultCursor
			};
		} catch (error) {
			return {
				result: transformToCatalogError(error)
			};
		}
	}

	/**
	 * Remove a dataset from the catalogue by its unique identifier.
	 * Indexes are automatically removed as they are stored with the dataset.
	 * @param dataSetId The unique identifier of the dataset to remove.
	 */
	public async remove(dataSetId: string): Promise<void> {
		Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(dataSetId), dataSetId);

		await this._logging?.log({
			level: "info",
			source: FederatedCatalogueService.CLASS_NAME,
			ts: Date.now(),
			message: "datasetRemove",
			data: { dataSetId }
		});

		await this._datasetStorage.remove(dataSetId);
	}

	/**
	 * Extract publisher from dataset.
	 * Publisher can be a string or an IFoafAgent object with @id.
	 * @param dataset The dataset to extract publisher from.
	 * @returns The publisher string or undefined if not found.
	 */
	private extractPublisher(dataset: IDcatDataset): string | undefined {
		const publisher = dataset["dcterms:publisher"];

		// Handle case where publisher is an object with @id (IFoafAgent)
		if (publisher && typeof publisher === "object") {
			const publisherId = (publisher as { "@id"?: string })["@id"];
			return Is.stringValue(publisherId) ? publisherId : undefined;
		}

		return Is.stringValue(publisher) ? publisher : undefined;
	}

	/**
	 * Generate a deterministic catalog ID using canonical hash.
	 * @param datasets The datasets to include in the hash.
	 * @param participantId The participant ID to include in the hash.
	 * @returns A URN-formatted catalog ID.
	 */
	private generateCatalogId(datasets: IDcatDataset[], participantId: string): string {
		const datasetIds = datasets
			.map(d => d["@id"])
			.filter(id => Is.stringValue(id))
			.sort();

		const canonicalContent = JsonHelper.canonicalize({
			"@type": "Catalog",
			participantId,
			datasets: datasetIds
		});

		const canonicalBytes = Converter.utf8ToBytes(canonicalContent);
		const catalogHash = Converter.bytesToHex(Blake2b.sum256(canonicalBytes));
		return `urn:x-catalog:${catalogHash}`;
	}
}
