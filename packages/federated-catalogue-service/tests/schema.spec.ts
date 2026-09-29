// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@twin.org/core";
import { EntitySchemaFactory, EntitySchemaHelper } from "@twin.org/entity";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	SchemaVersionService,
	type SchemaVersion,
	initSchema as initSchemaVersionSchema
} from "@twin.org/entity-storage-service";
import { nameof } from "@twin.org/nameof";
import type { Dataset } from "../src/entities/dataset.js";
import type { DatasetV0 } from "../src/entities/datasetV0.js";
import { initSchema } from "../src/schema.js";

describe("initSchema", () => {
	beforeAll(() => {
		initSchema();
		initSchemaVersionSchema();
	});

	test("Registers the current and previous dataset versions under their conventional names", () => {
		const current = EntitySchemaFactory.get(nameof<Dataset>());
		const previous = EntitySchemaFactory.get(nameof<DatasetV0>());

		expect(current.type).toEqual("Dataset");
		expect(previous.type).toEqual("DatasetV0");
		expect(EntitySchemaHelper.getVersion(current)).toEqual(1);
		expect(EntitySchemaHelper.getVersion(previous)).toEqual(0);
	});

	/**
	 * Seed a dataset store with version 0 rows and run the schema migration over it.
	 * @param key Unique storage key so each case gets its own buffers.
	 * @param storedVersion The version already recorded for Dataset, or undefined when the node
	 * has never tracked schema versions.
	 * @returns The dataset and version stores after the migration has run.
	 */
	async function runMigration(
		key: string,
		storedVersion: number | undefined
	): Promise<{
		datasetStorage: MemoryEntityStorageConnector<Dataset>;
		versionStorage: MemoryEntityStorageConnector<SchemaVersion>;
	}> {
		const datasetStorage = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>(),
			config: { storageKey: `dataset-${key}` }
		});
		const versionStorage = new MemoryEntityStorageConnector<SchemaVersion>({
			entitySchema: nameof<SchemaVersion>(),
			config: { storageKey: `schema-version-${key}` }
		});

		EntityStorageConnectorFactory.register(`dataset-${key}`, () => datasetStorage);
		EntityStorageConnectorFactory.register(`schema-version-${key}`, () => versionStorage);

		for (let i = 0; i < 5; i++) {
			await datasetStorage.set({
				id: `urn:dataset:${i}`,
				ownerId: "did:iota:testnet:0xowner",
				"@context": { dcat: "http://www.w3.org/ns/dcat#" },
				"@type": "dcat:Dataset",
				"dcterms:title": { "@value": `Dataset ${i}` }
			} as unknown as Dataset);
		}

		if (!Is.undefined(storedVersion)) {
			await versionStorage.set({
				schemaName: nameof<Dataset>(),
				version: storedVersion,
				updatedAt: new Date().toISOString()
			});
		}

		const service = new SchemaVersionService({
			schemaVersionStorageType: `schema-version-${key}`
		});
		await service.start();

		return { datasetStorage, versionStorage };
	}

	/**
	 * Assert a migrated dataset store still holds every seeded row intact.
	 * @param datasetStorage The store to check.
	 */
	async function expectRowsPreserved(
		datasetStorage: MemoryEntityStorageConnector<Dataset>
	): Promise<void> {
		const migrated = await datasetStorage.query();

		expect(migrated.entities).toHaveLength(5);
		expect(migrated.entities.map(e => e.id).sort()).toEqual([
			"urn:dataset:0",
			"urn:dataset:1",
			"urn:dataset:2",
			"urn:dataset:3",
			"urn:dataset:4"
		]);
		expect(migrated.entities[0]["dcterms:title"]).toEqual({ "@value": "Dataset 0" });
	}

	test("Migrates datasets from a recorded version 0 to version 1 preserving existing rows", async () => {
		const { datasetStorage, versionStorage } = await runMigration("recorded", 0);

		expect((await versionStorage.get(nameof<Dataset>()))?.version).toEqual(1);
		await expectRowsPreserved(datasetStorage);
	});

	test("Migrates datasets to version 1 when no version has ever been recorded", async () => {
		const { datasetStorage, versionStorage } = await runMigration("unrecorded", undefined);

		expect((await versionStorage.get(nameof<Dataset>()))?.version).toEqual(1);
		await expectRowsPreserved(datasetStorage);
	});
});
