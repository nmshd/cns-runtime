import { Setting } from "@nmshd/consumption";
import { SettingDTO } from "../../../types";

export class SettingMapper {
    public static toSettingDTO(setting: Setting): SettingDTO {
        return {
            id: setting.id.toString(),
            key: setting.key,
            scope: setting.scope.toString(),
            reference: setting.reference?.toString(),
            value: setting.value.toJSON(),
            createdAt: setting.createdAt.toISOString(),
            succeedsItem: setting.succeedsItem?.toString(),
            succeedsAt: setting.succeedsAt?.toString()
        };
    }

    public static toSettingDTOList(setting: Setting[]): SettingDTO[] {
        return setting.map((s) => this.toSettingDTO(s));
    }
}
