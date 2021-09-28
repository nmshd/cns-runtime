import { CoreServices, TokenDTO } from "../../src";
import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";
import { NoLoginTestRuntime, TestRuntime } from "../lib/TestRuntime";
import { uploadOwnToken } from "../lib/testUtils";
import { expectSuccess } from "../lib/validation";

const coreServiceProvider = new RuntimeServiceProvider();
let coreServices: CoreServices;
let noLoginRuntime: TestRuntime;

beforeAll(async () => {
    const runtimeServices = await coreServiceProvider.launch(1);
    coreServices = runtimeServices[0].core;

    noLoginRuntime = new NoLoginTestRuntime(RuntimeServiceProvider.runtimeConfig);
    await noLoginRuntime.init();
    await noLoginRuntime.start();
}, 30000);
afterAll(async () => {
    await coreServiceProvider.stop();
    await noLoginRuntime.stop();
});

describe("Anonymous tokens", () => {
    let uploadedToken: TokenDTO;
    beforeAll(async () => {
        uploadedToken = await uploadOwnToken(coreServices);
    });

    test("should get the token anonymous by truncated reference", async () => {
        const result = await noLoginRuntime.anonymousServices.tokens.loadPeerTokenByTruncatedReference({
            reference: uploadedToken.truncatedReference
        });
        expectSuccess(result);

        const token = result.value;
        expect(token.content).toStrictEqual(uploadedToken.content);
    });

    test("should get the token anonymous by id and key", async () => {
        const result = await noLoginRuntime.anonymousServices.tokens.loadPeerTokenByIdAndKey({
            id: uploadedToken.id,
            secretKey: uploadedToken.secretKey
        });
        expectSuccess(result);

        const token = result.value;
        expect(token.content).toStrictEqual(uploadedToken.content);
    });
});
