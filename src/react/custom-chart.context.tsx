import _ from 'lodash';
import React, { createContext, useRef, useState } from 'react';
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
    TSToChartEvent,
    TSToChartEventsPayloadMap,
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

interface ChartContextProps
    extends ChartToTSEventEmitters,
        TSToChartEventListener {
    hasInitialized: boolean;
    chartModel: ChartModel | undefined;
}

interface ChartProviderProps {
    contextProps: CustomChartContextProps;
    children: any;
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
                return ctx.emitEvent(eventName, args as any);
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

const ChartContext = createContext<ChartContextProps>({} as ChartContextProps);

const ChartProvider: React.FC<ChartProviderProps> = ({
    contextProps,
    children,
}: ChartProviderProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [ctx, setContextState] = useState<CustomChartContext>();
    const [chartModel, setChartModel] = useState<ChartModel>();
    const chartRef = useRef(null);

    const initializeProvider = async (ctx2: CustomChartContext) => {
        ctx2.initialize()
            .then(() => {
                setHasInitialized(true);
                setContextState(ctx2);
                return true;
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const getChartContextValues = (
        ctx: CustomChartContext,
    ): ChartContextProps => ({
        hasInitialized,
        chartModel,
        ...emitter(ctx),
        ...eventListener(ctx),
    });

    React.useEffect(() => {
        const context = new CustomChartContext({
            ...contextProps,
            renderChart: (ctx: CustomChartContext) => {
                chartRef.current = children;
                return Promise.resolve();
            },
        });
        initializeProvider(context);

        // update chart Model
        getChartContextValues(context).onChartModelUpdate(() => {
            setChartModel(context.getChartModel());
        });
        // update visual properties
        getChartContextValues(context).onVisualPropsUpdate(() => {
            setChartModel(context.getChartModel());
        });
        // update data
        getChartContextValues(context).onDataUpdate(() => {
            setChartModel(context.getChartModel());
        });
    }, []);

    return (
        <ChartContext.Provider value={getChartContextValues(ctx as any)}>
            {children}
        </ChartContext.Provider>
    );
};

export { ChartContext, ChartProvider };
