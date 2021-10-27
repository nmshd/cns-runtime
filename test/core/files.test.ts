import fs from "fs";
import { DateTime } from "luxon";
import { FileDTO, OwnerRestriction, TransportServices } from "../../src";
import { combinations, exchangeFile, expectError, expectSuccess, makeUploadRequest, QueryParamConditions, RuntimeServiceProvider, uploadFile } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;

const UNKOWN_FILE_ID = "FILXXXXXXXXXXXXXXXXX";
const UNKOWN_TOKEN_ID = "TOKXXXXXXXXXXXXXXXXX";

const illegalParameters = [null, undefined, ""];

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
}, 30000);
afterAll(async () => await serviceProvider.stop());

describe("File Upload", () => {
    let file: FileDTO;

    test("Can upload file", async () => {
        file = await uploadFile(transportServices1);
    });

    test("Uploaded files can be accessed under /Files", async () => {
        expect(file).toBeDefined();

        const response = await transportServices1.files.getFiles({ query: { createdAt: file.createdAt } });
        expectSuccess(response);
        expect(response.value).toContainEqual(file);
    });

    test("Uploaded files can be accessed under /Files/Own", async () => {
        expect(file).toBeDefined();

        const response = await transportServices1.files.getFiles({ query: { createdAt: file.createdAt }, ownerRestriction: OwnerRestriction.Own });
        expectSuccess(response);
        expect(response.value).toContainEqual(file);
    });

    test("Uploaded files can be accessed under /Files/{id}", async () => {
        expect(file).toBeDefined();

        const response = await transportServices1.files.getFile({ id: file.id });
        expectSuccess(response);
    });

    test("Uploaded files keep their size", async () => {
        expect(file).toBeDefined();

        const response = await transportServices1.files.downloadFile({ id: file.id });
        expect(response.isSuccess).toBeTruthy();
        expect(response.value.content.byteLength).toEqual(4);
    });

    test("Cannot upload an empty file", async () => {
        const response = await transportServices1.files.uploadOwnFile(await makeUploadRequest({ content: Buffer.of() }));
        expectError(response, "file content is empty", "error.runtime.validation.invalidPropertyValue");
    });

    test("Cannot upload a file that is null", async () => {
        //cannot use client1.files.uploadOwn because it cannot deal with null values
        const response = await transportServices1.files.uploadOwnFile(await makeUploadRequest({ content: null }));

        expectError(response, "file content is empty", "error.runtime.validation.invalidPropertyValue");
    });
    test("Can upload same file twice", async () => {
        const request = await makeUploadRequest({ file: await fs.promises.readFile(`${__dirname}/../__assets__/test.txt`) });

        const response1 = await transportServices1.files.uploadOwnFile(request);
        const response2 = await transportServices1.files.uploadOwnFile(request);
        expectSuccess(response1);
        expectSuccess(response2);
    });

    test("File description is optional", async () => {
        const response = await transportServices1.files.uploadOwnFile(await makeUploadRequest({ description: "" }));
        expectSuccess(response);
    });

    test("Cannot upload a file with empty expiry date", async () => {
        const response = await transportServices1.files.uploadOwnFile(await makeUploadRequest({ expiresAt: "" }));
        expectError(response, "'expiresAt' must be in the future.", "error.runtime.validation.invalidPropertyValue");
    });
});

