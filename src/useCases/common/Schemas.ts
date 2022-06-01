export const LoadPeerTokenAnonymousByIdAndKeyRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerTokenAnonymousByIdAndKeyRequest",
    "definitions": {
        "LoadPeerTokenAnonymousByIdAndKeyRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "secretKey": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "secretKey"
            ],
            "additionalProperties": false
        }
    }
}

export const LoadPeerTokenAnonymousByTruncatedReferenceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerTokenAnonymousByTruncatedReferenceRequest",
    "definitions": {
        "LoadPeerTokenAnonymousByTruncatedReferenceRequest": {
            "type": "object",
            "properties": {
                "reference": {
                    "type": "string"
                }
            },
            "required": [
                "reference"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateAttributeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateAttributeRequest",
    "definitions": {
        "CreateAttributeRequest": {
            "type": "object",
            "properties": {
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/ExtendedIdentityAttributeJSON"
                        },
                        {
                            "$ref": "#/definitions/ExtendedRelationshipAttributeJSON"
                        }
                    ]
                }
            },
            "required": [
                "content"
            ],
            "additionalProperties": false
        },
        "ExtendedIdentityAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "@type",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "ExtendedRelationshipAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "key": {
                    "type": "string"
                },
                "isTechnical": {
                    "type": "boolean"
                },
                "confidentiality": {
                    "$ref": "#/definitions/RelationshipAttributeConfidentiality"
                }
            },
            "required": [
                "@type",
                "confidentiality",
                "key",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "RelationshipAttributeConfidentiality": {
            "type": "string",
            "enum": [
                "public",
                "private",
                "protected"
            ]
        }
    }
}

export const CreateShareAttributeCopyRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateShareAttributeCopyRequest",
    "definitions": {
        "CreateShareAttributeCopyRequest": {
            "type": "object",
            "properties": {
                "attributeId": {
                    "type": "string",
                    "pattern": "ATT[A-Za-z0-9]{17}"
                },
                "peer": {
                    "type": "string",
                    "pattern": "[a-zA-Z1-9]{35,36}"
                },
                "requestReference": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "attributeId",
                "peer",
                "requestReference"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteAttributeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteAttributeRequest",
    "definitions": {
        "DeleteAttributeRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "ATT[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetAttributeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetAttributeRequest",
    "definitions": {
        "GetAttributeRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "ATT[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetAttributesRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetAttributesRequest",
    "definitions": {
        "GetAttributesRequest": {
            "type": "object",
            "properties": {
                "query": {
                    "$ref": "#/definitions/ConsumptionAttributeQuery"
                }
            },
            "additionalProperties": false
        },
        "ConsumptionAttributeQuery": {
            "type": "object",
            "properties": {
                "attributeType": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "content": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "tags": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "owner": {
                            "type": "string"
                        },
                        "validFrom": {
                            "type": "string"
                        },
                        "validTo": {
                            "type": "string"
                        },
                        "key": {
                            "type": "string"
                        },
                        "isTechnical": {
                            "type": "boolean"
                        },
                        "confidenttiality": {
                            "$ref": "#/definitions/RelationshipAttributeConfidentiality"
                        },
                        "value": {
                            "type": "object",
                            "properties": {
                                "@type": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                },
                "succeeds": {
                    "type": "string"
                },
                "succeededBy": {
                    "type": "string"
                },
                "shareInfo": {
                    "type": "object",
                    "properties": {
                        "requestReference": {
                            "type": "string"
                        },
                        "peer": {
                            "type": "string"
                        },
                        "sourceAttribute": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false
                }
            },
            "additionalProperties": {}
        },
        "RelationshipAttributeConfidentiality": {
            "type": "string",
            "enum": [
                "public",
                "private",
                "protected"
            ]
        }
    }
}

export const SucceedAttributeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/SucceedAttributeRequest",
    "definitions": {
        "SucceedAttributeRequest": {
            "type": "object",
            "properties": {
                "successorContent": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/ExtendedIdentityAttributeJSON"
                        },
                        {
                            "$ref": "#/definitions/ExtendedRelationshipAttributeJSON"
                        }
                    ]
                },
                "succeeds": {
                    "type": "string",
                    "pattern": "ATT[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "successorContent",
                "succeeds"
            ],
            "additionalProperties": false
        },
        "ExtendedIdentityAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "@type",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "ExtendedRelationshipAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "key": {
                    "type": "string"
                },
                "isTechnical": {
                    "type": "boolean"
                },
                "confidentiality": {
                    "$ref": "#/definitions/RelationshipAttributeConfidentiality"
                }
            },
            "required": [
                "@type",
                "confidentiality",
                "key",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "RelationshipAttributeConfidentiality": {
            "type": "string",
            "enum": [
                "public",
                "private",
                "protected"
            ]
        }
    }
}

export const UpdateAttributeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateAttributeRequest",
    "definitions": {
        "UpdateAttributeRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "ATT[A-Za-z0-9]{17}"
                },
                "content": {
                    "anyOf": [
                        {
                            "$ref": "#/definitions/ExtendedIdentityAttributeJSON"
                        },
                        {
                            "$ref": "#/definitions/ExtendedRelationshipAttributeJSON"
                        }
                    ]
                }
            },
            "required": [
                "id",
                "content"
            ],
            "additionalProperties": false
        },
        "ExtendedIdentityAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "@type",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "ExtendedRelationshipAttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "owner": {
                    "type": "string"
                },
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                },
                "value": {
                    "type": "object",
                    "properties": {
                        "@type": {
                            "type": "string"
                        },
                        "@context": {
                            "type": "string"
                        },
                        "@version": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "@type"
                    ]
                },
                "key": {
                    "type": "string"
                },
                "isTechnical": {
                    "type": "boolean"
                },
                "confidentiality": {
                    "$ref": "#/definitions/RelationshipAttributeConfidentiality"
                }
            },
            "required": [
                "@type",
                "confidentiality",
                "key",
                "owner",
                "value"
            ],
            "additionalProperties": false
        },
        "RelationshipAttributeConfidentiality": {
            "type": "string",
            "enum": [
                "public",
                "private",
                "protected"
            ]
        }
    }
}

