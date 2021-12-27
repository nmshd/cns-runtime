import { MatchedAttributesDVO } from "..";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport/IdentityDVO";
import { AttributeDVO } from "./AttributeDVO";

export interface RequestDVO extends DataViewObject {
    // from RequestJSON
    key?: string;
    reason?: string;
    expiresAt?: string;
    impact?: string;
}

export interface AttributesShareRequestDVO extends RequestDVO {
    type: "AttributesShareRequestDVO";

    // override AttributesShareRequestJSON
    attributes: MatchedAttributesDVO[];
    recipients: IdentityDVO[];

    // new
    attributeCount: number;
    recipientCount: number;
    possibleRecipientCount: number;
}

export interface AttributesChangeRequestDVO extends RequestDVO {
    type: "AttributesChangeRequestDVO";

    // override AttributesChangeRequestJSON
    oldAttributes: MatchedAttributesDVO[];
    newAttributes: AttributeDVO[];
    applyTo?: IdentityDVO;
}

export interface AttributesRequestDVO extends RequestDVO {
    type: "AttributesRequestDVO";

    // from AttributesRequestJSON
    names: string[];
    required?: boolean;

    // new
    attributes: MatchedAttributesDVO[];
}

export interface AuthorizationGrantRequestDVO extends RequestDVO {
    type: "AuthorizationGrantRequestDVO";

    // from AuthorizationGrantRequestJSON
    authorizationCode: string;
    authorizationDescription?: string;
    authorizationTitle: string;
    authorizationExpiresAt?: string;
}

export interface ChallengeRequestDVO extends RequestDVO {
    type: "ChallengeRequestDVO";

    // from ChallengeRequestJSON
    expiresAt: string;
    createdBy?: IdentityDVO;
    createdByDevice?: string;

    // override ChallengeRequestJSON
    challengeType: string;
}
