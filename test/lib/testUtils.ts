import { sleep } from "@js-soft/ts-utils";
import fs from "fs";
import { DateTime } from "luxon";
import { CoreServices, FileDTO, MessageDTO, RelationshipDTO, RelationshipTemplateDTO, SyncEverythingResponse, TokenDTO, UploadOwnFileRequest } from "../../src";
import { expectSuccess } from "./validation";

export async function syncUntil(coreServices: CoreServices, until: (syncResult: SyncEverythingResponse) => boolean): Promise<SyncEverythingResponse> {
    const { messages, relationships } = (await coreServices.account.syncEverything()).value;
    const syncResult: SyncEverythingResponse = { messages: [...messages], relationships: [...relationships] };

    let iterationNumber = 0;
    while (!until(syncResult) && iterationNumber < 10) {
        await sleep(20);
        const newSyncResult = (await coreServices.account.syncEverything()).value;
        syncResult.messages.push(...newSyncResult.messages);
        syncResult.relationships.push(...newSyncResult.relationships);
        iterationNumber++;
    }
    return syncResult;
}

export async function syncUntilHasRelationships(coreServices: CoreServices, expectedNumberOfRelationships = 1): Promise<RelationshipDTO[]> {
    const syncResult = await syncUntil(coreServices, (syncResult) => syncResult.relationships.length >= expectedNumberOfRelationships);
    return syncResult.relationships;
}

export async function syncUntilHasMessages(coreServices: CoreServices, expectedNumberOfMessages = 1): Promise<MessageDTO[]> {
    const syncResult = await syncUntil(coreServices, (syncResult) => syncResult.messages.length >= expectedNumberOfMessages);
    return syncResult.messages;
}

export async function uploadOwnToken(coreServices: CoreServices): Promise<TokenDTO> {
    const response = await coreServices.tokens.createOwnToken({
        content: {
            content: "Hello"
        },
        expiresAt: DateTime.utc().plus({ days: 1 }).toString(),
        ephemeral: false
    });

    expectSuccess(response);

    return response.value;
}

export async function uploadFile(coreServices: CoreServices): Promise<FileDTO> {
    const response = await coreServices.files.uploadOwnFile(await makeUploadRequest());

    expectSuccess(response);

    return response.value;
}

// Override the default upload request with values
export async function makeUploadRequest(values: object = {}): Promise<UploadOwnFileRequest> {
    return {
        title: "File Title",
        filename: "test.txt",
        content: await fs.promises.readFile(`${__dirname}/../__assets__/test.txt`),
        mimetype: "text/plain",
        description: "This is a valid file description",
        expiresAt: DateTime.utc().plus({ minutes: 5 }).toString(),
        ...values
    };
}

export async function createTemplate(coreServices: CoreServices): Promise<RelationshipTemplateDTO> {
    const response = await coreServices.relationshipTemplates.createOwnRelationshipTemplate({
        maxNumberOfRelationships: 1,
        expiresAt: DateTime.utc().plus({ minutes: 10 }).toString(),
        content: { a: "b" }
    });

    expectSuccess(response);

    return response.value;
}

export async function getTemplateToken(coreServices: CoreServices): Promise<TokenDTO> {
    const template = await createTemplate(coreServices);

    const response = await coreServices.relationshipTemplates.createTokenForOwnTemplate({ templateId: template.id });
    expectSuccess(response);

    return response.value;
}

export async function getFileToken(coreServices: CoreServices): Promise<TokenDTO> {
    const file = await uploadFile(coreServices);

    const response = await coreServices.files.createTokenForFile({ fileId: file.id });
    expectSuccess(response);

    return response.value;
}

export async function exchangeTemplate(coreServicesCreator: CoreServices, coreServicesRecpipient: CoreServices): Promise<RelationshipTemplateDTO> {
    const templateToken = await getTemplateToken(coreServicesCreator);

    const response = await coreServicesRecpipient.relationshipTemplates.loadPeerRelationshipTemplate({
        reference: templateToken.truncatedReference
    });
    expectSuccess(response);

    return response.value;
}

