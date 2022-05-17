import { TokenDTO, TransportServices } from "../../src";
import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";
import { NoLoginTestRuntime, TestRuntime } from "../lib/TestRuntime";
import { uploadOwnToken } from "../lib/testUtils";

const serviceProvider = new RuntimeServiceProvider();
let transportServices: TransportServices;
let noLoginRuntime: TestRuntime;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(1);
    transportServices = runtimeServices[0].transport;

    noLoginRuntime = new NoLoginTestRuntime(RuntimeServiceProvider.defaultConfig);
    await noLoginRuntime.init();
    await noLoginRuntime.start();
}, 30000);
afterAll(async () => {
    await serviceProvider.stop();
    await noLoginRuntime.stop();
});

describe("Anonymous tokens", () => {
    let uploadedToken: TokenDTO;
    beforeAll(async () => {
        uploadedToken = await uploadOwnToken(transportServices);
    });

    test("should get the token anonymous by truncated reference", async () => {
        const result = await noLoginRuntime.anonymousServices.tokens.loadPeerTokenByTruncatedReference({
            reference: uploadedToken.truncatedReference
        });
        expect(result).toBeSuccessful();

        const token = result.value;
        expect(token.content).toStrictEqual(uploadedToken.content);
    });

    test("should get the token anonymous by id and key", async () => {
        const result = await noLoginRuntime.anonymousServices.tokens.loadPeerTokenByIdAndKey({
            id: uploadedToken.id,
            secretKey: uploadedToken.secretKey
        });
        expect(result).toBeSuccessful();

        const token = result.value;
        expect(token.content).toStrictEqual(uploadedToken.content);
    });
});
