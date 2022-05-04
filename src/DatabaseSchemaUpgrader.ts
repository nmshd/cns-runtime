import { Serializable, serialize, type, validate } from "@js-soft/ts-serval";
import { ConsumptionController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";

@type("RuntimeDatabaseSchemaMetadata")
class RuntimeDatabaseSchemaMetadata extends Serializable {
    public static readonly DATABASE_SCHEMA_ID = "databaseSchema";

    @serialize()
    @validate({ customValidator: (value: string) => (value === RuntimeDatabaseSchemaMetadata.DATABASE_SCHEMA_ID ? undefined : "Invalid database schema id") })
    public id: string;

    @serialize()
    @validate({ min: 0 })
    public version: number;

    public static from(value: { id?: string; version: number }): RuntimeDatabaseSchemaMetadata {
        if (!value.id) value.id = RuntimeDatabaseSchemaMetadata.DATABASE_SCHEMA_ID;
        return super.fromT(value, RuntimeDatabaseSchemaMetadata);
    }
}

export class DatabaseSchemaUpgrader {
    private readonly CURRENT_DATABASE_SCHEMA_VERSION = 1;
    private readonly DATABASE_SCHEMA_QUERY = { id: RuntimeDatabaseSchemaMetadata.DATABASE_SCHEMA_ID };

    public constructor(private readonly accountController: AccountController, private readonly consumptionController: ConsumptionController) {}

    public async upgradeSchemaVersion(): Promise<void> {
        let version = await this.getVersionFromDB();

        while (version < this.CURRENT_DATABASE_SCHEMA_VERSION) {
            version++;

            const upgradeLogic = UPGRADE_LOGIC[version];
            if (!upgradeLogic) throw new Error(`No upgrade logic found for version '${version}'`);

            await upgradeLogic(this.accountController, this.consumptionController);
            await this.writeVersionToDB(version);
        }
    }

    private async getVersionFromDB(): Promise<number> {
        const metaCollection = await this.accountController.db.getCollection("meta");
        const doc = await metaCollection.findOne(this.DATABASE_SCHEMA_QUERY);

        // If no version is found, assume version 0
        if (!doc) return 0;

        const metadata = RuntimeDatabaseSchemaMetadata.from(doc);
        return metadata.version;
    }

    private async writeVersionToDB(version: number): Promise<void> {
        const metaCollection = await this.accountController.db.getCollection("meta");

        const metadata = RuntimeDatabaseSchemaMetadata.from({ version });

        const oldDoc = await metaCollection.findOne(this.DATABASE_SCHEMA_QUERY);
        if (oldDoc) {
            await metaCollection.update(oldDoc, metadata);
        } else {
            await metaCollection.create(metadata);
        }
    }
}

const UPGRADE_LOGIC: Record<number, ((accountController: AccountController, consumptionController: ConsumptionController) => void | Promise<void>) | undefined> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    1: () => {
        // noop
    }
};
