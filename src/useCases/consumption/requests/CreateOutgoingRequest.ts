import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { IRequest, RequestJSON } from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { OutgoingRequestCreatedEvent } from "../../../events";
import { LocalRequestDTO } from "../../../types";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CreateOutgoingRequestRequest {
    content: Omit<RequestJSON | IRequest, "id" | "@type" | "@version">;
    /**
     * @pattern id1[A-Za-z0-9]{32,33}
     */
    peer: string;
}

export class CreateOutgoingRequestUseCase extends UseCase<CreateOutgoingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly outgoingRequestsController: OutgoingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: CreateOutgoingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const params: ICreateOutgoingRequestParameters = {
            // @ts-expect-error // TODO: remove this as soon as the Type Definitions are correct
            content: request.content,
            peer: CoreAddress.from(request.peer)
        };

        const localRequest = await this.outgoingRequestsController.create(params);

        const dto = RequestMapper.toLocalRequestDTO(localRequest);

        this.eventBus.publish(new OutgoingRequestCreatedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
