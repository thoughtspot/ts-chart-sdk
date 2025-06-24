/**
 * @file Custom Chart Context
 * @fileoverview
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import _ from 'lodash';
import {
    AxisMenuActionHandler,
    ChartToTSEvent,
    ChartToTSEventsPayloadMap,
    ContextMenuActionHandler,
    CustomAction,
    ErrorType,
    OpenAxisMenuEventPayload,
    OpenContextMenuEventPayload,
} from '../types/chart-to-ts-event.types';
import {
    AppConfig,
    ChartConfig,
    ChartModel,
    SuccessValidationResponse,
    ValidationResponse,
    VisualConfig,
    VisualProps,
} from '../types/common.types';
import {
    ChartConfigEditorDefinition,
    ConfigEditorDefinitionSetter,
} from '../types/configurator.types';
import {
    AxisMenuCustomActionPayload,
    ChartConfigValidateEventPayload,
    ChartModelUpdateEventPayload,
    ContextMenuCustomActionPayload,
    DataUpdateEventPayload,
    DownloadExcelTriggerPayload,
    GetColumnDataPayload,
    GetColumnDataResponsePayload,
    GetDataQueryPayload,
    GetDataQueryResponsePayload,
    InitializeEventPayload,
    InitializeEventResponsePayload,
    Query,
    TSToChartEvent,
    TSToChartEventsPayloadMap,
    TSToChartInternalEventsPayloadMap,
    VisualPropsUpdateEventPayload,
    VisualPropsValidateEventPayload,
} from '../types/ts-to-chart-event.types';
import {
    VisualEditorDefinitionSetter,
    VisualPropEditorDefinition,
} from '../types/visual-prop.types';
import { setLocaleBasedStringFormats } from '../utils/number-formatting/number-formatting-utils';
import { create } from './logger';
import {
    globalThis,
    initMessageListener,
    postMessageToHostApp,
} from './post-message-event-bridge';

const logger = create('TsChartSDKContext');
/**
 * Configuration for allowing or disallowing specific TS UI features.
 *
 * @fileoverview
 * This configuration defines the ability to toggle specific features such as
 * column number formatting, conditional formatting, and measure names/values.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export type AllowedConfigurations = {
    /**
     * Allows column-level number formatting.
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowColumnNumberFormatting?: boolean;

    /**
     * Allows conditional formatting at the column level.
     * This allows users to apply rules that visually highlight or differentiate data.
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowColumnConditionalFormatting?: boolean;

    /**
     * Allows Gradient coloring at the column level.
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowGradientColoring?: boolean;

    /**
     * Enables measure_name and measure_values in the chart configuration.
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowMeasureNamesAndValues?: boolean;
};
/**
 * Key stored in persistedVisualPropKeys array will be preserved on changing the
 * visualPropeditorDefinition, any other key (expect clientState) would not be preserved for visual props.
 * ### NOTE: like clientState this variable should be a string, preferrably a result of JSON.stringify(<yourlocalClientState>)
 * ### USE CASE: This is to maintain different clientSate for different custom charts developed by same TS custom chart developer.
 * @version SDK: 0.1 | ThoughtSpot:
 */
export type PersistedVisualPropKeys = string[];
/**
 * Configuration parameters for setting chart-specific options.
 *
 * @fileoverview
 * This configuration includes settings for controlling measure name/value columns
 * and batch size limits for data processing.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export type ChartConfigParameters = {
    /**
     * Configurations related to measure name and value columns.
     * These parameters allow for enabling/disabling and aliasing the columns
     * used to represent measure names and values.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    measureNameValueColumns?: {
        /**
         * Enables or disables the measure_name column.
         *
         * @default false
         * @version SDK: 0.1 | ThoughtSpot:
         */
        enableMeasureNameColumn?: boolean;

        /**
         * Enables or disables the measure_value column.
         *
         * @default false
         * @version SDK: 0.1 | ThoughtSpot:
         */
        enableMeasureValueColumn?: boolean;

        /**
         * Alias for the measure_name column.
         * This allows users to define a custom name for the measure_name column.
         *
         * @default 'Measure Name'
         * @version SDK: 0.1 | ThoughtSpot:
         */
        measureNameColumnAlias?: string;

        /**
         * Alias for the measure_value column.
         * This allows users to define a custom name for the measure_value column.
         *
         * @default 'Measure Value'
         * @version SDK: 0.1 | ThoughtSpot:
         */
        measureValueColumnAlias?: string;
    };

    /**
     * Limit on the batch size for data processing.
     * This sets an upper limit on how much data can be processed in a single batch.
     *
     * @default 20000
     * @version SDK: 0.1 | ThoughtSpot:
     */
    batchSizeLimit?: number;
    /**
     * @description
     * Optional parameter to control certain visual elements on the chart For example visibleAction
     * array if Passed will only show those actions in context menu/Action menu of the chart on answer page
     * @type {VisualConfig}
     */
    customChartVisualConfig?: VisualConfig;
};