export const CreateDraftRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateDraftRequest",
    "definitions": {
        "CreateDraftRequest": {
            "type": "object",
            "properties": {
                "content": {},
                "type": {
                    "type": "string"
                }
            },
            "required": [
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteDraftRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteDraftRequest",
    "definitions": {
        "DeleteDraftRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetDraftRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetDraftRequest",
    "definitions": {
        "GetDraftRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetDraftsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetDraftsRequest",
    "definitions": {
        "GetDraftsRequest": {
            "type": "object",
            "properties": {
                "query": {}
            },
            "additionalProperties": false
        }
    }
}

export const UpdateDraftRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateDraftRequest",
    "definitions": {
        "UpdateDraftRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "id",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const AcceptIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/AcceptIncomingRequestRequest",
    "definitions": {
        "AcceptIncomingRequestRequest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "requestId": {
                    "type": "string"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/DecideRequestItemParametersJSON"
                            },
                            {
                                "$ref": "#/definitions/DecideRequestItemGroupParametersJSON"
                            }
                        ]
                    }
                }
            },
            "required": [
                "items",
                "requestId"
            ]
        },
        "DecideRequestItemParametersJSON": {
            "anyOf": [
                {
                    "$ref": "#/definitions/AcceptRequestItemParametersJSON"
                },
                {
                    "$ref": "#/definitions/RejectRequestItemParametersJSON"
                }
            ]
        },
        "AcceptRequestItemParametersJSON": {
            "type": "object",
            "properties": {
                "accept": {
                    "type": "boolean",
                    "const": true
                }
            },
            "required": [
                "accept"
            ],
            "additionalProperties": false
        },
        "RejectRequestItemParametersJSON": {
            "type": "object",
            "properties": {
                "accept": {
                    "type": "boolean",
                    "const": false
                },
                "code": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                }
            },
            "required": [
                "accept"
            ],
            "additionalProperties": false
        },
        "DecideRequestItemGroupParametersJSON": {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/DecideRequestItemParametersJSON"
                    }
                }
            },
            "required": [
                "items"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateOutgoingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateOutgoingRequestRequest",
    "definitions": {
        "CreateOutgoingRequestRequest": {
            "type": "object",
            "properties": {
                "content": {
                    "type": "object",
                    "properties": {
                        "expiresAt": {
                            "anyOf": [
                                {
                                    "type": "string",
                                    "description": "The point in time the request is considered obsolete either technically (e.g. the request is no longer valid or its response is no longer accepted) or from a business perspective (e.g. the request is no longer of interest).",
                                    "default": "undefined - the request won't expire"
                                },
                                {
                                    "$ref": "#/definitions/ICoreDate",
                                    "description": "The point in time the request is considered obsolete either technically (e.g. the request is no longer valid or its response is no longer accepted) or from a business perspective (e.g. the request is no longer of interest).",
                                    "default": "undefined - the request won't expire"
                                }
                            ],
                            "description": "The point in time the request is considered obsolete either technically (e.g. the request is no longer valid or its response is no longer accepted) or from a business perspective (e.g. the request is no longer of interest).",
                            "default": "undefined - the request won't expire"
                        },
                        "items": {
                            "anyOf": [
                                {
                                    "type": "array",
                                    "items": {
                                        "anyOf": [
                                            {
                                                "$ref": "#/definitions/RequestItemGroupJSON"
                                            },
                                            {
                                                "$ref": "#/definitions/RequestItemJSON"
                                            }
                                        ]
                                    },
                                    "description": "The items of the Request. Can be either a single  {@link  RequestItemJSON RequestItem }  or a  {@link  RequestItemGroupJSON RequestItemGroup } , which itself can contain further  {@link  RequestItemJSON RequestItems } ."
                                },
                                {
                                    "type": "array",
                                    "items": {
                                        "anyOf": [
                                            {
                                                "$ref": "#/definitions/IRequestItemGroup"
                                            },
                                            {
                                                "$ref": "#/definitions/IRequestItem"
                                            }
                                        ]
                                    },
                                    "description": "The items of the Request. Can be either a single  {@link  RequestItem RequestItem }  or a  {@link  RequestItemGroup RequestItemGroup } , which itself can contain further  {@link  RequestItem RequestItems } ."
                                }
                            ],
                            "description": "The items of the Request. Can be either a single  {@link  RequestItemJSON RequestItem }  or a  {@link  RequestItemGroupJSON RequestItemGroup } , which itself can contain further  {@link  RequestItemJSON RequestItems } ."
                        },
                        "responseMetadata": {
                            "anyOf": [
                                {
                                    "type": "object",
                                    "description": "This property can be used to add some arbitrary metadata to this request. The content of this property will be copied into the response on the side of the recipient."
                                },
                                {
                                    "type": "object",
                                    "description": "This property can be used to add some arbitrary metadata to this request. The content of this property will be copied into the response on the side of the recipient."
                                }
                            ],
                            "description": "This property can be used to add some arbitrary metadata to this request. The content of this property will be copied into the response on the side of the recipient."
                        },
                        "@context": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "items"
                    ],
                    "additionalProperties": false
                },
                "peer": {
                    "type": "string",
                    "pattern": "id1[A-Za-z0-9]{32,33}"
                }
            },
            "required": [
                "content",
                "peer"
            ],
            "additionalProperties": false
        },
        "ICoreDate": {
            "type": "object",
            "properties": {
                "date": {
                    "type": "string"
                }
            },
            "required": [
                "date"
            ],
            "additionalProperties": false
        },
        "RequestItemGroupJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this group."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this group."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this group. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/RequestItemJSON"
                    },
                    "description": "The items of this group."
                }
            },
            "required": [
                "@type",
                "items",
                "mustBeAccepted"
            ],
            "additionalProperties": false,
            "description": "A RequestItemGroup can be used to group one or more  {@link  RequestItemJSON RequestItems } . This is useful if you want to\n* make sure that the items in the group can only be accepted together\n\n  Example: when sending a `CreateAttributeRequestItem` **and** a `ShareAttributeRequestItem` in a single   Request where the latter one targets an attribute created by the first one, it it should be impossible to   reject the first item, while accepting the second one.\n* visually group items on the UI and give the a common title/description"
        },
        "RequestItemJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this item."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this item."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this item. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not.\n\nCaution: this setting does not take effect in case it is inside of a\n {@link  RequestItemGroupJSON RequestItemGroup } , which is not accepted by the recipient, since a  {@link  RequestItemJSON RequestItem }  can only be accepted if the parent group is accepted as well."
                }
            },
            "required": [
                "@type",
                "mustBeAccepted"
            ],
            "additionalProperties": false
        },
        "IRequestItemGroup": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this group."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this group."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this group. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/IRequestItem"
                    },
                    "description": "The items of this group."
                }
            },
            "required": [
                "mustBeAccepted",
                "items"
            ],
            "additionalProperties": false,
            "description": "A RequestItemGroup can be used to group one or more  {@link  RequestItem RequestItems } . This is useful if you want to\n* make sure that the items in the group can only be accepted together\n\n  Example: when sending a `CreateAttributeRequestItem` **and** a `ShareAttributeRequestItem` in a single   Request where the latter one targets an attribute created by the first one, it it should be impossible to   reject the first item, while accepting the second one.\n* visually group items on the UI and give the a common title/description"
        },
        "IRequestItem": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this item."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this item."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this item. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not.\n\nCaution: this setting does not take effect in case it is inside of a\n {@link  RequestItemGroup RequestItemGroup } , which is not accepted by the recipient, since a  {@link  RequestItem RequestItem }  can only be accepted if the parent group is accepted as well."
                }
            },
            "required": [
                "mustBeAccepted"
            ],
            "additionalProperties": false
        }
    }
}

