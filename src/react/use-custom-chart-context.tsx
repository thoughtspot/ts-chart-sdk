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
import {
    ChartContextProps,
    ChartToTSEventEmitters,
    TSChartContextProps,
    TSToChartEventListener,
    TSToChartEventOffListener,
} from './use-custom-chart-types';

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
            ...args: ChartToTSEventsPayloadMap[keyof ChartToTSEventsPayloadMap]
        ): Promise<void> => {
            if (!ctx || _.isEmpty(ctx)) {
                console.log('Context is not initialized');
                return Promise.reject(new Error('Context not initialized'));
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
        const emitterKey = `setOn${eventKey}` as keyof TSToChartEventListener;

        acc[emitterKey] = (
            callbackFn: TSToChartEventsPayloadMap[keyof TSToChartEventsPayloadMap],
        ): Promise<void> => {
            if (!ctx || _.isEmpty(ctx)) {
                console.log('Context is not initialized');
                return Promise.reject(new Error('Context not initialized'));
            }
            ctx.on(eventName, callbackFn);
            return Promise.resolve();
        };

        return acc;
    }, {} as TSToChartEventListener);
};

/**
 *
 * @param ctx Custom Chart Context
 * @returns List of event listeners
 */
const evenOfftListener = (
    ctx: CustomChartContext,
): TSToChartEventOffListener => {
    const validEvents = Object.keys(
        TSToChartEvent,
    ) as (keyof TSToChartEventsPayloadMap)[];
    return validEvents.reduce((acc, eventKey) => {
        const eventName = eventKey as keyof TSToChartEventsPayloadMap;
        const emitterKey =
            `setOff${eventKey}` as keyof TSToChartEventOffListener;

        acc[emitterKey] = (): Promise<void> => {
            if (!ctx || _.isEmpty(ctx)) {
                console.log('Context is not initialized');
                return Promise.reject(new Error('Context not initialized'));
            }
            ctx.off(eventName);
            return Promise.resolve();
        };

        return acc;
    }, {} as TSToChartEventOffListener);
};

/**
 * A custom hook to manage the Chart Context state and provide necessary
 * chart-related functionality.
 * @param {CustomChartContextProps} props - The custom chart context properties
 * to initialize the chart context.
 * @returns {ChartContextProps} The chart context values, including initialized state,
 * chart model, emitter, event listener, and TSChartContext.
 */
export const useChartContext = (
    props: Omit<CustomChartContextProps, 'renderChart'>,
): ChartContextProps => {
    /**
     * State to keep track of whether the context has been initialized.
     * @type {boolean}
     */
    const [hasInitialized, setHasInitialized] = useState(false);
    /**
     * State to manage the key used to re-render the chart.
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
     * Retrieves the chart context values.
     * @param {CustomChartContext} ctx - The custom chart context.
     * @returns {ChartContextProps} The chart context values,
     * including initialized state, chart model, emitter,
     * event listener, and TSChartContext.
     */
    const getChartContextValues = useCallback(
        (ctx: CustomChartContext): ChartContextProps => {
            return {
                hasInitialized,
                chartModel,
                destroy: () => ctx?.destroy(),
                ...emitter(ctx),
                ...eventListener(ctx),
                ...evenOfftListener(ctx),
                TSChartContext: ({ children }: TSChartContextProps) => {
                    return (
                        <React.Fragment key={key}>{children}</React.Fragment>
                    );
                },
            };
        },
        [chartModel, key, hasInitialized, ctx],
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

        getChartContextValues(context).setOnChartModelUpdate(
            commonUpdateHandler,
        );
        getChartContextValues(context).setOnVisualPropsUpdate(
            commonUpdateHandler,
        );
        getChartContextValues(context).setOnDataUpdate(commonUpdateHandler);
    }, []);

    /**
     * Initializes the chart context provider.
     * @param {CustomChartContext} context - The custom chart context to be initialized.
     * @returns {Promise<boolean>} A promise that resolves to
     * `true` after successful initialization.
     */
    const initializeContext = async (context: CustomChartContext) => {
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
     * Renders the chart by updating the `key` state to force re-rendering.
     * @param {CustomChartContext} ctx - The custom chart context.
     * @returns {Promise<void>} A promise that resolves after the
     * chart has been rendered.
     */
    const renderChart = useCallback(
        (ctx: CustomChartContext) => {
            setKey((prevKey: number) => prevKey + 1);
            return Promise.resolve();
        },
        [key],
    );

    useEffect(() => {
        // Create a new custom chart context with the provided props and
        // renderChart function.
        const context = new CustomChartContext({
            ...props,
            renderChart,
        });
        // Initialize the chart context provider.
        initializeContext(context);
        setupEventListeners(context);
    }, []);

    return getChartContextValues(ctx);
};
