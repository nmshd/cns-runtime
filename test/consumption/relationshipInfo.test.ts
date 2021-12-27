// TODO: Enable tests again once relationship info is updated with actions
/* eslint-disable jest/no-disabled-tests */
import { AttributeJSON } from "@nmshd/content";
import { ConsumptionServices, CreateRelationshipInfoRequest } from "../../src";
import { expectError, expectSuccess, RuntimeServiceProvider } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

/* Create RelationshipInfo without theme and attributes. */
async function createSimpleRelationshipInfo(relationshipId: string) {
    const parameters: CreateRelationshipInfoRequest = {
        relationshipId: relationshipId,
        attributes: [],
        isPinned: false,
        title: "My imaginary relationship's title"
    };
    return await consumptionServices.relationshipInfo.createRelationshipInfo(parameters);
}

/* Create RelationshipInfo with theme and attributes. */
const defaultParameters = {
    attributes: [
        {
            name: "attribute-name",
            content: { name: "content-attribute-name", value: "content-attribute-value" } as AttributeJSON,
            sharedItem: "CNSSITshareditem0001"
        },
        {
            name: "attribute-name2",
            content: { name: "content-attribute-name2", value: "content-attribute-value2" } as AttributeJSON,
            sharedItem: "CNSSITshareditem0002"
        }
    ],
    isPinned: false,
    title: "My imaginary relationship's title",
    description: "My imaginary relationship's description",
    userTitle: "My imaginary relationship's userTitle",
    userDescription: "My imaginary relationship's userDescription",
    theme: {
        image: "aW1hZ2VzCg==",
        imageBar: "white",
        backgroundColor: "white",
        foregroundColor: "black"
    }
};
async function createComplexRelationshipInfo(relationshipId: string) {
    const parameters: CreateRelationshipInfoRequest = {
        relationshipId: relationshipId,
        ...defaultParameters
    };
    return await consumptionServices.relationshipInfo.createRelationshipInfo(parameters);
}

