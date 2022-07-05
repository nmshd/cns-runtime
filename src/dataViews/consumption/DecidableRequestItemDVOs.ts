import { RequestItemDVO } from "../content";
import { DraftAttributeDVO } from "../content/AttributeDVOs";
import { ProcessedAttributeQueryDVO } from "./LocalAttributeDVO";

export interface DecidableRequestItemGroupDVO {
    type: "RequestItemGroupDVO";
    items: RequestItemDVO[];
    isDecidable: boolean;
}

export interface DecidableRequestItemDVO extends RequestItemDVO {}

export interface DecidableReadAttributeRequestItemDVO extends DecidableRequestItemDVO {
    type: "DecidableReadAttributeRequestItemDVO";
    query: ProcessedAttributeQueryDVO;
}

export interface DecidableProposeAttributeRequestItemDVO extends DecidableRequestItemDVO {
    type: "DecidableProposeAttributeRequestItemDVO";
    query: ProcessedAttributeQueryDVO;
    attribute: DraftAttributeDVO;
}

export interface DecidableCreateAttributeRequestItemDVO extends DecidableRequestItemDVO {
    type: "DecidableCreateAttributeRequestItemDVO";
    attribute: DraftAttributeDVO;
    sourceAttributeId?: string;
}
