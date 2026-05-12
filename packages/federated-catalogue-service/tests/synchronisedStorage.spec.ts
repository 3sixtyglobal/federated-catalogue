// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdStore } from "@twin.org/context";
import { ArrayHelper, ComponentFactory } from "@twin.org/core";
import { JsonLdDataTypes } from "@twin.org/data-json-ld";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { SynchronisedEntityStorageConnector } from "@twin.org/entity-storage-connector-synchronised";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import { LocalEventBusConnector } from "@twin.org/event-bus-connector-local";
import { EventBusConnectorFactory, type IEventBusComponent } from "@twin.org/event-bus-models";
import { EventBusService } from "@twin.org/event-bus-service";
import { FederatedCatalogueFilterFactory } from "@twin.org/federated-catalogue-models";
import { nameof } from "@twin.org/nameof";
import {
	DataspaceProtocolDataTypes,
	type IDataspaceProtocolCatalog
} from "@twin.org/standards-dataspace-protocol";
import { DublinCoreContexts } from "@twin.org/standards-dublin-core";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import { DcatClasses, DcatContexts, type IDcatDataset } from "@twin.org/standards-w3c-dcat";
import { OdrlContexts, OdrlDataTypes } from "@twin.org/standards-w3c-odrl";
import {
	SynchronisedStorageTopics,
	type ISyncItemRemove,
	type ISyncItemSet,
	type ISynchronisedEntity
} from "@twin.org/synchronised-storage-models";
import type { Dataset } from "../src/entities/dataset.js";
import { initSchema } from "../src/schema.js";
import { FederatedCatalogueService } from "../src/services/federatedCatalogueService.js";

const NODE_A_ID = "did:example:node-aaaa";
const NODE_B_ID = "did:example:node-bbbb";
const STORAGE_KEY = "dataset";

let memoryStorageA: MemoryEntityStorageConnector<Dataset>;
let memoryStorageB: MemoryEntityStorageConnector<Dataset>;
let syncConnectorA: SynchronisedEntityStorageConnector<Dataset>;
let syncConnectorB: SynchronisedEntityStorageConnector<Dataset>;
let eventBusService: IEventBusComponent;
let fcServiceA: FederatedCatalogueService;
let fcServiceB: FederatedCatalogueService;

function createTestDataset(id: string, publisher: string, title?: string): IDcatDataset {
	return {
		"@context": {
			dcat: DcatContexts.Namespace,
			dcterms: DublinCoreContexts.NamespaceTerms,
			odrl: OdrlContexts.Namespace
		},
		"@id": id,
		"@type": DcatClasses.Dataset,
		"dcterms:title": title ?? `Dataset ${id}`,
		"dcterms:publisher": publisher,
		"dcat:distribution": {
			"@type": "dcat:Distribution",
			"@id": `${id}:dist`,
			"dcterms:format": "application/json",
			"dcat:accessService": "https://example.com/services/test"
		},
		"odrl:hasPolicy": [
			{
				"@context": OdrlContexts.Context,
				"@type": "Offer",
				uid: `${id}:policy`,
				assigner: "https://example.com/participants/test-publisher",
				permission: [{ action: "use" }]
			}
		]
	} as unknown as IDcatDataset;
}