export async function exchangeFile(coreServicesCreator: CoreServices, coreServicesRecpipient: CoreServices): Promise<FileDTO> {
    const fileToken = await getFileToken(coreServicesCreator);

    const response = await coreServicesRecpipient.files.loadPeerFile({ reference: fileToken.truncatedReference });
    expectSuccess(response);

    return response.value;
}

export async function exchangeToken(coreServicesCreator: CoreServices, coreServicesRecpipient: CoreServices): Promise<TokenDTO> {
    const token = await uploadOwnToken(coreServicesCreator);

    const response = await coreServicesRecpipient.tokens.loadPeerToken({
        reference: token.truncatedReference,
        ephemeral: false
    });
    expectSuccess(response);

    return response.value;
}

export async function sendMessage(coreServices: CoreServices, recipient: string): Promise<MessageDTO> {
    const response = await coreServices.messages.sendMessage({
        recipients: [recipient],
        content: {
            "@type": "Mail",
            subject: "This is the mail subject",
            body: "This is the mail body",
            cc: [],
            to: [recipient]
        }
    });
    expectSuccess(response);

    return response.value;
}

export async function exchangeMessage(coreServices1: CoreServices, coreServices2: CoreServices): Promise<MessageDTO> {
    const coreService2Address = (await getRelationship(coreServices1)).peer;
    const messageId = (await sendMessage(coreServices1, coreService2Address)).id;
    const messages = await syncUntilHasMessages(coreServices2);
    expect(messages).toHaveLength(1);

    const message = messages[0];
    expect(message.id).toStrictEqual(messageId);

    return message;
}

export async function getRelationship(coreServices: CoreServices): Promise<RelationshipDTO> {
    const response = await coreServices.relationships.getRelationships({});

    expectSuccess(response);
    expect(response.value).toHaveLength(1);

    return response.value[0];
}

export async function establishRelationship(coreServices1: CoreServices, coreServices2: CoreServices): Promise<void> {
    const template = await exchangeTemplate(coreServices1, coreServices2);

    const createRelationshipResponse = await coreServices2.relationships.createRelationship({
        templateId: template.id,
        content: { a: "b" }
    });
    expectSuccess(createRelationshipResponse);

    const relationships = await syncUntilHasRelationships(coreServices1);
    expect(relationships).toHaveLength(1);

    const acceptResponse = await coreServices1.relationships.acceptRelationshipChange({
        relationshipId: relationships[0].id,
        changeId: relationships[0].changes[0].id,
        content: { a: "b" }
    });
    expectSuccess(acceptResponse);

    const relationships2 = await syncUntilHasRelationships(coreServices2);
    expect(relationships2).toHaveLength(1);
}

/**
 * Generate all possible combinations of the given arrays.
 *
 * combinations([1, 2], [a, b]) => [[1, a], [1, b], [2, a], [2, b]]
 *
 * Special Case: If only one array is given, it returns a list of lists with only the elements of the array
 *
 * combinations([1, 2]) => [[1], [2]]
 *
 * Strictly speaking this is not correct, since the combinations of an array with nothing should be nothing []
 * but in our case this makes more sense
 *
 * Beware: this contains recursion
 */
export function combinations<T>(...arrays: T[][]): T[][] {
    if (arrays.length < 1) {
        throw new Error("you must enter at least one array");
    }

    const firstArray = arrays[0];
    if (arrays.length === 1) {
        // Wrap every element in a list
        // This is neccessary because we want to return [[1], [2]] and not [[1, 2]] or [1, 2]
        return firstArray.map((x) => [x]);
    }

    const [firstArr, secondArr, ...allOtherArrs] = arrays;

    const result = [];
    // Combine the elements of the first array with all combinations of the other arrays
    for (const elem of firstArr) {
        for (const combination of combinations(secondArr, ...allOtherArrs)) {
            result.push([elem, ...combination]);
        }
    }
    return result;
}
