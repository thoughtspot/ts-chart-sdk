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

export type ChartToTSEventEmitters = {
    [key in keyof ChartToTSEventsPayloadMap as `emit${Capitalize<key>}`]: (
        args: ChartToTSEventsPayloadMap[key],
    ) => Promise<void>;
};

export type TSToChartEventListener = {
    [key in keyof TSToChartEventsPayloadMap as `on${Capitalize<key>}`]: (
        args: TSToChartEventsPayloadMap[key],
    ) => Promise<void>;
};

interface WrapperComponentProps {
    children: React.ReactNode;
}

interface ChartContextProps
    extends ChartToTSEventEmitters,
        TSToChartEventListener {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
    WrapperComponent: ({
        children,
    }: WrapperComponentProps) => React.JSX.Element;
}

const emitter = (ctx: CustomChartContext) => {
    function reducerFn(
        acc: ChartToTSEventEmitters,
        eventKey: string,
    ): ChartToTSEventEmitters {
        // TODO: do a better mapping for ChartToTSEvent and PayloadMap
        if (eventKey in ChartToTSEvent) {
            const eventName = eventKey as keyof ChartToTSEventsPayloadMap;
            const emitterKey =
                `emit${eventKey}` as keyof ChartToTSEventEmitters;

            acc[emitterKey] = (
                args: ChartToTSEventsPayloadMap[typeof eventName],
            ): Promise<void> => {
                return ctx.emitEvent(eventName, ...args);
            };
        }
        return acc;
    }
    return Object.keys(ChartToTSEvent).reduce(
        reducerFn,
        {} as ChartToTSEventEmitters,
    );
};

const eventListener = (ctx: CustomChartContext) => {
    function reducerFn(
        acc: TSToChartEventListener,
        eventKey: string,
    ): TSToChartEventListener {
        // TODO: do a better mapping for ChartToTSEvent and PayloadMap
        if (eventKey in TSToChartEvent) {
            const eventName = eventKey as keyof TSToChartEventsPayloadMap;
            const emitterKey = `on${eventKey}` as keyof TSToChartEventListener;

            acc[emitterKey] = (
                callbackFn: TSToChartEventsPayloadMap[typeof eventName],
            ): Promise<void> => {
                ctx.on(eventName, callbackFn);
                return Promise.resolve();
            };
        }
        return acc;
    }
    return Object.keys(TSToChartEvent).reduce(
        reducerFn,
        {} as TSToChartEventListener,
    );
};

export const useChartContext = (props: CustomChartContextProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [key, setKey] = useState(0);
    const [ctx, setContextState] = useState<CustomChartContext>(
        {} as CustomChartContext,
    );
    const [chartModel, setChartModel] = useState<ChartModel>();

    const initializeProvider = async (context: CustomChartContext) => {
        return context.initialize().then(() => {
            setHasInitialized(true);
            setContextState(context);
            return true;
        });
    };

    const getChartContextValues = useCallback(
        (ctx: CustomChartContext): ChartContextProps => ({
            hasInitialized,
            chartModel,
            ...emitter(ctx),
            ...eventListener(ctx),
            WrapperComponent: ({ children }: WrapperComponentProps) => {
                console.log(key);
                return (
                    <div
                        style={{
                            width: '99vw',
                            height: '95vh',
                            position: 'relative',
                        }}
                        key={key}
                    >
                        {children}
                    </div>
                );
            },
        }),
        [ctx, chartModel, key],
    );

    const renderChart = useCallback(
        (ctx: CustomChartContext) => {
            console.log('Here', key);
            setKey((prevKey) => prevKey + 1);
            return Promise.resolve();
        },
        [key],
    );

    useEffect(() => {
        const context = new CustomChartContext({
            ...props,
            renderChart,
        });
        initializeProvider(context);

        // update chart Model
        getChartContextValues(context).onChartModelUpdate(
            (payload: ChartModelUpdateEventPayload) => {
                setChartModel(context.getChartModel());
                return {
                    triggerRenderChart: true,
                };
            },
        );
        // update visual properties
        getChartContextValues(context).onVisualPropsUpdate(
            (payload: VisualPropsUpdateEventPayload) => {
                setChartModel(context.getChartModel());
                return {
                    triggerRenderChart: true,
                };
            },
        );
        // update data
        getChartContextValues(context).onDataUpdate(
            (payload: DataUpdateEventPayload) => {
                setChartModel(context.getChartModel());
                return {
                    triggerRenderChart: true,
                };
            },
        );
    }, []);

    return getChartContextValues(ctx);
};
