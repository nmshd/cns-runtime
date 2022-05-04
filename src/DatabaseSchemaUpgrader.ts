import { Serializable, serialize, type, validate } from "@js-soft/ts-serval";
import { ConsumptionController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";

@type("RuntimeDatabaseSchema")
class RuntimeDatabaseSchema extends Serializable {
    public static readonly DATABASE_SCHEMA_ID = "databaseSchema";

    @serialize()
    @validate({ customValidator: (value: string) => (value === RuntimeDatabaseSchema.DATABASE_SCHEMA_ID ? undefined : "Invalid database schema id") })
    public id: string;

    @serialize()
    @validate({ min: 0 })
    public version: number;

    public static from(value: { id?: string; version: number }): RuntimeDatabaseSchema {
        if (!value.id) value.id = RuntimeDatabaseSchema.DATABASE_SCHEMA_ID;
        return super.fromT(value, RuntimeDatabaseSchema);
    }
}

export class DatabaseSchemaUpgrader {
    private readonly CURRENT_DATABASE_SCHEMA_VERSION = 1;
    private readonly DATABASE_SCHEMA_QUERY = { id: RuntimeDatabaseSchema.DATABASE_SCHEMA_ID };

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
        const collection = await this.accountController.db.getCollection("meta");
        const doc = await collection.findOne(this.DATABASE_SCHEMA_QUERY);

        // If no version is found, assume version 0
        if (!doc) return 0;

        const schema = RuntimeDatabaseSchema.from(doc);
        return schema.version;
    }

    private async writeVersionToDB(version: number): Promise<void> {
        const collection = await this.accountController.db.getCollection("meta");

        const schema = RuntimeDatabaseSchema.from({ version });

        const oldDoc = await collection.findOne(this.DATABASE_SCHEMA_QUERY);
        if (oldDoc) {
            await collection.update(oldDoc, schema);
        } else {
            await collection.create(schema);
        }
    }
}

const noop = async () => {
    // noop
};

const UPGRADE_LOGIC: Record<number, ((accountController: AccountController, consumptionController: ConsumptionController) => void | Promise<void>) | undefined> = {
    1: noop // eslint-disable-line @typescript-eslint/naming-convention
};
