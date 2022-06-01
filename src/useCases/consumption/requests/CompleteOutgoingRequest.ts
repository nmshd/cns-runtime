import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, ICompleteOugoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { Response, ResponseJSON } from "@nmshd/content";
import { CoreId, Message, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { OutgoingRequestStatusChangedEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CompleteOutgoingRequestRequest {
    receivedResponse: ResponseJSON;

    /**
     * @pattern MSG[A-Za-z0-9]{17}
     */
    messageId: string;
}

class Validator extends SchemaValidator<CompleteOutgoingRequestRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CompleteOutgoingRequestRequest"));
    }
}

export class CompleteOutgoingRequestUseCase extends UseCase<CompleteOutgoingRequestRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject validator: Validator,
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly eventBus: EventBus
    ) {
        super(validator);
    }

    protected async executeInternal(request: CompleteOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const message = await this.messageController.getMessage(CoreId.from(request.messageId));

        if (!message) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Message));
        }

        const params: ICompleteOugoingRequestParameters = {
            requestId: CoreId.from(request.receivedResponse.requestId),
            receivedResponse: Response.fromAny(request.receivedResponse),
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
