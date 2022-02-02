import { DateTime } from "luxon";
import { OwnerRestriction, RelationshipTemplateDTO, TransportServices } from "../../src";
import { createTemplate, exchangeTemplate, expectError, expectSuccess, QueryParamConditions, RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
}, 30000);
afterAll(() => serviceProvider.stop());

describe("Template Tests", () => {
    let template: RelationshipTemplateDTO;
    let templateWithUndefinedMaxNumberOfRelationships: RelationshipTemplateDTO;

    test("create a template", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            maxNumberOfRelationships: 1,
            expiresAt: DateTime.utc().plus({ minutes: 10 }).toString(),
            content: { a: "b" }
        });

        expectSuccess(response);

        template = response.value;
    });

    test("create a template with undefined expiresAt", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            content: { a: "A" },
            expiresAt: undefined as unknown as string
        });

        expectError(response, "expiresAt is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("create a template with undefined maxNumberOfRelationships", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            content: { a: "A" },
            expiresAt: DateTime.utc().plus({ minutes: 1 }).toString()
        });

        templateWithUndefinedMaxNumberOfRelationships = response.value;

        expectSuccess(response);
        expect(templateWithUndefinedMaxNumberOfRelationships.maxNumberOfRelationships).toBeUndefined();
    });

    test("read a template with undefined maxNumberOfRelationships", async () => {
        const response = await transportServices1.relationshipTemplates.getRelationshipTemplate({
            id: templateWithUndefinedMaxNumberOfRelationships.id
        });

        expectSuccess(response);
        expect(templateWithUndefinedMaxNumberOfRelationships.maxNumberOfRelationships).toBeUndefined();
    });

    test("see If template exists in /RelationshipTemplates/Own", async () => {
        expect(template).toBeDefined();

        const response = await transportServices1.relationshipTemplates.getRelationshipTemplates({
            ownerRestriction: OwnerRestriction.Own
        });
        expectSuccess(response);
        expect(response.value).toContainEqual(template);
    });

    test("see If template exists in /RelationshipTemplates/{id}", async () => {
        expect(template).toBeDefined();

        const response = await transportServices1.relationshipTemplates.getRelationshipTemplate({ id: template.id });
        expectSuccess(response);
    });

    test("expect a validation error for sending maxNumberOfRelationships 0", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            content: { a: "A" },
            expiresAt: DateTime.utc().plus({ minutes: 1 }).toString(),
            maxNumberOfRelationships: 0
        });

        expect(response.isError).toBeTruthy();
        expect(response.error.code).toBe("error.runtime.validation.invalidPropertyValue");
    });
});

describe("Serialization Errors", () => {
    test("create a template with wrong content : missing values", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            content: { a: "A", "@type": "Message" },
            expiresAt: DateTime.utc().plus({ minutes: 1 }).toString()
        });
        expectError(response, "Message.secretKey :: Value is not defined", "error.runtime.requestDeserialization");
    });

    test("create a template with wrong content : not existent type", async () => {
        const response = await transportServices1.relationshipTemplates.createOwnRelationshipTemplate({
            content: { a: "A", "@type": "someNoneExistingType" },
            expiresAt: DateTime.utc().plus({ minutes: 1 }).toString()
        });
        expectError(response, "Type 'someNoneExistingType' was not found within reflection classes. You might have to install a module first.", "error.runtime.unknownType");
    });
});

describe("RelationshipTemplates query", () => {
    test("query all relationshipTemplates", async () => {
        const template = await createTemplate(transportServices1);
        const conditions = new QueryParamConditions(template, transportServices1)
            .addBooleanSet("isOwn")
            .addDateSet("createdAt")
            .addDateSet("expiresAt")
            .addStringSet("createdBy")
            .addStringSet("createdByDevice")
            .addNumberSet("maxNumberOfRelationships");

        await conditions.executeTests((c, q) => c.relationshipTemplates.getRelationshipTemplates({ query: q }));
    });

    test("query own relationshipTemplates", async () => {
        const template = await createTemplate(transportServices1);
        const conditions = new QueryParamConditions(template, transportServices1)
            .addDateSet("createdAt")
            .addDateSet("expiresAt")
            .addStringSet("createdBy")
            .addStringSet("createdByDevice")
            .addNumberSet("maxNumberOfRelationships");
        await conditions.executeTests((c, q) => c.relationshipTemplates.getRelationshipTemplates({ query: q, ownerRestriction: OwnerRestriction.Own }));
    });

    test("query peerRelationshipTemplates", async () => {
        const template = await exchangeTemplate(transportServices1, transportServices2);
        const conditions = new QueryParamConditions(template, transportServices2)
            .addDateSet("createdAt")
            .addDateSet("expiresAt")
            .addStringSet("createdBy")
            .addStringSet("createdByDevice")
            .addNumberSet("maxNumberOfRelationships");

        await conditions.executeTests((c, q) => c.relationshipTemplates.getRelationshipTemplates({ query: q, ownerRestriction: OwnerRestriction.Peer }));
    });
});
