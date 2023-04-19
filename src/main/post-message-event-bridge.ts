import { ChartToTSEvent } from '../types/chart-to-ts-event.types';

const TIMEOUT_THRESHOLD = 30000; // 30sec

/**
 * method to listen to messages using postMessage from parent.
 *
 * @param  {any} handleMessageEvent
 */
const init = (handleMessageEvent: any) => {
    window.addEventListener('message', handleMessageEvent);
};

/**
 * stop listening to the messages
 *
 * @param  {any} handleMessageEvent
 */
const destroy = (handleMessageEvent: any) => {
    window.removeEventListener('message', handleMessageEvent);
};

/**
 * @param  {string} componentId This is required to send the event to the
 *          right chart component in case of multiple components
 * @param  {string} hostUrl The host application url
 * @param  {any} eventPayload payload for the event
 * @param  {ChartToTSEvent} eventType type of the event
 * @returns Promise
 */
const postMessageToHostApp = (
    componentId: string,
    hostUrl: string,
    eventPayload: any,
    eventType: ChartToTSEvent,
): Promise<any> => new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (res: any) => {
        channel.port1.close();
        const { hasError, error } = res.data;
        if (hasError) {
            console.log('ChartContext: message failure:', res.data);
            reject(error);
        } else {
            console.log('ChartContext: message success:', res.data);
            resolve(null);
        }
    };

    setTimeout(() => {
        reject(
            new Error(
                `ChartContext: postMessage operation timed out. ${eventType}`,
                eventPayload,
            ),
        );
    }, TIMEOUT_THRESHOLD);

    try {
        window.parent.window.postMessage(
            {
                componentId,
                payload: {
                    ...eventPayload,
                },
                eventType,
                source: 'ts-chart-sdk',
            },
            hostUrl,
            [channel.port2],
        );
    } catch (err) {
        console.error(
            'ChartContext: error in emitting event:',
            err,
            eventType,
            eventPayload,
        );
        reject(err);
    }
});

export {
    init as initMessageListener,
    destroy as destroyMessageListener,
    postMessageToHostApp,
};
