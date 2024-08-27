import { VisualProps } from './common.types';
import {
    CustomAxisMenuAction,
    CustomContextMenuAction,
    Query,
} from './ts-to-chart-event.types';

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export enum ChartToTSEvent {
    /**
     * Context Menu events
     */
    OpenContextMenu = 'OpenContextMenu',
    CloseContextMenu = 'CloseContextMenu',

    /**
     * Axis Menu events
     */
    OpenAxisMenu = 'OpenAxisMenu',
    CloseAxisMenu = 'CloseAxisMenu',

    /**
     * Render life cycle events
     */
    InitStart = 'InitStart',
    RenderStart = 'RenderStart',
    RenderError = 'RenderError',
    RenderComplete = 'RenderComplete',

    /**
     * Visual props update
     */
    UpdateVisualProps = 'UpdateVisualProps',

    /**
     * TML events
     */
    GetTMLString = 'GetTMLString',
    SetTMLString = 'SetTMLString',

    /**
     * Fetch data for custom query
     */
    GetDataForQuery = 'GetDataForQuery',

    /**
     * Tooltip events
     */
    ShowToolTip = 'ShowToolTip',
    HideToolTip = 'HideToolTip',
}

/**
 * This map defines the event type and its corresponding payload needed by the event
 *
 * @version SDK: 0.1 | ThoughtSpot:
 * @group Chart to ThoughtSpot Events
 */
export interface ChartToTSEventsPayloadMap {
    /**
     * Trigger to open Context Menu
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.OpenContextMenu]: [OpenContextMenuEventPayload];
    /**
     * Trigger to close Context Menu
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.CloseContextMenu]: [];

    /**
     * Trigger to notify the Initialization start
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    [ChartToTSEvent.InitStart]: [];
    /**
     * Trigger to notify the render start
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderStart]: [];
    /**
     * Trigger to notify the render completion
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderComplete]: [];
    /**
     * Trigger to notify the render error
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderError]: [RenderErrorEventPayload];
    /**
     * Trigger to update the visual props
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.UpdateVisualProps]: [UpdateVisualPropsEventPayload];

    /**
     * Trigger to get the TML string
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.GetTMLString]: [];
    /**
     * Trigger to set the TML string
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.SetTMLString]: [SetTMLStringEventPayload];
    /**
     * Trigger to get the data for custom query
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.GetDataForQuery]: [GetDataForQueryEventPayload];
    /**
     * Trigger to update the visual props
     *
     * @version SDK: 0.0.1-alpha.4 | ThoughtSpot:
     */
    [ChartToTSEvent.ShowToolTip]: [ShowToolTipEventPayload];
    /**
     * Trigger to update the visual props
     *
     * @version SDK: 0.0.1-alpha.4 | ThoughtSpot:
     */
    [ChartToTSEvent.HideToolTip]: [];
    /**
     * Trigger to open Axis Menu
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    [ChartToTSEvent.OpenAxisMenu]: [OpenAxisMenuEventPayload];
    /**
     *  Trigger to close Axis Menu
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    [ChartToTSEvent.CloseAxisMenu]: [];
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export interface UpdateVisualPropsEventPayload {
    visualProps: VisualProps;
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export interface SetTMLStringEventPayload {
    // TML string to be set
    tmlString: string;
}

/**
 * @group Chart to ThoughtSpot Events / Context Menu
 */
// start - open context menu payload
export interface PointVal {
    // Column ID of the column associated with the value
    columnId: string;
    // Value of the point clicked on, mostly makes sense for attributes.
    // This can be an array of values as well.
    value: any;
}
/**
 *
 * @group Chart to ThoughtSpot Events / Context Menu
 */
export interface Point {
    tuple: PointVal[];
}

/**
 *
 * @group Chart to ThoughtSpot Events / Context Menu
 */
export interface CustomAction {
    id: string; // ID of the user-defined action
    label: string; // Developer should i18n this
    icon?: string; // Icon string to show on the context/axis menu

