import { onMessage, sendMessage } from 'promise-postmessage';
import { ChartToTSEvent } from '../types/chart-to-ts-event.types';
import { timeout } from './util';

const TIMEOUT_THRESHOLD = 30000; // 30sec

const elSelector = new URL(import.meta.url).searchParams.get('elSelector');
const target =
    (elSelector && (document.querySelector(elSelector) as HTMLElement)) ||
    window.parent;

const globalThis = (target === window.parent ? window : target) as any;

/**
 * method to listen to messages using postMessage from the parent.
 *
 * @param  {any} handleMessageEvent
 */
const init = (handleMessageEvent: (data: any) => Promise<any> | any) => {
    return onMessage(handleMessageEvent, target, 'child');
};

/**
 * @param  {string} componentId This is required to send the event to the
 *          right chart component in case of multiple components
 * @param  {string} hostUrl The host application URL
 * @param  {any} eventPayload payload for the event
 * @param  {ChartToTSEvent} eventType type of the event
 * @returns Promise
 */
const postMessageToHostApp = async (
    componentId: string,
    hostUrl: string,
    eventPayload: any,
    eventType: ChartToTSEvent,
): Promise<any> => {
    const resp = await timeout(
        sendMessage(
            target,
            {
                componentId,
                payload: {
                    ...eventPayload,
                },
                eventType,
                source: 'ts-chart-sdk',
            },
            {
                origin: hostUrl,
                endpoint: 'child',
            },
        ),
        TIMEOUT_THRESHOLD,
        'ChartContext: postMessage operation timed out.',
    );
    if (resp?.hasError) {
        throw new Error(resp.error);
    }
    return resp;
};

export { init as initMessageListener, postMessageToHostApp, globalThis };
