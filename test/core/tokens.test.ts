import { CoreServices, OwnerRestriction } from "../../src";
import { exchangeToken, QueryParamConditions, RuntimeServiceProvider, uploadOwnToken } from "../lib";

const coreServiceProvider = new RuntimeServiceProvider();
let coreServices1: CoreServices;
let coreServices2: CoreServices;

beforeAll(async () => {
    const runtimeServices = await coreServiceProvider.launch(2);
    coreServices1 = runtimeServices[0].core;
    coreServices2 = runtimeServices[1].core;
}, 30000);
afterAll(() => coreServiceProvider.stop());

describe("Tokens query", () => {
    test("query own tokens", async () => {
        const token = await uploadOwnToken(coreServices1);
        const conditions = new QueryParamConditions(token, coreServices1).addDateSet("expiresAt").addDateSet("createdAt").addStringSet("createdByDevice");
        await conditions.executeTests((c, q) => c.tokens.getTokens({ query: q, ownerRestriction: OwnerRestriction.Own }));
    });

    test("query peer tokens", async () => {
        const token = await exchangeToken(coreServices1, coreServices2);
        const conditions = new QueryParamConditions(token, coreServices2).addDateSet("expiresAt").addDateSet("createdAt").addStringSet("createdBy");
        await conditions.executeTests((c, q) => c.tokens.getTokens({ query: q, ownerRestriction: OwnerRestriction.Peer }));
    });
});
