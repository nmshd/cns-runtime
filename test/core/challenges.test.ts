import { TransportServices } from "../../src";
import { establishRelationship, expectError, expectSuccess, getRelationship, RuntimeServiceProvider } from "../lib";

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

    test("should return an error when a challenge with the default challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({} as any);
        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test("should return an error with the Relationship challenge type and missing relationship", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship"
        } as any);
        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test("should return an error with an invalid challenge type", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "-invalid-"
        } as any);
        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });
});

describe("Validate Challenge", () => {
    test("should validate a Relationship challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({
            challengeType: "Relationship",
            relationship: relationshipId
        });
        expectSuccess(response);
        expect(response.value.type).toBe("Relationship");

        const valid = await transportServices2.challenges.validateChallenge({
            challenge: response.value.challengeString,
            signature: response.value.signature
        });
        expectSuccess(valid);
        expect(valid.value.isValid).toBe(true);
        expect(valid.value.challengeCreatedBy).toBe(transportServices1Address);
    });

    test("should validate a Identity challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({ challengeType: "Identity" });
        expectSuccess(response);
        expect(response.value.type).toBe("Identity");

        const valid = await transportServices2.challenges.validateChallenge({
            challenge: response.value.challengeString,
            signature: response.value.signature
        });
        expectSuccess(valid);
        expect(valid.value.isValid).toBe(true);
        expect(valid.value.challengeCreatedBy).toBe(transportServices1Address);
    });

    test("should validate a Device challenge", async () => {
        const response = await transportServices1.challenges.createChallenge({ challengeType: "Device" });
        expectSuccess(response);
        expect(response.value.type).toBe("Device");

        const valid = await transportServices2.challenges.validateChallenge({
            challenge: response.value.challengeString,
            signature: response.value.signature
        });
        expectError(valid, "Validating challenges of the type 'Device' is not yet implemented.", "error.runtime.featureNotImplemented");
    });

    test("should return an error when the signature is invalid", async () => {
        const validChallenge = { createdBy: "id1...", createdByDevice: "DVC...", expiresAt: "2022", id: "CHL...", type: "Identity" };
        const valid = await transportServices2.challenges.validateChallenge({
            challenge: JSON.stringify(validChallenge),
            signature: "invalid-signature"
        });
        expectError(valid, "The signature is invalid.", "error.runtime.validation.invalidPropertyValue");
    });

    test("should return an error when the challenge is an invalid json string", async () => {
        const valid = await transportServices2.challenges.validateChallenge({
            challenge: "{}a",
            signature: randomValidSignature
        });

        expectError(valid, "The challenge is invalid.", "error.runtime.validation.invalidPropertyValue");
    });

    test("should return an error when the challenge is an invalid challenge", async () => {
        const valid = await transportServices2.challenges.validateChallenge({
            challenge: "{}",
            signature: randomValidSignature
        });

        expectError(valid, "The challenge is invalid.", "error.runtime.validation.invalidPropertyValue");
    });
});
