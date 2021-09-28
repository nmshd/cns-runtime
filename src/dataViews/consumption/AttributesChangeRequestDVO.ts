import { AttributesChangeRequestJSON } from "@nmshd/content";
import { IdentityDVO } from "../core/IdentityDVO";
import { DataViewObject } from "../DataViewObject";
import { AttributeDVO } from "./AttributeDVO";

export interface AttributesChangeRequestDVOProperties extends AttributesChangeRequestJSON {
    attributeObjects: AttributeDVO[];
    applyToObject?: IdentityDVO;
}

export interface AttributesChangeRequestDVO extends DataViewObject {
    request: AttributesChangeRequestDVOProperties;
}