export const RejectIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/RejectIncomingRequestRequest",
    "definitions": {
        "RejectIncomingRequestRequest": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "requestId": {
                    "type": "string"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/DecideRequestItemParametersJSON"
                            },
                            {
                                "$ref": "#/definitions/DecideRequestItemGroupParametersJSON"
                            }
                        ]
                    }
                }
            },
            "required": [
                "items",
                "requestId"
            ]
        },
        "DecideRequestItemParametersJSON": {
            "anyOf": [
                {
                    "$ref": "#/definitions/AcceptRequestItemParametersJSON"
                },
                {
                    "$ref": "#/definitions/RejectRequestItemParametersJSON"
                }
            ]
        },
        "AcceptRequestItemParametersJSON": {
            "type": "object",
            "properties": {
                "accept": {
                    "type": "boolean",
                    "const": true
                }
            },
            "required": [
                "accept"
            ],
            "additionalProperties": false
        },
        "RejectRequestItemParametersJSON": {
            "type": "object",
            "properties": {
                "accept": {
                    "type": "boolean",
                    "const": false
                },
                "code": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                }
            },
            "required": [
                "accept"
            ],
            "additionalProperties": false
        },
        "DecideRequestItemGroupParametersJSON": {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/DecideRequestItemParametersJSON"
                    }
                }
            },
            "required": [
                "items"
            ],
            "additionalProperties": false
        }
    }
}

export const CheckPrerequisitesOfIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CheckPrerequisitesOfIncomingRequestRequest",
    "definitions": {
        "CheckPrerequisitesOfIncomingRequestRequest": {
            "type": "object",
            "properties": {
                "requestId": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                }
            },
            "required": [
                "requestId"
            ],
            "additionalProperties": false
        }
    }
}

export const CompleteIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CompleteIncomingRequestRequest",
    "definitions": {
        "CompleteIncomingRequestRequest": {
            "type": "object",
            "properties": {
                "requestId": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{17}"
                },
                "responseSourceId": {
                    "type": "string",
                    "pattern": "(MSG|RCH)[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "requestId",
                "responseSourceId"
            ],
            "additionalProperties": false
        }
    }
}

export const CompleteOutgoingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CompleteOutgoingRequestRequest",
    "definitions": {
        "CompleteOutgoingRequestRequest": {
            "type": "object",
            "properties": {
                "requestId": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                },
                "receivedResponse": {
                    "$ref": "#/definitions/ResponseJSON"
                },
                "messageId": {
                    "type": "string",
                    "pattern": "MSG[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "requestId",
                "receivedResponse",
                "messageId"
            ],
            "additionalProperties": false
        },
        "ResponseJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "result": {
                    "$ref": "#/definitions/ResponseResult"
                },
                "requestId": {
                    "type": "string"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/ResponseItemGroupJSON"
                            },
                            {
                                "$ref": "#/definitions/ResponseItemJSON"
                            }
                        ]
                    }
                },
                "metadata": {
                    "type": "object"
                }
            },
            "required": [
                "@type",
                "items",
                "requestId",
                "result"
            ],
            "additionalProperties": false
        },
        "ResponseResult": {
            "type": "string",
            "enum": [
                "Accepted",
                "Rejected"
            ]
        },
        "ResponseItemGroupJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/ResponseItemJSON"
                    }
                },
                "metadata": {
                    "type": "object"
                }
            },
            "required": [
                "@type",
                "items"
            ],
            "additionalProperties": false
        },
        "ResponseItemJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "result": {
                    "$ref": "#/definitions/ResponseItemResult"
                },
                "metadata": {
                    "type": "object"
                }
            },
            "required": [
                "@type",
                "result"
            ],
            "additionalProperties": false
        },
        "ResponseItemResult": {
            "type": "string",
            "enum": [
                "Accepted",
                "Rejected",
                "Error"
            ]
        }
    }
}

export const CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest",
    "definitions": {
        "CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest": {
            "type": "object",
            "properties": {
                "templateId": {
                    "type": "string",
                    "pattern": "RLT[A-Za-z0-9]{17}"
                },
                "relationshipChangeId": {
                    "type": "string",
                    "pattern": "RCH[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "templateId",
                "relationshipChangeId"
            ],
            "additionalProperties": false
        }
    }
}

export const GetIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetIncomingRequestRequest",
    "definitions": {
        "GetIncomingRequestRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetIncomingRequestsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetIncomingRequestsRequest",
    "definitions": {
        "GetIncomingRequestsRequest": {
            "type": "object",
            "properties": {
                "query": {
                    "$ref": "#/definitions/GetIncomingRequestsRequestsQuery"
                }
            },
            "additionalProperties": false
        },
        "GetIncomingRequestsRequestsQuery": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "peer": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                },
                "content": {
                    "type": "object",
                    "properties": {
                        "expiresAt": {
                            "type": "string"
                        },
                        "items": {
                            "type": "object",
                            "properties": {
                                "@type": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                },
                "source": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string"
                        },
                        "reference": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "createdAt": {
                            "type": "string"
                        },
                        "source": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string"
                                },
                                "reference": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        },
                        "content": {
                            "type": "object",
                            "properties": {
                                "result": {
                                    "type": "string"
                                },
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "@type": {
                                            "type": "string"
                                        },
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "@type": {
                                                    "type": "string"
                                                }
                                            },
                                            "additionalProperties": false
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                }
            },
            "additionalProperties": {}
        }
    }
}

