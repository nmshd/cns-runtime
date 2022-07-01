import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ISentOutgoingRequestParameters, LocalRequestStatus, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreId, Message, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { OutgoingRequestStatusChangedEvent } from "../../../events";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface SentOutgoingRequestRequest {
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestId: string;

    /**
     * @pattern MSG[A-Za-z0-9]{17}
     */
    messageId: string;
}

export class SentOutgoingRequestUseCase extends UseCase<SentOutgoingRequestRequest, LocalRequestDTO> {
    public constructor(
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly eventBus: EventBus
    ) {
        super();
    }

    protected async executeInternal(request: SentOutgoingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const message = await this.messageController.getMessage(CoreId.from(request.messageId));

        if (!message) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Message));
        }

        const params: ISentOutgoingRequestParameters = {
            requestId: CoreId.from(request.requestId),
            requestSourceObject: message
        };

        const consumptionRequest = await this.outgoingRequestsController.sent(params);

        const dto = RequestMapper.toLocalRequestDTO(consumptionRequest);

        this.eventBus.publish(
            new OutgoingRequestStatusChangedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, {
                request: dto,
                oldStatus: LocalRequestStatus.Draft,
                newStatus: dto.status
            })
        );

        return Result.ok(dto);
    }
}
