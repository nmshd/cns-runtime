import { DataViewObject } from "../DataViewObject";
import { RelationshipDVOProperties } from "./RelationshipDVO";

export interface IdentityDVOProperties {
    initials: string;
    statusText: string;
}

export interface OrganizationProperties extends IdentityDVOProperties {
    isOrganization: true;
    legalName: string;
}

export interface PersonProperties extends IdentityDVOProperties {
    isPerson: true;
    givenName: string;
    familyName: string;
    salutation: string;
}

export interface IdentityDVO extends DataViewObject {
    isSelf: boolean;
    identity: OrganizationProperties | PersonProperties;
    relationship?: RelationshipDVOProperties;
}
