import { buildInformation as servalBuildInformation } from "@js-soft/ts-serval";
import { buildInformation as consumptionBuildInformation } from "@nmshd/consumption";
import { buildInformation as contentBuildInformation } from "@nmshd/content";
import { buildInformation as cryptoBuildInformation } from "@nmshd/crypto";
import { buildInformation as transportBuildInformation } from "@nmshd/transport";

export const buildInformation = {
    version: "{{version}}",
    build: "{{build}}",
    date: "{{date}}",
    commit: "{{commit}}",
    dependencies: "{{dependencies}}",
    libraries: {
        serval: servalBuildInformation,
        consumption: consumptionBuildInformation,
        content: contentBuildInformation,
        crypto: cryptoBuildInformation,
        transport: transportBuildInformation
    }
};
