import {
    ICreateConsumptionAttributeParams,
    ICreateSharedConsumptionAttributeCopyParams,
    IGetIdentityAttributesParams,
    IGetRelationshipAttributesParams,
    ISucceedConsumptionAttributeParams,
    UpdateConsumptionAttributeParams
} from "@nmshd/consumption";
import { IdentityAttribute, RelationshipAttribute, RelationshipAttributeConfidentiality } from "@nmshd/content";
import { CoreAddress, CoreDate, CoreId } from "@nmshd/transport";
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

describe.only("Attributes", () => {
    beforeEach(async function () {
        const surnameParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "Surname",
                    value: "ASurname"
                },
                owner: CoreAddress.from("address")
            })
        };

        const givenNamesParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "GivenName",
                    value: "AGivenName"
                },
                owner: CoreAddress.from("address")
            })
        };
        await consumptionServices.attributes.createAttribute({ params: surnameParams });
        await consumptionServices.attributes.createAttribute({ params: givenNamesParams });
    });

    afterEach(async function () {
        const attributes = await consumptionServices.attributes.getAttributes({ query: {} });
        attributes.value.forEach(async (attribute) => {
            await consumptionServices.attributes.deleteAttribute(attribute);
        });
    });

    test("should list all attributes with empty query", async () => {
        const attributes = await consumptionServices.attributes.getAttributes({ query: {} });
        expect(attributes.value).toHaveLength(2);
    });

    test("should allow to create new attributes", async () => {
        const attributesBeforeCreate = await consumptionServices.attributes.getAttributes({ query: {} });
        const nrAttributesBeforeCreate = attributesBeforeCreate.value.length;

        const timestamp = DateTime.utc().toString();
        const addressParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "StreetAddress",
                    recipient: "ARecipient",
                    street: "AStreet",
                    houseNo: "AHouseNo",
                    zipCode: "AZipCode",
                    city: "ACity",
                    country: "DE"
                },
                validTo: CoreDate.utc(),
                owner: CoreAddress.from("address")
            })
        };

        const birthDateParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "BirthDate",
                    day: 22,
                    month: 2,
                    year: 2022
                },
                owner: CoreAddress.from("address")
            })
        };

        const address = await consumptionServices.attributes.createAttribute({ params: addressParams });
        expect(address).toBeSuccessful();
        const addressAttribute = address.value;
        expect(addressAttribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(IdentityAttribute.from(addressAttribute.content)).toMatchObject(addressParams.content);

        const birthDate = await consumptionServices.attributes.createAttribute({ params: birthDateParams });
        expect(birthDate).toBeSuccessful();
        const birthDateAttribute = birthDate.value;
        expect(birthDateAttribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(IdentityAttribute.from(birthDateAttribute.content)).toMatchObject(birthDateParams.content);

        const attributesAfterCreate = await consumptionServices.attributes.getAttributes({ query: {} });
        const nrAttributesAfterCreate = attributesAfterCreate.value.length;
        expect(nrAttributesAfterCreate).toBe(nrAttributesBeforeCreate + 2);
    });

    test("should allow to delete an attribute", async () => {
        const attributes = await consumptionServices.attributes.getAttributes({ query: {} });
        const nrAttributesBeforeDelete = attributes.value.length;
        await consumptionServices.attributes.deleteAttribute(attributes.value[0]);

        const attributesAfterDelete = await consumptionServices.attributes.getAttributes({ query: {} });
        const nrAttributesAfterDelete = attributesAfterDelete.value.length;
        expect(nrAttributesAfterDelete).toBe(nrAttributesBeforeDelete - 1);

        const attributesJSON = attributesAfterDelete.value.map((v) => v.id.toString());
        expect(attributesJSON).not.toContain(attributes.value[0]?.id.toString());
    });

    test("should allow to succeed an attribute", async () => {
        const displayNameParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "DisplayName",
                    value: "ADisplayName"
                },
                owner: CoreAddress.from("address")
            })
        };

        const successorDate = CoreDate.utc();
        const displayNameSuccessor = IdentityAttribute.from({
            value: {
                "@type": "DisplayName",
                value: "ANewDisplayName"
            },
            owner: CoreAddress.from("address"),
            validFrom: successorDate
        });

        const attribute = await consumptionServices.attributes.createAttribute({ params: displayNameParams });
        const attributeId = attribute.value.id;
        const createSuccessorParams: ISucceedConsumptionAttributeParams = {
            successorContent: displayNameSuccessor,
            succeeds: CoreId.from(attributeId)
        };
        const successor = await consumptionServices.attributes.succeedAttribute({ params: createSuccessorParams });
        const successorId = successor.value.id;
        const succeededAttribute = await consumptionServices.attributes.getAttribute({ id: attributeId });
        expect(succeededAttribute.value.content.validTo).toBe(successorDate.subtract(1).toISOString());

        const succeessorAttribute = await consumptionServices.attributes.getAttribute({ id: successorId });
        expect(succeessorAttribute.value.content.validFrom).toBe(successorDate.toISOString());

        const allAttributes = await consumptionServices.attributes.getAttributes({ query: {} });
        const allAttributesJSON = allAttributes.value.map((v) => v.id);
        expect(allAttributesJSON).toContain(succeededAttribute.value.id);

        const currentAttributes = await consumptionServices.attributes.getAllValid();
        const currentAttributesJSON = currentAttributes.value.map((v) => v.id);
        expect(currentAttributesJSON).not.toContain(succeededAttribute.value.id);
        expect(currentAttributesJSON).toContain(succeessorAttribute.value.id);
    });

    test("should allow to create a share copy", async function () {
        const nationalityParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address")
            })
        };
        const nationalityAttribute = await consumptionServices.attributes.createAttribute({ params: nationalityParams });

        const peer = CoreAddress.from("address");
        const createSharedAttributesParams: ICreateSharedConsumptionAttributeCopyParams = {
            attributeId: CoreId.from(nationalityAttribute.value.id),
            peer: peer,
            requestReference: CoreId.from("requestId")
        };

        const sharedNationality = await consumptionServices.attributes.createSharedAttributeCopy({ params: createSharedAttributesParams });
        expect(sharedNationality).toBeSuccessful();
        const sharedNationalityAttribute = sharedNationality.value;
        expect(IdentityAttribute.from(sharedNationalityAttribute.content)).toMatchObject(nationalityParams.content);
        expect(sharedNationalityAttribute.shareInfo?.peer).toBe(peer.address);
    });

    test("should allow to update an attribute", async () => {
        const addressParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "StreetAddress",
                    recipient: "ARecipient",
                    street: "AStreet",
                    houseNo: "AHouseNo",
                    zipCode: "AZipCode",
                    city: "ACity",
                    country: "DE"
                },
                validTo: CoreDate.utc(),
                owner: CoreAddress.from("address")
            })
        };

        const newAddressContent = IdentityAttribute.from({
            value: {
                "@type": "StreetAddress",
                recipient: "ANewRecipient",
                street: "ANewStreet",
                houseNo: "ANewHouseNo",
                zipCode: "ANewZipCode",
                city: "ANewCity",
                country: "DE"
            },
            validTo: CoreDate.utc(),
            owner: CoreAddress.from("address")
        });

        const address = await consumptionServices.attributes.createAttribute({ params: addressParams });
        const updateParams = UpdateConsumptionAttributeParams.from({ id: CoreId.from(address.value.id), content: newAddressContent });
        const newAddress = await consumptionServices.attributes.updateAttribute({ params: updateParams });
        expect(newAddress).toBeSuccessful();
        const newAddressAttribute = newAddress.value;
        expect(IdentityAttribute.from(newAddressAttribute.content)).toMatchObject(newAddressContent);
    });

    test("should allow to get an attribute by id", async function () {
        const nationalityParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address")
            })
        };
        const nationalityAttribute = await consumptionServices.attributes.createAttribute({ params: nationalityParams });
        const receivedAttribute = await consumptionServices.attributes.getAttribute({ id: nationalityAttribute.value.id });
        expect(receivedAttribute).toBeSuccessful();
        expect(receivedAttribute).toStrictEqual(nationalityAttribute);
    });

    test("should allow to execute identity attribute queries", async function () {
        const identityAttributeParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address")
            })
        };
        const identityAttribute = await consumptionServices.attributes.createAttribute({ params: identityAttributeParams });

        const relationshipAttributeParams: ICreateConsumptionAttributeParams = {
            content: RelationshipAttribute.from({
                key: "nationality",
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address"),
                confidentiality: "public" as RelationshipAttributeConfidentiality
            })
        };
        const relationshipAttribute = await consumptionServices.attributes.createAttribute({ params: relationshipAttributeParams });

        const query: IGetIdentityAttributesParams = {
            query: {
                valueType: "Nationality"
            }
        };

        const attributes = await consumptionServices.attributes.executeIdentityAttributeQuery({ params: query });
        const attributesId = attributes.value.map((v) => v.id);
        expect(attributesId).not.toContain(relationshipAttribute.value.id);
        expect(attributesId).toContain(identityAttribute.value.id);
    });

    test("should allow to execute relationship attribute queries", async function () {
        const identityAttributeParams: ICreateConsumptionAttributeParams = {
            content: IdentityAttribute.from({
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address")
            })
        };
        const identityAttribute = await consumptionServices.attributes.createAttribute({ params: identityAttributeParams });

        const relationshipAttributeParams: ICreateConsumptionAttributeParams = {
            content: RelationshipAttribute.from({
                key: "nationality",
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: CoreAddress.from("address"),
                confidentiality: "public" as RelationshipAttributeConfidentiality
            })
        };
        const relationshipAttribute = await consumptionServices.attributes.createAttribute({ params: relationshipAttributeParams });

        const query: IGetRelationshipAttributesParams = {
            query: {
                key: "nationality",
                owner: CoreAddress.from("address"),
                attributeHints: {
                    title: "someHintTitle",
                    confidentiality: "public" as RelationshipAttributeConfidentiality
                }
            }
        };

        const attributes = await consumptionServices.attributes.executeRelationshipAttributeQuery({ params: query });
        const attributesId = attributes.value.map((v) => v.id);
        expect(attributesId).toContain(relationshipAttribute.value.id);
        expect(attributesId).not.toContain(identityAttribute.value.id);
    });
});
