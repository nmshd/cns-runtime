import { RelationshipChangeStatus, RelationshipChangeType } from "@nmshd/transport";
import { LocalAttributeDVO } from "../consumption";
import { DataViewObject } from "../DataViewObject";

export enum RelationshipDirection {
    Outgoing = "Outgoing",
    Incoming = "Incoming"
}

export interface RelationshipDVO extends DataViewObject {
    type: "RelationshipDVO";
    status: string;
    direction: string;
    statusText: string;
    isPinned: boolean;
    theme?: RelationshipTheme;
    changes: RelationshipChangeDVO[];
    changeCount: number;
    items: LocalAttributeDVO[];
    attributeMap: Record<string, undefined | LocalAttributeDVO[]>;
    nameMap: Record<string, undefined | string>;
}

export interface RelationshipTheme {
    image?: string;
    headerImage?: string;
    backgroundColor?: string;
    foregroundColor?: string;
}

export interface RelationshipChangeDVO extends DataViewObject {
    type: "RelationshipChangeDVO";
    request: RelationshipChangeRequestDVO;
    response?: RelationshipChangeResponseDVO;
    status: RelationshipChangeStatus;
    statusText: string;
    changeType: RelationshipChangeType;
    changeTypeText: string;
    isOwn: boolean;
}

export interface RelationshipChangeRequestDVO extends DataViewObject {
    type: "RelationshipChangeRequestDVO";
    createdBy: string;
    createdByDevice: string;
    createdAt: string;
    content?: unknown;
}

export interface RelationshipChangeResponseDVO extends DataViewObject {
    type: "RelationshipChangeResponseDVO";
    createdBy: string;
    createdByDevice: string;
    createdAt: string;
    content?: unknown;
}
