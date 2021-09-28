export class DataViewTranslateable {
    public static readonly prefix: string = "i18n://";
    public static readonly core = {
        messageName: `${DataViewTranslateable.prefix}message.name`,
        relationshipOutgoing: `${DataViewTranslateable.prefix}relationship.name`,
        relationshipIncoming: `${DataViewTranslateable.prefix}relationship.incoming`,
        relationshipRejected: `${DataViewTranslateable.prefix}relationship.outgoing`,
        relationshipRevoked: `${DataViewTranslateable.prefix}relationship.revoked`,
        relationshipActive: `${DataViewTranslateable.prefix}relationship.active`,
        fileName: `${DataViewTranslateable.prefix}file.name`
    };

    public static readonly consumption = {
        attributes: {
            unknownAttributeName: `${DataViewTranslateable.prefix}attributes.UnknownAttributeName`
        },
        requests: {
            // Request for sharing an attribute
            attributesShareRequestName: `${DataViewTranslateable.prefix}requests.AttributesShareRequest.name`,
            // Request for sharing multiple attributes
            attributesShareRequestNamePlural: `${DataViewTranslateable.prefix}requests.AttributesShareRequest.namePlural`,
            // You don't have a relationship to any of the recipients of this request
            attributesShareRequestNoRelationship: `${DataViewTranslateable.prefix}requests.AttributesShareRequest.noRelationship`,
            // The data is only shared with known recipients
            attributesShareRequestOnlyRelationships: `${DataViewTranslateable.prefix}requests.AttributesShareRequest.onlyRelationships`,
            // Request for changing an attribute
            attributesChangeRequestName: `${DataViewTranslateable.prefix}requests.AttributesChangeRequest.name`,
            // Request for changing multiple attributes
            attributesChangeRequestNamePlural: `${DataViewTranslateable.prefix}requests.AttributesChangeRequest.namePlural`
        },
        identities: {
            self: `${DataViewTranslateable.prefix}identities.self.name`
        }
    };
}
