import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.outgoingRequestFromRelationshipCreationChangeCreatedAndCompleted";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent.namespace, eventTargetAddress, data);

        if (!data.isOwn) throw new Error("Cannot create this event for an incoming Request");
    }
}
