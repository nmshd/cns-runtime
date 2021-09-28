import { ServalBuildInformation } from "@js-soft/ts-serval";
import { ConsumptionBuildInformation } from "@nmshd/consumption";
import { ContentBuildInformation } from "@nmshd/content";
import { CryptoBuildInformation } from "@nmshd/crypto";
import { TransportBuildInformation } from "@nmshd/transport";

export interface ILibraryBuildInformation {
    version: string;
    build: string;
    date: string;
    commit: string;
}

export interface IRuntimeVersionInfo {
    runtime: ILibraryBuildInformation;
    core: ILibraryBuildInformation;
    crypto: ILibraryBuildInformation;
    serval: ILibraryBuildInformation;
    consumption: ILibraryBuildInformation;
    content: ILibraryBuildInformation;
}

export class RuntimeBuildInformation {
    public readonly version: string = "{{version}}";
    public readonly build: string = "{{build}}";
    public readonly date: string = "{{date}}";
    public readonly commit: string = "{{commit}}";
    public readonly dependencies: object;

    public readonly core = TransportBuildInformation.info;
    public readonly crypto = CryptoBuildInformation.info;
    public readonly serval = ServalBuildInformation.info;
    public readonly consumption = ConsumptionBuildInformation.info;
    public readonly content = ContentBuildInformation.info;

    private constructor() {
        try {
            // eslint-disable-next-line @typescript-eslint/quotes
            this.dependencies = JSON.parse(`{{dependencies}}`);
        } catch (e) {
            this.dependencies = {};
        }
    }

    public toJson(): IRuntimeVersionInfo {
        return {
            runtime: this.buildInformationToJson(this),
            core: this.buildInformationToJson(this.core),
            crypto: this.buildInformationToJson(this.crypto),
            serval: this.buildInformationToJson(this.serval),
            consumption: this.buildInformationToJson(this.consumption),
            content: this.buildInformationToJson(this.content)
        };
    }

    private buildInformationToJson(buildInformation: ILibraryBuildInformation): ILibraryBuildInformation {
        return {
            version: buildInformation.version,
            build: buildInformation.build,
            date: buildInformation.date,
            commit: buildInformation.commit
        };
    }

    public static readonly info: RuntimeBuildInformation = new RuntimeBuildInformation();
}
