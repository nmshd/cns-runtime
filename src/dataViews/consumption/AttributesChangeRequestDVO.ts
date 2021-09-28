import { AttributesChangeRequestJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport/IdentityDVO";
import { AttributeDVO } from "./AttributeDVO";

export interface AttributesChangeRequestDVOProperties extends AttributesChangeRequestJSON {
    attributeObjects: AttributeDVO[];
    applyToObject?: IdentityDVO;
}

export interface AttributesChangeRequestDVO extends DataViewObject {
    request: AttributesChangeRequestDVOProperties;
}
