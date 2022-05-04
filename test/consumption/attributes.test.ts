import { DateTime } from "luxon";
import { ConsumptionServices } from "../../src";
import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("Attributes", () => {
    const attributeWithoutDateName = "attributeWithoutDate-Name";
    const attributeWithoutDate = {
        attribute: {
            name: attributeWithoutDateName,
            value: "attributeWithoutDate-Value"
        }
    };
    let attributeWithoutDateId: string;

    const attributeWithDateName = "attributeWithDate-Name";
    const attributeWithDate = {
        attribute: {
            name: attributeWithDateName,
            value: "attributeWithDate-Value",
            validFrom: { date: DateTime.utc().minus({ years: 1 }).toString() },
            validTo: { date: DateTime.utc().plus({ years: 1 }).toString() }
        }
    };
    let attributeWithDateId: string;
    let attributeWithoutDateCreatedAt: string;

    test("should create an attribute without date information", async () => {
        const timestamp = DateTime.utc().toString();
        const response = await consumptionServices.attributes.createAttribute(attributeWithoutDate);
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(attribute.content).toMatchObject(attributeWithoutDate.attribute);
        attributeWithoutDateId = attribute.id;
        attributeWithoutDateCreatedAt = attribute.createdAt;
    });

    test("should create an attribute with date information", async () => {
        const timestamp = DateTime.utc().toString();

        const response = await consumptionServices.attributes.createAttribute(attributeWithDate);
        expect(response).toBeSuccessful();
        const attribute = response.value;
        const attributeContent = attribute.content;
        expect(attribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(attributeContent).toBeDefined();
        expect(attributeContent).toStrictEqual(
            expect.objectContaining({
                name: attributeWithDate.attribute.name,
                value: attributeWithDate.attribute.value
            })
        );
        expect(attributeContent.validFrom).toStrictEqual(attributeWithDate.attribute.validFrom.date);
        expect(attributeContent.validTo).toStrictEqual(attributeWithDate.attribute.validTo.date);
        attributeWithDateId = attribute.id;
    });

    test("should throw an error for create with an empty name", async () => {
        const attributeWithEmptyValues = {
            attribute: {
                name: "",
                value: "new-Value"
            }
        };
        const response = await consumptionServices.attributes.createAttribute(attributeWithEmptyValues);
        expect(response).toBeAnError("attribute.name is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should get an attribute by id", async () => {
        const response = await consumptionServices.attributes.getAttribute({ id: attributeWithoutDateId });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.id).toStrictEqual(attributeWithoutDateId);
        expect(attribute.content).toBeDefined();
        expect(attribute.content).toStrictEqual(
            expect.objectContaining({
                name: attributeWithoutDate.attribute.name,
                value: attributeWithoutDate.attribute.value
            })
        );
    });

    test("should throw an error for get with an empty id", async () => {
        const response = await consumptionServices.attributes.getAttribute({ id: "" });
        expect(response).toBeAnError("id is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should throw an error for get with an invalid id", async () => {
        const response = await consumptionServices.attributes.getAttribute({ id: "ThisIsAnInvalidId" });
        expect(response).toBeAnError("id is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should get an attribute without date information by name", async () => {
        const response = await consumptionServices.attributes.getAttributeByName({ name: attributeWithoutDateName });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.id).toStrictEqual(attributeWithoutDateId);
        expect(attribute.content).toBeDefined();
        expect(attribute.content).toStrictEqual(
            expect.objectContaining({
                name: attributeWithoutDate.attribute.name,
                value: attributeWithoutDate.attribute.value
            })
        );
    });

    test("should get attribute with date information by name", async () => {
        const response = await consumptionServices.attributes.getAttributeByName({ name: attributeWithDateName });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.id).toStrictEqual(attributeWithDateId);
        expect(attribute.content).toBeDefined();
        expect(attribute.content).toStrictEqual(
            expect.objectContaining({
                name: attributeWithDate.attribute.name,
                value: attributeWithDate.attribute.value
            })
        );
    });

    test("should throw an error for get with empty name", async () => {
        const response = await consumptionServices.attributes.getAttributeByName({ name: "" });
        expect(response).toBeAnError("name is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should throw an error for get with non-existent name", async () => {
        const response = await consumptionServices.attributes.getAttributeByName({
            name: "ThisIsANon-ExistentAttributeName"
        });
        expect(response).toBeAnError("Attribute not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("should get all attributes", async () => {
        const response = await consumptionServices.attributes.getAttributes({});
        expect(response).toBeSuccessful();
        expect(response.value).toHaveLength(2);
    });

    test("should update an attribute", async () => {
        const response = await consumptionServices.attributes.updateAttribute({
            id: attributeWithoutDateId,
            attribute: { name: attributeWithoutDateName, value: "new-Value" }
        });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.content).toBeDefined();
        expect(attribute.content.value).toBe("new-Value");
        expect(attribute.createdAt).toStrictEqual(attributeWithoutDateCreatedAt);
    });

    test("should throw an error for update with empty name", async () => {
        const response = await consumptionServices.attributes.updateAttribute({
            id: attributeWithoutDateId,
            attribute: { name: "", value: "new-Value" }
        });
        expect(response).toBeAnError("attribute.name is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should succeed attribute without validFrom parameter", async () => {
        const getAttributeResponse = await consumptionServices.attributes.getAttributeByName({
            name: attributeWithDate.attribute.name
        });
        const attributeToSucceed = getAttributeResponse.value.content;

        const successorValue1 = "successor_value_1";
        const timestamp = DateTime.utc().toString();
        const response = await consumptionServices.attributes.succeedAttribute({
            attribute: { name: attributeToSucceed.name, value: successorValue1 }
        });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(attribute.content.validFrom!.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(attribute.content).toStrictEqual(expect.objectContaining({ name: attributeWithDateName, value: successorValue1 }));
    });

    test("should succeed attribute with validFrom parameter", async () => {
        const getAttributeResponse = await consumptionServices.attributes.getAttributeByName({
            name: attributeWithDate.attribute.name
        });
        const attributeToSucceed = getAttributeResponse.value.content;

        const successorValue2 = "successor_value_2";
        const validFrom = DateTime.utc().plus({ years: 1 }).toString();
        const timestamp = DateTime.utc().toString();
        const response = await consumptionServices.attributes.succeedAttribute({
            attribute: { name: attributeToSucceed.name, value: successorValue2 },
            validFrom: validFrom
        });
        expect(response).toBeSuccessful();
        const attribute = response.value;
        expect(attribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(attribute.content).toStrictEqual(expect.objectContaining({ name: attributeWithDateName, value: successorValue2, validFrom: validFrom }));

        const getCurrentAttributeResponse = await consumptionServices.attributes.getAttributeByName({
            name: attributeToSucceed.name
        });
        expect(getCurrentAttributeResponse).toBeSuccessful();
        expect(getCurrentAttributeResponse.value.content).toStrictEqual(
            expect.objectContaining({
                name: attributeToSucceed.name,
                value: attributeToSucceed.value,
                validTo: validFrom
            })
        );
    });

    test("should throw an error for succeed attribute with empty name", async () => {
        const getAttributeResponse = await consumptionServices.attributes.getAttributeByName({
            name: attributeWithDate.attribute.name
        });
        const attributeToSucceed = getAttributeResponse.value.content;
        attributeToSucceed.name = "";

        const successorValue3 = "successor_value_3";
        const validFrom = DateTime.utc().plus({ years: 2 }).toString();
        const response = await consumptionServices.attributes.succeedAttribute({
            attribute: { name: attributeToSucceed.name, value: successorValue3 },
            validFrom: validFrom
        });

        expect(response).toBeAnError("attribute.name is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should get history", async () => {
        const response = await consumptionServices.attributes.getHistoryByName({ name: attributeWithDateName });
        expect(response).toBeSuccessful();
        let validTo = "";
        for (const attribute of response.value) {
            expect(attribute.content).toStrictEqual(expect.objectContaining({ name: attributeWithDateName }));
            if (validTo !== "") {
                // TODO: JSSNMSHDD-2520 (move test to consumption library)
                // eslint-disable-next-line jest/no-conditional-expect
                expect(validTo).toStrictEqual(attribute.content.validFrom);
            }
            validTo = attribute.content.validTo ? attribute.content.validTo : "";
        }
    });

    test("should throw an error for get history with a non-existent name", async () => {
        const response = await consumptionServices.attributes.getHistoryByName({
            name: "ThisIsANon-ExistentAttributeName"
        });
        expect(response).toBeAnError("Attribute not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("should get all currently valid attributes", async () => {
        const response = await consumptionServices.attributes.getAllValid();
        expect(response).toBeSuccessful();
        const now = DateTime.utc();
        for (const attribute of response.value) {
            if (attribute.content.validFrom) {
                const validFrom = DateTime.fromISO(attribute.content.validFrom);
                // TODO: JSSNMSHDD-2520 (move test to consumption library)
                // eslint-disable-next-line jest/no-conditional-expect
                expect(validFrom <= now).toBeTruthy();
            }
            if (attribute.content.validTo) {
                const validTo = DateTime.fromISO(attribute.content.validTo);
                // TODO: JSSNMSHDD-2520 (move test to consumption library)
                // eslint-disable-next-line jest/no-conditional-expect
                expect(validTo > now).toBeTruthy();
            }
        }
    });

    test("should delete an attribute by id", async () => {
        const response = await consumptionServices.attributes.deleteAttribute({ id: attributeWithoutDateId });
        expect(response).toBeSuccessful();

        const responseGetAttribute = await consumptionServices.attributes.getAttribute({ id: attributeWithoutDateId });
        expect(responseGetAttribute).toBeAnError("Attribute not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("should delete attributes by name", async () => {
        const response = await consumptionServices.attributes.deleteAttributeByName({ name: attributeWithDateName });
        expect(response).toBeSuccessful();

        const responseGetAttribute = await consumptionServices.attributes.getAttributeByName({
            name: attributeWithDateName
        });
        expect(responseGetAttribute).toBeAnError("Attribute not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("should throw an error for delete with invalid attribute id", async () => {
        const response = await consumptionServices.attributes.deleteAttribute({ id: "ThisIsAnInvalidId" });
        expect(response).toBeAnError("id is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("should throw an error for delete with non-existent attribute name", async () => {
        const response = await consumptionServices.attributes.deleteAttributeByName({
            name: "ThisIsANon-ExistentAttributeName"
        });
        expect(response).toBeAnError("ConsumptionAttribute not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });
});