    /**
     * This function will need to have a defined set of arguments.
     * For example, pointClick Event, point details and chart model in case of context menu
     * For Axis menu, it would be different.
     *
     * Callback will be triggered via postMessage API contract.
     */
    onClick: (...args: any[]) => void;
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export interface OpenContextMenuEventPayload {
    event: Pick<PointerEvent, 'clientX' | 'clientY'>;
    clickedPoint: Point;
    selectedPoints?: Point[];
    customActions?: CustomAction[];
}
// end - open context menu payload

/**
 * Payload for the event triggered to show a tooltip
 */
export interface ShowToolTipEventPayload {
    /**
     * The pointer event that triggered the tooltip display
     * It includes the client's X and Y coordinates.
     */
    event: Pick<PointerEvent, 'clientX' | 'clientY'>;
    /**
     * Optional custom content to display in the tooltip.
     */
    customTooltipContent?: string[];
    /**
     * Information about the data point associated
     * with the tooltip
     * User can also include both point and customTooltipContent
     * depending upon the requirement
     */
    point?: Point;
}
// end - tooltip payload

/**
 * @group Chart to ThoughtSpot Events
 */
export interface RenderErrorEventPayload {
    hasError: boolean;
    error: any;
}

/**
 * @group Chart to ThoughtSpot Events
 */
export interface GetDataForQueryEventPayload {
    queries: Query[];
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export enum ErrorType {
    MultipleContextsNotSupported = 'MultipleContextsNotSupported',
}

/**
 * List of supported actions for the menu items in the axis menu
 * @group Chart to ThoughtSpot Events
 */
export enum AxisMenuActions {
    /**
     * Change the aggregation of the column from the possible options.
     * Only supported for numeric columns.
     */
    AGGREGATE = 'AGGREGATE',
    /**
     * Change the bucketing of the date or date time column from the possible options.
     * Only supported for date or date time columns.
     * */
    TIME_BUCKET = 'TIME_BUCKET',
    /**
     * Add or update the filter for the column.
     * */
    FILTER = 'FILTER',
    /**
     * Sort the column in ascending or descending order.
     * */
    SORT = 'SORT',

    /**
     * These 2 methods are disabled currently as they are not supported by the backend.
     * Following are the reasons for the same:
     * 1. Remove is ambiguous as it can mean remove from the answer scope or remove from the chart.
     * 2. Rename columns is not supported by the menu for now. If need be, this can be implemented.
     */
    // /**
    //  * Rename the column.
    //  * */
    // RENAME = 'RENAME',
    // /**
    //  * Remove the column from the answer scope.
    //  * */
    // REMOVE = 'REMOVE',
    /**
     * Defines a separator element between the actions.
     * Can be added multiple times.
     * */
    SEPARATOR = 'SEPARATOR',
}

export interface AxisMenuCustomAction {
    /**
     * ID of the custom action.
     * */
    id: string;
    /**
     * Label of the custom action.
     * */
    label: string;
    /**
     * Icon of the custom action.
     * */
    icon?: string;
    /**
     * Callback function that will be triggered when the custom action is clicked.
     * */
    onClick: (...args: any[]) => void;
}

export interface OpenAxisMenuEventPayload {
    /**
     * The pointer event that triggered the event to position the axis menu.
     */
    event: Pick<PointerEvent, 'clientX' | 'clientY'>;
    /**
     * The column IDs of the columns that can be modified via the axis menu.
     * This maps to the columns in chart model.
     * The order of the column IDs is the same as the order of the columns in the axis menu.
     * Atleast one column id is required.
     * */
    columnIds: string[];
    /**
     * The list of actions that are supported for the axis menu for each column.
     * The order of the actions is the same as the order of the columns in the axis menu.
     * If empty, all the supported actions in default order will be available.
     * */
    selectedActions?: AxisMenuActions[];
    /**
     * Custom action defined by the developer of the chart.
     * This action will trigger the callback defined in the custom action payload.
     * can be added multiple times.
     * @hidden
     * */
    customActions?: AxisMenuCustomAction[];
}

/**
 *
 * @group Custom action callback mapping with action id/ Context Menu
 */
export interface ContextMenuActionHandler {
    [key: string]: (args: CustomContextMenuAction) => void;
}

/**
 *
 * @group Custom action callback mapping with action id/ Axis Menu
 */
export interface AxisMenuActionHandler {
    [key: string]: (args: CustomAxisMenuAction) => void;
}
