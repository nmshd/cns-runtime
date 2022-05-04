import { ApplicationError, Result } from "@js-soft/ts-utils";

expect.extend({
    toBeSuccessful(actual: Result<unknown, ApplicationError>) {
        if (!(actual instanceof Result)) {
            return { pass: false, message: () => "expected an instance of Result." };
        }

        return {
            pass: actual.isSuccess,
            message: () => `expected a successful result; got an error result with the error message '${actual.error.message}'.`
        };
    },

    toBeAnError(actual: Result<unknown, ApplicationError>, expectedMessage: string | RegExp, expectedCode: string | RegExp) {
        if (!(actual instanceof Result)) {
            return {
                pass: false,
                message: () => "expected an instance of Result."
            };
        }

        if (!actual.isError) {
            return {
                pass: false,
                message: () => "expected an error result, but it was successful."
            };
        }

        if (actual.error.message.match(expectedMessage) === null) {
            return {
                pass: false,
                message: () => `expected the error message of the result to be '${expectedMessage}', but received '${actual.error.message}'.`
            };
        }

        if (actual.error.code.match(expectedCode) === null) {
            return {
                pass: false,
                message: () => `expected the error code of the result to be '${expectedCode}', but received '${actual.error.code}'.`
            };
        }

        return { pass: true, message: () => "" };
    }
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeSuccessful(): R;
            toBeAnError(expectedMessage: string | RegExp, expectedCode: string | RegExp): R;
        }
    }
}
