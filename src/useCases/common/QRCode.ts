import * as QRCodeLibrary from "qrcode";

export class QRCode {
    private constructor(private readonly base64: string) {}

    public asBase64(): string {
        return this.base64;
    }

    public static async from(utf8Content: string): Promise<QRCode> {
        const dataUrl = await QRCodeLibrary.toDataURL(`nmshd://qr#${utf8Content}`);
        const base64 = dataUrl.split(",")[1];

        return new QRCode(base64);
    }
}
