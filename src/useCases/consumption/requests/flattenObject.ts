export function flattenObject(object: any): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in object) {
        const propertyValue = object[key];
        if (typeof propertyValue === "object" && !Array.isArray(propertyValue)) {
            const temp = flattenObject(propertyValue);
            for (const j in temp) {
                result[`${key}.${j}`] = temp[j];
            }
        } else {
            result[key] = propertyValue;
        }
    }
    return result;
}
