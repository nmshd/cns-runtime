import { ConsumptionServices, TransportServices } from "../../src";
import { createTemplate, getRelationship, QueryParamConditions, RuntimeServiceProvider, syncUntilHasRelationships } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let consumptionServices1: ConsumptionServices;
let transportServices2: TransportServices;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    consumptionServices1 = runtimeServices[0].consumption;
    transportServices2 = runtimeServices[1].transport;
}, 30000);
afterAll(() => serviceProvider.stop());

describe("Create Relationship", () => {
    let templateId: string;
    let relationshipId: string;
    let relationshipChangeId: string;

    test("load relationship Template in connector 2", async () => {
        const template = await createTemplate(transportServices1);

        const response = await transportServices2.relationshipTemplates.loadPeerRelationshipTemplate({ reference: template.truncatedReference });
        expect(response).toBeSuccessful();
        templateId = response.value.id;
    });

    test("create relationship", async () => {
        expect(templateId).toBeDefined();

        const response = await transportServices2.relationships.createRelationship({
            templateId: templateId,
            content: { a: "b" }
        });
        expect(response).toBeSuccessful();
    });

    test("sync relationships", async () => {
        expect(templateId).toBeDefined();

        const relationships = await syncUntilHasRelationships(transportServices1);
        expect(relationships).toHaveLength(1);

        relationshipId = relationships[0].id;
        relationshipChangeId = relationships[0].changes[0].id;
    });

    test("accept relationship", async () => {
        expect(relationshipId).toBeDefined();
        expect(relationshipChangeId).toBeDefined();

        const response = await transportServices1.relationships.acceptRelationshipChange({
            relationshipId: relationshipId,
            changeId: relationshipChangeId,
            content: { a: "b" }
        });
        expect(response).toBeSuccessful();
    });

    test("should exist a relationship on TransportService1", async () => {
        expect(relationshipId).toBeDefined();

        const response = await transportServices1.relationships.getRelationships({});
        expect(response).toBeSuccessful();
        expect(response.value).toHaveLength(1);
    });

    test("check Open Outgoing Relationships on TransportService2", async () => {
        expect(relationshipId).toBeDefined();

        const relationships = await syncUntilHasRelationships(transportServices2);
        expect(relationships).toHaveLength(1);
    });

    test("should exist a relationship on TransportService2", async () => {
        expect(relationshipId).toBeDefined();

        const response = await transportServices2.relationships.getRelationships({});
        expect(response).toBeSuccessful();
        expect(response.value).toHaveLength(1);
    });

    test("should get created Relationship on TransportService1", async () => {
        expect(relationshipId).toBeDefined();

        const response = await transportServices1.relationships.getRelationship({ id: relationshipId });
        expect(response).toBeSuccessful();
        expect(response.value.status).toBe("Active");
    });

    test("should get created Relationship on TransportService2", async () => {
        expect(relationshipId).toBeDefined();

        const response = await transportServices2.relationships.getRelationship({ id: relationshipId });
        expect(response).toBeSuccessful();
        expect(response.value.status).toBe("Active");
    });
});

describe("Relationships query", () => {
    test("query own relationship", async () => {
        const relationship = await getRelationship(transportServices1);
        const conditions = new QueryParamConditions(relationship, transportServices1)
            // .addStringSet("peer")
            // .addStringSet("status")
            .addStringSet("template.id");
        await conditions.executeTests((c, q) => c.relationships.getRelationships({ query: q }));
    });
});

describe("Attributes for the relationship", () => {
    let relationshipId: string;

    beforeAll(async () => {
        const relationship = await getRelationship(transportServices1);
        relationshipId = relationship.id;

        const attribute = (
            await consumptionServices1.attributes.createAttribute({
                content: {
                    "@type": "IdentityAttribute",
                    value: {
                        "@type": "Surname",
                        value: "ASurname"
                    },
                    owner: "address"
                }
            })
        ).value;

        const fakeRequestReference = "REQ00000000000000000";
        await consumptionServices1.attributes.createSharedAttributeCopy({
            attributeId: attribute.id,
            peer: relationship.peer,
            requestReference: fakeRequestReference
        });

        await consumptionServices1.attributes.createAttribute({
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Surname",
                    value: "APeerSurname"
                },
                owner: relationship.peer
            }
        });
    });

    test("get attributes", async () => {
        const response = await transportServices1.relationships.getAttributesForRelationship({ id: relationshipId });
        expect(response).toBeSuccessful();
        expect(response.value).toHaveLength(2);
    });
});
