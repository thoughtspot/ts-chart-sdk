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
 * This map defines the event type and its corresponding payload needed by event
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
    [ChartToTSEvent.OpenContextMenu]: OpenContextMenuEventPayload;
    /**
     * Trigger to close Context Menu
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.CloseContextMenu]: null;

    /**
     * Trigger to notify the render start
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderStart]: null;
    /**
     * Trigger to notify the render completion
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderComplete]: null;
    /**
     * Trigger to notify the render error
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.RenderError]: RenderErrorEventPayload;
    /**
     * Trigger to update the visual props
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    [ChartToTSEvent.UpdateVisualProps]: UpdateVisualPropsEventPayload;
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
type UpdateVisualPropsEventPayload = VisualProps;

/**
 * @group Chart to ThoughtSpot Events / Context Menu
 */
// start - open context menu payload
export interface PointVal {
    // column id of the column associated with the value
    columnId: string;
    // value of the point clicked on, mostly makes sense for attributes.
    // this can be an array of values as well.
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
    id: string; // id of the action user defined
    label: string; // developer should i18n this
    icon: string; // icon string to show on the context/axis menu

    /**
     * This function will need to have a defined set of args.
     * For e.g., pointClick Event, point details and chart model in case on context menu
     * For axis menu, it would be different.
     *
     * Callback will be triggered via postMessage api contract.
     */
    onClick: (...args: any[]) => void;
}

/**
 *
 * @group Chart to ThoughtSpot Events
 */
export interface OpenContextMenuEventPayload {
    event: Pick<
        PointerEvent,
        | 'x'
        | 'y'
        | 'clientX'
        | 'clientY'
        | 'pageX'
        | 'pageY'
        | 'screenX'
        | 'screenY'
    >;
    clickedPoint: Point;
    selectedPoints?: Point[];
    customActions?: CustomAction[];
}
// end - open context menu payload

/**
 * @group Chart to ThoughtSpot Events
 */
interface RenderErrorEventPayload {
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
