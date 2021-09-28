import { CUSTOM_METADATA_NAMESPACE } from "./Constants";

export function getCustomClassDecoratorValue<T>(decoratorKey: string, targetClass: Function): T | undefined {
    const decorators = getCustomClassDecorators(targetClass);

    const decorator = decorators.find((d) => d.key.endsWith(decoratorKey));
    return decorator ? <T>decorator.value : undefined;
}

export function getCustomClassDecorators(targetClass: Function): { key: string; value: any }[] {
    const keys: string[] = Reflect.getMetadataKeys(targetClass);

    const decorators = keys
        .filter((key) => key.toString().startsWith(CUSTOM_METADATA_NAMESPACE))
        .map((key) => {
            return { key: key, value: Reflect.getMetadata(key, targetClass) };
        });

    return decorators;
}
