import { DataViewExpander, TransportServices } from "../../src";
import { establishRelationshipWithBodys, RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    await establishRelationshipWithBodys(
        transportServices1,
        transportServices2,
        {
            "@type": "RelationshipTemplateBody",
            sharedAttributes: [
                { "@type": "Attribute", name: "Person.givenName", value: "Jürgen" },
                { "@type": "Attribute", name: "Person.familyName", value: "Becker" }
            ]
        },
        {
            "@type": "RelationshipCreationChangeRequestBody",
            sharedAttributes: [
                { "@type": "Attribute", name: "Person.gender", value: "f" },
                { "@type": "Attribute", name: "Person.familyName", value: "Sèzanné" }
            ]
        }
    );
}, 30000);

afterAll(() => serviceProvider.stop());

describe("RelationshipDVO", () => {
    test("check the relationship dvo for the templator", async () => {
        const dtos = (await transportServices1.relationships.getRelationships({})).value;
        const dvos = await expander1.expandRelationshipDTOs(dtos);

        const dto = dtos[0];
        const dvo = dvos[0];
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(dto.peer);
        expect(dvo.name).toBe("i18n://salutation.gender.f Sèzanné");
        expect(dvo.description).toBe("i18n://dvo.relationship.active");
        expect(dvo.type).toBe("IdentityDVO");
        expect(dvo.date).toStrictEqual(dto.changes[0].request.createdAt);
        expect(dvo.isSelf).toBe(false);
    });

    test("check the relationship dvo for the requestor", async () => {
        const dtos = (await transportServices2.relationships.getRelationships({})).value;
        const dvos = await expander2.expandRelationshipDTOs(dtos);

        const dto = dtos[0];
        const dvo = dvos[0];
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(dto.peer);
        expect(dvo.name).toBe("Jürgen Becker");
        expect(dvo.description).toBe("i18n://dvo.relationship.active");
        expect(dvo.type).toBe("IdentityDVO");
        expect(dvo.date).toStrictEqual(dto.changes[0].request.createdAt);
        expect(dvo.isSelf).toBe(false);
    });
});
