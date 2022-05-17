import { IDatabaseConnection } from "@js-soft/docdb-access-abstractions";
import { ILogger, ILoggerFactory } from "@js-soft/logging-abstractions";
import { EventBus, EventEmitter2EventBus } from "@js-soft/ts-utils";
import {
    ConsumptionAttributesController,
    ConsumptionController,
    DraftsController,
    IncomingRequestsController,
    OutgoingRequestsController,
    SettingsController
} from "@nmshd/consumption";
import {
    AccountController,
    AnonymousTokenController,
    ChallengeController,
    DeviceController,
    DevicesController,
    FileController,
    ICoreAddress,
    IdentityController,
    MessageController,
    RelationshipsController,
    RelationshipTemplateController,
    TokenController,
    Transport
} from "@nmshd/transport";
import { Container, Scope } from "typescript-ioc";
import { DatabaseSchemaUpgrader } from "./DatabaseSchemaUpgrader";
import { DataViewExpander } from "./dataViews";
import {
    ModulesInitializedEvent,
    ModulesLoadedEvent,
    ModulesStartedEvent,
    RuntimeInitializedEvent,
    RuntimeInitializingEvent,
    TransportLibraryInitializedEvent,
    TransportLibraryInitializingEvent
} from "./events";
import { AnonymousServices, ConsumptionServices, ModuleConfiguration, RuntimeModule, RuntimeModuleRegistry, TransportServices } from "./extensibility";
import { DeciderModule, MessageModule, RequestModule } from "./modules";
import { RuntimeConfig } from "./RuntimeConfig";
import { RuntimeLoggerFactory } from "./RuntimeLoggerFactory";
import { RuntimeHealth } from "./types";
import { RuntimeErrors } from "./useCases";
import { SchemaRepository } from "./useCases/common/SchemaRepository";

export interface RuntimeServices {
    transportServices: TransportServices;
    consumptionServices: ConsumptionServices;
    dataViewExpander: DataViewExpander;
}

export abstract class Runtime<TConfig extends RuntimeConfig = RuntimeConfig> {
    protected logger: ILogger;
    protected loggerFactory: ILoggerFactory;
    protected runtimeConfig: TConfig;
    protected transport: Transport;

    private _anonymousServices: AnonymousServices;
    public get anonymousServices(): AnonymousServices {
        return this._anonymousServices;
    }

    private _accountController?: AccountController;
    private _consumptionController?: ConsumptionController;

    protected isLoggedIn(): boolean {
        return !!this._accountController;
    }

    protected getAccountController(): AccountController {
        if (!this._accountController) throw RuntimeErrors.startup.noActiveAccount();
        return this._accountController;
    }

    protected getConsumptionController(): ConsumptionController {
        if (!this._consumptionController) throw RuntimeErrors.startup.noActiveConsumptionController();
        return this._consumptionController;
    }

    protected async login(accountController: AccountController, consumptionController: ConsumptionController): Promise<RuntimeServices> {
        this._accountController = accountController;
        const transportServices = Container.get<TransportServices>(TransportServices);

        this._consumptionController = consumptionController;
        const consumptionServices = Container.get<ConsumptionServices>(ConsumptionServices);

        const dataViewExpander = Container.get<DataViewExpander>(DataViewExpander);

        await new DatabaseSchemaUpgrader(accountController, consumptionController).upgradeSchemaVersion();

        return { transportServices, consumptionServices, dataViewExpander };
    }

    private _modules: RuntimeModuleRegistry;
    public get modules(): RuntimeModuleRegistry {
        return this._modules;
    }

    public abstract getServices(address: string | ICoreAddress): RuntimeServices;

    private readonly _eventBus: EventBus;
    public get eventBus(): EventBus {
        return this._eventBus;
    }

    public constructor(config: TConfig) {
        this.runtimeConfig = config;
        this._eventBus = new EventEmitter2EventBus();
    }

    private _isInitialized = false;
    public get isInitialized(): boolean {
        return this._isInitialized;
    }

    public async init(): Promise<void> {
        if (this._isInitialized) {
            throw RuntimeErrors.general.alreadyInitialized();
        }

        this.eventBus.publish(new RuntimeInitializingEvent());

        this.loggerFactory = await this.createLoggerFactory();

        await this.initDIContainer();

        await this.initTransportLibrary();
        await this.initAccount();

        this._modules = new RuntimeModuleRegistry();
        await this.loadModules();
        await this.initInfrastructure();
        await this.initModules();

        this._isInitialized = true;
        this.eventBus.publish(new RuntimeInitializedEvent());
    }

