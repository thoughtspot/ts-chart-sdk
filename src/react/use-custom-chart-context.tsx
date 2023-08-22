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
import { ChartModel } from '../types/common.types';
import {
    ChartModelUpdateEventPayload,
    DataUpdateEventPayload,
    VisualPropsUpdateEventPayload,
} from '../types/ts-to-chart-event.types';
import {
    emitter,
    eventListener,
    eventOffListener,
} from './use-custom-chart-context.util';
import {
    ChartContextProps,
    TSChartContextProps,
} from './use-custom-chart-types';

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
                ...eventOffListener(ctx),
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

        // Register all external event listeners here
        getChartContextValues(context).setOnChartModelUpdate(
            commonUpdateHandler,
        );
        getChartContextValues(context).setOnVisualPropsUpdate(
            commonUpdateHandler,
        );
        getChartContextValues(context).setOnDataUpdate(commonUpdateHandler);
    }, []);

    /**
     * Register all external event off listeners
     */
    const setupEventOffListeners = useCallback(
        (context: CustomChartContext) => {
            // Register all external event off listeners here
            getChartContextValues(context).setOffChartModelUpdate();
            getChartContextValues(context).setOffDataUpdate();
            getChartContextValues(context).setOffVisualPropsUpdate();
        },
        [],
    );

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
        return () => {
            setupEventOffListeners(context);
        };
    }, []);

    return getChartContextValues(ctx);
};
