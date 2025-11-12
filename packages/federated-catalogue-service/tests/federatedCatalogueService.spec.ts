// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import fs from "node:fs";
import path from "node:path";
import { ComponentFactory, Urn } from "@twin.org/core";
import { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import {
	FederatedCatalogueDataTypes,
	FederatedCatalogueTypes,
	type IParticipantEntry,
	type IFederatedCatalogueComponent
} from "@twin.org/federated-catalogue-models";
import {
	IdentityResolverConnectorFactory,
	type IIdentityResolverConnector
} from "@twin.org/identity-models";
import { IdentityResolverService } from "@twin.org/identity-service";
import { ModuleHelper } from "@twin.org/modules";
import { nameof, nameofKebabCase } from "@twin.org/nameof";
import { GaiaXTypes } from "@twin.org/standards-gaia-x";
import { addAllContextsToDocumentCache } from "@twin.org/standards-ld-contexts";
import type { IDidDocument } from "@twin.org/standards-w3c-did";
import type { DataResourceEntry } from "../src/entities/dataResourceEntry.js";
import type { DataSpaceConnectorEntry } from "../src/entities/dataSpaceConnectorEntry.js";
import type { ParticipantEntry } from "../src/entities/participantEntry.js";
import type { ServiceOfferingEntry } from "../src/entities/serviceOfferingEntry.js";
import { FederatedCatalogueService } from "../src/federatedCatalogueService.js";
import type { IFederatedCatalogueServiceConstructorOptions } from "../src/models/IFederatedCatalogueServiceConstructorOptions.js";
import { initSchema } from "../src/schema.js";
import dataResourceCredential from "./dataset/credentials/compliance/data-resource-credential.json" with { type: "json" };
import dataSpaceConnectorCredential from "./dataset/credentials/compliance/data-space-connector-credential.json" with { type: "json" };
import dataResourceCredentialWithExt from "./dataset/credentials/compliance/exporter-consignments-compliant-data-resource.json" with { type: "json" };
import participantCredential from "./dataset/credentials/compliance/participant-credential.json" with { type: "json" };
import participantCredentialWithExt from "./dataset/credentials/compliance/poland-exporter-compliant-participant.json" with { type: "json" };
import serviceOfferingCedential from "./dataset/credentials/compliance/service-offering-credential.json" with { type: "json" };
import { cleanupTestEnv, setupTestEnv } from "./setupTestEnv.js";

let participantStore: MemoryEntityStorageConnector<ParticipantEntry>;
let dataResourceStore: MemoryEntityStorageConnector<DataResourceEntry>;
let serviceOfferingStore: MemoryEntityStorageConnector<ServiceOfferingEntry>;
let dataSpaceConnectorStore: MemoryEntityStorageConnector<DataSpaceConnectorEntry>;

let options: IFederatedCatalogueServiceConstructorOptions;
/**
 * Extracts the URL as string.
 * @param request The request.
 * @returns URL as string.
 */
function extractURL(request: Request | URL | string): string {
	let url: string = "";
	if (request instanceof Request) {
		url = request.url;
	} else {
		url = typeof request === "string" ? request : request.toString();
	}
	return url;
}

/**
 * Asserts a participant.
 * @param fedCatalogueService The Fed Catalogue.
 * @param subjectId Subject Id.
 * @returns the participant entry being asserted.
 */
async function assertParticipant(
	fedCatalogueService: IFederatedCatalogueComponent,
	subjectId: string
): Promise<IParticipantEntry> {
	let queryResult;
	try {
		queryResult = await fedCatalogueService.queryParticipants();

		expect(queryResult.itemListElement[0].id).toBe(subjectId);
		expect(queryResult.itemListElement[0].type).toBe(GaiaXTypes.LegalPerson);

		const participantId = queryResult.itemListElement[0].id as string;
		const participantEntry = await fedCatalogueService.getEntry(
			GaiaXTypes.LegalPerson,
			participantId
		);
		expect(participantEntry.id).toBe(participantId);
	} catch (err) {
		console.error("Error during participant query:", err);
		throw err;
	}

	return queryResult.itemListElement[0] as IParticipantEntry;
}

describe("federated-catalogue-service", () => {
	beforeAll(async () => {
		const clearingHouseApproverList = await setupTestEnv();

		// Mock the module helper to execute the method in the same thread, so we don't have to create an engine
		ModuleHelper.execModuleMethodThread = vi
			.fn()
			.mockImplementation(async (module, method, args) =>
				ModuleHelper.execModuleMethod(module, method, args)
			);

		FederatedCatalogueDataTypes.registerTypes();

		const originalFetch = globalThis.fetch;

		globalThis.fetch = vi
			.fn()
			.mockImplementation(
				async (request: Request | URL | string, opts: RequestInit | undefined) => {
					const url = new URL(extractURL(request));
					if (url.host !== "twinfoundation.github.io") {
						return originalFetch(request, opts);
					}

					const filePath = url.pathname;
					const domainName = url.host;
					const pathToFile = path.join(__dirname, "published-datasets", domainName, filePath);
					const contentBuffer = fs.readFileSync(pathToFile);
					const content = contentBuffer.toString();
					return {
						status: 200,
						ok: true,
						headers: { "Content-Type": "application/json", "Content-Length": content.length },
						json: async () => new Promise(resolve => resolve(JSON.parse(content)))
					};
				}
			);

		initSchema();

		ComponentFactory.register("identity-resolver", () => new IdentityResolverService());
		IdentityResolverConnectorFactory.register(
			"universal",
			() =>
				({
					resolveDocument: async (did: string): Promise<IDidDocument> => {
						const didUrn = Urn.fromValidString(did);
						const didId = didUrn.parts().pop() as string;

						const contentBuffer = fs.readFileSync(path.join(__dirname, "dataset", "dids", didId));
						const content = contentBuffer.toString();
						return JSON.parse(content) as IDidDocument;
					}
				}) as IIdentityResolverConnector
		);

		options = {
			// Check for support of multiple values from env vars
			config: { clearingHouseApproverList }
		};
	});

	afterAll(async () => {
		await cleanupTestEnv();
	});

	beforeEach(async () => {
		await addAllContextsToDocumentCache();

		participantStore = new MemoryEntityStorageConnector<ParticipantEntry>({
			entitySchema: nameof<ParticipantEntry>()
		});

		dataResourceStore = new MemoryEntityStorageConnector<DataResourceEntry>({
			entitySchema: nameof<DataResourceEntry>()
		});

		serviceOfferingStore = new MemoryEntityStorageConnector<ServiceOfferingEntry>({
			entitySchema: nameof<ServiceOfferingEntry>()
		});

		dataSpaceConnectorStore = new MemoryEntityStorageConnector<DataSpaceConnectorEntry>({
			entitySchema: nameof<DataSpaceConnectorEntry>()
		});

		EntityStorageConnectorFactory.register(
			nameofKebabCase<ParticipantEntry>(),
			() => participantStore
		);
		EntityStorageConnectorFactory.register(
			nameofKebabCase<DataResourceEntry>(),
			() => dataResourceStore
		);
		EntityStorageConnectorFactory.register(
			nameofKebabCase<ServiceOfferingEntry>(),
			() => serviceOfferingStore
		);
		EntityStorageConnectorFactory.register(
			nameofKebabCase<DataSpaceConnectorEntry>(),
			() => dataSpaceConnectorStore
		);
	});

	test("It should register a compliant Participant", async () => {
		let fedCatalogueService;
		try {
			fedCatalogueService = new FederatedCatalogueService(options);
			await fedCatalogueService.registerComplianceCredential(participantCredential.jwtCredential);
		} catch (err) {
			console.error("Error during participant registration:", err);
			throw err;
		}
		await assertParticipant(
			fedCatalogueService,
			participantCredential.credential.credentialSubject.id
		);
	});

	test("It should register a compliant Participant with extended properties", async () => {
		let fedCatalogueService;
		try {
			fedCatalogueService = new FederatedCatalogueService(options);
			await fedCatalogueService.registerComplianceCredential(
				participantCredentialWithExt.jwtCredential
			);
		} catch (err) {
			console.error("Error during participant registration:", err);
			throw err;
		}
		const participantEntry = await assertParticipant(
			fedCatalogueService,
			participantCredentialWithExt.credential.credentialSubject.id
		);
		expect(participantEntry.isicV4).toBe("1010");
	});

	test("It should register a compliant Data Resource", async () => {
		const fedCatalogueService = new FederatedCatalogueService(options);
		// The Participant first must exist
		await fedCatalogueService.registerComplianceCredential(participantCredential.jwtCredential);

		await fedCatalogueService.registerDataResourceCredential(dataResourceCredential.jwtCredential);
		const queryResult = await fedCatalogueService.queryDataResources();
		expect(queryResult.itemListElement.length).toBe(1);

		expect(queryResult.itemListElement[0].id).toBe(
			dataResourceCredential.credential.credentialSubject.id
		);
		expect(queryResult.itemListElement[0].type).toBe(GaiaXTypes.DataResource);

		const dataResourceId = queryResult.itemListElement[0].id as string;
		const dataResourceEntry = await fedCatalogueService.getEntry(
			GaiaXTypes.DataResource,
			dataResourceId
		);
		expect(dataResourceEntry.id).toBe(dataResourceId);
	});

	test("It should register a compliant Data Resource with extended properties", async () => {
		const fedCatalogueService = new FederatedCatalogueService(options);
		// The Participant first must exist
		await fedCatalogueService.registerComplianceCredential(
			participantCredentialWithExt.jwtCredential
		);

		await fedCatalogueService.registerDataResourceCredential(
			dataResourceCredentialWithExt.jwtCredential
		);
		const queryResult = await fedCatalogueService.queryDataResources();
		expect(queryResult.itemListElement.length).toBe(1);

		expect(queryResult.itemListElement[0].id).toBe(
			dataResourceCredentialWithExt.credential.credentialSubject.id
		);
		expect(queryResult.itemListElement[0].type).toBe(GaiaXTypes.DataResource);

		const dataResourceId = queryResult.itemListElement[0].id as string;
		const dataResourceEntry = await fedCatalogueService.getEntry(
			GaiaXTypes.DataResource,
			dataResourceId
		);
		expect(dataResourceEntry.id).toBe(dataResourceId);
	});

	test("It should register a compliant Service Offering", async () => {
		const fedCatalogueService = new FederatedCatalogueService(options);
		// The Participant first must exist
		await fedCatalogueService.registerComplianceCredential(participantCredential.jwtCredential);

		await fedCatalogueService.registerServiceOfferingCredential(
			serviceOfferingCedential.jwtCredential
		);
		const queryResult = await fedCatalogueService.queryServiceOfferings();
		expect(queryResult.itemListElement.length).toBe(1);

		expect(queryResult.itemListElement[0].id).toBe(
			serviceOfferingCedential.credential.credentialSubject.id
		);
		expect(queryResult.itemListElement[0].type).toBe(GaiaXTypes.ServiceOffering);

		const serviceOfferingId = queryResult.itemListElement[0].id as string;
		const serviceOfferingEntry = await fedCatalogueService.getEntry(
			GaiaXTypes.ServiceOffering,
			serviceOfferingId
		);
		expect(serviceOfferingEntry.id).toBe(serviceOfferingId);
	});

	test("It should register a compliant Data Space Connector", async () => {
		const fedCatalogueService = new FederatedCatalogueService(options);
		// The Participant first must exist
		await fedCatalogueService.registerComplianceCredential(participantCredential.jwtCredential);

		await fedCatalogueService.registerDataSpaceConnectorCredential(
			dataSpaceConnectorCredential.jwtCredential
		);
		const queryResult = await fedCatalogueService.queryDataSpaceConnectors();
		expect(queryResult.itemListElement.length).toBe(1);

		expect(queryResult.itemListElement[0].id).toBe(
			dataSpaceConnectorCredential.credential.credentialSubject.id
		);
		expect(queryResult.itemListElement[0].type).toStrictEqual([
			GaiaXTypes.DataExchangeComponent,
			FederatedCatalogueTypes.DataSpaceConnector
		]);

		const dataSpaceConnectorId = queryResult.itemListElement[0].id as string;
		const dataSpaceConnectorEntry = await fedCatalogueService.getEntry(
			GaiaXTypes.DataExchangeComponent,
			dataSpaceConnectorId
		);
		expect(dataSpaceConnectorEntry.id).toBe(dataSpaceConnectorId);
	});
});
