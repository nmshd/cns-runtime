import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { CachedMessage, Message, MessageController, MessageEnvelopeRecipient } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { MessageDTO, RecipientDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { MessageMapper } from "./MessageMapper";

export interface GetMessagesRequest {
    query?: any;
}

class GetMessagesRequestValidator extends RuntimeValidator<GetMessagesRequest> {
    public constructor() {
        super();

        // TODO: JSSNMSHDD-2470 (add validation)
    }
}

export class GetMessagesUseCase extends UseCase<GetMessagesRequest, MessageDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<MessageDTO>((m) => m.createdBy)]: true,
            [nameof<MessageDTO>((m) => m.createdByDevice)]: true,
            [nameof<MessageDTO>((m) => m.createdAt)]: true,
            [`${nameof<MessageDTO>((m) => m.recipients)}.${nameof<RecipientDTO>((r) => r.address)}`]: true,
            [`${nameof<MessageDTO>((m) => m.content)}.@type`]: true,
            [`${nameof<MessageDTO>((m) => m.content)}.body`]: true,
            [`${nameof<MessageDTO>((m) => m.content)}.subject`]: true,
            [nameof<MessageDTO>((m) => m.attachments)]: true,
            [nameof<MessageDTO>((m) => m.relationshipIds)]: true,
            participant: true
        },

        alias: {
            [nameof<MessageDTO>((m) => m.createdBy)]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.createdBy)}`,
            [nameof<MessageDTO>((m) => m.createdByDevice)]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.createdByDevice)}`,
            [nameof<MessageDTO>((m) => m.createdAt)]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.createdAt)}`,
            [`${nameof<MessageDTO>((m) => m.recipients)}.${nameof<RecipientDTO>((r) => r.address)}`]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>(
                (m) => m.recipients
            )}.${nameof<MessageEnvelopeRecipient>((r) => r.address)}`,
            [`${nameof<MessageDTO>((m) => m.content)}.@type`]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.content)}.@type`,
            [`${nameof<MessageDTO>((m) => m.content)}.body`]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.content)}.body`,
            [`${nameof<MessageDTO>((m) => m.content)}.subject`]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.content)}.subject`,
            [nameof<MessageDTO>((m) => m.attachments)]: `${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.attachments)}`
        },

        custom: {
            relationshipIds: (query: any, input: any) => {
                query["relationshipIds"] = {
                    $contains: input
                };
            },
            participant: (query: any, input: any) => {
                let participantQuery: any;

                if (Array.isArray(input)) {
                    if (input.length === 0) {
                        return;
                    }

                    participantQuery = {};

                    for (const value of input) {
                        const parsed: { field: string; value: any } = GetMessagesUseCase.queryTranslator.parseString(value, true);

                        switch (parsed.field) {
                            case "$in":
                            case "$nin":
                                participantQuery[parsed.field] = participantQuery[parsed.field] || [];
                                participantQuery[parsed.field].push(parsed.value);
                                break;
                            default:
                                participantQuery[parsed.field] = parsed.value;
                        }
                    }
                } else {
                    participantQuery = GetMessagesUseCase.queryTranslator.parseStringVal(input);
                }

                query["$or"] = [
                    {
                        [`${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.createdBy)}`]: participantQuery
                    },
                    {
                        [`${nameof<Message>((m) => m.cache)}.${nameof<CachedMessage>((m) => m.recipients)}.${nameof<MessageEnvelopeRecipient>((r) => r.address)}`]: participantQuery
                    }
                ];
            }
        }
    });

    public constructor(@Inject private readonly messageController: MessageController, @Inject validator: GetMessagesRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetMessagesRequest): Promise<Result<MessageDTO[]>> {
        const query = GetMessagesUseCase.queryTranslator.parse(request.query);

        const messages = await this.messageController.getMessages(query);

        return Result.ok(MessageMapper.toMessageDTOList(messages));
    }
}
