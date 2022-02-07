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

export const GetAttributesByNamesRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetAttributesByNamesRequest",
    "definitions": {
        "GetAttributesByNamesRequest": {
            "type": "object",
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
                "attribute": {
                    "$ref": "#/definitions/IAttribute"
                }
            },
            "required": [
                "attribute"
            ],
            "additionalProperties": false
        },
        "IAttribute": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {},
                "validFrom": {
                    "$ref": "#/definitions/ICoreDate"
                },
                "validTo": {
                    "$ref": "#/definitions/ICoreDate"
                }
            },
            "required": [
                "name",
                "value"
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

export const DeleteAttributeByNameRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteAttributeByNameRequest",
    "definitions": {
        "DeleteAttributeByNameRequest": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "required": [
                "name"
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

export const GetAttributeByNameRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetAttributeByNameRequest",
    "definitions": {
        "GetAttributeByNameRequest": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "required": [
                "name"
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
            "additionalProperties": false
        }
    }
}

export const GetHistoryByNameRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetHistoryByNameRequest",
    "definitions": {
        "GetHistoryByNameRequest": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                }
            },
            "required": [
                "name"
            ],
            "additionalProperties": false
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
                "attribute": {
                    "$ref": "#/definitions/IAttribute"
                },
                "validFrom": {
                    "type": "string"
                }
            },
            "required": [
                "attribute"
            ],
            "additionalProperties": false
        },
        "IAttribute": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {},
                "validFrom": {
                    "$ref": "#/definitions/ICoreDate"
                },
                "validTo": {
                    "$ref": "#/definitions/ICoreDate"
                }
            },
            "required": [
                "name",
                "value"
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
                    "type": "string"
                },
                "attribute": {
                    "$ref": "#/definitions/IAttribute"
                }
            },
            "required": [
                "id",
                "attribute"
            ],
            "additionalProperties": false
        },
        "IAttribute": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {},
                "validFrom": {
                    "$ref": "#/definitions/ICoreDate"
                },
                "validTo": {
                    "$ref": "#/definitions/ICoreDate"
                }
            },
            "required": [
                "name",
                "value"
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

export const CreateRelationshipInfoRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateRelationshipInfoRequest",
    "definitions": {
        "CreateRelationshipInfoRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                },
                "attributes": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/RelationshipAttributeDTO"
                    }
                },
                "isPinned": {
                    "type": "boolean"
                },
                "title": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "userTitle": {
                    "type": "string"
                },
                "userDescription": {
                    "type": "string"
                },
                "theme": {
                    "$ref": "#/definitions/RelationshipThemeDTO"
                }
            },
            "required": [
                "relationshipId",
                "attributes",
                "isPinned",
                "title"
            ],
            "additionalProperties": false
        },
        "RelationshipAttributeDTO": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "content": {
                    "$ref": "#/definitions/AttributeJSON"
                },
                "sharedItem": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "content",
                "sharedItem"
            ],
            "additionalProperties": false
        },
        "AttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@schema": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "value": {},
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                }
            },
            "required": [
                "@type",
                "name",
                "value"
            ],
            "additionalProperties": false
        },
        "RelationshipThemeDTO": {
            "type": "object",
            "properties": {
                "image": {
                    "type": "string"
                },
                "imageBar": {
                    "type": "string"
                },
                "backgroundColor": {
                    "type": "string"
                },
                "foregroundColor": {
                    "type": "string"
                }
            },
            "required": [
                "image",
                "imageBar",
                "backgroundColor",
                "foregroundColor"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteRelationshipInfoRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteRelationshipInfoRequest",
    "definitions": {
        "DeleteRelationshipInfoRequest": {
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

export const DeleteRelationshipInfoByRelationshipRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteRelationshipInfoByRelationshipRequest",
    "definitions": {
        "DeleteRelationshipInfoByRelationshipRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                }
            },
            "required": [
                "relationshipId"
            ],
            "additionalProperties": false
        }
    }
}

export const GetRelationshipInfoRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipInfoRequest",
    "definitions": {
        "GetRelationshipInfoRequest": {
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

export const GetRelationshipInfoByRelationshipRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetRelationshipInfoByRelationshipRequest",
    "definitions": {
        "GetRelationshipInfoByRelationshipRequest": {
            "type": "object",
            "properties": {
                "relationshipId": {
                    "type": "string"
                }
            },
            "required": [
                "relationshipId"
            ],
            "additionalProperties": false
        }
    }
}

export const UpdateRelationshipInfoRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateRelationshipInfoRequest",
    "definitions": {
        "UpdateRelationshipInfoRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                },
                "attributes": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/RelationshipAttributeDTO"
                    }
                },
                "isPinned": {
                    "type": "boolean"
                },
                "title": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "userTitle": {
                    "type": "string"
                },
                "userDescription": {
                    "type": "string"
                },
                "theme": {
                    "$ref": "#/definitions/RelationshipThemeDTO"
                }
            },
            "required": [
                "id"
            ],
            "additionalProperties": false,
            "description": "Overwrite a RelationshipInfo's attributes with the request's corresponding fields. Undefined fields in the request will leave the corresponding RelationshipInfo's attributes untouched."
        },
        "RelationshipAttributeDTO": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "content": {
                    "$ref": "#/definitions/AttributeJSON"
                },
                "sharedItem": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "content",
                "sharedItem"
            ],
            "additionalProperties": false
        },
        "AttributeJSON": {
            "type": "object",
            "properties": {
                "@type": {
                    "type": "string"
                },
                "@schema": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "value": {},
                "validFrom": {
                    "type": "string"
                },
                "validTo": {
                    "type": "string"
                }
            },
            "required": [
                "@type",
                "name",
                "value"
            ],
            "additionalProperties": false
        },
        "RelationshipThemeDTO": {
            "type": "object",
            "properties": {
                "image": {
                    "type": "string"
                },
                "imageBar": {
                    "type": "string"
                },
                "backgroundColor": {
                    "type": "string"
                },
                "foregroundColor": {
                    "type": "string"
                }
            },
            "required": [
                "image",
                "imageBar",
                "backgroundColor",
                "foregroundColor"
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

export const CreateSharedItemRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateSharedItemRequest",
    "definitions": {
        "CreateSharedItemRequest": {
            "type": "object",
            "properties": {
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "sharedBy": {
                    "type": "string"
                },
                "sharedWith": {
                    "type": "string"
                },
                "sharedAt": {
                    "type": "string"
                },
                "reference": {
                    "type": "string"
                },
                "content": {},
                "succeedsItem": {
                    "type": "string"
                },
                "succeedsAt": {
                    "type": "string"
                },
                "expiresAt": {
                    "type": "string"
                }
            },
            "required": [
                "sharedBy",
                "sharedWith",
                "sharedAt",
                "content"
            ],
            "additionalProperties": false
        }
    }
}

export const DeleteSharedItemRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DeleteSharedItemRequest",
    "definitions": {
        "DeleteSharedItemRequest": {
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

export const GetSharedItemRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemRequest",
    "definitions": {
        "GetSharedItemRequest": {
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

export const GetSharedItemsRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemsRequest",
    "definitions": {
        "GetSharedItemsRequest": {
            "type": "object",
            "properties": {
                "query": {}
            },
            "additionalProperties": false
        }
    }
}

export const GetSharedItemsByAddressRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemsByAddressRequest",
    "definitions": {
        "GetSharedItemsByAddressRequest": {
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

export const GetSharedItemsByReferenceRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemsByReferenceRequest",
    "definitions": {
        "GetSharedItemsByReferenceRequest": {
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

export const GetSharedItemsSharedByAddressRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemsSharedByAddressRequest",
    "definitions": {
        "GetSharedItemsSharedByAddressRequest": {
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

export const GetSharedItemsSharedWithAddressRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/GetSharedItemsSharedWithAddressRequest",
    "definitions": {
        "GetSharedItemsSharedWithAddressRequest": {
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

export const UpdateSharedItemRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/UpdateSharedItemRequest",
    "definitions": {
        "UpdateSharedItemRequest": {
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

export const DownloadFileRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/DownloadFileRequest",
    "definitions": {
        "DownloadFileRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "format": "fileId"
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

export const CreateChallengeRequest: any = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/CreateChallengeRequest",
    "definitions": {
        "CreateChallengeRequest": {
            "type": "object",
            "properties": {
                "relationship": {
                    "type": "string"
                },
                "challengeType": {
                    "type": "string"
                }
            },
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
                    "format": "fileId"
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
                    "format": "fileId"
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
                    "format": "fileId"
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
                    "format": "fileId"
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
                    "format": "fileId"
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