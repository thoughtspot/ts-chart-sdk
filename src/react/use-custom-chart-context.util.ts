import _ from 'lodash';
import { CustomChartContext } from '../main/custom-chart-context';
import {
    ChartToTSEvent,
    ChartToTSEventsPayloadMap,
} from '../types/chart-to-ts-event.types';
import {
    TSToChartEvent,
    TSToChartEventsPayloadMap,
} from '../types/ts-to-chart-event.types';
import {
    ChartToTSEventEmitters,
    TSToChartEventListener,
    TSToChartEventOffListener,
} from './use-custom-chart-types';

/**
 *
 * @param ctx Custom Chart Context
 * @returns List of event emitters
 */
export const emitter = (ctx: CustomChartContext): ChartToTSEventEmitters => {
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
export const eventListener = (
    ctx: CustomChartContext,
): TSToChartEventListener => {
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
export const eventOffListener = (
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