export const GetOutgoingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetOutgoingRequestRequest",
    "definitions": {
        "GetOutgoingRequestRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetOutgoingRequestsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetOutgoingRequestsRequest",
    "definitions": {
        "GetOutgoingRequestsRequest": {
            "type": "object",
            "properties": {
                "query": {
                    "$ref": "#/definitions/GetOutgoingRequestsRequestQuery"
                }
            },
            "additionalProperties": false
        },
        "GetOutgoingRequestsRequestQuery": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "peer": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                },
                "content": {
                    "type": "object",
                    "properties": {
                        "expiresAt": {
                            "type": "string"
                        },
                        "items": {
                            "type": "object",
                            "properties": {
                                "@type": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                },
                "source": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string"
                        },
                        "reference": {
                            "type": "string"
                        }
                    },
                    "additionalProperties": false
                },
                "response": {
                    "type": "object",
                    "properties": {
                        "createdAt": {
                            "type": "string"
                        },
                        "source": {
                            "type": "object",
                            "properties": {
                                "type": {
                                    "type": "string"
                                },
                                "reference": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        },
                        "content": {
                            "type": "object",
                            "properties": {
                                "result": {
                                    "type": "string"
                                },
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "@type": {
                                            "type": "string"
                                        },
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "@type": {
                                                    "type": "string"
                                                }
                                            },
                                            "additionalProperties": false
                                        }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "additionalProperties": false
                        }
                    },
                    "additionalProperties": false
                }
            },
            "additionalProperties": {}
        }
    }
}

export const ReceivedIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/ReceivedIncomingRequestRequest",
    "definitions": {
        "ReceivedIncomingRequestRequest": {
            "type": "object",
            "properties": {
                "receivedRequest": {
                    "$ref": "#/definitions/RequestJSON"
                },
                "requestSourceId": {
                    "type": "string",
                    "description": "The id of the Message or RelationshipTemplate in which the Response was received.",
                    "pattern": "(MSG|RLT)[A-Za-z0-9]{14}"
                }
            },
            "required": [
                "receivedRequest",
                "requestSourceId"
            ],
            "additionalProperties": false
        },
        "RequestJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string",
                    "description": "The point in time the request is considered obsolete either technically (e.g. the request is no longer valid or its response is no longer accepted) or from a business perspective (e.g. the request is no longer of interest).",
                    "default": "undefined - the request won't expire"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/RequestItemGroupJSON"
                            },
                            {
                                "$ref": "#/definitions/RequestItemJSON"
                            }
                        ]
                    },
                    "description": "The items of the Request. Can be either a single  {@link  RequestItemJSON RequestItem }  or a  {@link  RequestItemGroupJSON RequestItemGroup } , which itself can contain further  {@link  RequestItemJSON RequestItems } ."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this request. The content of this property will be copied into the response on the side of the recipient."
                }
            },
            "required": [
                "@type",
                "items"
            ],
            "additionalProperties": false
        },
        "RequestItemGroupJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this group."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this group."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this group. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/RequestItemJSON"
                    },
                    "description": "The items of this group."
                }
            },
            "required": [
                "@type",
                "items",
                "mustBeAccepted"
            ],
            "additionalProperties": false,
            "description": "A RequestItemGroup can be used to group one or more  {@link  RequestItemJSON RequestItems } . This is useful if you want to\n* make sure that the items in the group can only be accepted together\n\n  Example: when sending a `CreateAttributeRequestItem` **and** a `ShareAttributeRequestItem` in a single   Request where the latter one targets an attribute created by the first one, it it should be impossible to   reject the first item, while accepting the second one.\n* visually group items on the UI and give the a common title/description"
        },
        "RequestItemJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@context": {
                    "type": "string"
                },
                "@version": {
                    "type": "string"
                },
                "title": {
                    "type": "string",
                    "description": "The human-readable title of this item."
                },
                "description": {
                    "type": "string",
                    "description": "The human-readable description of this item."
                },
                "responseMetadata": {
                    "type": "object",
                    "description": "This property can be used to add some arbitrary metadata to this item. The content of this property will be copied into the response on the side of the recipient, so the sender can use it to identify the group content as they receive the response."
                },
                "mustBeAccepted": {
                    "type": "boolean",
                    "description": "If set to `true`, the recipient has to accept this group if he wants to accept the Request. If set to `false`, the recipient can decide whether he wants to accept it or not.\n\nCaution: this setting does not take effect in case it is inside of a\n {@link  RequestItemGroupJSON RequestItemGroup } , which is not accepted by the recipient, since a  {@link  RequestItemJSON RequestItem }  can only be accepted if the parent group is accepted as well."
                }
            },
            "required": [
                "@type",
                "mustBeAccepted"
            ],
            "additionalProperties": false
        }
    }
}

export const RequireManualDecisionOfIncomingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/RequireManualDecisionOfIncomingRequestRequest",
    "definitions": {
        "RequireManualDecisionOfIncomingRequestRequest": {
            "type": "object",
            "properties": {
                "requestId": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                }
            },
            "required": [
                "requestId"
            ],
            "additionalProperties": false
        }
    }
}

