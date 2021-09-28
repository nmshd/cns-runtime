import { AttributesShareRequestJSON } from "@nmshd/content";
import { IdentityDVO } from "../core/IdentityDVO";
import { DataViewObject } from "../DataViewObject";
import { AttributeDVO } from "./AttributeDVO";

export interface AttributesShareRequestDVOProperties extends AttributesShareRequestJSON {
    attributeObjects: AttributeDVO[];
    recipientObjects: IdentityDVO[];
    relationshipCount: number;
}

export interface AttributesShareRequestDVO extends DataViewObject {
    request: AttributesShareRequestDVOProperties;
}
