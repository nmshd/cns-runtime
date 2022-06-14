import { BirthDay, BirthMonth, BirthYear, CommunicationLanguage, GivenName, IdentityAttribute, Nationality, Sex, Surname } from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
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

describe("RepositoryAttributeDVO", () => {
    let transportService1Address: string;
    const attributes: ConsumptionAttributeDTO[] = [];

    beforeAll(async () => {
        transportService1Address = (await transportServices1.account.getIdentityInfo()).value.address;
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<GivenName>({
                        owner: CoreAddress.from(transportService1Address),
                        value: GivenName.fromAny("Hugo")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<Surname>({
                        owner: CoreAddress.from(transportService1Address),
                        value: Surname.fromAny("Becker")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<BirthDay>({
                        owner: CoreAddress.from(transportService1Address),
                        value: BirthDay.fromAny(17)
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await consumptionServices1.attributes.createAttribute({
                    content: IdentityAttribute.from<BirthMonth>({
                        owner: CoreAddress.from(transportService1Address),
                        value: BirthMonth.fromAny(11)
                    }).toJSON() as any
                })
            ).value
        );
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
    });

    test("check the GivenName", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[0].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[0];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.GivenName");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.GivenName");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe("Hugo");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.max).toBe(200);
    });

    test("check the Surname", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[1].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[1];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.Surname");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.Surname");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe("Becker");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.max).toBe(200);
    });

    test("check the BirthDay", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[2].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[2];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthDay");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthDay");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe(17);
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Day");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(31);
    });

    test("check the BirthMonth", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[3].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[3];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthMonth");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthMonth");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe(11);
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Month");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(12);
    });

    test("check the BirthYear", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[4].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[4];
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
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("SelectLike");
        expect(dvo.renderHints.dataType).toBe("Year");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(9999);
    });

    test("check the Sex", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[5].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[5];
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
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");

        expect(dvo.valueHints.values).toStrictEqual([
            { key: "male", displayName: "i18n://attributes.values.sex.male" },
            { key: "female", displayName: "i18n://attributes.values.sex.female" },
            { key: "intersex", displayName: "i18n://attributes.values.sex.intersex" }
        ]);
    });

    test("check the Nationality", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[6].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[6];
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
        expect(dvo.sharedWith).toStrictEqual([]);
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
    });

    test("check the CommunicationLanguage", async () => {
        // const dtos = (await consumptionServices1.attributes.getAttributes({ query: { content: { value: { "@type": "GivenName" } } } })).value;
        const dtos = [(await consumptionServices1.attributes.getAttribute({ id: attributes[7].id })).value];
        const dvos = await expander1.expandConsumptionAttributes(dtos);
        expect(dvos).toHaveLength(1);
        const dvo = dvos[0] as RepositoryAttributeDVO;
        const attribute = attributes[7];
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
        expect(dvo.sharedWith).toStrictEqual([]);
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
    });
});
