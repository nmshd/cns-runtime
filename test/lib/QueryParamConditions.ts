/* eslint-disable jest/no-standalone-expect */
import { Result } from "@js-soft/ts-utils";
import { DateTime } from "luxon";
import { TransportServices } from "../../src";

export interface ICondition<TQuery> {
    key: string & keyof TQuery;
    value: string | string[];
    expectedResult: boolean;
}

type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export class QueryParamConditions<TQuery extends PartialRecord<keyof TQuery, string | string[]>, TServices = TransportServices> {
    private readonly _conditions: ICondition<TQuery>[];

    public constructor(private readonly object: any, private readonly services: TServices) {
        this._conditions = [];
    }

    public addDateSet(key: string & keyof TQuery, positiveValue?: string): this {
        if (!positiveValue) {
            positiveValue = this.getValueByKey(key);
        }

        if (!positiveValue) {
            return this;
        }

        this._conditions.push({
            key: key,
            value: positiveValue,
            expectedResult: true
        });

        const positiveValueAsDate = DateTime.fromISO(positiveValue);

        this._conditions.push({
            key: key,
            value: positiveValueAsDate.plus({ hours: 24 }).toString(),
            expectedResult: false
        });

        this._conditions.push({
            key: key,
            value: positiveValueAsDate.minus({ hours: 24 }).toString(),
            expectedResult: false
        });

        return this;
    }

    public addBooleanSet(key: string & keyof TQuery, positiveValue?: boolean): this {
        if (positiveValue === undefined) {
            positiveValue = this.getValueByKey(key) as boolean | undefined;
        }

        if (positiveValue === undefined) {
            return this;
        }

        this._conditions.push({
            key: key,
            value: positiveValue.toString(),
            expectedResult: true
        });

        this._conditions.push({
            key: key,
            value: (!positiveValue).toString(),
            expectedResult: false
        });

        return this;
    }

    public addNumberSet(key: string & keyof TQuery, positiveValue?: number): this {
        if (!positiveValue) {
            positiveValue = this.getValueByKey(key);
        }

        if (!positiveValue) {
            return this;
        }

        this._conditions.push({
            key: key,
            value: positiveValue.toString(),
            expectedResult: true
        });

        this._conditions.push({
            key: key,
            value: (positiveValue + 1).toString(),
            expectedResult: false
        });

        this._conditions.push({
            key: key,
            value: (positiveValue - 1).toString(),
            expectedResult: false
        });

        return this;
    }

    public addStringSet(key: string & keyof TQuery, positiveValue?: string): this {
        if (!positiveValue) {
            positiveValue = this.getValueByKey(key);
        }

        if (!positiveValue) {
            return this;
        }

        this._conditions.push({
            key: key,
            value: positiveValue,
            expectedResult: true
        });

        this._conditions.push({
            key: key,
            value: positiveValue.replace(/....$/, "XXXX"),
            expectedResult: false
        });

        return this;
    }

    public addSingleCondition(condition: ICondition<TQuery>): this {
        this._conditions.push(condition);
        return this;
    }

    public addStringArraySet(key: string & keyof TQuery): this {
        return this.addStringSet(key);
    }

    private getValueByKey(key: string & keyof TQuery) {
        const keyParts = key.split(".");
        let value = this.object;
        for (const keyPart of keyParts) {
            value = value[keyPart];
            if (Array.isArray(value)) {
                value = value[0];
            }
        }

        if (!value) {
            console.warn(`No positiveValue for the given set provided (key: '${key}').`); // eslint-disable-line no-console
        }

        return value;
    }

    public async executeTests(queryFunction: (client: TServices, params: Record<string, string | string[] | undefined>) => Promise<any>): Promise<void> {
        if (this._conditions.length < 1) {
            throw new Error("The conditions list may not be empty.");
        }

        for (const condition of this._conditions) {
            const response: Result<any> = await queryFunction(this.services, { [condition.key]: condition.value });

            expect(response.isSuccess).toBeTruthy();

            if (condition.expectedResult) {
                expect(response.value, `Positive match failed for key "${condition.key}" and value "${condition.value}".`).toContainEqual(this.object);
            } else {
                expect(response.value, `Negative match failed for key "${condition.key}" and value "${condition.value}".`).not.toContainEqual(this.object);
            }
        }
    }
}
