/**
 *  Custom chart context spec file
 *
 *  @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 */

import _ from 'lodash';
import { mockInitializeContextPayload } from '../test/test-utils';
import { ChartToTSEvent, ErrorType } from '../types/chart-to-ts-event.types';
import { TSToChartEvent } from '../types/ts-to-chart-event.types';
import { CustomChartContext, getChartContext } from './custom-chart-context';
import * as PostMessageEventBridge from './post-message-event-bridge';

jest.mock('./post-message-event-bridge');

jest.spyOn(console, 'log').mockImplementation(() => {
    // do nothing.
});

describe('CustomChartContext', () => {
    let eventProcessor: any;

    let getDefaultChartConfig = jest.fn();
    let getQueriesFromChartConfig = jest.fn();
    let renderChart = jest.fn();
    const mockInitMessage = jest.spyOn(
        PostMessageEventBridge,
        'initMessageListener',
    );
    const mockPostMessageToHost: any = jest.spyOn(
        PostMessageEventBridge,
        'postMessageToHostApp',
    );

    beforeEach(() => {
        getDefaultChartConfig = jest.fn();
        getQueriesFromChartConfig = jest.fn();
        renderChart = jest.fn();

        mockInitMessage.mockImplementation((fn: any) => {
            eventProcessor = fn;
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });

    describe('initialize', () => {
        let customChartContext: CustomChartContext;
        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
        });

        afterEach(() => {
            // Destroy the chart context after each test
            jest.resetAllMocks();
            customChartContext.destroy();
            eventProcessor = null;
        });

        test('should wait till the parent calls initialize', async () => {
            expect(mockInitMessage).toHaveBeenCalled();
            // initialize function should not resolve
            const promise = customChartContext.initialize();
            const rej = jest.fn();
            const res = jest.fn();
            promise.then(() => rej()).catch(() => res());
            await new global.Promise((resolve) => {
                setTimeout(() => resolve(null), 3000);
            });

            expect(rej).not.toHaveBeenCalled();
            expect(res).not.toHaveBeenCalled();
        });

        test('should return a promise that resolves when the chart context is initialized', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // Call the initialize function and wait for it to resolve
            const promise = customChartContext.initialize();

            // Check that the hasInitializedPromise has resolved
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            await expect(promise).resolves.toBeUndefined();
            expect(mockPostMessage).toHaveBeenCalledTimes(2);

            expect(mockPostMessage.mock.calls[0][0]).toEqual({
                isConfigValid: false,
                defaultChartConfig: undefined,
                chartConfigEditorDefinition: undefined,
                visualPropEditorDefinition: undefined,
            });
            expect(mockPostMessage).toHaveBeenCalled();
            expect(mockPostMessageToHost).not.toHaveBeenCalled();
        });

        test('multiple intializations should throw an error', async () => {
            // Call the initialize function and wait for it to resolve
            const promise = customChartContext.initialize();

            // Check that the hasInitializedPromise has resolved
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            await expect(promise).resolves.toBeUndefined();

            let error;
            try {
                customChartContext = new CustomChartContext({
                    getDefaultChartConfig,
                    getQueriesFromChartConfig,
                    renderChart,
                });
            } catch (err: any) {
                error = err.message;
            }
            expect(error).toBe(ErrorType.MultipleContextsNotSupported);

            try {
                await getChartContext({
                    getDefaultChartConfig,
                    getQueriesFromChartConfig,
                    renderChart,
                });
            } catch (err: any) {
                error = err.message;
            }
            expect(error).toBe(ErrorType.MultipleContextsNotSupported);
        });
    });

    describe('on', () => {
        let customChartContext: CustomChartContext;
        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
        });
        afterEach(() => {
            // Destroy the chart context after each test
            jest.resetAllMocks();
            customChartContext.destroy();
            eventProcessor = null;
        });

        test('should not trigger post message if host is not accurate', () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // mock the event trigger for ChartConfigValidate
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.ChartConfigValidate,
                    source: 'incorrect-source',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the event listener was added to the eventListeners
            // object
            expect(mockPostMessage).not.toHaveBeenCalled();
        });

        test('default internal function testing', () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // mock the event trigger for ChartConfigValidate
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.ChartConfigValidate,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({
                isValid: true,
            });
            mockPostMessage.mockReset();

            // mock the event trigger for VisualPropsValidate
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.VisualPropsValidate,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({
                isValid: true,
            });

            mockPostMessage.mockReset();

            // mock the event trigger for TriggerRenderChart
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.TriggerRenderChart,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({});
            expect(renderChart).toHaveBeenCalled();

            mockPostMessage.mockReset();

            // mock the event trigger for getQueriesFromChartConfig
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.GetDataQuery,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({});
            expect(getQueriesFromChartConfig).toHaveBeenCalled();
        });

        test('default external function testing', () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // mock the event trigger for DataUpdate
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: {
                        data: 'random data',
                    },
                    eventType: TSToChartEvent.DataUpdate,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().data).toBe('random data');
            mockPostMessage.mockReset();

            // mock the event trigger for VisualPropsValidate
            eventProcessor({
                data: {
                    payload: {
                        chartModel: {
                            data: 'random data2',
                            visualProps: null,
                        },
                    },
                    eventType: TSToChartEvent.ChartModelUpdate,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().data).toBe(
                'random data2',
            );
            expect(customChartContext.getChartModel().visualProps).toBe(null);

            mockPostMessage.mockReset();

            // mock the event trigger for VisualPropsUpdate
            eventProcessor({
                data: {
                    payload: {
                        visualProps: 'random data',
                    },
                    eventType: TSToChartEvent.VisualPropsUpdate,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was received
            expect(mockPostMessage).toHaveBeenCalledWith({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().visualProps).toBe(
                'random data',
            );
            mockPostMessage.mockReset();

            // mock the event trigger for AxisMenuActionClick
            customChartContext.axisMenuCustomActionPreProcessor([
                {
                    customActions: [
                        {
                            icon: '',
                            id: 'custom-action-1',
                            label: 'Custom user action 1',
                            onClick: () => _.noop(),
                        },
                    ],
                },
            ] as any);
            eventProcessor({
                data: {
                    payload: {
                        customAction: {
                            id: 'custom-action-1',
                            columnIds: ['9f96b5b0-f7e4-4a5e-aa11-4c77fdf42125'],
                        },
                    },
                    eventType: TSToChartEvent.AxisMenuActionClick,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was valid which means action gets
            // executed successfully
            expect(mockPostMessage).toHaveBeenCalledWith({
                isValid: true,
            });

            // mock the event trigger for ContextMenuActionClick
            customChartContext.contextMenuCustomActionPreProcessor([
                {
                    customActions: [
                        {
                            icon: '',
                            id: 'custom-action-1',
                            label: 'Custom user action 1',
                            onClick: () => _.noop(),
                        },
                    ],
                },
            ] as any);
            eventProcessor({
                data: {
                    payload: {
                        customAction: {
                            id: 'custom-action-1',
                            columnIds: ['9f96b5b0-f7e4-4a5e-aa11-4c77fdf42125'],
                        },
                    },
                    eventType: TSToChartEvent.ContextMenuActionClick,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the response was valid which means action gets
            // executed successfully
            expect(mockPostMessage).toHaveBeenCalledWith({
                isValid: true,
            });
        });

        test('should add an event listener to the specified event type', () => {
            expect(mockInitMessage).toHaveBeenCalled();
            // Define a test event type and callback function
            const TEST_EVENT_TYPE = 'testEventType' as any;
            const testCallbackFn = jest.fn();
            // Call the on function with the test event type and callback
            // function
            customChartContext.on(TEST_EVENT_TYPE, testCallbackFn);

            // mock the event trigger
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TEST_EVENT_TYPE,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the event listener was added to the eventListeners
            // object
            expect(testCallbackFn).toHaveBeenCalled();
        });

        test('should respond with an error to an unspecified event type', () => {
            expect(mockInitMessage).toHaveBeenCalled();
            // Define a test event type and callback function
            const TEST_EVENT_TYPE = 'testEventType' as any;

            // mock the event trigger
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TEST_EVENT_TYPE,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            // Check that the event listener was added to the eventListeners
            // object
            expect(mockPostMessage).toHaveBeenCalledWith({
                hasError: true,
                error: `Event type not recognised or processed: ${TEST_EVENT_TYPE}`,
            });
        });
    });

    describe('off', () => {
        let customChartContext: CustomChartContext;

        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
        });

        afterEach(() => {
            // Destroy the chart context after each test
            customChartContext.destroy();
            eventProcessor = null;
            jest.resetAllMocks();
        });

        test('should remove the event listener for the specified event type', () => {
            // Define a test event type and callback function
            const TEST_EVENT_TYPE = 'testEventType' as any;
            const testCallbackFn = jest.fn();
            // Call the on function with the test event type and callback
            // function to add the event listener
            customChartContext.on(TEST_EVENT_TYPE, testCallbackFn);

            // mock the event trigger for the test event type
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TEST_EVENT_TYPE,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            // Call the off function to remove the event listener
            customChartContext.off(TEST_EVENT_TYPE);

            // Check that the event listener was not called
            expect(testCallbackFn).toHaveBeenCalled();
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE],
            ).toHaveLength(0);
        });

        test('should remove a specific event listener without affecting others', () => {
            // Define two test event types and callback functions
            const TEST_EVENT_TYPE_1: any = 'testEventType1';
            const TEST_EVENT_TYPE_2: any = 'testEventType2';
            const testCallbackFn1 = jest.fn();
            const testCallbackFn2 = jest.fn();

            // Add event listeners with the test event types and callback
            // functions
            customChartContext.on(TEST_EVENT_TYPE_1, testCallbackFn1);
            customChartContext.on(TEST_EVENT_TYPE_2, testCallbackFn2);

            // Verify that both event listeners are in the eventListeners array
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE_1],
            ).toHaveLength(1);
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE_2],
            ).toHaveLength(1);

            // Emit events for both event types
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TEST_EVENT_TYPE_1,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TEST_EVENT_TYPE_2,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            // Check that both callback functions were called
            expect(testCallbackFn1).toHaveBeenCalled();
            expect(testCallbackFn2).toHaveBeenCalled();

            // Remove the first event listener (TEST_EVENT_TYPE_1)
            customChartContext.off(TEST_EVENT_TYPE_1);

            // Verify that the first event listener is removed while the second
            // is still present
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE_1],
            ).toHaveLength(0);
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE_2],
            ).toHaveLength(1);
        });

        test('should make sure not to throw error when off is called before', () => {
            // Define two test event types and callback functions
            const TEST_EVENT_TYPE_1: any = 'testEventType1';
            customChartContext.off(TEST_EVENT_TYPE_1);

            // Verify that the first event listener is removed while the second
            // is still present
            expect(
                (customChartContext as any).eventListeners[TEST_EVENT_TYPE_1],
            ).toHaveLength(0);
        });
    });

    describe('emitEvent', () => {
        let customChartContext: CustomChartContext;

        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
        });
        afterEach(() => {
            // Destroy the chart context after each test
            customChartContext.destroy();
            eventProcessor = null;
            jest.resetAllMocks();
        });

        test('should reject the promise if the chart context is not initialized', async () => {
            // Define a test event type and payload
            const TEST_EVENT_TYPE = 'testEventType' as any;
            const testPayload = { value: 'testPayload' };
            // Call the emitEvent function and wait for it to resolve
            const result = customChartContext.emitEvent(
                TEST_EVENT_TYPE,
                testPayload,
            );

            // Check that the result is defined
            expect(mockPostMessageToHost).not.toHaveBeenCalled();
            await expect(result).rejects.toBeDefined();
        });

        test('should resolve the promise if the chart context is initialized', async () => {
            // Check that the hasInitializedPromise has resolved
            const mockPostMessage = jest.fn();
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });

            const promise = customChartContext.initialize();
            await expect(promise).resolves.toBeUndefined();
            expect(mockPostMessage).toHaveBeenCalledTimes(2);

            // define mock response for the postMessage response promise
            let resolve: any;
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );

            // Define a test event type and payload
            const TEST_EVENT_TYPE = 'testEventType' as any;
            const testPayload = { value: 'testPayload' };

            // Call the emitEvent function and wait for it to resolve
            const result = customChartContext.emitEvent(
                TEST_EVENT_TYPE,
                testPayload,
            );
            global.setTimeout(() => resolve('helloworld'), 1000);

            await expect(result).resolves.toEqual('helloworld');
            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                testPayload,
                TEST_EVENT_TYPE,
            );

            // test for null payload
            // Call the emitEvent function and wait for it to resolve
            mockPostMessageToHost.mockReset();
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );
            const result2 = customChartContext.emitEvent(
                ChartToTSEvent.RenderStart,
            );
            global.setTimeout(() => resolve('helloworld'), 1000);

            await expect(result2).resolves.toEqual('helloworld');
            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                null,
                ChartToTSEvent.RenderStart,
            );
        });
        test('should process the event payload for context menu custom actions', async () => {
            const mockPostMessage = jest.fn();
            let resolve: any;
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            customChartContext.initialize();
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );

            // Define a test event type and payload
            const TEST_EVENT_TYPE = ChartToTSEvent.OpenContextMenu as any;
            const testPayload = {
                customActions: [
                    {
                        id: 'custom-action-1',
                        label: 'Custom user action 1',
                        icon: '',
                        onClick: () => _.noop(),
                    },
                ],
            };

            // Call the emitEvent function and wait for it to resolve
            customChartContext.emitEvent(TEST_EVENT_TYPE, testPayload);

            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                {
                    customActions: [
                        {
                            icon: '',
                            id: 'custom-action-1',
                            label: 'Custom user action 1',
                        },
                    ],
                },
                TEST_EVENT_TYPE,
            );
        });
        test('should process the event payload for axis menu custom actions', async () => {
            const mockPostMessage = jest.fn();
            let resolve: any;
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            customChartContext.initialize();
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );

            // Define a test event type and payload
            const TEST_EVENT_TYPE = ChartToTSEvent.OpenAxisMenu as any;
            const testPayload = {
                customActions: [
                    {
                        id: 'custom-action-1',
                        label: 'Custom user action 1',
                        icon: '',
                        onClick: () => _.noop(),
                    },
                ],
            };

            // Call the emitEvent function and wait for it to resolve
            customChartContext.emitEvent(TEST_EVENT_TYPE, testPayload);
            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                {
                    customActions: [
                        {
                            icon: '',
                            id: 'custom-action-1',
                            label: 'Custom user action 1',
                        },
                    ],
                },
                TEST_EVENT_TYPE,
            );
        });

        test('should process the event payload for axis menu when custom actions are not defined', async () => {
            const mockPostMessage = jest.fn();
            let resolve: any;
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            customChartContext.initialize();
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );

            // Define a test event type and payload
            const TEST_EVENT_TYPE = ChartToTSEvent.OpenAxisMenu as any;
            const testPayload = {};
            // Call the emitEvent function and wait for it to resolve
            customChartContext.emitEvent(TEST_EVENT_TYPE, testPayload);
            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                {},
                TEST_EVENT_TYPE,
            );
        });

        test('should process the event payload for context menu when custom actions are not defined', async () => {
            const mockPostMessage = jest.fn();
            let resolve: any;
            eventProcessor({
                data: {
                    payload: mockInitializeContextPayload,
                    eventType: TSToChartEvent.Initialize,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            eventProcessor({
                data: {
                    payload: {},
                    eventType: TSToChartEvent.InitializeComplete,
                    source: 'ts-host-app',
                },
                ports: [{ postMessage: mockPostMessage }],
            });
            customChartContext.initialize();
            mockPostMessageToHost.mockImplementation(
                () =>
                    new global.Promise<any>((res) => {
                        resolve = res;
                    }),
            );

            // Define a test event type and payload
            const TEST_EVENT_TYPE = ChartToTSEvent.OpenContextMenu as any;
            const testPayload = {};
            // Call the emitEvent function and wait for it to resolve
            customChartContext.emitEvent(TEST_EVENT_TYPE, testPayload);
            // Check that the result is defined
            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                {},
                TEST_EVENT_TYPE,
            );
        });
    });
});
