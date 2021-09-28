export abstract class SubscriptionTargetInfo {
    protected constructor(public namespace: string) {}

    public static from(target: string | Function): SubscriptionTargetInfo {
        if (target instanceof Function) {
            return new ConstructorSubscriptionTargetInfo(target);
        }

        return new NamespaceSubscriptionTargetInfo(target);
    }

    public abstract isCompatibleWith(event: any): boolean;
}

class ConstructorSubscriptionTargetInfo extends SubscriptionTargetInfo {
    public constructor(public constructorFunction: Function) {
        super(getEventNamespaceFromClass(constructorFunction));
    }

    public isCompatibleWith(event: any): boolean {
        return event instanceof this.constructorFunction;
    }
}

class NamespaceSubscriptionTargetInfo extends SubscriptionTargetInfo {
    public constructor(namespace: string) {
        super(namespace);
    }

    public isCompatibleWith(_event: any): boolean {
        return true;
    }
}

function getEventNamespaceFromClass(targetClass: Function): string {
    return (targetClass as any).namespace;
}