    protected initInfrastructure(): void | Promise<void> {
        return;
    }

    protected abstract createLoggerFactory(): Promise<ILoggerFactory> | ILoggerFactory;

    protected abstract createDatabaseConnection(): Promise<IDatabaseConnection>;

    protected abstract initAccount(): Promise<void>;

    public abstract getHealth(): Promise<RuntimeHealth>;

    public async getSupportInformation(): Promise<{ health: RuntimeHealth; configuration: TConfig }> {
        const health = await this.getHealth();
        const config = JSON.parse(JSON.stringify(this.runtimeConfig)) as TConfig;

        return {
            health: health,
            configuration: config
        };
    }

    private async initTransportLibrary() {
        this.eventBus.publish(new TransportLibraryInitializingEvent());
        this.logger.debug("Initializing Database connection... ");

        const databaseConnection = await this.createDatabaseConnection();

        this.transport = new Transport(databaseConnection, this.runtimeConfig.transportLibrary, this.loggerFactory);

        this.logger.debug("Initializing Transport Library...");
        await this.transport.init();
        this.logger.debug("Finished initialization of Transport Library.");

        this._anonymousServices = Container.get<AnonymousServices>(AnonymousServices);

        this.eventBus.publish(new TransportLibraryInitializedEvent());
    }

    private async initDIContainer() {
        Container.bind(EventBus)
            .factory(() => this.eventBus)
            .scope(Scope.Singleton);

        Container.bind(RuntimeLoggerFactory)
            .factory(() => this.loggerFactory)
            .scope(Scope.Singleton);

        Container.bind(AccountController)
            .factory(() => this.getAccountController())
            .scope(Scope.Request);

        Container.bind(DevicesController)
            .factory(() => this.getAccountController().devices)
            .scope(Scope.Request);

        Container.bind(DeviceController)
            .factory(() => this.getAccountController().activeDevice)
            .scope(Scope.Request);

        Container.bind(FileController)
            .factory(() => this.getAccountController().files)
            .scope(Scope.Request);

        Container.bind(IdentityController)
            .factory(() => this.getAccountController().identity)
            .scope(Scope.Request);

        Container.bind(MessageController)
            .factory(() => this.getAccountController().messages)
            .scope(Scope.Request);

        Container.bind(RelationshipTemplateController)
            .factory(() => this.getAccountController().relationshipTemplates)
            .scope(Scope.Request);

        Container.bind(RelationshipsController)
            .factory(() => this.getAccountController().relationships)
            .scope(Scope.Request);

        Container.bind(TokenController)
            .factory(() => this.getAccountController().tokens)
            .scope(Scope.Request);

        Container.bind(ChallengeController)
            .factory(() => this.getAccountController().challenges)
            .scope(Scope.Request);

        Container.bind(ConsumptionController)
            .factory(() => this.getConsumptionController())
            .scope(Scope.Request);

        Container.bind(ConsumptionAttributesController)
            .factory(() => this.getConsumptionController().attributes)
            .scope(Scope.Request);

        Container.bind(DraftsController)
            .factory(() => this.getConsumptionController().drafts)
            .scope(Scope.Request);

        Container.bind(IncomingRequestsController)
            .factory(() => this.getConsumptionController().incomingRequests)
            .scope(Scope.Request);

        Container.bind(OutgoingRequestsController)
            .factory(() => this.getConsumptionController().outgoingRequests)
            .scope(Scope.Request);

        Container.bind(SettingsController)
            .factory(() => this.getConsumptionController().settings)
            .scope(Scope.Request);

        Container.bind(AnonymousTokenController)
            .factory(() => new AnonymousTokenController(this.transport.config))
            .scope(Scope.Singleton);

        const schemaRepository = new SchemaRepository();
        await schemaRepository.loadSchemas();
        Container.bind(SchemaRepository)
            .factory(() => schemaRepository)
            .scope(Scope.Singleton);
    }

