import { DataViewObject } from "../DataViewObject";
import { RelationshipDVO } from "./RelationshipDVO";

export interface IdentityDVOInternal extends DataViewObject {
    publicKey?: string;
    realm: string;
    initials: string;
    isSelf: boolean;
    hasRelationship: boolean;
    relationship?: RelationshipDVO;
}

export interface IdentityDVO extends IdentityDVOInternal {
    type: "IdentityDVO";
}
