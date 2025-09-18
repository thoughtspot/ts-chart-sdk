import { ChartConfig, VisualProps } from './common.types';
import {
    CustomAxisMenuAction,
    CustomContextMenuAction,
    Query,
} from './ts-to-chart-event.types';
import { VisualPropEditorDefinition } from './visual-prop.types';

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
     * Action Handle events
     */
    ActionHandler = 'ActionHandler',

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
    /**
     * Global toast alert event
     */
    ShowGlobalAlertToast = 'ShowGlobalAlertToast',
    /**
     * Label translation events.
     */
    GetLabelTranslation = 'GetLabelTranslation',
    /**
     * Update visual prop editor definition
     */
    UpdateVisualPropEditorDefinition = 'UpdateVisualPropEditorDefinition',
    /**
     * Update chart config
     */
    UpdateChartConfig = 'UpdateChartConfig',
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
    [ChartToTSEvent.RenderStart]: [RenderStartEventPayload?]; // The payload for this event is optional.
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
     * Trigger to update the show tooltips
     *
     * @version SDK: 0.0.1-alpha.4 | ThoughtSpot:
     */
    [ChartToTSEvent.ShowToolTip]: [ShowToolTipEventPayload];
    /**
     * Trigger to update the show toast alerts
     *
     * @version SDK: 0.0.1-alpha.4 | ThoughtSpot:
     */
    [ChartToTSEvent.ShowGlobalAlertToast]: [ShowGlobalAlertToastEventPayload];
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

    /**
     * Trigger to handle the action
     *
     * @version SDK: 2.4.0 | ThoughtSpot:
     */
    [ChartToTSEvent.ActionHandler]: [ActionHandlerEventPayload];
    /**
     * Trigger this event to get the locale translated msg values based on the msgId provided.
     * These msgIds corresponds to the msgIds defined in string.po file of ThoughtSpot.
     * example:
     * msgId: 'chart.tooltip.title'
     * msg: 'Tooltip Title'  // based on the locale of ThoughtSpot instance.
     * @version SDK: 2.1.0 | ThoughtSpot:
     */
    [ChartToTSEvent.GetLabelTranslation]: [GetLabelTranslationPayload];
    /**
     * Trigger this event when you want to update the visual prop editor definition.
     * This event takes the updated editor definition as payload.
     */
    [ChartToTSEvent.UpdateVisualPropEditorDefinition]: [
        UpdateVisualPropEditorDefinitionEventPayload,
    ];
    /**
     * Trigger this event when you want to update the chart config.
     * This event takes the updated chart config as payload.
     */
    [ChartToTSEvent.UpdateChartConfig]: [UpdateChartConfigEventPayload];
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
export interface RenderStartEventPayload {
    // A custom message displayed while the chart is loading.
    // This message typically appears if the chart takes longer than 30 seconds
    // to load, but the exact display logic is determined by the ts-chart-app
    // package.
    loadingMessage?: string;
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
 * This payload is used to get array of msgIds to get the locale translated msg values.
 * @group Chart to ThoughtSpot Events
 */

export interface GetLabelTranslationPayload {
    msgIds: string[];
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
 * This interface is used to define the custom action menu item group for cascading menu items.
 *
 * @group Chart to ThoughtSpot Events / Context Menu
 */
export interface CustomActionMenuItemGroup {
    /**
     * Title of the custom action menu item group.
     * */
    title: string;
    /**
     * Items of the custom action menu item group.
     * */
    items: CustomAction[];
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
    onClick?: (...args: any[]) => void;
    /**
     * flag to disable MenuItem
     */
    itemDisabled?: boolean;
    /**
     * Tooltip when MenuItem is disabled
     */
    itemDisabledTooltip?: string;
    /**
     * This is used to check if the custom action is selected.
     * This is used to show the custom action as selected in the axis menu.
     */
    isSelected?: boolean;
    /**
     * This is used to add cascading items to the custom action.
     * */
    cascadingItems?: CustomActionMenuItemGroup[];
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

export type ButtonType = 'primary' | 'secondary' | 'tertiary';

export interface AlertActionButton {
    /*
     * ID of the user-defined action
     */
    id: string;
    /**
     * Label for action button
     */
    label: string;
    /**
     * Callback for when the user clicks on action button
     */
    onClick?: () => any;
    /**
     * If the action button is disabled
     */
    isDisabled?: boolean;
    /**
     * i18ned Tooltip to show on the button
     */
    tooltip?: string;
    /**
     * Type of button
     * @default 'primary'
     */
    type?: ButtonType;
}

export interface ShowGlobalAlertToastEventPayload {
    /**
     * i18n message that will be shown.
     *
     */
    alertMessage: string;
    /**
     * label translation id's defined in thoughtspot
     */
    labelTranslation?: string;
    /**
     * enable close button in toast alert component.
     * @default true
     */
    showCloseButton?: boolean;
    /**
     * want to show checkmark icon in Toast by default set to `true`.
     * @default true
     */
    showCheckmarkIcon?: boolean;
    /**
     * Whether or not to auto hide the alert after a delay (4.8s)
     *
     * @default true
     */
    autoHide?: boolean;
    /**
     * Show a primary button with callback
     */
    primaryActionButton?: AlertActionButton;
}

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

export interface UpdateVisualPropEditorDefinitionEventPayload {
    /**
     * The updated visual prop editor definition.
     * This is used to update the visual prop editor in the chart.
     */
    visualPropEditorDefinition: VisualPropEditorDefinition;
}

export interface UpdateChartConfigEventPayload {
    /**
     * The updated chart config.
     * This is used to update the chart config in the chart.
     */
    chartConfig: ChartConfig[];
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
     * This  method is disabled currently as it is not supported by the backend.
     * Following are the reasons for the same:
     * 1. Rename columns is not supported by the menu for now. If need be, this can be implemented.
     */
    // /**
    //  * Rename the column.
    //  * */
    // RENAME = 'RENAME',

    /**
     * Remove the column from the answer scope.
     * */
    REMOVE = 'REMOVE',

    /**
     * Open configure settings.
     */
    EDIT = 'EDIT',

    /**
     * Open Conditional Formatting editor of the column.
     */
    CONDITIONAL_FORMAT = 'CONDITIONAL_FORMAT',
    /**
     * Defines a separator element between the actions.
     * Can be added multiple times.
     * */
    SEPARATOR = 'SEPARATOR',
}

export type AxisMenuCustomAction = CustomAction;

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

export enum ActionEventType {
    ColumnSort = 'ColumnSort',
}

export interface ColumnSortActionHandler {
    eventType: ActionEventType.ColumnSort;
    /**
     * This payload is used to sort the column in ascending or descending order.
     * */
    payload: {
        columnId: string;
        isAscending: boolean;
    };
}

export type ActionHandlerEventPayload = ColumnSortActionHandler;

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

export interface GlobalToastActionHandler {
    [key: string]: (args: any) => void;
}
