import { DataViewObject } from "../DataViewObject";
import { AttributeQueryDVO, DraftAttributeDVO } from "./AttributeDVOs";

export interface RequestItemGroupDVO {
    type: "RequestItemGroupDVO";
    items: RequestItemDVO[];
}

export interface RequestItemDVO extends DataViewObject {
    mustBeAccepted: boolean;
    isDecidable: boolean;
}

export interface ReadAttributeRequestItemDVO extends RequestItemDVO {
    type: "ReadAttributeRequestItemDVO";
    query: AttributeQueryDVO;
}

export interface ProposeAttributeRequestItemDVO extends RequestItemDVO {
    type: "ProposeAttributeRequestItemDVO";
    query: AttributeQueryDVO;
    attribute: DraftAttributeDVO;
}

export interface CreateAttributeRequestItemDVO extends RequestItemDVO {
    type: "CreateAttributeRequestItemDVO";
    attribute: DraftAttributeDVO;
    sourceAttributeId?: string;
}
