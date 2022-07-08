import { LocalRequestStatus } from "@nmshd/consumption";
import { ResponseJSON } from "@nmshd/content";
import { RequestDVO, RequestItemDVO, RequestItemGroupDVO } from "../content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface LocalRequestDVO extends DataViewObject {
    isOwn: boolean;
    createdAt: string;
    content: RequestDVO;
    status: LocalRequestStatus;
    statusText: string;
    createdBy: IdentityDVO;
    peer: IdentityDVO;
    response?: LocalResponseDVO;
    source?: LocalRequestSourceDVO;
    decider: IdentityDVO;
    isDecidable: boolean;
    items: (RequestItemDVO | RequestItemGroupDVO)[];
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
