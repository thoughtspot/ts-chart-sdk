import { AllowedConfigurations } from '../main/custom-chart-context';
import { ChartColumn } from './answer-column.types';
import { Point } from './chart-to-ts-event.types';
import {
    AppConfig,
    ChartConfig,
    ChartModel,
    QueryData,
    ValidationResponse,
    VisualProps,
} from './common.types';
import { ChartConfigEditorDefinition } from './configurator.types';
import { VisualPropEditorDefinition } from './visual-prop.types';

/**
 * All the events sent from the ThoughtSpot application to Custom Chart App
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group ThoughtSpot to Chart Events
 */
export enum TSToChartEvent {
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    Initialize = 'Initialize',
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    InitializeComplete = 'InitializeComplete',

    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    GetDataQuery = 'GetDataQuery',

    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    ChartConfigValidate = 'ChartConfigValidate',
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    ChartModelUpdate = 'ChartModelUpdate',
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    DataUpdate = 'DataUpdate',

    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    TriggerRenderChart = 'TriggerRenderChart',

    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    VisualPropsValidate = 'VisualPropsValidate',
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    VisualPropsUpdate = 'VisualPropsUpdate',
    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */

    ContextMenuActionClick = 'ContextMenuActionClick',

    /**
     * @version SDK: 0.1 | ThoughtSpot:
     */
    AxisMenuActionClick = 'AxisMenuActionClick',
}

/**
 * Map of callback function with the event types
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group ThoughtSpot to Chart Events
 */
export interface TSToChartEventsPayloadMap {
    [TSToChartEvent.ChartModelUpdate]: (
        payload: ChartModelUpdateEventPayload,
    ) => void;
    [TSToChartEvent.DataUpdate]: (payload: DataUpdateEventPayload) => void;
    [TSToChartEvent.VisualPropsUpdate]: (
        payload: VisualPropsUpdateEventPayload,
    ) => void;
}

/**
 * Map of internal events that will not be exposed to the developers
 * and is only for internal usage.
 *
 * @internal
 * @hidden
 * @version SDK: 0.1 | ThoughtSpot:
 * @group ThoughtSpot to Chart Events
 */
export interface TSToChartInternalEventsPayloadMap {
    [TSToChartEvent.Initialize]: (
        payload: InitializeEventPayload,
    ) => InitializeEventResponsePayload;

    [TSToChartEvent.InitializeComplete]: () => void;

    [TSToChartEvent.GetDataQuery]: (
        payload: GetDataQueryPayload,
    ) => GetDataQueryResponsePayload;

    [TSToChartEvent.ChartConfigValidate]: (
        payload: ChartConfigValidateEventPayload,
    ) => ValidationResponse;

    [TSToChartEvent.VisualPropsValidate]: (
        payload: VisualPropsValidateEventPayload,
    ) => ValidationResponse;

    [TSToChartEvent.TriggerRenderChart]: () => void;

    [TSToChartEvent.ContextMenuActionClick]: (
        payload: ContextMenuCustomActionPayload,
    ) => void;

    [TSToChartEvent.AxisMenuActionClick]: (
        payload: AxisMenuCustomActionPayload,
    ) => void;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface InitializeEventPayload {
    /**
     * The entire chart object with data
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartModel: ChartModel;

    /**
     * Additional app configuration
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    appConfig?: AppConfig;

    /**
     * This is a unique component id that the context should send in every
     * post message payload. This helps in identifying multiple app components.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    componentId: string;
    /**
     * The host URL of the parent to send the post message requests to.
     * We cannot use the window.parent object details to fetch this.
     * Hence sending in init flow.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    hostUrl: string;
    /**
     * The selector of the container element where the chart will be rendered. Used for internal
     * charts, external custom charts mostly have their own DOM.
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    containerElSelector: string;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface InitializeEventResponsePayload {
    /**
     * Boolean value to define if the current config is valid or not
     * Would be true if the validateChartConfig function is not defined
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    isConfigValid: boolean;
    /**
     * Default Chart Config generated if the chart config is not valid or not present.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultChartConfig: ChartConfig[];
    /**
     * chart config editor definition
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartConfigEditorDefinition?: ChartConfigEditorDefinition[];
    /**
     * visual properties editor definition
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    visualPropEditorDefinition?: VisualPropEditorDefinition;
    /**
     * Toggle native configurations supported by TS UI. Ex: column level number and conditional
     * formatting.
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    allowedConfigurations?: AllowedConfigurations;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface GetDataQueryPayload {
    config: ChartConfig[];
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface QueryColumn extends ChartColumn {
    /**
     * Flag to identify if the column is a measure value,
     * to be used along with MEASURE_NAME/MEASUE_VALUE column in the query
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    isMeasureValue?: boolean;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface Query {
    queryColumns: QueryColumn[];
    queryParams?: {
        offset?: number;
        size?: number;
    };
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface GetDataQueryResponsePayload {
    queries: Query[];
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface ChartModelUpdateEventPayload {
    /**
     * updated chart model
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartModel: ChartModel;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface DataUpdateEventPayload {
    /**
     * updated data in the chart model
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    data: QueryData[];
}
export interface VisualPropsUpdateEventPayload {
    /**
     * updated visual properties
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    visualProps: VisualProps;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface VisualPropsValidateEventPayload {
    /**
     * updated visual properties
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    visualProps: VisualProps;
    /**
     * used to identify active column for column level settings, empty string in case of overall
     * chart settings
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    activeColumnId?: string;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface ChartConfigValidateEventPayload {
    /**
     * updated chart config properties
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    chartConfig: ChartConfig[];
}

/**
 * Custom action dispatched by context menu of the chart
 *
 * @group ThoughtSpot to Chart Events
 * @version SDK: 0.1 | ThoughtSpot:
 */
export interface CustomContextMenuAction {
    id: string;
    clickedPoint: Point;
    selectedPoints?: Point[];
    event: Pick<PointerEvent, 'clientX' | 'clientY'>;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface ContextMenuCustomActionPayload {
    /**
     * Dispatched custom action from context menu
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    customAction: CustomContextMenuAction;
}

/**
 * Custom action dispatched by axis menu of the chart
 *
 * @group ThoughtSpot to Chart Events
 * @version SDK: 0.1 | ThoughtSpot:
 */
export interface CustomAxisMenuAction {
    id: string;
    columnIds: string[];
    event: Pick<PointerEvent, 'clientX' | 'clientY'>;
}

/**
 *
 * @group ThoughtSpot to Chart Events
 */
export interface AxisMenuCustomActionPayload {
    /**
     * Dispatched custom action from context menu
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    customAction: CustomAxisMenuAction;
}
