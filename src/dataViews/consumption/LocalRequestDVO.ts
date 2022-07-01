import { LocalRequestStatus } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface LocalRequestDVO extends DataViewObject {
    isOwn: boolean;
    createdAt: string;
    content: RequestJSON;
    status: LocalRequestStatus;

    peer: IdentityDVO;
    response?: LocalResponseDVO;
    source?: LocalRequestSourceDVO;
}

export interface LocalRequestSourceDVO {
    type: "Message" | "RelationshipTemplate";
    reference: string;
}

export interface LocalResponseDVO extends DataViewObject {
    createdAt: string;
    content: ResponseJSON;
    source?: LocalResponseSourceDVO;
}

export interface LocalResponseSourceDVO {
    type: "Message" | "RelationshipChange";
    reference: string;
}
