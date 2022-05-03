import { ConsumptionController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Runtime } from "./Runtime";

export class DatabaseSchemaUpgrader {
    private readonly CURRENT_RUNTIME_VERSION = 1;

    public constructor(private readonly runtime: Runtime, private readonly accountController: AccountController, private readonly consumptionController: ConsumptionController) {}

    public async upgradeSchemaVersion(): Promise<void> {
        let version = await this.getVersionFromDB();

        while (version < this.CURRENT_RUNTIME_VERSION) {
            version++;

            const upgradeLogic = UPGRADE_LOGIC[version];
            if (!upgradeLogic) throw new Error(`No upgrade logic found for version '${version}'`);

            await upgradeLogic(this.runtime, this.accountController, this.consumptionController);
            await this.writeVersionToDB(version);
        }
    }

    private async getVersionFromDB(): Promise<number> {
        const collection = await this.accountController.db.getCollection("meta");
        const doc = await collection.findOne({ id: "version" });

        // If no version is found, assume version 0
        if (!doc) return 0;

        return doc.version;
    }

    private async writeVersionToDB(version: number): Promise<void> {
        const collection = await this.accountController.db.getCollection("meta");

        const newObject = { id: "version", version };

        const oldDoc = await collection.findOne({ id: "version" });
        if (oldDoc) {
            await collection.update(oldDoc, newObject);
        } else {
            await collection.create(newObject);
        }
    }
}

const UPGRADE_LOGIC: Record<number, ((runtime: Runtime, accountController: AccountController, consumptionController: ConsumptionController) => void | Promise<void>) | undefined> =
    {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        1: (): void => {
            // noop
        }
    };
