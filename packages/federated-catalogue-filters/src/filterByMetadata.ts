// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, Guards, Is, ObjectHelper } from "@twin.org/core";
import { ComparisonOperator } from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IFederatedCatalogueFilter } from "@twin.org/federated-catalogue-models";
import { type Dataset, datasetEntityToModel } from "@twin.org/federated-catalogue-service";
import { nameof } from "@twin.org/nameof";
import type { IDcatDataset } from "@twin.org/standards-w3c-dcat";
import type { ITrustVerificationInfo } from "@twin.org/trust-models";
import type { IFilterByMetadataConstructorOptions } from "./models/IFilterByMetadataConstructorOptions.js";

/**
 * Filter plugin that matches datasets by metadata attributes using partial matching.
 * Supports nested properties and array matching.
 */
export class FilterByMetadata implements IFederatedCatalogueFilter {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<FilterByMetadata>();

	/**
	 * The entity storage connector for datasets.
	 * @internal
	 */
	private readonly _datasetStorage: IEntityStorageConnector<Dataset>;

	/**
	 * Create a new instance of FilterByMetadata.
	 * @param options The options for the filter.
	 */
	constructor(options?: IFilterByMetadataConstructorOptions) {
		this._datasetStorage = EntityStorageConnectorFactory.get(
			options?.datasetStorageConnectorType ?? "dataset"
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FilterByMetadata.CLASS_NAME;
	}

	/**
	 * Execute a filter-specific query over the catalogue.
	 * Uses database-level filtering with query conditions.
	 * @param trustInfo The trust verification information for the current request.
	 * @param filter The filter criteria (Partial IDataset with example values).
	 * @param cursor The pagination cursor from the previous query, if any.
	 * @param limit The maximum number of results to return.
	 * @returns Object containing datasets matching the filter criteria and optional cursor for next page.
	 */
	public async query(
		trustInfo: ITrustVerificationInfo,
		filter: unknown,
		cursor?: string,
		limit?: number
	): Promise<{ datasets: IDcatDataset[]; cursor?: string }> {
		if (!Is.objectValue(filter)) {
			const result = await this._datasetStorage.query(
				undefined,
				undefined,
				undefined,
				cursor,
				limit
			);
			const datasets = result.entities.map(entity => datasetEntityToModel(entity));
			return { datasets, cursor: result.cursor };
		}

		const conditions = this.buildQueryConditions(filter);
		const results = await this._datasetStorage.query(
			conditions.length > 0
				? {
						conditions
					}
				: undefined,
			undefined,
			undefined,
			cursor,
			limit
		);

		return {
			datasets: results.entities.map(entity => datasetEntityToModel(entity)),
			cursor: results.cursor
		};
	}

	/**
	 * Generate filter indexes for a dataset to optimize future queries.
	 * Creates indexes for common searchable properties.
	 * Indexes are stored as properties on the dataset entity itself.
	 * @param dataset The dataset to index.
	 * @returns Record mapping property names to their values for indexing.
	 */
	public async createIndex(dataset: IDcatDataset): Promise<{ [key: string]: unknown }> {
		Guards.object(FilterByMetadata.CLASS_NAME, nameof(dataset), dataset);

		const indexes: { [key: string]: unknown } = {};

		if (dataset["dcterms:title"]) {
			indexes["dcterms:title"] = dataset["dcterms:title"];
		}

		if (dataset["dcterms:description"]) {
			indexes["dcterms:description"] = dataset["dcterms:description"];
		}

		if (dataset["dcat:keyword"]) {
			indexes["dcat:keyword"] = ArrayHelper.fromObjectOrArray(dataset["dcat:keyword"]);
		}

		if (dataset["dcterms:publisher"]) {
			indexes["dcterms:publisher"] = dataset["dcterms:publisher"];
		}

		return indexes;
	}

	/**
	 * Build database-level query conditions from filter criteria.
	 * Converts filter properties into entity storage query conditions.
	 * For complex objects, stringifies them for comparison.
	 * @param filter The filter criteria (Partial<IDataset> with example values).
	 * @returns Query conditions array for entity storage.
	 * @internal
	 */
	private buildQueryConditions(
		filter: Partial<IDcatDataset> & { ownerId?: string }
	): { property: string; value: unknown; comparison: ComparisonOperator }[] {
		const conditions: {
			property: string;
			value: unknown;
			comparison: ComparisonOperator;
		}[] = [];

		if (Is.stringValue(filter.ownerId)) {
			conditions.push({
				property: "ownerId",
				value: filter.ownerId,
				comparison: ComparisonOperator.Equals
			});
		}

		for (const key of Object.keys(filter)) {
			const value = ObjectHelper.propertyGet(filter, key);
			if (value !== undefined) {
				if (Is.array(value)) {
					const processedArray = value.map(item => {
						const processedItem =
							Is.object(item) && !Is.stringValue(item) ? JSON.stringify(item) : item;
						return processedItem;
					});
					conditions.push({
						property: key,
						value: processedArray,
						comparison: ComparisonOperator.In
					});
				} else if (Is.object(value) && !Is.stringValue(value)) {
					// For complex objects, stringify for comparison
					conditions.push({
						property: key,
						value: JSON.stringify(value),
						comparison: ComparisonOperator.Equals
					});
				} else {
					conditions.push({
						property: key,
						value,
						comparison: ComparisonOperator.Equals
					});
				}
			}
		}

		return conditions;
	}
}
