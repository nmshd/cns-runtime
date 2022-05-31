import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface ConsumptionRequestDVO extends DataViewObject {
    isOwn: boolean;
    createdAt: string;
    content: RequestJSON;
    status: ConsumptionRequestStatus;

    peer: IdentityDVO;
    response?: ConsumptionResponseDVO;
    source?: ConsumptionRequestSourceDVO;
}

export interface ConsumptionRequestSourceDVO {
    type: "Message" | "RelationshipTemplate";
    reference: string;
}

export interface ConsumptionResponseDVO extends DataViewObject {
    createdAt: string;
    content: ResponseJSON;
    source?: ConsumptionResponseSourceDVO;
}

export interface ConsumptionResponseSourceDVO {
    type: "Message" | "RelationshipChange";
    reference: string;
}
