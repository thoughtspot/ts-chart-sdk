import {
    ON_MESSAGE_CALLBACK_SKIP_PROCESSING,
    onMessage,
    sendMessage,
} from 'promise-postmessage';
import { ChartToTSEvent } from '../types/chart-to-ts-event.types';
import { timeout } from './util';

const TIMEOUT_THRESHOLD = 30000; // 30sec

/**
 * Custom error for postMessage bridge failures.
 * Carries the original error message from the host response
 * and the event type that triggered the error.
 * Allows consumers to distinguish bridge errors via `instanceof`.
 *
 * @version SDK: 0.1 | ThoughtSpot:
 */
export class PostMessageError extends Error {
    /** The event type that was being sent when the error occurred */
    public readonly eventType?: ChartToTSEvent;

    constructor(message: string, eventType?: ChartToTSEvent) {
        super(message);
        this.name = 'PostMessageError';
        this.eventType = eventType;

        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, PostMessageError.prototype);
    }
}

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
    return onMessage(
        (data: any) => {
            if (!data.eventType) {
                return ON_MESSAGE_CALLBACK_SKIP_PROCESSING;
            }
            return handleMessageEvent(data);
        },
        target,
        'child',
    );
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
                isValidResponse(data) {
                    return (
                        !!data && typeof data === 'object' && 'hasError' in data
                    );
                },
            },
        ),
        TIMEOUT_THRESHOLD,
        'ChartContext: postMessage operation timed out.',
    );
    if (resp?.hasError) {
        throw new PostMessageError(resp.error, eventType);
    }
    return resp;
};

export { init as initMessageListener, postMessageToHostApp, globalThis };