export const SentOutgoingRequestRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/SentOutgoingRequestRequest",
    "definitions": {
        "SentOutgoingRequestRequest": {
            "type": "object",
            "properties": {
                "requestId": {
                    "type": "string",
                    "pattern": "REQ[A-Za-z0-9]{14}"
                },
                "messageId": {
                    "type": "string",
                    "pattern": "MSG[A-Za-z0-9]{17}"
                }
            },
            "required": [
                "requestId",
                "messageId"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateSettingRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateSettingRequest",
    "definitions": {
        "CreateSettingRequest": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string"
                },
                "value": {},
                "reference": {
                    "type": "string"
                },
                "scope": {
                    "type": "string"
                },
                "succeedsAt": {
                    "type": "string"
                },
                "succeedsItem": {
                    "type": "string"
                }
            },
            "required": [
                "key",
                "value"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteSettingRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteSettingRequest",
    "definitions": {
        "DeleteSettingRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetSettingRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSettingRequest",
    "definitions": {
        "GetSettingRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetSettingsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSettingsRequest",
    "definitions": {
        "GetSettingsRequest": {
            "type": "object",
            "properties": {
                "query": {}
            },
            "additionalProperties": false
        }
    }
}

export const UpdateSettingRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateSettingRequest",
    "definitions": {
        "UpdateSettingRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "value": {}
            },
            "required": [
                "id",
                "value"
            ],
            "additionalProperties": false
        }
    }
}

export const RegisterPushNotificationTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/RegisterPushNotificationTokenRequest",
    "definitions": {
        "RegisterPushNotificationTokenRequest": {
            "type": "object",
            "properties": {
                "handle": {
                    "type": "string"
                },
                "installationId": {
                    "type": "string"
                },
                "platform": {
                    "type": "string"
                }
            },
            "required": [
                "handle",
                "installationId",
                "platform"
            ],
            "additionalProperties": false
        }
    }
}

export const SyncDatawalletRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/SyncDatawalletRequest",
    "definitions": {
        "SyncDatawalletRequest": {
            "type": "object",
            "additionalProperties": false
        }
    }
}

export const DownloadFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DownloadFileRequest",
    "definitions": {
        "DownloadFileRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const DownloadAttachmentRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DownloadAttachmentRequest",
    "definitions": {
        "DownloadAttachmentRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "attachmentId": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "attachmentId"
            ],
            "additionalProperties": false
        }
    }
}

export const SyncEverythingRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/SyncEverythingRequest",
    "definitions": {
        "SyncEverythingRequest": {
            "type": "object",
            "additionalProperties": false
        }
    }
}

export const CreateRelationshipChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateRelationshipChallengeRequest",
    "definitions": {
        "CreateRelationshipChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Relationship"
                },
                "relationship": {
                    "type": "string",
                    "pattern": "REL[A-z0-9]{17}"
                }
            },
            "required": [
                "challengeType",
                "relationship"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateIdentityChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateIdentityChallengeRequest",
    "definitions": {
        "CreateIdentityChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Identity"
                }
            },
            "required": [
                "challengeType"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateDeviceChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateDeviceChallengeRequest",
    "definitions": {
        "CreateDeviceChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Device"
                }
            },
            "required": [
                "challengeType"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateChallengeRequest",
    "definitions": {
        "CreateChallengeRequest": {
            "anyOf": [
                {
                    "$ref": "#/definitions/CreateRelationshipChallengeRequest"
                },
                {
                    "$ref": "#/definitions/CreateIdentityChallengeRequest"
                },
                {
                    "$ref": "#/definitions/CreateDeviceChallengeRequest"
                }
            ]
        },
        "CreateRelationshipChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Relationship"
                },
                "relationship": {
                    "type": "string",
                    "pattern": "REL[A-z0-9]{17}"
                }
            },
            "required": [
                "challengeType",
                "relationship"
            ],
            "additionalProperties": false
        },
        "CreateIdentityChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Identity"
                }
            },
            "required": [
                "challengeType"
            ],
            "additionalProperties": false
        },
        "CreateDeviceChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeType": {
                    "type": "string",
                    "const": "Device"
                }
            },
            "required": [
                "challengeType"
            ],
            "additionalProperties": false
        }
    }
}

export const ValidateChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/ValidateChallengeRequest",
    "definitions": {
        "ValidateChallengeRequest": {
            "type": "object",
            "properties": {
                "challengeString": {
                    "type": "string"
                },
                "signature": {
                    "type": "string"
                }
            },
            "required": [
                "challengeString",
                "signature"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateDeviceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateDeviceRequest",
    "definitions": {
        "CreateDeviceRequest": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "isAdmin": {
                    "type": "boolean"
                }
            },
            "additionalProperties": false
        }
    }
}

export const CreateDeviceOnboardingTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateDeviceOnboardingTokenRequest",
    "definitions": {
        "CreateDeviceOnboardingTokenRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteDeviceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteDeviceRequest",
    "definitions": {
        "DeleteDeviceRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetDeviceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetDeviceRequest",
    "definitions": {
        "GetDeviceRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetDeviceOnboardingInfoRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetDeviceOnboardingInfoRequest",
    "definitions": {
        "GetDeviceOnboardingInfoRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const UpdateDeviceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateDeviceRequest",
    "definitions": {
        "UpdateDeviceRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateTokenForFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateTokenForFileRequest",
    "definitions": {
        "CreateTokenForFileRequest": {
            "type": "object",
            "properties": {
                "fileId": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                },
                "expiresAt": {
                    "type": "string",
                    "format": "date-time"
                },
                "ephemeral": {
                    "type": "boolean"
                }
            },
            "required": [
                "fileId"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateTokenQrCodeForFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateTokenQrCodeForFileRequest",
    "definitions": {
        "CreateTokenQrCodeForFileRequest": {
            "type": "object",
            "properties": {
                "fileId": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                },
                "expiresAt": {
                    "type": "string",
                    "format": "date-time"
                }
            },
            "required": [
                "fileId"
            ],
            "additionalProperties": false
        }
    }
}

export const GetFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetFileRequest",
    "definitions": {
        "GetFileRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetFilesRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetFilesRequest",
    "definitions": {
        "GetFilesRequest": {
            "type": "object",
            "properties": {
                "query": {},
                "ownerRestriction": {
                    "$ref": "#/definitions/OwnerRestriction"
                }
            },
            "additionalProperties": false
        },
        "OwnerRestriction": {
            "type": "string",
            "enum": [
                "o",
                "p"
            ]
        }
    }
}

export const LoadPeerFileViaSecretRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerFileViaSecretRequest",
    "definitions": {
        "LoadPeerFileViaSecretRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                },
                "secretKey": {
                    "type": "string",
                    "minLength": 100
                }
            },
            "required": [
                "id",
                "secretKey"
            ],
            "additionalProperties": false
        }
    }
}

export const LoadPeerFileViaReferenceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerFileViaReferenceRequest",
    "definitions": {
        "LoadPeerFileViaReferenceRequest": {
            "type": "object",
            "properties": {
                "reference": {
                    "type": "string",
                    "pattern": "VE9L.{84}"
                }
            },
            "required": [
                "reference"
            ],
            "additionalProperties": false,
            "errorMessage": "token reference invalid"
        }
    }
}

export const LoadPeerFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerFileRequest",
    "definitions": {
        "LoadPeerFileRequest": {
            "anyOf": [
                {
                    "$ref": "#/definitions/LoadPeerFileViaSecretRequest"
                },
                {
                    "$ref": "#/definitions/LoadPeerFileViaReferenceRequest"
                }
            ]
        },
        "LoadPeerFileViaSecretRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "pattern": "FIL[A-z0-9]{17}"
                },
                "secretKey": {
                    "type": "string",
                    "minLength": 100
                }
            },
            "required": [
                "id",
                "secretKey"
            ],
            "additionalProperties": false
        },
        "LoadPeerFileViaReferenceRequest": {
            "type": "object",
            "properties": {
                "reference": {
                    "type": "string",
                    "pattern": "VE9L.{84}"
                }
            },
            "required": [
                "reference"
            ],
            "additionalProperties": false,
            "errorMessage": "token reference invalid"
        }
    }
}

export const UploadOwnFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UploadOwnFileRequest",
    "definitions": {
        "UploadOwnFileRequest": {
            "type": "object",
            "properties": {
                "content": {
                    "type": "object",
                    "properties": {
                        "BYTES_PER_ELEMENT": {
                            "type": "number"
                        },
                        "buffer": {
                            "type": "object",
                            "properties": {
                                "byteLength": {
                                    "type": "number"
                                }
                            },
                            "required": [
                                "byteLength"
                            ],
                            "additionalProperties": false
                        },
                        "byteLength": {
                            "type": "number"
                        },
                        "byteOffset": {
                            "type": "number"
                        },
                        "length": {
                            "type": "number"
                        }
                    },
                    "required": [
                        "BYTES_PER_ELEMENT",
                        "buffer",
                        "byteLength",
                        "byteOffset",
                        "length"
                    ],
                    "additionalProperties": {
                        "type": "number"
                    }
                },
                "filename": {
                    "type": "string"
                },
                "mimetype": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                }
            },
            "required": [
                "content",
                "filename",
                "mimetype",
                "expiresAt",
                "title"
            ],
            "additionalProperties": false
        }
    }
}

export const CheckIdentityRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CheckIdentityRequest",
    "definitions": {
        "CheckIdentityRequest": {
            "type": "object",
            "properties": {
                "address": {
                    "type": "string"
                }
            },
            "required": [
                "address"
            ],
            "additionalProperties": false
        }
    }
}

export const GetAttachmentMetadataRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetAttachmentMetadataRequest",
    "definitions": {
        "GetAttachmentMetadataRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "attachmentId": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "attachmentId"
            ],
            "additionalProperties": false
        }
    }
}

export const GetMessageRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetMessageRequest",
    "definitions": {
        "GetMessageRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetMessagesRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetMessagesRequest",
    "definitions": {
        "GetMessagesRequest": {
            "type": "object",
            "properties": {
                "query": {}
            },
            "additionalProperties": false
        }
    }
}

