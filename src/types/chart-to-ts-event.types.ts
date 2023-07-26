import { VisualProps } from './common.types';

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
    RenderStart = 'RenderStart',
    RenderError = 'RenderError',
    RenderComplete = 'RenderComplete',

    /**
     * Visual Props Update
     */
    UpdateVisualProps = 'UpdateVisualProps',
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
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export interface UpdateVisualPropsEventPayload {
    visualProps: VisualProps;
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
 * @group Chart to ThoughtSpot Events
 */
export interface RenderErrorEventPayload {
    hasError: boolean;
    error: any;
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export enum ErrorType {
    MultipleContextsNotSupported = 'MultipleContextsNotSupported',
}
