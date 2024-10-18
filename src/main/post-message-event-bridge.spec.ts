/**
 *  post message event bridge spec file
 *
 *  @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 */
import _ from 'lodash';
import {
    initMessageListener,
    postMessageToHostApp,
} from './post-message-event-bridge';

const TIMEOUT_THRESHOLD = 30000;

describe('postMessageToHostApp', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('should resolve the promise with data object when successful', async () => {
        // Mock the necessary variables and functions
        const componentId = '123';
        const hostUrl = 'https://example.com';
        const eventPayload = { foo: 'bar' };
        const eventType = 'SOME_EVENT';

        // mockpost Message
        const mockPostMessage = jest.spyOn(global.parent.window, 'postMessage');
        // mock Message Channel
        const channel = {
            port1: { onmessage: null, close: jest.fn() },
            port2: {},
        };
        const messageChannelMock = { MessageChannel: jest.fn(() => channel) };
        global.MessageChannel = messageChannelMock.MessageChannel as any;

        // Call the function
        const promise = postMessageToHostApp(
            componentId,
            hostUrl,
            eventPayload,
            eventType as any,
        );

        // Simulate a successful response
        const response = {
            data: { hasError: false, randomData: 'randomString' },
        };
        if (_.isFunction(channel.port1.onmessage)) {
            (channel.port1.onmessage as any)(response);
        } else {
            // on message should have been initialized
            throw new Error('on message should have been initialized');
        }

        // Wait for the promise to resolve
        await expect(promise).resolves.toEqual(response.data);

        // Verify that the postMessage function was called with the correct
        // arguments
        expect(mockPostMessage).toHaveBeenCalledWith(
            {
                componentId,
                payload: eventPayload,
                eventType,
                source: 'ts-chart-sdk',
            },
            hostUrl,
            [channel.port2],
        );

        // Verify that the MessageChannel was used correctly
        expect(messageChannelMock.MessageChannel).toHaveBeenCalled();
    });

    test('should reject the promise with an error message when there is an error', async () => {
        // Mock the necessary variables and functions
        const componentId = '123';
        const hostUrl = 'https://example.com';
        const eventPayload = { foo: 'bar' };
        const eventType = 'SOME_EVENT';

        // mockpost Message
        const mockPostMessage = jest.spyOn(global.parent.window, 'postMessage');
        // mock Message Channel
        const channel = {
            port1: { onmessage: null, close: jest.fn() },
            port2: {},
        };
        const messageChannelMock = { MessageChannel: jest.fn(() => channel) };
        global.MessageChannel = messageChannelMock.MessageChannel as any;

        // Call the function
        const promise = postMessageToHostApp(
            componentId,
            hostUrl,
            eventPayload,
            eventType as any,
        );

        // Simulate an error response
        const error = new Error('Some error');
        const response = { data: { hasError: true, error } };
        if (_.isFunction(channel.port1.onmessage)) {
            (channel.port1.onmessage as any)(response);
        } else {
            // on message should have been initialized
            throw new Error('on message should have been initialized');
        }

        // Wait for the promise to reject
        await expect(promise).rejects.toThrow('Some error');

        // Verify that the postMessage function was called with the correct
        // arguments
        expect(mockPostMessage).toHaveBeenCalledWith(
            {
                componentId,
                payload: eventPayload,
                eventType,
                source: 'ts-chart-sdk',
            },
            hostUrl,
            [channel.port2],
        );

        expect(messageChannelMock.MessageChannel).toHaveBeenCalled();
    });

    test(
        'should reject the promise after a timeout',
        async () => {
            const componentId = 'some-component-id';
            const hostUrl = 'https://some-host-url.com';
            const eventPayload = { someKey: 'someValue' };
            const eventType = 'some-event-type';

            // mockpost Message
            const mockPostMessage = jest.spyOn(
                global.parent.window,
                'postMessage',
            );
            // mock Message Channel
            const channel = {
                port1: { onmessage: null, close: jest.fn() },
                port2: {},
            };
            const messageChannelMock = {
                MessageChannel: jest.fn(() => channel),
            };
            global.MessageChannel = messageChannelMock.MessageChannel as any;

            const promise = postMessageToHostApp(
                componentId,
                hostUrl,
                eventPayload,
                eventType as any,
            );

            expect(mockPostMessage).toHaveBeenCalledWith(
                {
                    componentId,
                    payload: eventPayload,
                    eventType,
                    source: 'ts-chart-sdk',
                },
                hostUrl,
                expect.any(Array),
            );

            await expect(promise).rejects.toThrow(
                'ChartContext: postMessage operation timed out.',
            );
        },
        TIMEOUT_THRESHOLD + 1000,
    ); // added extra timeout for this test

    test('should reject the promise if some error in postMessage', async () => {
        const componentId = 'some-component-id';
        const hostUrl = 'https://some-host-url.com';
        const eventPayload = { someKey: 'someValue' };
        const eventType = 'some-event-type';

        // mockpost Message
        const mockPostMessage = jest.spyOn(global.parent.window, 'postMessage');
        mockPostMessage.mockImplementation(() => {
            throw new Error('Some postMessage error');
        });
        // mock Message Channel
        const channel = {
            port1: { onmessage: null, close: jest.fn() },
            port2: {},
        };
        const messageChannelMock = { MessageChannel: jest.fn(() => channel) };
        global.MessageChannel = messageChannelMock.MessageChannel as any;

        const promise = postMessageToHostApp(
            componentId,
            hostUrl,
            eventPayload,
            eventType as any,
        );

        // Wait for the promise to reject
        await expect(promise).rejects.toThrow('Some postMessage error');

        expect(mockPostMessage).toHaveBeenCalledWith(
            {
                componentId,
                payload: eventPayload,
                eventType,
                source: 'ts-chart-sdk',
            },
            hostUrl,
            expect.any(Array),
        );
    });
});

describe('globalThis', () => {
    test('should be set to window when target is window.parent', () => {
        // Mock window.parent
        const originalWindowParent = window.parent;
        Object.defineProperty(window, 'parent', {
            value: window,
            writable: true,
        });

        // Re-import the module to trigger the globalThis assignment
        jest.isolateModules(() => {
            const {
                globalThis: testGlobalThis,
            } = require('./post-message-event-bridge');
            expect(testGlobalThis).toBe(window);
        });

        // Restore original window.parent
        Object.defineProperty(window, 'parent', {
            value: originalWindowParent,
            writable: true,
        });
    });

    test('should be set to target when target is not window.parent', () => {
        // Mock document.querySelector
        const mockTarget = {};
        document.querySelector = jest.fn().mockReturnValue(mockTarget);

        // Mock URL.searchParams.get
        const originalURL = global.URL;
        global.URL = jest.fn(() => ({
            searchParams: {
                get: jest.fn().mockReturnValue('mockSelector'),
            },
        })) as any;

        // Re-import the module to trigger the globalThis assignment
        jest.isolateModules(() => {
            const {
                globalThis: testGlobalThis,
            } = require('./post-message-event-bridge');
            expect(testGlobalThis).toBe(mockTarget);
        });

        // Restore original URL
        global.URL = originalURL;
    });
});
