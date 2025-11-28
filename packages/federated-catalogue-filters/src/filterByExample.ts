// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, Guards, Is } from "@twin.org/core";
import { ComparisonOperator } from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { IFederatedCatalogueFilter } from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import type { IDataset } from "@twin.org/standards-w3c-dcat";
import type { IFilterByExampleConstructorOptions } from "./models/IFilterByExampleConstructorOptions.js";

/**
 * Filter plugin that matches datasets by example attributes using partial matching.
 * Supports nested properties and array matching.
 */
export class FilterByExample implements IFederatedCatalogueFilter {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<FilterByExample>();

	/**
	 * The entity storage connector for datasets.
	 * @internal
	 */
	private readonly _datasetStorage: IEntityStorageConnector<IDataset>;

	/**
	 * Create a new instance of FilterByExample.
	 * @param options The options for the filter.
	 */
	constructor(options?: IFilterByExampleConstructorOptions) {
		this._datasetStorage = EntityStorageConnectorFactory.get(
			options?.datasetStorageConnectorType ?? "dataset"
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return FilterByExample.CLASS_NAME;
	}

	/**
	 * Execute a filter-specific query over the catalogue.
	 * Uses database-level filtering with query conditions.
	 * @param filter The filter criteria (Partial<IDataset> with example values).
	 * @returns Object containing datasets matching the filter criteria and optional cursor for next page.
	 */
	public async query(filter: unknown): Promise<{ datasets: IDataset[]; cursor?: string }> {
		if (!Is.objectValue(filter)) {
			const result = await this._datasetStorage.query();
			const datasets = result.entities.map(entity => entity as unknown as IDataset);
			return { datasets };
		}

		const filterObj = filter as Partial<IDataset>;

		const conditions = this.buildQueryConditions(filterObj);
		if (conditions.length > 0) {
			const result = await this._datasetStorage.query({
				conditions
			});
			const datasets = result.entities.map(entity => entity as IDataset);
			return { datasets };
		}

		const result = await this._datasetStorage.query();
		const datasets = result.entities.map(entity => entity as IDataset);
		return { datasets };
	}

	/**
	 * Generate filter indexes for a dataset to optimize future queries.
	 * Creates indexes for common searchable properties.
	 * Indexes are stored as properties on the dataset entity itself.
	 * @param dataSet The dataset to index.
	 * @returns Record mapping property names to their values for indexing.
	 */
	public async createIndex(dataSet: IDataset): Promise<{ [key: string]: unknown }> {
		Guards.object(FilterByExample.CLASS_NAME, nameof(dataSet), dataSet);

		const indexes: { [key: string]: unknown } = {};

		if (dataSet["dcterms:title"]) {
			indexes["dcterms:title"] = dataSet["dcterms:title"];
		}

		if (dataSet["dcterms:description"]) {
			indexes["dcterms:description"] = dataSet["dcterms:description"];
		}

		if (dataSet["dcat:keyword"]) {
			indexes["dcat:keyword"] = ArrayHelper.fromObjectOrArray(dataSet["dcat:keyword"]);
		}

		if (dataSet["dcterms:publisher"]) {
			indexes["dcterms:publisher"] = dataSet["dcterms:publisher"];
		}

		return indexes;
	}

	/**
	 * Build database-level query conditions from filter criteria.
	 * Converts filter properties into entity storage query conditions.
	 * For complex objects, stringifies them for comparison.
	 * @param filter The filter criteria (Partial<IDataset> with example values).
	 * @returns Query conditions array for entity storage.
	 */
	private buildQueryConditions(
		filter: Partial<IDataset>
	): { property: string; value: unknown; comparison: ComparisonOperator }[] {
		const conditions: {
			property: string;
			value: unknown;
			comparison: ComparisonOperator;
		}[] = [];

		for (const key of Object.keys(filter)) {
			const value = filter[key];
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
