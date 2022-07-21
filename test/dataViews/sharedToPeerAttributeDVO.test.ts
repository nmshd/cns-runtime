import { BirthYear, CommunicationLanguage, IAbstractIntegerJSON, IAbstractStringJSON, IdentityAttribute, Nationality, Sex } from "@nmshd/content";
import { CoreAddress, CoreId } from "@nmshd/transport";
import { ConsumptionServices, DataViewExpander, LocalAttributeDTO, RepositoryAttributeDVO, TransportServices } from "../../src";
import { RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let consumptionServices1: ConsumptionServices;
let expander1: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(1);
    transportServices1 = runtimeServices[0].transport;
    consumptionServices1 = runtimeServices[0].consumption;
    expander1 = runtimeServices[0].expander;
}, 30000);

afterAll(() => serviceProvider.stop());

describe("SharedToPeerAttributeDVO", () => {
    let transportService1Address: string;
    const attributes: LocalAttributeDTO[] = [];
    const sharedAttributes: LocalAttributeDTO[] = [];

    beforeAll(async () => {
        transportService1Address = (await transportServices1.account.getIdentityInfo()).value.address;
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<BirthYear>({
                        owner: CoreAddress.from(transportService1Address),
                        value: BirthYear.fromAny(2001)
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<Sex>({
                        owner: CoreAddress.from(transportService1Address),
                        value: Sex.fromAny("male")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<Nationality>({
                        owner: CoreAddress.from(transportService1Address),
                        value: Nationality.fromAny("DE")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<CommunicationLanguage>({
                        owner: CoreAddress.from(transportService1Address),
                        value: CommunicationLanguage.fromAny("de")
                    }).toJSON() as any
                })
            ).value
        );

        for (const attr of attributes) {
            sharedAttributes.push(
                (
                    await consumptionServices1.attributes.createSharedAttributeCopy({
                        attributeId: attr.id,
                        peer: `${transportService1Address.substring(0, transportService1Address.length - 1)}a`,
                        requestReference: (await CoreId.generate("REQ")).toString()
                    })
                ).value
            );
        }
    });

    test("check the BirthYear", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[0].id })).value];
        const dvos = await expander1.expandLocalAttributeDTOs(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[0];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthYear");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthYear");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        const value = dvo.value as IAbstractIntegerJSON;
        expect(value["@type"]).toBe("BirthYear");
        expect(value.value).toBe(2001);

        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner).toStrictEqual(attribute.content.owner);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Year");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(9999);

        expect(dvo.sharedWith).toHaveLength(1);
        const shared = dvo.sharedWith[0];
        const sharedAttribute = sharedAttributes[0];
        expect(shared.id).toBe(sharedAttribute.id);
        expect(shared.date).toBe(sharedAttribute.createdAt);
        expect(shared.createdAt).toBe(sharedAttribute.createdAt);
        expect(shared.peer).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the Sex", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[1].id })).value];
        const dvos = await expander1.expandLocalAttributeDTOs(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[1];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.Sex");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.Sex");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        const value = dvo.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("Sex");
        expect(value.value).toBe("male");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner).toStrictEqual(attribute.content.owner);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");

        expect(dvo.valueHints.values).toStrictEqual([
            { key: "male", displayName: "i18n://attributes.values.sex.male" },
            { key: "female", displayName: "i18n://attributes.values.sex.female" },
            { key: "intersex", displayName: "i18n://attributes.values.sex.intersex" }
        ]);

        expect(dvo.sharedWith).toHaveLength(1);
        const shared = dvo.sharedWith[0];
        const sharedAttribute = sharedAttributes[1];
        expect(shared.id).toBe(sharedAttribute.id);
        expect(shared.date).toBe(sharedAttribute.createdAt);
        expect(shared.createdAt).toBe(sharedAttribute.createdAt);
        expect(shared.peer).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the Nationality", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[2].id })).value];
        const dvos = await expander1.expandLocalAttributeDTOs(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[2];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.Nationality");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.Nationality");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        const value = dvo.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("Nationality");
        expect(value.value).toBe("DE");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner).toStrictEqual(attribute.content.owner);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Country");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(2);
        expect(dvo.valueHints.max).toBe(2);
        expect(dvo.valueHints.values).toHaveLength(249);
        expect(dvo.valueHints.values![61]).toStrictEqual({ key: "DE", displayName: "i18n://attributes.values.countries.DE" });

        expect(dvo.sharedWith).toHaveLength(1);
        const shared = dvo.sharedWith[0];
        const sharedAttribute = sharedAttributes[2];
        expect(shared.id).toBe(sharedAttribute.id);
        expect(shared.date).toBe(sharedAttribute.createdAt);
        expect(shared.createdAt).toBe(sharedAttribute.createdAt);
        expect(shared.peer).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the CommunicationLanguage", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[3].id })).value];
        const dvos = await expander1.expandLocalAttributeDTOs(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[3];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.CommunicationLanguage");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.CommunicationLanguage");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        const value = dvo.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("CommunicationLanguage");
        expect(value.value).toBe("de");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner).toStrictEqual(attribute.content.owner);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Language");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(2);
        expect(dvo.valueHints.max).toBe(2);
        expect(dvo.valueHints.values).toHaveLength(183);
        expect(dvo.valueHints.values![31]).toStrictEqual({ key: "de", displayName: "i18n://attributes.values.languages.de" });

        expect(dvo.sharedWith).toHaveLength(1);
        const shared = dvo.sharedWith[0];
        const sharedAttribute = sharedAttributes[3];
        expect(shared.id).toBe(sharedAttribute.id);
        expect(shared.date).toBe(sharedAttribute.createdAt);
        expect(shared.createdAt).toBe(sharedAttribute.createdAt);
        expect(shared.peer).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });
});