export const SendMessageRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/SendMessageRequest",
    "definitions": {
        "SendMessageRequest": {
            "type": "object",
            "properties": {
                "recipients": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "content": {},
                "attachments": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": [
                "recipients",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const AcceptRelationshipChangeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/AcceptRelationshipChangeRequest",
    "definitions": {
        "AcceptRelationshipChangeRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                },
                "changeId": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "relationshipId",
                "changeId",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateRelationshipRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateRelationshipRequest",
    "definitions": {
        "CreateRelationshipRequest": {
            "type": "object",
            "properties": {
                "templateId": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "templateId",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateRelationshipChangeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateRelationshipChangeRequest",
    "definitions": {
        "CreateRelationshipChangeRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipRequest",
    "definitions": {
        "GetRelationshipRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipByAddressRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipByAddressRequest",
    "definitions": {
        "GetRelationshipByAddressRequest": {
            "type": "object",
            "properties": {
                "address": {
                    "type": "string"
                }
            },
            "required": [
                "address"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipsRequest",
    "definitions": {
        "GetRelationshipsRequest": {
            "type": "object",
            "properties": {
                "query": {}
            },
            "additionalProperties": false
        }
    }
}

export const RejectRelationshipChangeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/RejectRelationshipChangeRequest",
    "definitions": {
        "RejectRelationshipChangeRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                },
                "changeId": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "relationshipId",
                "changeId",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const RevokeRelationshipChangeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/RevokeRelationshipChangeRequest",
    "definitions": {
        "RevokeRelationshipChangeRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                },
                "changeId": {
                    "type": "string"
                },
                "content": {}
            },
            "required": [
                "relationshipId",
                "changeId",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateOwnRelationshipTemplateRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateOwnRelationshipTemplateRequest",
    "definitions": {
        "CreateOwnRelationshipTemplateRequest": {
            "type": "object",
            "properties": {
                "expiresAt": {
                    "type": "string"
                },
                "content": {},
                "maxNumberOfRelationships": {
                    "type": "number"
                }
            },
            "required": [
                "expiresAt",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateTokenForOwnTemplateRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateTokenForOwnTemplateRequest",
    "definitions": {
        "CreateTokenForOwnTemplateRequest": {
            "type": "object",
            "properties": {
                "templateId": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string"
                },
                "ephemeral": {
                    "type": "boolean"
                }
            },
            "required": [
                "templateId"
            ],
            "additionalProperties": false
        }
    }
}

export const CreateTokenQrCodeForOwnTemplateRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateTokenQrCodeForOwnTemplateRequest",
    "definitions": {
        "CreateTokenQrCodeForOwnTemplateRequest": {
            "type": "object",
            "properties": {
                "templateId": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string"
                }
            },
            "required": [
                "templateId"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipTemplateRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipTemplateRequest",
    "definitions": {
        "GetRelationshipTemplateRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipTemplatesRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipTemplatesRequest",
    "definitions": {
        "GetRelationshipTemplatesRequest": {
            "type": "object",
            "properties": {
                "query": {},
                "ownerRestriction": {
                    "$ref": "#/definitions/OwnerRestriction"
                }
            },
            "additionalProperties": false
        },
        "OwnerRestriction": {
            "type": "string",
            "enum": [
                "o",
                "p"
            ]
        }
    }
}

export const LoadPeerRelationshipTemplateRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerRelationshipTemplateRequest",
    "definitions": {
        "LoadPeerRelationshipTemplateRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "secretKey": {
                    "type": "string"
                },
                "reference": {
                    "type": "string"
                }
            },
            "additionalProperties": false
        }
    }
}

export const CreateOwnTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateOwnTokenRequest",
    "definitions": {
        "CreateOwnTokenRequest": {
            "type": "object",
            "properties": {
                "content": {},
                "expiresAt": {
                    "type": "string"
                },
                "ephemeral": {
                    "type": "boolean"
                }
            },
            "required": [
                "content",
                "expiresAt",
                "ephemeral"
            ],
            "additionalProperties": false
        }
    }
}

export const GetQRCodeForTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetQRCodeForTokenRequest",
    "definitions": {
        "GetQRCodeForTokenRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetTokenRequest",
    "definitions": {
        "GetTokenRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false
        }
    }
}

export const GetTokensRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetTokensRequest",
    "definitions": {
        "GetTokensRequest": {
            "type": "object",
            "properties": {
                "query": {},
                "ownerRestriction": {
                    "$ref": "#/definitions/OwnerRestriction"
                }
            },
            "additionalProperties": false
        },
        "OwnerRestriction": {
            "type": "string",
            "enum": [
                "o",
                "p"
            ]
        }
    }
}

export const LoadPeerTokenRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/LoadPeerTokenRequest",
    "definitions": {
        "LoadPeerTokenRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "secretKey": {
                    "type": "string"
                },
                "reference": {
                    "type": "string"
                },
                "ephemeral": {
                    "type": "boolean"
                }
            },
            "required": [
                "ephemeral"
            ],
            "additionalProperties": false
        }
    }
}