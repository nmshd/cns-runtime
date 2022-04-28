import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, ICompleteOugoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { ResponseJSON } from "@nmshd/content";
import { CoreId, Message, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { OutgoingRequestStatusChangedEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CompleteOutgoingRequestRequest {
    requestId: string;

    receivedResponse: ResponseJSON;

    /**
     * The id of the Message in which the Response was received.
     */
    messageId: string;
}

export class CompleteOutgoingRequestUseCase extends UseCase<CompleteOutgoingRequestRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly eventBus: EventBus
    ) {
        super();
    }

    protected async executeInternal(request: CompleteOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const message = await this.messageController.getMessage(CoreId.from(request.messageId));

        if (!message) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Message));
        }

        const params: ICompleteOugoingRequestParameters = {
            requestId: CoreId.from(request.requestId),
            // @ts-expect-error // TODO: TIMO: remove this as soon as the Type Definitions are correct
            receivedResponse: request.receivedResponse,
            responseSourceObject: message
        };

        const consumptionRequest = await this.outgoingRequestsController.complete(params);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(
            new OutgoingRequestStatusChangedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, {
                oldStatus: ConsumptionRequestStatus.Open,
                newStatus: dto.status,
                request: dto
            })
        );

        return Result.ok(dto);
    }
}
