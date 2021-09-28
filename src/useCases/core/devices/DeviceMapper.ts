import { CryptoSecretKey, CryptoSignaturePrivateKey, CryptoSignaturePublicKey } from "@nmshd/crypto";
import { CoreAddress, CoreDate, CoreId, Device, DeviceSharedSecret, IdentityType, Realm } from "@nmshd/transport";
import { DeviceOnboardingInfoDTO } from "../../../types";
import { DeviceDTO } from "../../../types/core/DeviceDTO";

export class DeviceMapper {
    public static toDeviceDTO(device: Device): DeviceDTO {
        return {
            id: device.id.toString(),
            createdAt: device.createdAt.toString(),
            createdByDevice: device.createdByDevice.toString(),
            name: device.name,
            type: device.type.toString(),
            username: device.username,
            certificate: device.certificate,
            description: device.description,
            lastLoginAt: device.lastLoginAt?.toString(),
            operatingSystem: device.operatingSystem,
            publicKey: device.publicKey?.toString()
        };
    }

    public static toDeviceOnboardingInfoDTO(deviceSharedSecret: DeviceSharedSecret): DeviceOnboardingInfoDTO {
        return {
            id: deviceSharedSecret.id.toString(),
            createdAt: deviceSharedSecret.createdAt.toString(),
            createdByDevice: deviceSharedSecret.createdByDevice.toString(),
            name: deviceSharedSecret.name,
            description: deviceSharedSecret.description,
            secretBaseKey: deviceSharedSecret.secretBaseKey.toBase64(),
            deviceIndex: deviceSharedSecret.deviceIndex,
            synchronizationKey: deviceSharedSecret.synchronizationKey.toBase64(),
            identityPrivateKey: deviceSharedSecret.identityPrivateKey ? deviceSharedSecret.identityPrivateKey.toString() : undefined,
            identity: {
                address: deviceSharedSecret.identity.address.toString(),
                createdAt: deviceSharedSecret.identity.createdAt.toString(),
                description: deviceSharedSecret.identity.description,
                name: deviceSharedSecret.identity.name,
                publicKey: deviceSharedSecret.identity.publicKey.toString(),
                realm: deviceSharedSecret.identity.realm.toString(),
                type: deviceSharedSecret.identity.type.toString()
            },
            password: deviceSharedSecret.password,
            username: deviceSharedSecret.username
        };
    }

    public static async toDeviceSharedSecret(deviceOnboardingDTO: DeviceOnboardingInfoDTO): Promise<DeviceSharedSecret> {
        const sharedSecret = await DeviceSharedSecret.from({
            id: CoreId.from(deviceOnboardingDTO.id),
            createdAt: CoreDate.from(deviceOnboardingDTO.createdAt),
            createdByDevice: CoreId.from(deviceOnboardingDTO.createdByDevice),
            name: deviceOnboardingDTO.name,
            description: deviceOnboardingDTO.description,
            secretBaseKey: await CryptoSecretKey.fromBase64(deviceOnboardingDTO.secretBaseKey),
            deviceIndex: deviceOnboardingDTO.deviceIndex,
            synchronizationKey: await CryptoSecretKey.fromBase64(deviceOnboardingDTO.synchronizationKey),
            identityPrivateKey: deviceOnboardingDTO.identityPrivateKey ? await CryptoSignaturePrivateKey.deserialize(deviceOnboardingDTO.identityPrivateKey) : undefined,
            identity: {
                address: CoreAddress.from(deviceOnboardingDTO.identity.address),
                createdAt: CoreDate.from(deviceOnboardingDTO.identity.createdAt),
                name: deviceOnboardingDTO.identity.name,
                description: deviceOnboardingDTO.identity.description,
                publicKey: await CryptoSignaturePublicKey.deserialize(deviceOnboardingDTO.identity.publicKey),
                realm: deviceOnboardingDTO.identity.realm as Realm,
                type: deviceOnboardingDTO.identity.type as IdentityType
            },
            password: deviceOnboardingDTO.password,
            username: deviceOnboardingDTO.username
        });
        return sharedSecret;
    }
}
