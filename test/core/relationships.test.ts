import { CoreServices } from "../../src";
import { getRelationship, getTemplateToken, QueryParamConditions, RuntimeServiceProvider, syncUntilHasRelationships } from "../lib";
import { expectSuccess } from "../lib/validation";

const coreServiceProvider = new RuntimeServiceProvider();
let coreServices1: CoreServices;
let coreServices2: CoreServices;

beforeAll(async () => {
    const runtimeServices = await coreServiceProvider.launch(2);
    coreServices1 = runtimeServices[0].core;
    coreServices2 = runtimeServices[1].core;
}, 30000);
afterAll(() => coreServiceProvider.stop());

describe("Create Relationship", () => {
    let templateId: string;
    let relationshipId: string;
    let relationshipChangeId: string;

    test("load relationship Template in connector 2", async () => {
        const token = await getTemplateToken(coreServices1);

        const response = await coreServices2.relationshipTemplates.loadPeerRelationshipTemplate({
            reference: token.truncatedReference
        });
        expectSuccess(response);
        templateId = response.value.id;
    });

    test("create relationship", async () => {
        expect(templateId).toBeDefined();

        const response = await coreServices2.relationships.createRelationship({
            templateId: templateId,
            content: { a: "b" }
        });
        expectSuccess(response);
    });

    test("sync relationships", async () => {
        expect(templateId).toBeDefined();

        const relationships = await syncUntilHasRelationships(coreServices1);
        expect(relationships).toHaveLength(1);

        relationshipId = relationships[0].id;
        relationshipChangeId = relationships[0].changes[0].id;
    });

    test("accept relationship", async () => {
        expect(relationshipId).toBeDefined();
        expect(relationshipChangeId).toBeDefined();

        const response = await coreServices1.relationships.acceptRelationshipChange({
            relationshipId: relationshipId,
            changeId: relationshipChangeId,
            content: { a: "b" }
        });
        expectSuccess(response);
    });

    test("should exist a relationship on CoreService1", async () => {
        expect(relationshipId).toBeDefined();

        const response = await coreServices1.relationships.getRelationships({});
        expectSuccess(response);
        expect(response.value).toHaveLength(1);
    });

    test("check Open Outgoing Relationships on CoreService2", async () => {
        expect(relationshipId).toBeDefined();

        const relationships = await syncUntilHasRelationships(coreServices2);
        expect(relationships).toHaveLength(1);
    });

    test("should exist a relationship on CoreService2", async () => {
        expect(relationshipId).toBeDefined();

        const response = await coreServices2.relationships.getRelationships({});
        expectSuccess(response);
        expect(response.value).toHaveLength(1);
    });

    test("should get created Relationship on CoreService1", async () => {
        expect(relationshipId).toBeDefined();

        const response = await coreServices1.relationships.getRelationship({ id: relationshipId });
        expectSuccess(response);
        expect(response.value.status).toStrictEqual("Active");
    });

    test("should get created Relationship on CoreService2", async () => {
        expect(relationshipId).toBeDefined();

        const response = await coreServices2.relationships.getRelationship({ id: relationshipId });
        expectSuccess(response);
        expect(response.value.status).toStrictEqual("Active");
    });
});

describe("Relationships query", () => {
    test("query own relationship", async () => {
        const relationship = await getRelationship(coreServices1);
        const conditions = new QueryParamConditions(relationship, coreServices1)
            // .addDateSet("lastMessageReceivedAt")
            // .addDateSet("lastMessageSentAt")
            // .addStringSet("peer")
            // .addStringSet("status")
            .addStringSet("template.id");
        await conditions.executeTests((c, q) => c.relationships.getRelationships({ query: q }));
    });
});
