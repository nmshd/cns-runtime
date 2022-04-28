import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ISentOutgoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreId, Message, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RequestSentEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface SentOutgoingRequestRequest {
    requestId: string;

    /**
     * The id of the Message in which the Request was sent.
     */
    messageId: string;
}

export class SentOutgoingRequestUseCase extends UseCase<SentOutgoingRequestRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly eventBus: EventBus
    ) {
        super();
    }

    protected async executeInternal(request: SentOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const message = await this.messageController.getMessage(CoreId.from(request.messageId));

        if (!message) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Message));
        }

        const params: ISentOutgoingRequestParameters = {
            requestId: CoreId.from(request.requestId),
            requestSourceObject: message
        };

        const consumptionRequest = await this.outgoingRequestsController.sent(params);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(new RequestSentEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
