import { BirthYear, CommunicationLanguage, IdentityAttribute, Nationality, Sex } from "@nmshd/content";
import { CoreAddress, CoreId } from "@nmshd/transport";
import { ConsumptionAttributeDTO, ConsumptionServices, DataViewExpander, RepositoryAttributeDVO, TransportServices } from "../../src";
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
    const attributes: ConsumptionAttributeDTO[] = [];
    const sharedAttributes: ConsumptionAttributeDTO[] = [];

    beforeAll(async () => {
        transportService1Address = (await transportServices1.account.getIdentityInfo()).value.address;
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    params: {
                        content: IdentityAttribute.from<BirthYear>({
                            owner: CoreAddress.from(transportService1Address),
                            value: BirthYear.fromAny(2001)
                        })
                    }
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    params: {
                        content: IdentityAttribute.from<Sex>({
                            owner: CoreAddress.from(transportService1Address),
                            value: Sex.fromAny("male")
                        })
                    }
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    params: {
                        content: IdentityAttribute.from<Nationality>({
                            owner: CoreAddress.from(transportService1Address),
                            value: Nationality.fromAny("DE")
                        })
                    }
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    params: {
                        content: IdentityAttribute.from<CommunicationLanguage>({
                            owner: CoreAddress.from(transportService1Address),
                            value: CommunicationLanguage.fromAny("de")
                        })
                    }
                })
            ).value
        );

        for (const attr of attributes) {
            sharedAttributes.push(
                (
                    await consumptionServices1.attributes.createSharedAttributeCopy({
                        params: { attributeId: CoreId.from(attr.id), peer: CoreAddress.from("id123456789"), requestReference: await CoreId.generate() }
                    })
                ).value
            );
        }
    });

    test("check the BirthYear", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[0].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
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
        expect(dvo.value.value).toBe(2001);
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
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
        expect(shared.peer.id).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.peer.name).toBe(sharedAttribute.shareInfo!.peer.substring(3, 9));
        expect(shared.peer.description).toBe("i18n://dvo.identity.unknown.description");
        expect(shared.peer.isSelf).toBe(false);
        expect(shared.peer.hasRelationship).toBe(false);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the Sex", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[1].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
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
        expect(dvo.value.value).toBe("male");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        // TODO: Uncomment after content has been upgraded
        // expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");

        // TODO: Uncomment after content has been upgraded
        /*
        expect(dvo.valueHints.values).toStrictEqual([
            { key: "male", displayName: "i18n://attributes.values.sex.male" },
            { key: "female", displayName: "i18n://attributes.values.sex.female" },
            { key: "intersex", displayName: "i18n://attributes.values.sex.intersex" }
        ]);
        */
        expect(dvo.valueHints.values).toStrictEqual([
            { key: "M", displayName: "i18n://attributes.values.sex.M" },
            { key: "F", displayName: "i18n://attributes.values.sex.F" },
            { key: "X", displayName: "i18n://attributes.values.sex.X" }
        ]);

        expect(dvo.sharedWith).toHaveLength(1);
        const shared = dvo.sharedWith[0];
        const sharedAttribute = sharedAttributes[1];
        expect(shared.id).toBe(sharedAttribute.id);
        expect(shared.date).toBe(sharedAttribute.createdAt);
        expect(shared.createdAt).toBe(sharedAttribute.createdAt);
        expect(shared.peer.id).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the Nationality", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[2].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
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
        expect(dvo.value.value).toBe("DE");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
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
        expect(shared.peer.id).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });

    test("check the CommunicationLanguage", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[3].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
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
        expect(dvo.value.value).toBe("de");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
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
        expect(shared.peer.id).toBe(sharedAttribute.shareInfo!.peer);
        expect(shared.requestReference).toBe(sharedAttribute.shareInfo!.requestReference);
        expect(shared.sourceAttribute).toBe(sharedAttribute.shareInfo!.sourceAttribute);
    });
});
