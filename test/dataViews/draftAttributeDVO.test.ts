import {
    BirthDay,
    BirthMonth,
    BirthYear,
    CommunicationLanguage,
    GivenName,
    IdentityAttribute,
    IdentityAttributeJSON,
    Nationality,
    RelationshipAttributeJSON,
    Sex
} from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import { DataViewExpander, TransportServices } from "../../src";
import { RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let expander1: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(1);
    transportServices1 = runtimeServices[0].transport;
    expander1 = runtimeServices[0].expander;
}, 30000);

afterAll(() => serviceProvider.stop());

describe("DraftAttributeDVO", () => {
    let transportService1Address: CoreAddress;
    const attributes: (IdentityAttributeJSON | RelationshipAttributeJSON)[] = [];

    beforeAll(async () => {
        transportService1Address = CoreAddress.from((await transportServices1.account.getIdentityInfo()).value.address);
        attributes.push(
            IdentityAttribute.from<GivenName>({
                owner: transportService1Address,
                value: GivenName.fromAny("Hugo")
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<BirthDay>({
                owner: transportService1Address,
                value: BirthDay.fromAny(17)
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<BirthMonth>({
                owner: transportService1Address,
                value: BirthMonth.fromAny(11)
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<BirthYear>({
                owner: transportService1Address,
                value: BirthYear.fromAny(2001)
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<Sex>({
                owner: transportService1Address,
                value: Sex.fromAny("male")
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<Nationality>({
                owner: transportService1Address,
                value: Nationality.fromAny("DE")
            }).toJSON()
        );
        attributes.push(
            IdentityAttribute.from<CommunicationLanguage>({
                owner: transportService1Address,
                value: CommunicationLanguage.fromAny("de")
            }).toJSON()
        );
    });

    test("check the GivenName", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[0];
        const attribute = attributes[0];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.GivenName");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.GivenName");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe("Hugo");
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.max).toBe(200);
    });

    test("check the BirthDay", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[1];
        const attribute = attributes[1];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthDay");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthDay");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe(17);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.renderHints.dataType).toBe("Day");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(31);
    });

    test("check the BirthMonth", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[2];
        const attribute = attributes[2];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthMonth");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthMonth");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe(11);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.renderHints.dataType).toBe("Month");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(12);
    });

    test("check the BirthYear", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[3];
        const attribute = attributes[3];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.BirthYear");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.BirthYear");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe(2001);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("Integer");
        expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.renderHints.dataType).toBe("Year");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.min).toBe(1);
        expect(dvo.valueHints.max).toBe(9999);
    });

    test("check the Sex", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[4];
        const attribute = attributes[4];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.Sex");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.Sex");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe("male");
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        // TODO: Uncomment after content has been upgraded
        // expect(dvo.renderHints.editType).toBe("ButtonLike");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        /*
        // TODO: Uncomment after content has been upgraded
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
    });

    test("check the Nationality", async () => {
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[5];
        const attribute = attributes[5];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.Nationality");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.Nationality");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe("DE");
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
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
        const dvos = await expander1.expandAttributes(attributes);
        expect(dvos).toHaveLength(7);
        const dvo = dvos[6];
        const attribute = attributes[6];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("DraftAttributeDVO");
        expect(dvo.id).toBe("");
        expect(dvo.name).toBe("i18n://dvo.attribute.name.CommunicationLanguage");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.CommunicationLanguage");
        expect(dvo.content).toStrictEqual(attribute);
        expect(dvo.value.value).toBe("de");
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.owner);
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
