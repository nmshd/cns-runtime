import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { IRequest, RequestJSON } from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RequestCreatedEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CreateOutgoingRequestRequest {
    content: Omit<RequestJSON | IRequest, "id" | "@type" | "@version">;
    peer: string;
}

export class CreateOutgoingRequestUseCase extends UseCase<CreateOutgoingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly outgoingRequestsController: OutgoingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: CreateOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const params: ICreateOutgoingRequestParameters = {
            // @ts-expect-error // TODO: TIMO: remove this as soon as the Type Definitions are correct
            content: request.content,
            peer: CoreAddress.from(request.peer)
        };

        const consumptionRequest = await this.outgoingRequestsController.create(params);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(new RequestCreatedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