describe.skip("RelationshipInfo", () => {
    const relationshipIdPrefix = "RELmyrelationship";

    /* Before each test create a unique relationshipId to not interfere with
     * previous tests. The relationshipId is 'RELmyrelationshipXXX' where XXX
     * is the test counter 0-padded to a length of 3. */
    let testIndex = 1;
    let relationshipId: string;
    beforeEach(() => {
        relationshipId = `${relationshipIdPrefix}${String(testIndex).padStart(3, "0")}`;
        testIndex++;
    });

    test("create a RelationshipInfo", async () => {
        const result = await createSimpleRelationshipInfo(relationshipId);
        expectSuccess(result);
        expect(result.value.relationshipId).toStrictEqual(relationshipId);
    });

    test("prohibit creation of multiple RelationshipInfos for a single Relationship", async () => {
        let result = await createSimpleRelationshipInfo(relationshipId);
        expectSuccess(result);
        result = await createSimpleRelationshipInfo(relationshipId);
        const code = "error.runtime.relationshipInfo.relationshipInfoExists";
        const message = `RelationshipInfo for RelationshipId ${relationshipId} already exists. Try to update the RelationshipInfo instead.`;
        expectError(result, message, code);
    });

    test("retrieve a RelationshipInfo by its RelationshipId", async () => {
        let resultCreate = await createSimpleRelationshipInfo(relationshipId);
        resultCreate = await consumptionServices.relationshipInfo.getRelationshipInfoByRelationship({
            relationshipId: relationshipId
        });
        expectSuccess(resultCreate);
        expect(resultCreate.value.relationshipId).toBe(relationshipId);
    });

    test("delete a RelationshipInfo", async () => {
        const resultCreate = await createSimpleRelationshipInfo(relationshipId);
        const id: string = resultCreate.value.id;
        const resultDelete = await consumptionServices.relationshipInfo.deleteRelationshipInfo({ id: id });
        expectSuccess(resultDelete);
        const resultGet = await consumptionServices.relationshipInfo.getRelationshipInfoByRelationship({
            relationshipId: relationshipId
        });
        const code = "error.runtime.recordNotFound";
        const message = "RelationshipInfo not found. Make sure the ID exists and the record is not expired.";
        expectError(resultGet, message, code);
    });

    test("delete a RelationshipInfo by its RelationshipId", async () => {
        await createSimpleRelationshipInfo(relationshipId);
        const resultDelete = await consumptionServices.relationshipInfo.deleteRelationshipInfoByRelationship({
            relationshipId: relationshipId
        });
        expectSuccess(resultDelete);
        const resultGet = await consumptionServices.relationshipInfo.getRelationshipInfoByRelationship({
            relationshipId: relationshipId
        });
        const code = "error.runtime.recordNotFound";
        const message = "RelationshipInfo not found. Make sure the ID exists and the record is not expired.";
        expectError(resultGet, message, code);
    });

    test("prohibit deletion of non-existing RelationshipInfo", async () => {
        const resultDelete = await consumptionServices.relationshipInfo.deleteRelationshipInfo({
            id: "CNSRIN12340xdeadbeef"
        });
        const code = "error.runtime.recordNotFound";
        const message = "RelationshipInfo not found. Make sure the ID exists and the record is not expired.";
        expectError(resultDelete, message, code);
    });

    test("prohibit deletion of non-existing RelationshipInfo by its RelationshipId", async () => {
        const resultDelete = await consumptionServices.relationshipInfo.deleteRelationshipInfoByRelationship({
            relationshipId: "REL12345670xdeadbeef"
        });
        const code = "error.runtime.recordNotFound";
        const message = "RelationshipInfo not found. Make sure the ID exists and the record is not expired.";
        expectError(resultDelete, message, code);
    });

    test("create, fetch and update a complex RelationshipInfo", async () => {
        const resultCreate = await createComplexRelationshipInfo(relationshipId);
        expectSuccess(resultCreate);

        const resultGet = await consumptionServices.relationshipInfo.getRelationshipInfoByRelationship({
            relationshipId: relationshipId
        });
        expectSuccess(resultGet);

        // Compare fields. Note that jest's partial matching does not support nested objects.
        const relationshipInfoDto = resultGet.value;
        const { attributes: _1, theme: _2, id: _3, ...simpleFields } = relationshipInfoDto;
        expect(relationshipInfoDto).toStrictEqual(expect.objectContaining(simpleFields));
        expect(relationshipInfoDto.theme).toStrictEqual(expect.objectContaining(defaultParameters.theme));
        for (let i = 0; i < defaultParameters.attributes.length; i++) {
            expect(relationshipInfoDto.attributes[i]).toStrictEqual(expect.objectContaining({ content: expect.objectContaining(defaultParameters.attributes[i].content) }));
            const { content: _, ...fields } = defaultParameters.attributes[i];
            expect(relationshipInfoDto.attributes[i]).toStrictEqual(expect.objectContaining(fields));
        }

        // Update and compare updated fields
        const updatedParameters = {
            title: "a new default title",
            attributes: [
                {
                    name: "changed-attribute-name",
                    content: {
                        name: "changed-content-attribute-name",
                        value: "changed-content-attribute-value"
                    } as AttributeJSON,
                    sharedItem: "CNSSITshareditem0003"
                }
            ],
            description: "a new description",
            isPinned: false
        };
        const resultUpdate = await consumptionServices.relationshipInfo.updateRelationshipInfo({
            id: relationshipInfoDto.id,
            ...updatedParameters
        });
        expectSuccess(resultUpdate);
        const updatedDto = resultUpdate.value;
        const { attributes: _4, theme: _5, ...newSimpleFields } = updatedDto;
        expect(updatedDto).toStrictEqual(expect.objectContaining(newSimpleFields));
        for (let i = 0; i < updatedParameters.attributes.length; i++) {
            expect(updatedDto.attributes[i]).toStrictEqual(expect.objectContaining({ content: expect.objectContaining(updatedParameters.attributes[i].content) }));
            const { content: _, ...fields } = updatedParameters.attributes[i];
            expect(updatedDto.attributes[i]).toStrictEqual(expect.objectContaining(fields));
        }
    });
});