export type CustomChartContextProps = {
    /**
     * Generate the default axis configuration for rendering the chart on first load.
     *
     * @param chartModel
     * @returns {@link ChartConfig[]}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    getDefaultChartConfig: (chartModel: ChartModel) => ChartConfig[];
    /**
     * Generate query in the form of array of chart columns to fetch the data.
     *
     * @param  ChartConfig[] chartConfig
     * @returns {@link Array<Query>}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    getQueriesFromChartConfig: (
        chartConfig: ChartConfig[],
        chartModel: ChartModel,
    ) => Query[];
    /**
     * Main Render function that will render the chart based on the chart context provided
     *
     * @version SDK: 0.1 | ThoughtSpot:
     * @param {CustomChartContext} ctx the chart context sdk object
     * @returns {@link Promise<void>} Promise object to resolve once the chart is rendered
     */
    renderChart: (ctx: CustomChartContext) => Promise<void>;
    /**
     * Required to validate the current chart configuration
     * that chart user has updated on the chart config editor
     *
     * @version SDK: 0.1 | ThoughtSpot:
     * @param updatedConfig
     * @param chartModel
     * @returns {@link ValidationResponse}
     */
    validateConfig?: (
        updatedConfig: ChartConfig[],
        chartModel: ChartModel,
        appConfig?: AppConfig,
    ) => ValidationResponse;

    /**
     * Required to validate the custom visual props that
     * the chart user has updated on the chart settings editor.
     *
     * @param updatedVisualProps
     * @param chartModel
     * @returns {@link ValidationResponse}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    validateVisualProps?: (
        updatedVisualProps: VisualProps,
        chartModel: ChartModel,
        activeColumnId?: string,
        appConfig?: AppConfig,
    ) => ValidationResponse;

    /**
     * Definition to help edit/customize the chart config from chart config editor on the
     * TS app. If not provided, chart queries will not be configurable in editor
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartConfigEditorDefinition?:
        | ConfigEditorDefinitionSetter
        | ChartConfigEditorDefinition[];

    /**
     * Definition to help edit/customize the visual properties from chart settings editor
     * on the TS app. If not provided, visual properties will not be configurable in
     * editor
     *
     * @param chartModel
     * @returns {@link VisualPropEditorDefinition}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    visualPropEditorDefinition?:
        | VisualEditorDefinitionSetter
        | VisualPropEditorDefinition;

    /**
     * Optional configuration to toggle native TS UI configurations, such as column number
     * formatting and conditional formatting.
     *
     * @type {AllowedConfigurations}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowedConfigurations?: AllowedConfigurations;
    /**
    /**
     * Key stored in persistedVisualPropKeys array will be preserved on changing the
     * visualPropeditorDefinition, any other key (expect clientState) 
     * would not be preserved for visual props.
     * ### NOTE: like clientState this variable should be a string, 
     * preferrably a result of JSON.stringify(<yourlocalClientState>)
     * ### USE CASE: This is to maintain different clientSate for different custom charts 
     * developed by same TS custom chart developer.
     * 
     * @type {PersistedVisualPropKeys}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    persistedVisualPropKeys?: PersistedVisualPropKeys;
    /**
     * Optional parameters for configuring specific chart-related features, such as measure name
     * and value columns.
     *
     * @type {ChartConfigParameters}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartConfigParameters?: ChartConfigParameters;
};

export type ValidationFunctions =
    | CustomChartContextProps['validateVisualProps']
    | CustomChartContextProps['validateConfig'];

/**
 * Default configuration options for all the chart context properties
 */
const DEFAULT_CHART_CONTEXT_PROPS: Partial<CustomChartContextProps> = {
    validateConfig: () => ({ isValid: true }),
    validateVisualProps: () => ({ isValid: true }),
    chartConfigEditorDefinition: undefined,
    allowedConfigurations: {
        allowColumnNumberFormatting: false,
        allowColumnConditionalFormatting: false,
        allowGradientColoring: false,
        allowMeasureNamesAndValues: false,
    },
    persistedVisualPropKeys: undefined,
    chartConfigParameters: {
        measureNameValueColumns: {
            enableMeasureNameColumn: false,
            enableMeasureValueColumn: false,
            measureNameColumnAlias: 'Measure Name',
            measureValueColumnAlias: 'Measure Values',
        },
        batchSizeLimit: 20000,
    },
};

export class CustomChartContext {
    /**
     * ID to map to the parent chart component.
     * This is used to differentiate between multiple chart components rendered on the
     * parent app Example: liveboards with multiple charts
     *
     * @hidden
     * @internal
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private componentId = '';

    private removeListener: () => void = _.noop;

    /**
     * host app url
     *
     * @hidden
     * @internal
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public hostUrl = '';

    /**
     * Chart Model object. This contains the complete metadata persisted with TS
     * application Also contains data.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private chartModel: ChartModel = {} as any;

    /**
     * App Config object. This contains the app state like locale and timezones.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private appConfig: AppConfig = {};

    /**
     * Chart Props Object to define the workflow of the application
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private chartContextProps: CustomChartContextProps =
        DEFAULT_CHART_CONTEXT_PROPS as CustomChartContextProps;

    /**
     * Map of event listeners for the TS to chart events
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    // TODO: define a better type mapping here.
    private eventListeners: Record<string, ((...args: any[]) => void)[]> = {};

    /**
     * This is a promise object to wait on till the chart context
     * is initialized by the parent app
     *
     * @hidden
     * @internal
     * @version SDK: 0.1 | ThoughtSpot:
     */

    private hasInitializedPromise: Promise<void>;

    /**
     * This function triggers on initialization completion from TS app.
     *
     * @hidden
     * @internal
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private triggerInitResolve: () => void = _.noop;

    /**
     * Stores the callbacks of context menu custom action based on custom action id
     *
     * @returns {@link ContextMenuActionHandler}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private contextMenuActionHandler: ContextMenuActionHandler = {};

    /**
     * Stores the callbacks of axis menu custom action based on custom action id
     *
     * @returns {@link AxisMenuActionHandler}
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private axisMenuActionHandler: AxisMenuActionHandler = {};

    public containerEl: HTMLElement | null = null;

    /**
     * Constructor to only accept context props as payload
     *
     * @param  {CustomChartContextProps} chartContextProps
     */
    constructor(chartContextProps: CustomChartContextProps) {
        this.chartContextProps = {
            ...DEFAULT_CHART_CONTEXT_PROPS,
            ...chartContextProps,
        };
        this.registerEventProcessor();
        this.hasInitializedPromise = new Promise((resolve, reject) => {
            this.triggerInitResolve = resolve;
        });
        // Not using this.emitEvent as the context is not yet completely
        // initialized, thus short circuiting.
        postMessageToHostApp('', '*', null, ChartToTSEvent.InitStart);
    }

    /**
     * Function to expose and wait on the initialize promise object.
     * This will resolve immediately if the chart context is already initialized by TS
     * App.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public initialize = (): Promise<void> => {
        logger.log('Chart Context: initialization start');
        return this.hasInitializedPromise;
    };

    /**
     * Add event listeners on the chart context with the required callback.
     *
     * @param  {T} eventType
     * @param  {TSToChartEventsPayloadMap[T]} callbackFn
     * @returns void
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public on<T extends keyof TSToChartEventsPayloadMap>(
        eventType: T,
        callbackFn: TSToChartEventsPayloadMap[T],
    ): void {
        // TODO(chetan): [FIX ME] This function doesnt fail if the function
        // callback is mapped with different argument types
        if (_.isNil(this.eventListeners[eventType])) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callbackFn);
    }

    /**
     * Removes specific event listeners on the chart context.
     *
     * @param  {T} eventType
     * @returns void
     */
    public off<T extends keyof TSToChartEventsPayloadMap>(eventType: T): void {
        if (_.isNil(this.eventListeners[eventType])) {
            logger.log('No event listener found to remove');
            this.eventListeners[eventType] = [];
            return;
        }
        this.eventListeners[eventType].splice(0, 1);
    }

    /**
     * Add internal event listeners on the chart context with the required callback.
     *
     * @param  {T} eventType
     * @param  {TSToChartInternalEventsPayloadMap[T]} callbackFn
     * @returns void
     * @version SDK: 0.1 | ThoughtSpot:
     */
    private onInternal<T extends keyof TSToChartInternalEventsPayloadMap>(
        eventType: T,
        callbackFn: TSToChartInternalEventsPayloadMap[T],
    ): void {
        if (_.isNil(this.eventListeners[eventType])) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callbackFn);
    }

    /**
     * Destroy the chart context object and stop listening to the parent post message
     * events
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public destroy() {
        this.removeListener();
        globalThis.isInitialized = false;
    }

    /**
     * Getter for the chart model object
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public getChartModel = (): ChartModel => this.chartModel;

    /**
     * Getter for the chart model object
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    public getAppConfig = (): AppConfig => this.appConfig;

    /**
     * Function to store the context menu custom action callback mapped with action id
     * @param  {[OpenContextMenuEventPayload]} eventPayload Event payload bound
     *          to the type of the event
     * @returns payload
     */
    public contextMenuCustomActionPreProcessor(
        eventPayload: [OpenContextMenuEventPayload],
    ): [OpenContextMenuEventPayload] {
        // clear out the stored custom events callback for context menu
        this.contextMenuActionHandler = {};
        if (_.isEmpty(eventPayload?.[0]?.customActions)) {
            return eventPayload;
        }
        eventPayload?.[0]?.customActions?.forEach((action: CustomAction) => {
            this.contextMenuActionHandler[action.id] = action.onClick;
        });
        const processedCustomActions = eventPayload[0]?.customActions?.map(
            (action: CustomAction) => {
                return {
                    id: action.id,
                    label: action.label,
                    icon: action.icon,
                };
            },
        );
        const processedPayload: [OpenContextMenuEventPayload] = [
            {
                ...eventPayload[0],
                customActions: processedCustomActions as CustomAction[],
            },
        ];
        return processedPayload;
    }

    /**
     * Funtions return the chart config editor definition
     * @param {ChartConfig[]} currentChartConfig
     * @param {VisualProps}
     * @returns {ChartConfigEditorDefinition[]}
     */
    private getChartConfigEditorDefinition = (
        currentState: Partial<ChartModel> = {},
    ) => {
        if (_.isFunction(this.chartContextProps.chartConfigEditorDefinition)) {
            return this.chartContextProps.chartConfigEditorDefinition(
                {
                    ...this.chartModel,
                    ...currentState,
                },
                this,
            );
        }
        return this.chartContextProps.chartConfigEditorDefinition;
    };

    /**
     * Funtions returns the visual prop editor definition
     * @param {ChartConfig[]} currentChartConfig
     * @param {VisualProps}
     * @returns {VisualPropEditorDefinition}
     */
    private getVisualPropEditorDefinition = (
        activeColumnId?: string,
        currentState: Partial<ChartModel> = {},
    ) => {
        if (_.isFunction(this.chartContextProps.visualPropEditorDefinition)) {
            return this.chartContextProps.visualPropEditorDefinition(
                {
                    ...this.chartModel,
                    ...currentState,
                },
                this,
                activeColumnId,
            );
        }
        return this.chartContextProps.visualPropEditorDefinition;
    };

    /**
     * Function to store the axis menu custom action callback mapped with action id
     * @param  {[OpenAxisMenuEventPayload]} eventPayload Event payload bound
     *          to the type of the event
     * @returns payload
     */
    public axisMenuCustomActionPreProcessor(
        eventPayload: [OpenAxisMenuEventPayload],
    ): [OpenAxisMenuEventPayload] {
        // clear out the stored custom events callback for axis menu
        this.axisMenuActionHandler = {};
        if (_.isEmpty(eventPayload?.[0]?.customActions)) {
            return eventPayload;
        }
        eventPayload[0].customActions?.forEach((action: CustomAction) => {
            this.axisMenuActionHandler[action.id] = action.onClick;
        });
        const processedCustomActions = eventPayload?.[0].customActions?.map(
            (action: CustomAction) => {
                return {
                    id: action.id,
                    label: action.label,
                    icon: action.icon,
                };
            },
        );
        const processedPayload: [OpenAxisMenuEventPayload] = [
            {
                ...eventPayload[0],
                customActions: processedCustomActions as CustomAction[],
            },
        ];
        return processedPayload;
    }

    /**
     * Function to process the event payload based on event type
     * @param  {ChartToTSEventsPayloadMap[T]} eventPayload Event payload bound
     *          to the type of the event
     * @returns payload
     */
    private eventPayloadPreProcessor<T extends keyof ChartToTSEventsPayloadMap>(
        eventType: T,
        eventPayload: ChartToTSEventsPayloadMap[T],
    ): ChartToTSEventsPayloadMap[T] {
        switch (eventType) {
            case ChartToTSEvent.OpenContextMenu:
                return this.contextMenuCustomActionPreProcessor(
                    eventPayload as [OpenContextMenuEventPayload],
                ) as ChartToTSEventsPayloadMap[T];
            case ChartToTSEvent.OpenAxisMenu:
                return this.axisMenuCustomActionPreProcessor(
                    eventPayload as [OpenAxisMenuEventPayload],
                ) as ChartToTSEventsPayloadMap[T];
            default:
                return eventPayload;
        }
    }

    private eventPayloadPostProcessor<
        T extends keyof ChartToTSEventsPayloadMap,
    >(eventType: T, eventResponse: Promise<any>): any {
        switch (eventType) {
            case ChartToTSEvent.UpdateVisualPropEditorDefinition:
                return this.updateVisualPropEditorDefinitionPostProcessor(
                    eventResponse,
                );
            default:
                return eventResponse;
        }
    }

    private async updateVisualPropEditorDefinitionPostProcessor(
        eventResponse: Promise<any>,
    ): Promise<any> {
        // eslint-disable-next-line promise/catch-or-return
        return eventResponse.then((response) => {
            // eslint-disable-next-line promise/always-return
            if (!response?.hasError) {
                const customVisualProp = response.data;
                this.chartModel.visualProps = customVisualProp;
            }
        });
    }

    private validationsResponseProcessor(
        currentValidationState: Partial<ChartModel>,
        validationResponse: ValidationResponse,
        activeColumnId?: string,
    ) {
        const visualPropEditorDefinition = this.getVisualPropEditorDefinition(
            activeColumnId,
            currentValidationState,
        );
        const chartConfigEditorDefinition = this.getChartConfigEditorDefinition(
            currentValidationState,
        );

        return {
            ...validationResponse,
            visualPropEditorDefinition,
            chartConfigEditorDefinition,
        };
    }

    /**
     * Function to emit Chart to TS Events to the TS application.

     * @param  {T} eventType Type of the event
     * @param  {ChartToTSEventsPayloadMap[T]} eventPayload Event payload bound
     *          to the type of the event
     * @returns Promise
     */
    public emitEvent<T extends keyof ChartToTSEventsPayloadMap>(
        eventType: T,
        ...eventPayload: ChartToTSEventsPayloadMap[T]
    ): Promise<any> {
        if (!globalThis.isInitialized) {
            logger.log(
                'Chart Context: not initialized the context, something went wrong',
            );
            return Promise.reject(new Error('Context not initialized'));
        }
        const processedPayload = this.eventPayloadPreProcessor(
            eventType,
            eventPayload,
        );
        const res = postMessageToHostApp(
            this.componentId,
            this.hostUrl,
            processedPayload?.[0] ?? null,
            eventType,
        );
        return this.eventPayloadPostProcessor(eventType, res);
    }

    /**
     * This registers the current chart context to the post message event bridge
     * Process all the functions via the eventProcess callback
     */
    private registerEventProcessor = () => {
        if (globalThis.isInitialized) {
            logger.error(
                'The context is already initialized. you cannot have multiple contexts',
            );
            throw new Error(ErrorType.MultipleContextsNotSupported);
        }
        this.removeListener = initMessageListener(this.eventProcessor);

        this.registerEvents();
    };

    /**
     * Process received host messages from the post message event bridge
     *
     * @param event : Message Event Object
     */
    private eventProcessor = (data: any) => {
        logger.log('Chart Context: message received:', data.eventType, data);

        const messageResponse = this.executeEventListenerCBs(data);

        // respond back to parent to confirm/ack the receipt
        return messageResponse || {};
    };

    /**
     * Register all internal and default external events for TSToChartEvent types
     *
     * @returns void
     */
    private registerEvents = (): void => {
        // Register Internal Events
        // These events will not be readable by the developer

        /**
         * This event is triggered when the TS app initializes the app
         */
        this.onInternal(
            TSToChartEvent.Initialize,
            (payload: InitializeEventPayload) =>
                this.initializeContext(payload),
        );

        /**
         * This event is triggered when the TS app initialization is complete.
         */
        this.onInternal(TSToChartEvent.InitializeComplete, () =>
            this.initializationComplete(),
        );

        /**
         * This event is triggered when the TS app asks for validating the updated visual
         * props If {validateVisualProps} is not defined, default is always returned as
         * true.
         */
        this.onInternal(
            TSToChartEvent.VisualPropsValidate,
            (
                payload: VisualPropsValidateEventPayload,
            ):
                | (ValidationResponse & SuccessValidationResponse)
                | ValidationResponse => {
                if (this.chartContextProps.validateVisualProps) {
                    const validationResponse =
                        this.chartContextProps.validateVisualProps(
                            payload.visualProps,
                            this.chartModel,
                            payload?.activeColumnId,
                            this.appConfig,
                        );
                    if (validationResponse.isValid) {
                        const currentVisualState = {
                            visualProps: payload.visualProps,
                        };
                        const activeColumnId = payload?.activeColumnId;
                        return this.validationsResponseProcessor(
                            currentVisualState,
                            validationResponse,
                            activeColumnId,
                        );
                    }
                    return validationResponse;
                }
                // this will never be true
                return { isValid: false };
            },
        );

        /**
         * This event is triggered when the TS app asks for validating the updated chart
         * configuration If {validateConfig} is not defined, default is always returned as
         * true.
         */
        this.onInternal(
            TSToChartEvent.ChartConfigValidate,
            (
                payload: ChartConfigValidateEventPayload,
            ):
                | (ValidationResponse & SuccessValidationResponse)
                | ValidationResponse => {
                if (this.chartContextProps.validateConfig) {
                    const validationResponse =
                        this.chartContextProps.validateConfig(
                            payload.chartConfig,
                            this.chartModel,
                            this.appConfig,
                        );
                    if (validationResponse.isValid) {
                        const currentConfigState = {
                            config: {
                                ...this.chartModel.config,
                                chartConfig: payload.chartConfig,
                            },
                        };
                        return this.validationsResponseProcessor(
                            currentConfigState,
                            validationResponse,
                        );
                    }
                    return validationResponse;
                }
                // this will never be true
                return { isValid: false };
            },
        );

        /**
         * This event is triggered when the TS app asks for the base queries required
         * by the chart to render.
         */
        this.onInternal(
            TSToChartEvent.GetDataQuery,
            (payload: GetDataQueryPayload): GetDataQueryResponsePayload => {
                const queries =
                    this.chartContextProps.getQueriesFromChartConfig(
                        payload.config,
                        this.chartModel,
                    );
                return {
                    queries,
                };
            },
        );

        /**
         * This event is triggered when the TS app asks for data in a specific columns
         * for certain validations for settings and drop down options related to Conditional
         * formatting and other advanced settings
         */
        this.onInternal(
            TSToChartEvent.GetColumnData,
            (payload: GetColumnDataPayload): GetColumnDataResponsePayload => {
                const parsedData = this.chartModel.data?.[0].data;
                const dataIdx = parsedData?.columns.findIndex(
                    (columnId) => columnId === payload.columnId,
                );
                const dataArray =
                    !_.isNil(dataIdx) && dataIdx > -1
                        ? parsedData?.dataValue.map((it) => it[dataIdx])
                        : [];
                return {
                    data: dataArray,
                };
            },
        );

        /**
         * This event is triggered when the TS app re-renders the chart
         */
        this.onInternal(TSToChartEvent.TriggerRenderChart, () => {
            this.chartContextProps.renderChart(this);
        });

        /**
         * This event is triggered when the custom context action is triggered from TS app
         */
        this.onInternal(
            TSToChartEvent.ContextMenuActionClick,
            (
                payload: ContextMenuCustomActionPayload,
            ): {
                isValid: boolean;
                error?: unknown;
            } => {
                try {
                    const {
                        id: customActionCallback,
                        clickedPoint,
                        selectedPoints,
                        event,
                    } = payload.customAction;
                    const customActionCallbackArgs = {
                        id: customActionCallback,
                        clickedPoint,
                        selectedPoints,
                        event,
                    };
                    this.contextMenuActionHandler[customActionCallback](
                        customActionCallbackArgs,
                    );
                    return {
                        isValid: true,
                    };
                } catch (error: unknown) {
                    logger.log(
                        'ContextMenuCustomAction: payload recieved:',
                        payload,
                        'CustomActionCallbackStore:',
                        this.axisMenuActionHandler,
                    );
                    return {
                        isValid: false,
                        error,
                    };
                }
            },
        );

        /**
         * This event is triggered when the custom axis action is triggered from TS app
         */
        this.onInternal(
            TSToChartEvent.AxisMenuActionClick,
            (
                payload: AxisMenuCustomActionPayload,
            ): {
                isValid: boolean;
                error?: unknown;
            } => {
                try {
                    const {
                        id: customActionCallback,
                        columnIds,
                        event,
                    } = payload.customAction;
                    const customActionCallbackArgs = {
                        id: customActionCallback,
                        columnIds,
                        event,
                    };
                    this.axisMenuActionHandler[customActionCallback](
                        customActionCallbackArgs,
                    );
                    return {
                        isValid: true,
                    };
                } catch (error: unknown) {
                    logger.log(
                        'AxisMenuCustomAction: payload recieved:',
                        payload,
                        'CustomActionCallbackStore:',
                        this.axisMenuActionHandler,
                    );
                    return {
                        isValid: false,
                        error,
                    };
                }
            },
        );

        // Register External Events
        // These events are readable by the developer

        /**
         * This event is triggered when the TS app sends the updated chart model.
         * If event is not defined by developer, default is always sent to refresh the
         * chart iframe.
         */
        this.on(
            TSToChartEvent.ChartModelUpdate,
            (
                payload: ChartModelUpdateEventPayload,
            ): { triggerRenderChart: boolean } => {
                this.chartModel = payload.chartModel;
                return {
                    triggerRenderChart: true,
                };
            },
        );

        /**
         * This event is triggered when the TS app sends the updated data.
         * If event is not defined by developer, default is always sent to refresh the
         * chart iframe.
         */
        this.on(
            TSToChartEvent.DataUpdate,
            (
                payload: DataUpdateEventPayload,
            ): {
                triggerRenderChart: boolean;
            } => {
                this.chartModel.data = payload.data;
                return {
                    triggerRenderChart: true,
                };
            },
        );

        /**
         * This event is triggered when the TS app sends the updated visual properties.
         * If event is not defined by developer, default is always sent to refresh the
         * chart iframe.
         */
        this.on(
            TSToChartEvent.VisualPropsUpdate,
            (
                payload: VisualPropsUpdateEventPayload,
            ): { triggerRenderChart: boolean } => {
                this.chartModel.visualProps = payload.visualProps;
                return {
                    triggerRenderChart: true,
                };
            },
        );
        /**
         * This event is triggered when the TS app sends the download excel trigger.
         */
        this.on(
            TSToChartEvent.DownloadExcelTrigger,
            async (payload: DownloadExcelTriggerPayload) => {
                logger.log(
                    'DownloadExcelTrigger event triggered from TS with payload:',
                    payload,
                );
                return Promise.resolve({
                    fileName: '',
                    error: '',
                    message: 'Download Excel not implemented.',
                });
            },
        );
    };

    /**
     * Private function is going to initialize the flow from TS app and send back
     * the configuration back to ts app to complete the handshake.
     *
     * @param  {InitializeEventPayload} payload
     * @returns InitializeEventResponsePayload
     */
    private initializeContext = (
        payload: InitializeEventPayload,
    ): InitializeEventResponsePayload => {
        this.componentId = payload.componentId;
        this.hostUrl = payload.hostUrl;
        this.chartModel = payload.chartModel;
        this.appConfig = payload.appConfig ?? {};
        this.containerEl = payload.containerElSelector
            ? document.querySelector(payload.containerElSelector)
            : null;
        setLocaleBasedStringFormats(
            this.appConfig.dateFormatsConfig?.tsLocaleBasedStringsFormats,
        );
        return this.publishChartContextPropsToHost();
    };

    private initializationComplete = (): void => {
        // context is now initialized
        globalThis.isInitialized = true;

        // TODO: following can be done behind a promise
        this.triggerInitResolve();
    };

    private publishChartContextPropsToHost =
        (): InitializeEventResponsePayload => {
            // for first search, this would be null
            const hasChartConfig = !_.isEmpty(
                this.chartModel.config.chartConfig,
            );
            const { isValid } =
                hasChartConfig && this.chartContextProps.validateConfig
                    ? this.chartContextProps.validateConfig(
                          this.chartModel.config.chartConfig ?? [],
                          this.chartModel,
                          this.appConfig,
                      )
                    : { isValid: false };

            let defaultChartConfig: ChartConfig[] = [];
            if (!isValid) {
                defaultChartConfig =
                    this.chartContextProps.getDefaultChartConfig(
                        this.chartModel,
                    );
            }
            return {
                isConfigValid: isValid,
                defaultChartConfig,
                chartConfigEditorDefinition:
                    this.getChartConfigEditorDefinition(),
                visualPropEditorDefinition:
                    this.getVisualPropEditorDefinition(),
                allowedConfigurations:
                    this.chartContextProps.allowedConfigurations,
                chartConfigParameters:
                    this.chartContextProps.chartConfigParameters,
                persistedVisualPropKeys:
                    this.chartContextProps.persistedVisualPropKeys,
            };
        };

    /**
     * Process each message events
     *
     * @param event : Message Event Object
     * @returns response to be sent back to the message sender (host)
     */
    private executeEventListenerCBs = (data: any): any => {
        // do basic sanity
        const payload = data.payload;
        let response;
        if (_.isArray(this.eventListeners[data.eventType])) {
            this.eventListeners[data.eventType].forEach((callback) => {
                // this is a problem today if we have multiple callbacks
                // registered. only the last response will be sent back to the
                // server
                response = callback(payload);
            });
        } else {
            response = {
                hasError: true,
                error: `Event type not recognised or processed: ${data.eventType}`,
            };
        }

        logger.log(
            'ChartContext: Response:',
            data.eventType,
            response,
            this.eventListeners[data.eventType]?.length,
        );
        return response;
    };
}

/**
 * Get the initialized chart context object
 *
 * @param  {CustomChartContextProps} customChartConfig
 * @returns Promise
 */
export const getChartContext = async (
    customChartConfig: CustomChartContextProps,
): Promise<CustomChartContext> => {
    const ctx = new CustomChartContext(customChartConfig);
    // wait for initialization here as the host app
    // needs to first handshake with the client app.
    await ctx.initialize();
    return ctx;
};
