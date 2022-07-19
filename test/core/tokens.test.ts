import { GetTokensQuery, OwnerRestriction, TransportServices } from "../../src";
import { exchangeToken, QueryParamConditions, RuntimeServiceProvider, uploadOwnToken } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
}, 30000);
afterAll(() => serviceProvider.stop());

describe("Tokens errors", () => {
    test("create a token with 'expiresAt' set to undefined", async () => {
        const response = await transportServices1.tokens.createOwnToken({
            content: {
                content: "Hello"
            },
            expiresAt: undefined as unknown as string,
            ephemeral: false
        });

        expect(response).toBeAnError("expiresAt is invalid", "error.runtime.validation.invalidPropertyValue");
    });
});

describe("Tokens query", () => {
    test("query own tokens", async () => {
        const token = await uploadOwnToken(transportServices1);
        const conditions = new QueryParamConditions<GetTokensQuery>(token, transportServices1).addDateSet("expiresAt").addDateSet("createdAt").addStringSet("createdByDevice");
        await conditions.executeTests((c, q) => c.tokens.getTokens({ query: q, ownerRestriction: OwnerRestriction.Own }));
    });

    test("query peer tokens", async () => {
        const token = await exchangeToken(transportServices1, transportServices2);
        const conditions = new QueryParamConditions<GetTokensQuery>(token, transportServices2).addDateSet("expiresAt").addDateSet("createdAt").addStringSet("createdBy");
        await conditions.executeTests((c, q) => c.tokens.getTokens({ query: q, ownerRestriction: OwnerRestriction.Peer }));
    });
});
