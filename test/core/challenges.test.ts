import { TransportServices } from "../../src";
import { establishRelationship, expectError, expectSuccess, getRelationship, RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let relationshipId: string;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2, { enableDatawallet: true });
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;

    await establishRelationship(transportServices1, transportServices2);

    relationshipId = (await getRelationship(transportServices1)).id;
}, 30000);
afterAll(async () => await serviceProvider.stop());

describe("Create challenge", () => {
    test("should create a challenge with the default challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({});
        expectSuccess(response);

        expect(response.value.type).toBe("Identity");
    });

    test("should create a challenge with the Identity challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Identity"
        });
        expectSuccess(response);

        expect(response.value.type).toBe("Identity");
    });

    test("should create a challenge with the Device challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Device"
        });
        expectSuccess(response);

        expect(response.value.type).toBe("Device");
    });

    test("should create a challenge with the Relationship challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expectSuccess(response);

        expect(response.value.type).toBe("Relationship");
    });

    test("should return an error with the Relationship challenge type and missing relationship", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship"
        });
        expectError(response, "'relationship' is required when 'challengeType' is 'Relationship'", "error.runtime.validation.invalidPropertyValue");
    });

    test("should return an error with an invalid challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "-invalid-"
        });
        expectError(response, "challengeType is invalid", "error.runtime.validation.invalidPropertyValue");
    });
});
