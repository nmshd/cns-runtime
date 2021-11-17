import { RuntimeModule } from "./RuntimeModule";

export class RuntimeModuleRegistry implements Iterable<RuntimeModule> {
    private readonly modules: RuntimeModule[] = [];

    public getByName<T extends RuntimeModule>(name: string): T {
        return this.modules.find((m) => m.name.toLowerCase() === name.toLowerCase()) as T;
    }

    public add(module: RuntimeModule): void {
        this.modules.push(module);
    }

    public toArray(): RuntimeModule[] {
        return this.modules.slice();
    }

    public [Symbol.iterator](): Iterator<RuntimeModule, any, undefined> {
        return new ModulesIterator(this.modules);
    }
}

export class ModulesIterator implements Iterator<RuntimeModule> {
    private currentIndex = 0;

    public constructor(private readonly items: RuntimeModule[]) {}

    public next(_value?: any): IteratorResult<RuntimeModule> {
        return {
            value: this.items[this.currentIndex++],
            done: this.currentIndex > this.items.length
        };
    }
}
