export function flattenObject(obj: any): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const i in obj) {
        const propertyValue = obj[i];
        if (typeof propertyValue === "object" && !Array.isArray(propertyValue)) {
            const temp = flattenObject(propertyValue);
            for (const j in temp) {
                result[`${i}.${j}`] = temp[j];
            }
        } else {
            result[i] = propertyValue;
        }
    }
    return result;
}
