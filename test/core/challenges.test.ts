import { TransportServices } from "../../src";
import { establishRelationship, getRelationship, RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let relationshipId: string;
let transportServices1Address: string;

// a random valid signature
const randomValidSignature =
    "eyJzaWciOiJlMlB2NHp1a3FlakhTUHJCUFdjYW8tWElLdmcxcV9lYTZkM0tJRlNCREV4OFVNYTV4cU95MEhYdEF5Qy1yX014NDBPQWRrQUs1d1dLX3pYbHJsTVVDUSIsImFsZyI6MiwiQHR5cGUiOiJDcnlwdG9TaWduYXR1cmUifQ";

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2, { enableDatawallet: true });
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;

    await establishRelationship(transportServices1, transportServices2);

    relationshipId = (await getRelationship(transportServices1)).id;
    transportServices1Address = (await transportServices1.account.getIdentityInfo()).value.address;
}, 30000);
afterAll(async () => await serviceProvider.stop());

describe("Create challenge", () => {
    test("should create a challenge with the Identity challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Identity"
        });
        expect(response).toBeSuccessful();

        expect(response.value.type).toBe("Identity");
    });

    test("should create a challenge with the Device challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Device"
        });
        expect(response).toBeSuccessful();

        expect(response.value.type).toBe("Device");
    });

    test("should create a challenge with the Relationship challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expect(response).toBeSuccessful();

        expect(response.value.type).toBe("Relationship");
    });

    test("should return an error when a challenge with the default challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({} as any);
        expect(response).toBeAnError("The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test("should return an error with the Relationship challenge type and missing relationship", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship"
        } as any);
        expect(response).toBeAnError("The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test("should return an error with an invalid challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "-invalid-"
        } as any);
        expect(response).toBeAnError("The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });
});

describe("Validate Challenge", () => {
    test("should validate a Relationship challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expect(response).toBeSuccessful();
        expect(response.value.type).toBe("Relationship");

        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: response.value.challengeString,
            signature: response.value.signature
        });
        expect(validationResult).toBeSuccessful();
        expect(validationResult.value.isValid).toBe(true);
        expect(validationResult.value.correspondingRelationship?.peer).toBe(transportServices1Address);
    });

    test("should validate a Identity challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({ challengeType: "Identity" });
        expect(response).toBeSuccessful();
        expect(response.value.type).toBe("Identity");

        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: response.value.challengeString,
            signature: response.value.signature
        });
        expect(validationResult).toBeSuccessful();
        expect(validationResult.value.isValid).toBe(true);
        expect(validationResult.value.correspondingRelationship?.peer).toBe(transportServices1Address);
    });

    test("challenge with the wrong signature is considered as not valid", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expect(response).toBeSuccessful();

        const response2 = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expect(response).toBeSuccessful();

        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: response.value.challengeString,
            signature: response2.value.signature
        });
        expect(validationResult).toBeSuccessful();
        expect(validationResult.value.isValid).toBe(false);
    });

    test("should validate a Device challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({ challengeType: "Device" });
        expect(response).toBeSuccessful();
        expect(response.value.type).toBe("Device");

        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: response.value.challengeString,
            signature: response.value.signature
        });
        expect(validationResult).toBeAnError("Validating challenges of the type 'Device' is not yet implemented.", "error.runtime.featureNotImplemented");
    });

    test("should return an error when the signature is invalid", async () => {
        const validChallenge = { createdBy: "id1...", createdByDevice: "DVC...", expiresAt: "2022", id: "CHL...", type: "Identity" };
        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: JSON.stringify(validChallenge),
            signature: "invalid-signature"
        });
        expect(validationResult).toBeAnError("The signature is invalid.", "error.runtime.validation.invalidPropertyValue");
    });

    test("should return an error when the challenge is an invalid json string", async () => {
        const validChallenge = { createdBy: "id1...", createdByDevice: "DVC...", expiresAt: "2022", id: "CHL...", type: "Identity" };
        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: `${JSON.stringify(validChallenge)}a`,
            signature: randomValidSignature
        });

        expect(validationResult).toBeAnError("The challengeString is invalid.", "error.runtime.validation.invalidPropertyValue");
    });

    test("should return an error when the challenge is an invalid challenge", async () => {
        const validationResult = await transportServices2.challenges.validateChallenge({
            challengeString: "{}",
            signature: randomValidSignature
        });

        expect(validationResult).toBeAnError("The challengeString is invalid.", "error.runtime.validation.invalidPropertyValue");
    });
});
