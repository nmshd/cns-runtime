import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController } from "@nmshd/consumption";
import { RequestJSON } from "@nmshd/content";
import { CoreId, Message, MessageController, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestReceivedEvent } from "../../../events/consumption/IncomingRequestReceivedEvent";
import { ConsumptionRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface ReceivedIncomingRequestRequest {
    receivedRequest: RequestJSON;

    /**
     * The id of the Message or RelationshipTemplate in which the Response was received.
     * @pattern (MSG|RLT)[A-Za-z0-9]{17}
     */
    requestSourceId: string;
}

export class ReceivedIncomingRequestUseCase extends UseCase<ReceivedIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject private readonly incomingRequestsController: IncomingRequestsController,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly relationshipTemplateController: RelationshipTemplateController,
        @Inject private readonly eventBus: EventBus
    ) {
        super();
    }

    protected async executeInternal(request: ReceivedIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        let requestSourceObject: Message | RelationshipTemplate | undefined;

        if (request.requestSourceId.startsWith("MSG")) {
            requestSourceObject = await this.messageController.getMessage(CoreId.from(request.requestSourceId));

            if (!requestSourceObject) {
                return Result.fail(RuntimeErrors.general.recordNotFound(Message));
            }
        } else {
            requestSourceObject = await this.relationshipTemplateController.getRelationshipTemplate(CoreId.from(request.requestSourceId));

            if (!requestSourceObject) {
                return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
            }
        }

        const consumptionRequest = await this.incomingRequestsController.received({
            // @ts-expect-error // TODO: remove this as soon as the Type Definitions are correct
            receivedRequest: request.receivedRequest,
            requestSourceObject
        });

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(new IncomingRequestReceivedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
