import { Result } from "@js-soft/ts-utils";

export function expectSuccess<T>(result: Result<T>): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    expect(result.isSuccess, `${result.error?.code} | ${result.error?.message}`).toBeTruthy();
}

export function expectError<T>(result: Result<T>, message: string, code: string): void {
    expect(result.isSuccess).toBeFalsy();
    expect(result.isError).toBeTruthy();
    expect(result.error.code).toStrictEqual(code);
    expect(result.error.message).toStrictEqual(message);
}
