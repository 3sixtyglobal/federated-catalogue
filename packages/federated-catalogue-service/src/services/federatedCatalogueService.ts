// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	BaseError,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	ObjectHelper
} from "@twin.org/core";
import { Blake2b } from "@twin.org/crypto";
import { type IJsonLdContextDefinitionRoot, JsonLdProcessor } from "@twin.org/data-json-ld";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type {
	IBaseFilter,
	IFederatedCatalogueComponent
} from "@twin.org/federated-catalogue-models";
import {
	FederatedCatalogueContexts,
	FederatedCatalogueFilterFactory
} from "@twin.org/federated-catalogue-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolContexts,
	DataspaceProtocolDataTypes
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts, DublinCoreDataTypes } from "@twin.org/standards-dublin-core";
import { FoafDataTypes } from "@twin.org/standards-foaf";
import {
	DcatClasses,
	DcatContexts,
	type DcatContextType,
	DcatDataTypes,
	type ICatalog,
	type IDataset
} from "@twin.org/standards-w3c-dcat";
import type { Dataset } from "../entities/dataset.js";
import type { IFederatedCatalogueServiceConstructorOptions } from "../models/IFederatedCatalogueServiceConstructorOptions.js";
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
	 * Create a new instance of FederatedCatalogueService.
	 * @param options The options for the service.
	 */
	constructor(options?: IFederatedCatalogueServiceConstructorOptions) {
		this._logging = ComponentFactory.getIfExists<ILoggingComponent>(
			options?.loggingComponentType ?? "logging"
		);

		this._datasetStorage = EntityStorageConnectorFactory.get(
			options?.datasetStorageConnectorType ?? "dataset"
		);

		// Register JSON-LD redirects for offline processing
		DcatDataTypes.registerRedirects();
		DublinCoreDataTypes.registerRedirects();
		FoafDataTypes.registerRedirects();
		DataspaceProtocolDataTypes.registerRedirects();
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FederatedCatalogueService.CLASS_NAME;
	}

	/**
	 * Retrieve a dataset by its unique identifier.
	 * @param dataSetId The unique identifier of the dataset.
	 * @returns The dataset if found.
	 * @throws NotFoundError if the dataset does not exist.
	 */
	public async get(dataSetId: string): Promise<IDataset> {
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

		return datasetEntityToModel(datasetEntity);
	}

	/**
	 * Insert or update a dataset in the catalogue.
	 * This method is internal and should not be exposed via REST endpoints.
	 * @param dataSet The dataset to store.
	 */
	public async set(dataSet: IDataset): Promise<void> {
		Guards.object(FederatedCatalogueService.CLASS_NAME, nameof(dataSet), dataSet);

		const dataSetId = dataSet["@id"] ?? dataSet["dcterms:identifier"];
		Guards.stringValue(FederatedCatalogueService.CLASS_NAME, nameof(dataSetId), dataSetId);

		await this._logging?.log({
			level: "info",
			source: FederatedCatalogueService.CLASS_NAME,
			ts: Date.now(),
			message: "datasetSet",
			data: { dataSetId }
		});

		const datasetEntity = datasetModelToEntity(dataSet);

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
	 * Returns a complete DCAT Catalog object with proper JSON-LD context, metadata, and datasets.
	 * The filter payload is evaluated by the appropriate filter plugin based on its structure.
	 * Pagination properties (cursor, limit) and filter type (@type) are extracted from the filter object.
	 * @param filter The filter criteria containing @type, optional cursor and limit properties.
	 * @returns Complete ICatalog object with @context, @id, @type, dcat:dataset, and optional cursor.
	 * @throws NotFoundError if @type is missing or if the filter type is not registered.
	 */
	public async query(filter?: IBaseFilter[]): Promise<ICatalog> {
		let datasets: IDataset[];
		let resultCursor: string | undefined;

		const isArray = Is.array(filter);
		if (!filter || (isArray && filter.length === 0)) {
			const result = await this._datasetStorage.query();
			datasets = result.entities.map(entity => datasetEntityToModel(entity));
		} else if (isArray && filter.length > 1) {
			throw new GeneralError(FederatedCatalogueService.CLASS_NAME, "multipleFiltersNotSupported");
		} else {
			const singleFilter = filter[0];

			const cursor = singleFilter?.cursor;
			const limit = singleFilter?.limit;
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

			ObjectHelper.propertyDelete(filter, "cursor");
			ObjectHelper.propertyDelete(filter, "limit");
			ObjectHelper.propertyDelete(filter, "@type");
			const result = await selectedFilter.query(filter);

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

		// Generate deterministic catalog ID using canonical hash of dataset IDs
		// Sort dataset IDs to ensure consistent ordering
		const datasetIds = datasets
			.map(d => d["@id"])
			.filter(id => Is.stringValue(id))
			.sort();

		// Create deterministic representation for hashing
		const canonicalContent = JSON.stringify({
			"@type": DcatClasses.Catalog,
			datasets: datasetIds
		});

		const canonicalBytes = Converter.utf8ToBytes(canonicalContent);
		const catalogHash = Converter.bytesToHex(Blake2b.sum256(canonicalBytes));
		const catalogId = `urn:x-catalog:${catalogHash}`;

		// Return complete catalog with deterministic ID
		const catalog: ICatalog = {
			"@context": [
				DataspaceProtocolContexts.ContextRoot,
				{
					dcat: DcatContexts.ContextRoot,
					dcterms: DublinCoreContexts.ContextTerms,
					cursor: `${FederatedCatalogueContexts.ContextRoot}cursor`
				}
			] as IJsonLdContextDefinitionRoot as DcatContextType,
			"@id": catalogId,
			"@type": DcatClasses.Catalog,
			"dcat:dataset": datasets
		};

		if (resultCursor) {
			catalog.cursor = resultCursor;
		}

		// Apply JSON-LD compaction to ensure proper context handling
		const compactedCatalog = await JsonLdProcessor.compact(catalog, catalog["@context"]);

		return compactedCatalog;
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
}
