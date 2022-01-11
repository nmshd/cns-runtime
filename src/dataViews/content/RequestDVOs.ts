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

    /**
     * An array of matched attributes for each received attribute which
     * were sent. It is to be decided if no, one, multiple or all of these
     * matched attributes should be overwritten by the change.
     */
    oldAttributes: MatchedAttributesDVO[];
    oldAttributeCount: number;

    /**
     * The array of new attribute values which should be stored for the identity.
     */
    newAttributes: AttributeDVO[];
    newAttributeCount: number;

    /**
     * The same data as oldAttributes and newAttributes but combined in one
     * array.
     */
    changes: AttributeChange[];
    changeCount: number;
    applyTo?: IdentityDVO;
}

export interface AttributeChange {
    oldAttribute: MatchedAttributesDVO;
    newAttribute: AttributeDVO;
}

export interface AttributesRequestDVO extends RequestDVO {
    type: "AttributesRequestDVO";

    // from AttributesRequestJSON
    names: string[];
    nameCount: number;
    required?: boolean;

    // new
    attributes: MatchedAttributesDVO[];
    attributeCount: number;
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
