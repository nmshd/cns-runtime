import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RelationshipCreationChangeRequestBody, RelationshipTemplateBodyJSON, RequestJSON } from "@nmshd/content";
import { IncomingRequestStatusChangedEvent, MessageReceivedEvent, PeerRelationshipTemplateLoadedEvent, RelationshipChangedEvent } from "../events";
import { RuntimeModule } from "../extensibility/modules/RuntimeModule";
import { RuntimeServices } from "../Runtime";
import { RelationshipStatus } from "../types";

export class RequestModule extends RuntimeModule {
    public init(): void | Promise<void> {
        // Nothing to do here
    }

    public start(): void | Promise<void> {
        this.subscribeToEvent(PeerRelationshipTemplateLoadedEvent, this.handlePeerRelationshipTemplateLoaded.bind(this));
        this.subscribeToEvent(MessageReceivedEvent, this.handleMessageReceivedEvent.bind(this));
        this.subscribeToEvent(IncomingRequestStatusChangedEvent, this.handleIncomingRequestStatusChanged.bind(this));
        this.subscribeToEvent(RelationshipChangedEvent, this.handleRelationshipChangedEvent.bind(this));
    }

    private async handlePeerRelationshipTemplateLoaded(event: PeerRelationshipTemplateLoadedEvent) {
        if (event.data.content["@type"] !== "RelationshipTemplateBody") return;

        const body = event.data.content as RelationshipTemplateBodyJSON;
        const request = body.onNewRelationship;

        const services = this.runtime.getServices(event.eventTargetAddress);
        await this.createIncomingRequest(services, request, event.data.id);
    }

    private async handleMessageReceivedEvent(event: MessageReceivedEvent) {
        if (event.data.content["@type"] !== "Request") return;
        // TODO: JSSNMSHDD-2896 (handle response)

        const request = event.data.content as RequestJSON;

        const services = this.runtime.getServices(event.eventTargetAddress);

        await this.createIncomingRequest(services, request, event.data.id);
    }

    private async createIncomingRequest(services: RuntimeServices, request: RequestJSON, requestSourceId: string) {
        const receivedRequestResult = await services.consumptionServices.incomingRequests.received({ receivedRequest: request, requestSourceId });
        if (receivedRequestResult.isError) {
            this.logger.error(`Could not receive request ${request.id}`, receivedRequestResult.error);
            return;
        }

        const checkPrerequitesResult = await services.consumptionServices.incomingRequests.checkPrerequisites({ requestId: receivedRequestResult.value.id });
        if (checkPrerequitesResult.isError) {
            this.logger.error(`Could not check prerequisites for request ${request.id}`, checkPrerequitesResult.error);
            return;
        }
    }

    private async handleIncomingRequestStatusChanged(event: IncomingRequestStatusChangedEvent) {
        if (event.data.newStatus !== ConsumptionRequestStatus.Decided) return;

        switch (event.data.request.source!.type) {
            case "RelationshipTemplate":
                await this.handleIncomingRequestCompletedForRelationship(event);
                break;
            default:
                throw new Error(`Cannot handle source.type '${event.data.request.source!.type}'.`);
        }
    }

    private async handleIncomingRequestCompletedForRelationship(event: IncomingRequestStatusChangedEvent) {
        const templateId = event.data.request.source!.reference;

        const services = this.runtime.getServices(event.eventTargetAddress);
        const templateResponse = await services.transportServices.relationshipTemplates.getRelationshipTemplate({ id: templateId });
        if (templateResponse.isError) {
            this.logger.error(`Could not find template with id '${templateId}'.`);
            // TODO: error state
            return;
        }

        const template = templateResponse.value;

        const creationChangeBody = RelationshipCreationChangeRequestBody.from({
            "@type": "RelationshipCreationChangeRequestBody",
            response: event.data.request.response!.content,
            templateContentMetadata: template.content.metadata
        });

        const createRelationshipResponse = await services.transportServices.relationships.createRelationship({ templateId, content: creationChangeBody });
        if (createRelationshipResponse.isError) {
            this.logger.error(`Could not create relationship for templateId '${templateId}'.`);
            // TODO: error state
            return;
        }

        const requestId = event.data.request.id;
        const completeRequestResponse = await services.consumptionServices.incomingRequests.complete({
            requestId,
            responseSourceId: createRelationshipResponse.value.changes[0].id
        });
        if (completeRequestResponse.isError) {
            this.logger.error(`Could not complete the request '${requestId}'.`);
            return;
        }
    }

    private async handleRelationshipChangedEvent(event: RelationshipChangedEvent) {
        // only trigger for new relationships that were created from an own template
        if (event.data.status !== RelationshipStatus.Pending || !event.data.template.isOwn) return;

        const services = this.runtime.getServices(event.eventTargetAddress);

        const createdRelationship = event.data;

        const template = createdRelationship.template;
        const templateId = template.id;
        // do not trigger for templates without the correct content type
        if (template.content["@type"] !== "RelationshipTemplateBody") return;

        const relationshipCreationChange = createdRelationship.changes[0];
        const relationshipChangeId = relationshipCreationChange.id;
        // do not trigger for creation changes without the correct content type
        if (relationshipCreationChange.request.content["@type"] !== "RelationshipCreationChangeRequestBody") return;

        const result = await services.consumptionServices.outgoingRequests.createAndCompleteFromRelationshipCreationChange({ templateId, relationshipChangeId });
        if (result.isError) {
            this.logger.error(`Could not create and complete request for templateId '${templateId}' and changeId '${relationshipChangeId}'.`, result.error);
            return;
        }
    }

    public stop(): void | Promise<void> {
        this.unsubscribeFromAllEvents();
    }
}
