import * as QRCodeLibrary from "qrcode";

export class QRCode {
    private constructor(private readonly base64: string) {}

    public asBase64(): string {
        return this.base64;
    }

    public static async from(content: string, prefix: string): Promise<QRCode> {
        const dataUrl = await QRCodeLibrary.toDataURL(`nmshd://${prefix}#${content}`);
        const base64 = dataUrl.split(",")[1];

        return new QRCode(base64);
    }

    public static async forTruncateable(truncateable: { truncate(): string }): Promise<QRCode> {
        return await this.from(truncateable.truncate(), "tr");
    }
}
