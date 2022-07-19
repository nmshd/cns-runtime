import { IdentityAttributeQueryJSON, RelationshipAttributeConfidentiality, RelationshipAttributeQueryJSON } from "@nmshd/content";
import { CoreDate } from "@nmshd/transport";
import { DateTime } from "luxon";
import {
    ConsumptionServices,
    CreateAttributeRequest,
    CreateSharedAttributeCopyRequest,
    ExecuteIdentityAttributeQueryRequest,
    ExecuteRelationshipAttributeQueryRequest,
    GetAttributesRequest,
    SucceedAttributeRequest,
    UpdateAttributeRequest
} from "../../src";
import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("Attributes", () => {
    beforeEach(async function () {
        const surnameParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Surname",
                    value: "ASurname"
                },
                owner: "address"
            }
        };

        const givenNameParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "GivenName",
                    value: "AGivenName"
                },
                owner: "address"
            }
        };
        await consumptionServices.attributes.createAttribute(surnameParams);
        await consumptionServices.attributes.createAttribute(givenNameParams);
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
        const addressParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "StreetAddress",
                    recipient: "ARecipient",
                    street: "AStreet",
                    houseNo: "AHouseNo",
                    zipCode: "AZipCode",
                    city: "ACity",
                    country: "DE"
                },
                validTo: CoreDate.utc().toString(),
                owner: "address"
            }
        };

        const birthDateParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "BirthDate",
                    day: 22,
                    month: 2,
                    year: 2022
                },
                owner: "address"
            }
        };

        const address = await consumptionServices.attributes.createAttribute(addressParams);
        expect(address).toBeSuccessful();
        const addressAttribute = address.value;
        expect(addressAttribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(addressAttribute.content).toMatchObject(addressParams.content);

        const birthDate = await consumptionServices.attributes.createAttribute(birthDateParams);
        expect(birthDate).toBeSuccessful();
        const birthDateAttribute = birthDate.value;
        expect(birthDateAttribute.createdAt.substring(0, 10)).toStrictEqual(timestamp.substring(0, 10));
        expect(birthDateAttribute.content).toMatchObject(birthDateParams.content);

        const attributesAfterCreate = await consumptionServices.attributes.getAttributes({ query: {} });
        const nrAttributesAfterCreate = attributesAfterCreate.value.length;
        expect(nrAttributesAfterCreate).toBe(nrAttributesBeforeCreate + 2);
    });

    test("should allow to delete an attribute", async () => {
        const attributes = await consumptionServices.attributes.getAttributes({});
        const nrAttributesBeforeDelete = attributes.value.length;
        await consumptionServices.attributes.deleteAttribute({ id: attributes.value[0].id });

        const attributesAfterDelete = await consumptionServices.attributes.getAttributes({});
        const nrAttributesAfterDelete = attributesAfterDelete.value.length;
        expect(nrAttributesAfterDelete).toBe(nrAttributesBeforeDelete - 1);

        const attributesJSON = attributesAfterDelete.value.map((v) => v.id.toString());
        expect(attributesJSON).not.toContain(attributes.value[0]?.id.toString());
    });

    test("should allow to succeed an attribute", async () => {
        const displayNameParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "DisplayName",
                    value: "ADisplayName"
                },
                owner: "address"
            }
        };

        const successorDate = CoreDate.utc();

        const attribute = await consumptionServices.attributes.createAttribute(displayNameParams);
        const attributeId = attribute.value.id;
        const createSuccessorParams: SucceedAttributeRequest = {
            successorContent: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "DisplayName",
                    value: "ANewDisplayName"
                },
                owner: "address",
                validFrom: successorDate.toString()
            },
            succeeds: attributeId
        };
        const successor = await consumptionServices.attributes.succeedAttribute(createSuccessorParams);
        const successorId = successor.value.id;
        const succeededAttribute = await consumptionServices.attributes.getAttribute({ id: attributeId });
        expect(succeededAttribute.value.content.validTo).toBe(successorDate.subtract(1).toISOString());

        const succeessorAttribute = await consumptionServices.attributes.getAttribute({ id: successorId });
        expect(succeessorAttribute.value.content.validFrom).toBe(successorDate.toISOString());

        const allAttributes = await consumptionServices.attributes.getAttributes({});
        const allAttributesJSON = allAttributes.value.map((v) => v.id);
        expect(allAttributesJSON).toContain(succeededAttribute.value.id);

        const currentAttributes = await consumptionServices.attributes.getValidAttributes({});
        const currentAttributesJSON = currentAttributes.value.map((v) => v.id);
        expect(currentAttributesJSON).not.toContain(succeededAttribute.value.id);
        expect(currentAttributesJSON).toContain(succeessorAttribute.value.id);
    });

    test("should allow to create a share copy", async function () {
        const nationalityParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: "address"
            }
        };
        const nationalityAttribute = await consumptionServices.attributes.createAttribute(nationalityParams);

        const peer = "A35characterLongAddress".padStart(35, "1");
        const requestReference = "REQA15CharacterLongRef".padStart(17, "0");
        const createSharedAttributesParams: CreateSharedAttributeCopyRequest = {
            attributeId: nationalityAttribute.value.id,
            peer: peer,
            requestReference: requestReference
        };

        const sharedNationality = await consumptionServices.attributes.createSharedAttributeCopy(createSharedAttributesParams);
        expect(sharedNationality).toBeSuccessful();
        const sharedNationalityAttribute = sharedNationality.value;
        expect(sharedNationalityAttribute.content).toMatchObject(nationalityParams.content);
        expect(sharedNationalityAttribute.shareInfo?.peer).toBe(peer);
    });

    test("should allow to update an attribute", async () => {
        const addressParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "StreetAddress",
                    recipient: "ARecipient",
                    street: "AStreet",
                    houseNo: "AHouseNo",
                    zipCode: "AZipCode",
                    city: "ACity",
                    country: "DE"
                },
                validTo: CoreDate.utc().toString(),
                owner: "address"
            }
        };

        const address = await consumptionServices.attributes.createAttribute(addressParams);
        const updateParams: UpdateAttributeRequest = {
            id: address.value.id,
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "StreetAddress",
                    recipient: "ANewRecipient",
                    street: "ANewStreet",
                    houseNo: "ANewHouseNo",
                    zipCode: "ANewZipCode",
                    city: "ANewCity",
                    country: "DE"
                },
                validTo: CoreDate.utc().toString(),
                owner: "address"
            }
        };
        const newAddress = await consumptionServices.attributes.updateAttribute(updateParams);
        expect(newAddress).toBeSuccessful();
        const newAddressAttribute = newAddress.value;
        expect(newAddressAttribute.content).toMatchObject(updateParams.content);
    });

    test("should allow to get an attribute by id", async function () {
        const nationalityParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Nationality",
                    value: "DE"
                },
                owner: "address"
            }
        };
        const nationalityAttribute = await consumptionServices.attributes.createAttribute(nationalityParams);
        const receivedAttribute = await consumptionServices.attributes.getAttribute({ id: nationalityAttribute.value.id });
        expect(receivedAttribute).toBeSuccessful();
        expect(receivedAttribute).toStrictEqual(nationalityAttribute);
    });

    test("should allow to get an attribute by type", async function () {
        const nationalityParams: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "EMailAddress",
                    value: "a.mailaddress@provider.com"
                },
                owner: "address"
            }
        };
        const nationalityAttribute = await consumptionServices.attributes.createAttribute(nationalityParams);
        const queryRequest: GetAttributesRequest = {
            query: {
                "content.value.@type": "EMailAddress"
            }
        };
        const receivedAttributes = await consumptionServices.attributes.getAttributes(queryRequest);
        expect(receivedAttributes).toBeSuccessful();
        expect(receivedAttributes.value).toHaveLength(1);
        expect(receivedAttributes.value[0]).toStrictEqual(nationalityAttribute.value);
    });

    test("should allow to execute an identityAttributeQuery", async function () {
        const identityAttributeRequest: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Phone",
                    value: "012345678910"
                },
                owner: "address"
            }
        };
        const identityAttribute = await consumptionServices.attributes.createAttribute(identityAttributeRequest);
        const relationshipAttributeRequest: CreateAttributeRequest = {
            content: {
                "@type": "RelationshipAttribute",
                value: {
                    "@type": "Phone",
                    value: "012345678910"
                },
                key: "phone",
                confidentiality: "protected" as RelationshipAttributeConfidentiality,
                owner: "address"
            }
        };
        const relationshipAttribute = await consumptionServices.attributes.createAttribute(relationshipAttributeRequest);
        const identityQuery: IdentityAttributeQueryJSON = { "@type": "IdentityAttributeQuery", valueType: "Phone" };
        const identityQueryRequest: ExecuteIdentityAttributeQueryRequest = {
            query: identityQuery
        };
        const receivedAttributes = await consumptionServices.attributes.executeIdentityAttributeQuery(identityQueryRequest);
        expect(receivedAttributes).toBeSuccessful();
        expect(receivedAttributes.value).toHaveLength(1);
        const currentAttributesJSON = receivedAttributes.value.map((v) => v.id);
        expect(currentAttributesJSON).not.toContain(relationshipAttribute.value.id);
        expect(currentAttributesJSON).toContain(identityAttribute.value.id);
        expect(receivedAttributes.value[0]).toStrictEqual(identityAttribute.value);
    });
    test("should allow to execute a relationshipAttributeQuery", async function () {
        const identityAttributeRequest: CreateAttributeRequest = {
            content: {
                "@type": "IdentityAttribute",
                value: {
                    "@type": "Website",
                    value: "AWebsiteAddress"
                },
                owner: "address"
            }
        };
        const identityAttribute = await consumptionServices.attributes.createAttribute(identityAttributeRequest);
        const relationshipAttributeRequest: CreateAttributeRequest = {
            content: {
                "@type": "RelationshipAttribute",
                value: {
                    "@type": "Website",
                    value: "AWebsiteAddress"
                },
                key: "website",
                confidentiality: RelationshipAttributeConfidentiality.Protected,
                owner: "address"
            }
        };
        const relationshipAttribute = await consumptionServices.attributes.createAttribute(relationshipAttributeRequest);
        const relationshipAttributeQuery: RelationshipAttributeQueryJSON = {
            "@type": "RelationshipAttributeQuery",
            key: "website",
            owner: "address",
            valueType: "Website",
            attributeCreationHints: { title: "AnAttributeHint", confidentiality: RelationshipAttributeConfidentiality.Protected }
        };
        const relationshipQueryRequest: ExecuteRelationshipAttributeQueryRequest = {
            query: relationshipAttributeQuery
        };
        const receivedAttributes = await consumptionServices.attributes.executeRelationshipAttributeQuery(relationshipQueryRequest);
        expect(receivedAttributes).toBeSuccessful();
        expect(receivedAttributes.value).toHaveLength(1);
        const currentAttributesJSON = receivedAttributes.value.map((v) => v.id);
        expect(currentAttributesJSON).toContain(relationshipAttribute.value.id);
        expect(currentAttributesJSON).not.toContain(identityAttribute.value.id);
        expect(receivedAttributes.value[0]).toStrictEqual(relationshipAttribute.value);
    });
});