describe("Synchronised Storage Integration", () => {
	beforeAll(async () => {
		initSchema();
		DataspaceProtocolDataTypes.registerTypes();
		JsonLdDataTypes.registerTypes();
		OdrlDataTypes.registerTypes();

		await addAllContextsToDocumentCache();
	});

	beforeEach(async () => {
		// Clear all factories
		EntityStorageConnectorFactory.clear();
		EventBusConnectorFactory.clear();
		ComponentFactory.clear();
		FederatedCatalogueFilterFactory.clear();

		// Create shared event bus
		const eventBusConnector = new LocalEventBusConnector();
		EventBusConnectorFactory.register("local", () => eventBusConnector);
		eventBusService = new EventBusService({ eventBusConnectorType: "local" });
		ComponentFactory.register("event-bus", () => eventBusService);

		// Register a mock IUrlTransformerComponent that the service resolves at construct time.
		ComponentFactory.register("url-transformer", () => ({
			className: () => "MockUrlTransformerComponent",
			addEncryptedQueryParamToUrl: async (url: string, id: string, value: string) =>
				`${url}${url.includes("?") ? "&" : "?"}x-enc-${id}=${value}`
		}));

		// Create memory storage connectors for each node
		memoryStorageA = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});
		memoryStorageB = new MemoryEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>()
		});
		EntityStorageConnectorFactory.register("memory-a", () => memoryStorageA);
		EntityStorageConnectorFactory.register("memory-b", () => memoryStorageB);

		// Create sync connectors wrapping memory storage
		syncConnectorA = new SynchronisedEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>(),
			entityStorageConnectorType: "memory-a",
			eventBusComponentType: "event-bus",
			config: { storageKey: STORAGE_KEY }
		});

		syncConnectorB = new SynchronisedEntityStorageConnector<Dataset>({
			entitySchema: nameof<Dataset>(),
			entityStorageConnectorType: "memory-b",
			eventBusComponentType: "event-bus",
			config: { storageKey: STORAGE_KEY }
		});

		// Start each sync connector with its own node identity
		ContextIdStore.getContextIds = vi.fn().mockResolvedValue({ node: NODE_A_ID });
		await syncConnectorA.start();

		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({ node: NODE_B_ID });
		await syncConnectorB.start();

		// Reset mock to Node A as default context
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({ node: NODE_A_ID });

		// Register sync connectors for each FC service
		EntityStorageConnectorFactory.register("dataset-a", () => syncConnectorA);
		EntityStorageConnectorFactory.register("dataset-b", () => syncConnectorB);

		// Create FC services and start with node identities
		fcServiceA = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset-a"
		});
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({ node: NODE_A_ID });
		await fcServiceA.start();

		fcServiceB = new FederatedCatalogueService({
			datasetEntityStorageType: "dataset-b"
		});
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({ node: NODE_B_ID });
		await fcServiceB.start();

		// Reset mock to Node A as default context
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({ node: NODE_A_ID });
	});

	afterAll(() => {
		EntityStorageConnectorFactory.clear();
		EventBusConnectorFactory.clear();
		ComponentFactory.clear();
		FederatedCatalogueFilterFactory.clear();
	});

	test("Entity shape is compatible with sync connector (id, nodeIdentity, dateModified)", async () => {
		const dataset = createTestDataset("urn:test:dataset:1", "urn:pub:alice");

		// Set through FC service (goes through converter: @id -> id, adds sync fields)
		await fcServiceA.set(dataset);

		// Verify entity in storage has sync-compatible shape
		const rawEntity = await memoryStorageA.get("urn:test:dataset:1");
		expect(rawEntity).toBeDefined();
		expect(rawEntity?.id).toBe("urn:test:dataset:1");
		expect(rawEntity?.nodeIdentity).toBeDefined();
		expect(rawEntity?.dateModified).toBeDefined();

		// Verify no @id on the raw entity
		expect((rawEntity as unknown as { "@id"?: string })["@id"]).toBeUndefined();
	});

	test("Dataset inserted on Node A can be retrieved as valid IDcatDataset", async () => {
		const dataset = createTestDataset("urn:test:dataset:2", "urn:pub:alice", "Test Dataset 2");

		await fcServiceA.set(dataset);

		// Get through service (goes through converter: id -> @id, strips sync fields)
		const retrieved = await fcServiceA.get("urn:test:dataset:2");

		expect(retrieved).toBeDefined();
		expect((retrieved as IDcatDataset)["@id"]).toBe("urn:test:dataset:2");

		// Verify sync fields are NOT in API response
		const raw = retrieved as unknown as { [key: string]: unknown };
		expect(raw.id).toBeUndefined();
		expect(raw.nodeIdentity).toBeUndefined();
		expect(raw.dateModified).toBeUndefined();
	});

	test("Remote item set via event bus appears on Node B", async () => {
		const dataset = createTestDataset("urn:test:dataset:3", "urn:pub:alice", "Synced Dataset");

		// Set on Node A
		await fcServiceA.set(dataset);

		// Read the entity from Node A storage
		const entityFromA = await memoryStorageA.get("urn:test:dataset:3");
		expect(entityFromA).toBeDefined();

		// Simulate sync: publish RemoteItemSet for Node B
		await eventBusService.publish<ISyncItemSet>(SynchronisedStorageTopics.RemoteItemSet, {
			storageKey: STORAGE_KEY,
			entity: {
				...entityFromA,
				nodeIdentity: NODE_A_ID
			} as unknown as ISynchronisedEntity
		});

		// Wait for async event processing
		await new Promise(resolve => setTimeout(resolve, 200));

		// Verify Node B has the entity
		const entityFromB = await memoryStorageB.get("urn:test:dataset:3");
		expect(entityFromB).toBeDefined();
		expect(entityFromB?.id).toBe("urn:test:dataset:3");

		// Verify FC service B can retrieve it as valid IDcatDataset
		const retrieved = await fcServiceB.get("urn:test:dataset:3");
		expect((retrieved as IDcatDataset)["@id"]).toBe("urn:test:dataset:3");
	});

	test("Dataset update propagates via sync events", async () => {
		const dataset = createTestDataset("urn:test:dataset:4", "urn:pub:alice", "Original Title");

		await fcServiceA.set(dataset);

		// Simulate initial sync to Node B
		const entityFromA = await memoryStorageA.get("urn:test:dataset:4");
		await eventBusService.publish<ISyncItemSet>(SynchronisedStorageTopics.RemoteItemSet, {
			storageKey: STORAGE_KEY,
			entity: { ...entityFromA, nodeIdentity: NODE_A_ID } as unknown as ISynchronisedEntity
		});
		await new Promise(resolve => setTimeout(resolve, 200));

		// Update on Node A
		const updatedDataset = createTestDataset(
			"urn:test:dataset:4",
			"urn:pub:alice",
			"Updated Title"
		);
		await fcServiceA.set(updatedDataset);

		// Simulate sync of update to Node B
		const updatedEntityFromA = await memoryStorageA.get("urn:test:dataset:4");
		await eventBusService.publish<ISyncItemSet>(SynchronisedStorageTopics.RemoteItemSet, {
			storageKey: STORAGE_KEY,
			entity: {
				...updatedEntityFromA,
				nodeIdentity: NODE_A_ID,
				dateModified: new Date().toISOString()
			} as unknown as ISynchronisedEntity
		});
		await new Promise(resolve => setTimeout(resolve, 200));

		// Verify Node B sees the updated title
		const retrieved = await fcServiceB.get("urn:test:dataset:4");
		expect(retrieved).toBeDefined();
	});

	test("Dataset removal propagates via sync events", async () => {
		const dataset = createTestDataset("urn:test:dataset:5", "urn:pub:alice");

		await fcServiceA.set(dataset);

		// Simulate sync to Node B
		const entityFromA = await memoryStorageA.get("urn:test:dataset:5");
		await eventBusService.publish<ISyncItemSet>(SynchronisedStorageTopics.RemoteItemSet, {
			storageKey: STORAGE_KEY,
			entity: { ...entityFromA, nodeIdentity: NODE_A_ID } as unknown as ISynchronisedEntity
		});
		await new Promise(resolve => setTimeout(resolve, 200));

		// Verify Node B has the entity
		const entityFromB = await memoryStorageB.get("urn:test:dataset:5");
		expect(entityFromB).toBeDefined();

		// Remove on Node A
		await fcServiceA.remove("urn:test:dataset:5");

		// Simulate sync removal to Node B
		await eventBusService.publish<ISyncItemRemove>(SynchronisedStorageTopics.RemoteItemRemove, {
			storageKey: STORAGE_KEY,
			id: "urn:test:dataset:5",
			nodeId: NODE_A_ID
		});
		await new Promise(resolve => setTimeout(resolve, 200));

		// Verify Node B no longer has the entity
		const removedEntity = await memoryStorageB.get("urn:test:dataset:5");
		expect(removedEntity).toBeUndefined();
	});

	test("Multi-publisher catalog grouping works with synced data", async () => {
		const aliceDataset = createTestDataset("urn:test:dataset:6a", "urn:pub:alice", "Alice Dataset");
		const bobDataset = createTestDataset("urn:test:dataset:6b", "urn:pub:bob", "Bob Dataset");

		// Alice's dataset on Node A
		await fcServiceA.set(aliceDataset);

		// Bob's dataset synced to Node A via remote event
		const bobEntity = {
			id: "urn:test:dataset:6b",
			nodeIdentity: NODE_B_ID,
			dateModified: new Date().toISOString(),
			"@context": bobDataset["@context"],
			"@type": bobDataset["@type"],
			"dcterms:title": "Bob Dataset",
			"dcterms:publisher": "urn:pub:bob",
			"dcat:distribution": bobDataset["dcat:distribution"],
			"odrl:hasPolicy": bobDataset["odrl:hasPolicy"]
		};

		await eventBusService.publish<ISyncItemSet>(SynchronisedStorageTopics.RemoteItemSet, {
			storageKey: STORAGE_KEY,
			entity: bobEntity
		});
		await new Promise(resolve => setTimeout(resolve, 200));

		// Mock context as Alice for the query
		vi.mocked(ContextIdStore.getContextIds).mockResolvedValue({
			org: "urn:pub:alice"
		});

		// Query Node A (has both datasets)
		const queryResult = await fcServiceA.query([]);

		expect(queryResult.result).toBeDefined();
		const catalog = queryResult.result as IDataspaceProtocolCatalog;
		expect(catalog["@type"]).toBe("Catalog");
		expect(catalog.participantId).toBe("urn:pub:alice");

		// Root catalog has Alice's dataset
		const rootDatasets = ArrayHelper.fromObjectOrArray(catalog.dataset ?? []);
		expect(rootDatasets.length).toBe(1);

		// Nested catalog has Bob's dataset
		const nestedCatalogs = ArrayHelper.fromObjectOrArray(catalog.catalog ?? []);
		expect(nestedCatalogs.length).toBe(1);
		expect((nestedCatalogs[0] as IDataspaceProtocolCatalog).participantId).toBe("urn:pub:bob");
	});

	test("Converter ensures @id never stored, always mapped", async () => {
		const dataset = createTestDataset("urn:test:dataset:7", "urn:pub:alice");

		await fcServiceA.set(dataset);

		// Direct storage access: entity has id, NOT @id
		const rawEntity = await memoryStorageA.get("urn:test:dataset:7");
		expect(rawEntity?.id).toBe("urn:test:dataset:7");
		expect((rawEntity as unknown as { "@id"?: string })["@id"]).toBeUndefined();
		expect(rawEntity?.nodeIdentity).toBeDefined();
		expect(rawEntity?.dateModified).toBeDefined();

		// Service access: response has @id, NOT id/nodeIdentity/dateModified
		const retrieved = await fcServiceA.get("urn:test:dataset:7");
		const apiResponse = retrieved as unknown as { [key: string]: unknown };
		expect(apiResponse["@id"]).toBe("urn:test:dataset:7");
		expect(apiResponse.id).toBeUndefined();
		expect(apiResponse.nodeIdentity).toBeUndefined();
		expect(apiResponse.dateModified).toBeUndefined();
	});
});