describe("Get file", () => {
    test("Can get file by id", async () => {
        const file = await uploadFile(transportServices1);
        const response = await transportServices1.files.getFile({ id: file.id });

        expectSuccess(response);
        expect(response.value).toMatchObject(file);
    });

    test("Accessing not existing file id causes an error", async () => {
        const notPresentFileId = "FILXXXXXXXXXXXXXXXXX";
        const response = await transportServices1.files.getFile({ id: notPresentFileId });
        expectError(response, "File not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });
});

describe("Upload big files", () => {
    test("can not upload a file that is bigger than 10MB", async () => {
        const file = await fs.promises.readFile(`${__dirname}/../__assets__/upload-10+mb.bin`);

        const response = await transportServices1.files.uploadOwnFile(await makeUploadRequest({ content: file }));
        expectError(response, "file content is too large", "error.runtime.validation.invalidPropertyValue");
    });
});

describe("Files query", () => {
    test("Files can be queried by their attributes", async () => {
        const file = await uploadFile(transportServices1);
        const conditions = new QueryParamConditions(file, transportServices1)
            .addDateSet("createdAt")
            .addDateSet("createdBy")
            .addDateSet("createdByDevice")
            .addDateSet("deletedAt")
            .addDateSet("deletedBy")
            .addDateSet("deletedByDevice")
            .addStringSet("description")
            .addDateSet("expiresAt")
            .addStringSet("filename")
            .addNumberSet("filesize")
            .addStringSet("mimetype")
            .addStringSet("title")
            .addBooleanSet("isOwn");

        await conditions.executeTests((c, q) => c.files.getFiles({ query: q }));
    });

    test("Own files can be queried by their attributes", async () => {
        const file = await uploadFile(transportServices1);
        const conditions = new QueryParamConditions(file, transportServices1)
            .addDateSet("createdAt")
            .addDateSet("createdBy")
            .addDateSet("createdByDevice")
            .addDateSet("deletedAt")
            .addDateSet("deletedBy")
            .addDateSet("deletedByDevice")
            .addStringSet("description")
            .addDateSet("expiresAt")
            .addStringSet("filename")
            .addNumberSet("filesize")
            .addStringSet("mimetype")
            .addStringSet("title");

        await conditions.executeTests((c, q) => c.files.getFiles({ query: q, ownerRestriction: OwnerRestriction.Own }));
    });

    test("Peer files can be queried by their attributes", async () => {
        const file = await exchangeFile(transportServices1, transportServices2);
        const conditions = new QueryParamConditions(file, transportServices2)
            .addDateSet("createdAt")
            .addDateSet("createdBy")
            .addDateSet("createdByDevice")
            .addDateSet("deletedAt")
            .addDateSet("deletedBy")
            .addDateSet("deletedByDevice")
            .addStringSet("description")
            .addDateSet("expiresAt")
            .addStringSet("filename")
            .addNumberSet("filesize")
            .addStringSet("mimetype")
            .addStringSet("title");

        await conditions.executeTests((c, q) => c.files.getFiles({ query: q, ownerRestriction: OwnerRestriction.Peer }));
    });
});

describe("Can create token for file", () => {
    let file: FileDTO;

    beforeAll(async () => {
        file = await uploadFile(transportServices1);
    });

    test("Can generate token for uploaded file", async () => {
        const response = await transportServices1.files.createTokenForFile({ fileId: file.id });
        expectSuccess(response);
    });

    test("Can generate token for uploaded file with explicit expiration date", async () => {
        const expiresAt = DateTime.now().plus({ minutes: 5 }).toString();
        const response = await transportServices1.files.createTokenForFile({ fileId: file.id, expiresAt });

        expectSuccess(response);
    });

    test("Cannot generate token for uploaded file with wrong expiration date", async () => {
        const response = await transportServices1.files.createTokenForFile({ fileId: file.id, expiresAt: "invalid date" });

        expectError(response, "expiresAt must match format date-time", "error.runtime.validation.invalidPropertyValue");
    });

    test("Cannot generate token with wrong type of id", async () => {
        const response = await transportServices1.files.createTokenForFile({ fileId: UNKOWN_TOKEN_ID });

        expectError(response, "fileId must match format bkb-file", "error.runtime.validation.invalidPropertyValue");
    });

    test("Cannot generate token for non-existant file", async () => {
        const response = await transportServices1.files.createTokenForFile({ fileId: UNKOWN_FILE_ID });

        expectError(response, "File not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("Cannot generate token for invalid file id", async () => {
        const response = await transportServices1.files.createTokenForFile({ fileId: "INVALID FILE ID" });

        expectError(response, "fileId must match format bkb-file", "error.runtime.validation.invalidPropertyValue");
    });
});

describe("Can create token QR code for file", () => {
    let file: FileDTO;

    beforeAll(async () => {
        file = await uploadFile(transportServices1);
    });

    test("Can generate token for uploaded file", async () => {
        const response = await transportServices1.files.createTokenQrCodeForFile({ fileId: file.id });
        expectSuccess(response);
    });

    test("Can generate token for uploaded file with explicit expiration date", async () => {
        const expiresAt = DateTime.now().plus({ minutes: 5 }).toString();
        const response = await transportServices1.files.createTokenQrCodeForFile({ fileId: file.id, expiresAt });

        expectSuccess(response);
    });

    test("Cannot generate token for uploaded file with wrong expiration date", async () => {
        const response = await transportServices1.files.createTokenQrCodeForFile({ fileId: file.id, expiresAt: "invalid date" });

        expectError(response, "expiresAt must match format date-time", "error.runtime.validation.invalidPropertyValue");
    });
});

describe("Load peer file with token reference", () => {
    let file: FileDTO;

    beforeAll(async () => {
        file = await uploadFile(transportServices1);
    });

    test("Before the peer file is loaded another client cannot access it", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFile({ id: file.id });
        expectError(response, "File not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("Peer file can be loaded with truncated token reference", async () => {
        expect(file).toBeDefined();

        const token = (await transportServices1.files.createTokenForFile({ fileId: file.id })).value;
        const response = await transportServices2.files.loadPeerFile({ reference: token.truncatedReference });

        expectSuccess(response);
        expect(response.value).toMatchObject({ ...file, isOwn: false });
    });

    test("After peer file is loaded the file can be accessed under /Files/{id}", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFile({ id: file.id });
        expectSuccess(response);
        expect(response.value).toMatchObject({ ...file, isOwn: false });
    });

    test("After peer file is loaded it can be accessed under /Files", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFiles({ query: { createdAt: file.createdAt } });
        expectSuccess(response);
        expect(response.value).toContainEqual({ ...file, isOwn: false });
    });

    test("Passing token id as truncated token reference causes an error", async () => {
        const file = await uploadFile(transportServices1);
        const token = (await transportServices1.files.createTokenForFile({ fileId: file.id })).value;

        const response = await transportServices2.files.loadPeerFile({ reference: token.id });
        expectError(response, "reference is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test("Passing file id as truncated token reference causes an error", async () => {
        const file = await uploadFile(transportServices1);

        const response = await transportServices2.files.loadPeerFile({ reference: file.id });
        expectError(response, "reference is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test.each(illegalParameters)("Passing %p as truncated token reference causes an error", async (tokenReference) => {
        const response = await transportServices2.files.loadPeerFile({ reference: tokenReference! });
        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });
});

describe("Load peer file with file id and secret", () => {
    let file: FileDTO;

    beforeAll(async () => {
        file = await uploadFile(transportServices1);
    });

    test("Before the peer file is loaded another client cannot access it", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFile({ id: file.id });
        expectError(response, "File not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("Peer file can be loaded with file id and secret key", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.loadPeerFile({ id: file.id, secretKey: file.secretKey });

        expectSuccess(response);
        expect(response.value).toMatchObject({ ...file, isOwn: false });
    });

    test("After peer file is loaded the file can be accessed under /Files/{id}", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFile({ id: file.id });
        expectSuccess(response);
        expect(response.value).toMatchObject({ ...file, isOwn: false });
    });

    test("After peer file is loaded it can be accessed under /Files", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.getFiles({ query: { createdAt: file.createdAt } });
        expectSuccess(response);
        expect(response.value).toContainEqual({ ...file, isOwn: false });
    });

    test("Passing an unkown file id causes an error", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.loadPeerFile({ id: UNKOWN_FILE_ID, secretKey: file.secretKey });

        expectError(response, "File not found. Make sure the ID exists and the record is not expired.", "error.runtime.recordNotFound");
    });

    test("Passing an unkown token id as file id causes an error", async () => {
        expect(file).toBeDefined();

        const response = await transportServices2.files.loadPeerFile({ id: UNKOWN_TOKEN_ID, secretKey: file.secretKey });

        expectError(response, "id is invalid", "error.runtime.validation.invalidPropertyValue");
    });

    test.each(illegalParameters)("Passing valid file id and %p as secret key", async (secretKey) => {
        const response = await transportServices2.files.loadPeerFile({ id: file.id, secretKey: secretKey! });

        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test.each(illegalParameters)("Passing %p as file id and valid secret key", async (fileId) => {
        const response = await transportServices2.files.loadPeerFile({ id: fileId!, secretKey: file.secretKey });

        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });

    test.each(combinations(illegalParameters, illegalParameters))("Passing %p as file id and %p as secret key", async (fileId, secretKey) => {
        const response = await transportServices2.files.loadPeerFile({ id: fileId!, secretKey: secretKey! });

        expectError(response, "The given combination of properties in the payload is not supported.", "error.runtime.validation.invalidPayload");
    });
});
