import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController, LocalRequestStatus } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events";
import { LocalRequestDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CheckPrerequisitesOfIncomingRequestRequest {
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestId: string;
}

class Validator extends SchemaValidator<CheckPrerequisitesOfIncomingRequestRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CheckPrerequisitesOfIncomingRequestRequest"));
    }
}

export class CheckPrerequisitesOfIncomingRequestUseCase extends UseCase<CheckPrerequisitesOfIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject validator: Validator, @Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super(validator);
    }

    protected async executeInternal(request: CheckPrerequisitesOfIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const localRequest = await this.incomingRequestsController.checkPrerequisites({
            requestId: CoreId.from(request.requestId)
        });

        const dto = RequestMapper.toLocalRequestDTO(localRequest);

        if (localRequest.status === LocalRequestStatus.DecisionRequired) {
            this.eventBus.publish(
                new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                    request: dto,
                    oldStatus: LocalRequestStatus.Open,
                    newStatus: dto.status
                })
            );
        }

        return Result.ok(dto);
    }
}
