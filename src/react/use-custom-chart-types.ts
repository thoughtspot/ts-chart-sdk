import React from 'react';
import { ChartToTSEventsPayloadMap } from '../types/chart-to-ts-event.types';
import { ChartModel } from '../types/common.types';
import { TSToChartEventsPayloadMap } from '../types/ts-to-chart-event.types';

/**
 * For all events that we trigger from React Chart to TS Host,
 * this enum provides the trigger functions for each event.
 * All the trigger functions have a prefix of emit.
 */
export type ChartToTSEventEmitters = {
    [key in keyof ChartToTSEventsPayloadMap as `emit${Capitalize<key>}`]: (
        ...args: ChartToTSEventsPayloadMap[key]
    ) => Promise<void>;
};

/**
 * For all events that we trigger from TS Host to React Chart,
 * this enum provides the event listener on functions for each external event listener.
 * All the event listener functions have a prefix of on.
 */
export type TSToChartEventListener = {
    [key in keyof TSToChartEventsPayloadMap as `setOn${Capitalize<key>}`]: (
        args: TSToChartEventsPayloadMap[key],
    ) => Promise<void>;
};

/**
 * For all events that we trigger from TS Host to React Chart,
 * this enum provides the event listener on functions for each external event listener.
 * All the event listener functions have a prefix of on.
 */
export type TSToChartEventOffListener = {
    [key in keyof TSToChartEventsPayloadMap as `setOff${Capitalize<key>}`]: () => Promise<void>;
};

export interface TSChartContextProps {
    /**
     * Child App which renders chart
     * wrapper is used to control rendering of child app
     */
    children: React.ReactNode;
}

export interface ChartContextProps
    extends ChartToTSEventEmitters,
        TSToChartEventListener,
        TSToChartEventOffListener {
    /**
     * decides if the chart context is initialzed
     */
    hasInitialized: boolean;
    /**
     * chart model to be used by client having
     * config, data and visual props
     */
    chartModel: ChartModel | undefined;
    /**
     * For destroying current chart context
     * @returns void
     */
    destroy: () => void;
    /**
     * Parent component wrapped around chart app
     * for controlling re-rendering of chart
     * @param children
     * @returns React.JSX.Element
     */
    TSChartContext: ({ children }: TSChartContextProps) => React.JSX.Element;
}
