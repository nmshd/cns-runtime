import { CryptoSecretKey, CryptoSignaturePrivateKey, CryptoSignaturePublicKey } from "@nmshd/crypto";
import { CoreAddress, CoreDate, CoreId, Device, DeviceSharedSecret, Realm } from "@nmshd/transport";
import { DeviceDTO, DeviceOnboardingInfoDTO } from "../../../types";

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
                publicKey: deviceSharedSecret.identity.publicKey.toString(),
                realm: deviceSharedSecret.identity.realm.toString()
            },
            password: deviceSharedSecret.password,
            username: deviceSharedSecret.username
        };
    }

    public static toDeviceSharedSecret(deviceOnboardingDTO: DeviceOnboardingInfoDTO): DeviceSharedSecret {
        const sharedSecret = DeviceSharedSecret.from({
            id: CoreId.from(deviceOnboardingDTO.id),
            createdAt: CoreDate.from(deviceOnboardingDTO.createdAt),
            createdByDevice: CoreId.from(deviceOnboardingDTO.createdByDevice),
            name: deviceOnboardingDTO.name,
            description: deviceOnboardingDTO.description,
            secretBaseKey: CryptoSecretKey.fromBase64(deviceOnboardingDTO.secretBaseKey),
            deviceIndex: deviceOnboardingDTO.deviceIndex,
            synchronizationKey: CryptoSecretKey.fromBase64(deviceOnboardingDTO.synchronizationKey),
            identityPrivateKey: deviceOnboardingDTO.identityPrivateKey ? CryptoSignaturePrivateKey.deserialize(deviceOnboardingDTO.identityPrivateKey) : undefined,
            identity: {
                address: CoreAddress.from(deviceOnboardingDTO.identity.address),
                publicKey: CryptoSignaturePublicKey.deserialize(deviceOnboardingDTO.identity.publicKey),
                realm: deviceOnboardingDTO.identity.realm as Realm
            },
            password: deviceOnboardingDTO.password,
            username: deviceOnboardingDTO.username
        });
        return sharedSecret;
    }
}