    private async loadModules() {
        this.logger.info("Loading modules...");

        for (const moduleName in this.runtimeConfig.modules) {
            const moduleConfiguration = this.runtimeConfig.modules[moduleName];

            if (!moduleConfiguration.enabled) {
                this.logger.debug(`Skip loading module '${this.getModuleName(moduleConfiguration)}' because it is not enabled.`);
                continue;
            }

            if (!moduleConfiguration.location) {
                this.logger.error(`Skip loading module '${this.getModuleName(moduleConfiguration)}' because has no location.`);
                continue;
            }

            // handle the builtin '@nmshd/runtime' modules based on their name
            if (moduleConfiguration.location.startsWith("@nmshd/runtime:")) return this.loadBuiltinModule(moduleConfiguration);

            await this.loadModule(moduleConfiguration);
        }

        this.eventBus.publish(new ModulesLoadedEvent());
    }

    private loadBuiltinModule(moduleConfiguration: ModuleConfiguration) {
        const moduleName = moduleConfiguration.location.split(":")[1];

        switch (moduleName) {
            case "DeciderModule":
                const deciderModule = new DeciderModule(this, moduleConfiguration, this.loggerFactory.getLogger(DeciderModule));
                this.modules.add(deciderModule);
                break;
            case "RequestModule":
                const requestModule = new RequestModule(this, moduleConfiguration, this.loggerFactory.getLogger(RequestModule));
                this.modules.add(requestModule);
                break;
            case "MessageModule":
                const messageModule = new MessageModule(this, moduleConfiguration, this.loggerFactory.getLogger(MessageModule));
                this.modules.add(messageModule);
                break;
            default:
                throw new Error(`Module ${moduleConfiguration.name} is not a builtin module.`);
        }
    }

    protected abstract loadModule(moduleConfiguration: ModuleConfiguration): Promise<void>;

    private async initModules() {
        this.logger.info("Initializing modules...");

        for (const module of this.modules.toArray()) {
            try {
                await module.init();
                this.logger.info(`Module '${this.getModuleName(module)}' was initialized successfully.`);
            } catch (e) {
                this.logger.error(`Module '${this.getModuleName(module)}' could not be initialized.`, e);
                throw e;
            }
        }

        this.eventBus.publish(new ModulesInitializedEvent());
    }

    private _isStarted = false;
    public get isStarted(): boolean {
        return this._isStarted;
    }

    public async start(): Promise<void> {
        if (!this._isInitialized) {
            throw RuntimeErrors.general.notInitialized();
        }

        if (this._isStarted) {
            throw RuntimeErrors.general.alreadyStarted();
        }

        await this.startInfrastructure();
        await this.startModules();

        this._isStarted = true;
    }

    protected startInfrastructure(): void | Promise<void> {
        return;
    }

    protected async stop(): Promise<void> {
        if (!this._isInitialized) {
            throw RuntimeErrors.general.notInitialized();
        }

        if (!this._isStarted) {
            throw RuntimeErrors.general.notStarted();
        }

        await this.stopModules();
        await this.stopInfrastructure();

        this.logger.info("Closing AccountController...");
        await this._accountController?.close();
        this._accountController = undefined;
        this.logger.info("AccountController was closed successfully.");

        this._isInitialized = false;
        this._isStarted = false;
    }

    protected stopInfrastructure(): void | Promise<void> {
        return;
    }

    private async stopModules() {
        this.logger.info("Stopping modules...");

        for (const module of this.modules.toArray()) {
            try {
                await module.stop();
                this.logger.info(`Module '${this.getModuleName(module)}' was stopped successfully.`);
            } catch (e) {
                this.logger.error(`An Error occured while stopping module '${this.getModuleName(module)}': `, e);
            }
        }

        this.logger.info("Stopped all modules.");
    }

    private async startModules() {
        this.logger.info("Starting modules...");

        for (const module of this.modules.toArray()) {
            try {
                await module.start();
                this.logger.info(`Module '${this.getModuleName(module)}' was started successfully.`);
            } catch (e) {
                this.logger.error(`Module '${this.getModuleName(module)}' could not be started.`, e);
                throw e;
            }
        }

        this.eventBus.publish(new ModulesStartedEvent());
        this.logger.info("Started all modules.");
    }

    protected getModuleName(moduleConfiguration: ModuleConfiguration | RuntimeModule): string {
        return moduleConfiguration.displayName || moduleConfiguration.name || JSON.stringify(moduleConfiguration);
    }
}
