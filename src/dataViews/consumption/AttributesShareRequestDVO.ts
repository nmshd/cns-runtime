import { AttributesShareRequestJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport/IdentityDVO";
import { AttributeDVO } from "./AttributeDVO";

export interface AttributesShareRequestDVOProperties extends AttributesShareRequestJSON {
    attributeObjects: AttributeDVO[];
    recipientObjects: IdentityDVO[];
    relationshipCount: number;
}

export interface AttributesShareRequestDVO extends DataViewObject {
    request: AttributesShareRequestDVOProperties;
}
