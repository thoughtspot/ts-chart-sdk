/**
 *  post message event bridge spec file
 *
 *  @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 */
import _ from 'lodash';
import { postMessageToHostApp } from './post-message-event-bridge';

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
