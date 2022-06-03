import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RelationshipCreationChangeRequestBody, RelationshipTemplateBodyJSON, RequestJSON, ResponseJSON } from "@nmshd/content";
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
        const services = this.runtime.getServices(event.eventTargetAddress);

        const messageContentType = event.data.content["@type"];
        switch (messageContentType) {
            case "Request":
                await this.createIncomingRequest(services, event.data.content as RequestJSON, event.data.id);
                break;
            case "Response":
                const receivedResponse = event.data.content as ResponseJSON;
                await services.consumptionServices.outgoingRequests.complete({ receivedResponse, messageId: event.data.id });
                break;
        }
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
                await this.handleIncomingRequestDecidedForRelationship(event);
                break;
            case "Message":
                await this.handleIncomingRequestDecidedForMessage(event);
                break;
            default:
                throw new Error(`Cannot handle source.type '${event.data.request.source!.type}'.`);
        }
    }

    private async handleIncomingRequestDecidedForRelationship(event: IncomingRequestStatusChangedEvent) {
        const templateId = event.data.request.source!.reference;

        if (event.data.request.response!.content.result !== "Accepted") {
            // TODO: correctly handle rejection (=> delete / new status)
            // ignore rejection for now
            return;
        }

        const services = this.runtime.getServices(event.eventTargetAddress);
        const templateResult = await services.transportServices.relationshipTemplates.getRelationshipTemplate({ id: templateId });
        if (templateResult.isError) {
            this.logger.error(`Could not find template with id '${templateId}'.`);
            // TODO: error state
            return;
        }

        const template = templateResult.value;
        const creationChangeBody = RelationshipCreationChangeRequestBody.from({
            "@type": "RelationshipCreationChangeRequestBody",
            response: event.data.request.response!.content,
            templateContentMetadata: template.content.metadata
        });

        const createRelationshipResult = await services.transportServices.relationships.createRelationship({ templateId, content: creationChangeBody });
        if (createRelationshipResult.isError) {
            this.logger.error(`Could not create relationship for templateId '${templateId}'.`);
            // TODO: error state
            return;
        }

        const requestId = event.data.request.id;
        const completeRequestResult = await services.consumptionServices.incomingRequests.complete({
            requestId,
            responseSourceId: createRelationshipResult.value.changes[0].id
        });
        if (completeRequestResult.isError) {
            this.logger.error(`Could not complete the request '${requestId}'.`);
            return;
        }
    }

    private async handleIncomingRequestDecidedForMessage(event: IncomingRequestStatusChangedEvent) {
        const request = event.data.request;
        const requestId = request.id;

        const services = this.runtime.getServices(event.eventTargetAddress);

        const sendMessageResult = await services.transportServices.messages.sendMessage({
            recipients: [request.peer],
            content: request.response
        });
        if (sendMessageResult.isError) {
            this.logger.error(`Could not send message to answer the request '${requestId}'.`);
            // TODO: error state
            return;
        }

        const completeRequestResult = await services.consumptionServices.incomingRequests.complete({
            requestId,
            responseSourceId: sendMessageResult.value.id
        });
        if (completeRequestResult.isError) {
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
