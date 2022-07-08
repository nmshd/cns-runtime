import { DataViewObject } from "../DataViewObject";
import { RequestItemDVO, RequestItemGroupDVO } from "./RequestItemDVOs";

export interface RequestDVO extends DataViewObject {
    type: "RequestDVO";
    expiresAt?: string;
    items: (RequestItemGroupDVO | RequestItemDVO)[];
}
