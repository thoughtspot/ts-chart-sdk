/**
 * @file Custom Chart Context Hook for React App
 * @fileoverview
 * @author Divyam Lamiyan <divyam.lamiyan@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
    CustomChartContext,
    CustomChartContextProps,
} from '../main/custom-chart-context';
import {
    ChartToTSEvent,
    ChartToTSEventsPayloadMap,
} from '../types/chart-to-ts-event.types';
import { ChartModel } from '../types/common.types';
import {
    ChartModelUpdateEventPayload,
    DataUpdateEventPayload,
    TSToChartEvent,
    TSToChartEventsPayloadMap,
    VisualPropsUpdateEventPayload,
} from '../types/ts-to-chart-event.types';

/**
 * All event emmiter which can be called from Chart App
 * prefixed with emit
 * @returns Promise<void>
 */
export type ChartToTSEventEmitters = {
    [key in keyof ChartToTSEventsPayloadMap as `emit${Capitalize<key>}`]: (
        args: ChartToTSEventsPayloadMap[key],
    ) => Promise<void>;
};

/**
 * All external event listener which can be listened in chart App
 * prefixed with on
 * @returns Promise<void>
 */
export type TSToChartEventListener = {
    [key in keyof TSToChartEventsPayloadMap as `on${Capitalize<key>}`]: (
        args: TSToChartEventsPayloadMap[key],
    ) => Promise<void>;
};

interface WrapperComponentProps {
    /**
     * Child App which renders chart
     * wrapper is used to control rendering of child app
     */
    children: React.ReactNode;
}

interface ChartContextProps
    extends ChartToTSEventEmitters,
        TSToChartEventListener {
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
     * Parent component wrapped around chart app
     * for controlling re-rendering of chart
     * @param children
     * @returns React.JSX.Element
     */
    WrapperComponent: ({
        children,
    }: WrapperComponentProps) => React.JSX.Element;
}

/**
 *
 * @param ctx Custom Chart Context
 * @returns List of event emitters
 */
const emitter = (ctx: CustomChartContext): ChartToTSEventEmitters => {
    const validEvents = Object.keys(
        ChartToTSEvent,
    ) as (keyof ChartToTSEventsPayloadMap)[];
    return validEvents.reduce((acc, eventKey) => {
        const eventName = eventKey as keyof ChartToTSEventsPayloadMap;
        const emitterKey = `emit${eventKey}` as keyof ChartToTSEventEmitters;

        acc[emitterKey] = (
            args: ChartToTSEventsPayloadMap[keyof ChartToTSEventsPayloadMap],
        ): Promise<void> => {
            if (!ctx || _.isEmpty(ctx)) {
                return Promise.resolve();
            }
            return ctx.emitEvent(eventName, ...args);
        };

        return acc;
    }, {} as ChartToTSEventEmitters);
};

/**
 *
 * @param ctx Custom Chart Context
 * @returns List of event listeners
 */
const eventListener = (ctx: CustomChartContext): TSToChartEventListener => {
    const validEvents = Object.keys(
        TSToChartEvent,
    ) as (keyof TSToChartEventsPayloadMap)[];
    return validEvents.reduce((acc, eventKey) => {
        const eventName = eventKey as keyof TSToChartEventsPayloadMap;
        const emitterKey = `on${eventKey}` as keyof TSToChartEventListener;

        acc[emitterKey] = (
            callbackFn: TSToChartEventsPayloadMap[keyof TSToChartEventsPayloadMap],
        ): Promise<void> => {
            ctx.on(eventName, callbackFn);
            return Promise.resolve();
        };

        return acc;
    }, {} as TSToChartEventListener);
};

/**
 * A custom hook to manage the Chart Context state and provide necessary
 * chart-related functionality.
 * @param {CustomChartContextProps} props - The custom chart context properties to initialize the chart context.
 * @returns {ChartContextProps} The chart context values, including initialized state,
 * chart model, emitter, event listener, and WrapperComponent.
 */
export const useChartContext = (
    props: CustomChartContextProps,
): ChartContextProps => {
    /**
     * State to keep track of whether the context has been initialized.
     * @type {boolean}
     */
    const [hasInitialized, setHasInitialized] = useState(false);
    /**
     * State to manage the key used to force re-render the chart.
     * @type {number}
     */
    const [key, setKey] = useState(0);
    /**
     * State to hold the custom chart context.
     * @type {CustomChartContext}
     */
    const [ctx, setContextState] = useState<CustomChartContext>(
        {} as CustomChartContext,
    );
    /**
     * State to manage the chart model.
     * @type {ChartModel}
     */
    const [chartModel, setChartModel] = useState<ChartModel>();

    /**
     * Initializes the chart context provider.
     * @param {CustomChartContext} context - The custom chart context to be initialized.
     * @returns {Promise<boolean>} A promise that resolves to `true` after successful initialization.
     */
    const initializeProvider = async (context: CustomChartContext) => {
        return context
            .initialize()
            .then(() => {
                setHasInitialized(true);
                setContextState(context);
                setChartModel(context.getChartModel());
                return true;
            })
            .catch((e) => {
                console.log('Error in context initialization', e);
            });
    };

    /**
     * Retrieves the chart context values.
     * @param {CustomChartContext} ctx - The custom chart context.
     * @returns {ChartContextProps} The chart context values,
     * including initialized state, chart model, emitter, event listener, and WrapperComponent.
     */
    const getChartContextValues = useCallback(
        (ctx: CustomChartContext): ChartContextProps => {
            return {
                hasInitialized,
                chartModel,
                ...emitter(ctx),
                ...eventListener(ctx),
                WrapperComponent: ({ children }: WrapperComponentProps) => {
                    return (
                        <React.Fragment key={key}>{children}</React.Fragment>
                    );
                },
            };
        },
        [chartModel, key, hasInitialized],
    );

    /**
     * Renders the chart by updating the `key` state to force re-rendering.
     * @param {CustomChartContext} ctx - The custom chart context.
     * @returns {Promise<void>} A promise that resolves after the chart has been rendered.
     */
    const renderChart = useCallback(
        (ctx: CustomChartContext) => {
            setKey((prevKey) => prevKey + 1);
            return Promise.resolve();
        },
        [key],
    );

    /**
     * Register all external event listeners and update chart model once called
     */
    const setupEventListeners = useCallback((context: CustomChartContext) => {
        const commonUpdateHandler = (
            payload:
                | ChartModelUpdateEventPayload
                | VisualPropsUpdateEventPayload
                | DataUpdateEventPayload,
        ) => {
            setChartModel(context.getChartModel());
            return {
                triggerRenderChart: true,
            };
        };

        getChartContextValues(context).onChartModelUpdate(commonUpdateHandler);
        getChartContextValues(context).onVisualPropsUpdate(commonUpdateHandler);
        getChartContextValues(context).onDataUpdate(commonUpdateHandler);
    }, []);

    useEffect(() => {
        // Create a new custom chart context with the provided props and
        // renderChart function.
        const context = new CustomChartContext({
            ...props,
            renderChart,
        });
        // Initialize the chart context provider.
        initializeProvider(context);
        // Register External Event listeners
        setupEventListeners(context);
    }, []);

    return getChartContextValues(ctx);
};
