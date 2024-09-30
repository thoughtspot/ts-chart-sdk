/**
 *  Custom chart context spec file
 *
 *  @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 */

import _ from 'lodash';
import { mockInitializeContextPayload } from '../test/test-utils';
import { ColumnType } from '../types/answer-column.types';
import { ChartToTSEvent, ErrorType } from '../types/chart-to-ts-event.types';
import { TSToChartEvent } from '../types/ts-to-chart-event.types';
import { PropElement } from '../types/visual-prop.types';
import { CustomChartContext, getChartContext } from './custom-chart-context';
import * as PostMessageEventBridge from './post-message-event-bridge';

jest.spyOn(console, 'log').mockImplementation(() => {
    // do nothing.
});

const mockFormElements: PropElement = {
    key: 'color',
    type: 'radio',
    defaultValue: 'red',
    values: ['red', 'green', 'yellow'],
    label: 'Colors',
};

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
            return () => null;
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

            const initResp = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });

            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });

            await expect(promise).resolves.toBeUndefined();

            expect(initResp).toEqual({
                isConfigValid: false,
                defaultChartConfig: undefined,
                chartConfigEditorDefinition: undefined,
                visualPropEditorDefinition: undefined,
                allowedConfigurations: {
                    allowColumnNumberFormatting: false,
                    allowColumnConditionalFormatting: false,
                    allowMeasureNamesAndValues: false,
                },
            });
        });

        test('should return responseMessage as empty instead of undefine', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            const initResp = await eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            expect(initResp).toEqual({});
        });

        test('type check string for visualProps on initialize payload should not throw an error.', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // Call the initialize function and wait for it to resolve
            const promise = customChartContext.initialize();

            // Check that the hasInitializedPromise has resolved

            const mockInitializeContextPayloadWithVisualProps = {
                ...mockInitializeContextPayload,
                chartModel: {
                    ...mockInitializeContextPayload.chartModel,
                    visualProps: 'visualPropStringPayload',
                },
            };

            await eventProcessor({
                payload: mockInitializeContextPayloadWithVisualProps,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            await expect(promise).resolves.toBeUndefined();
            const chartModel = customChartContext.getChartModel();
            expect(typeof chartModel.visualProps).toEqual('string');
            expect(chartModel.visualProps).toEqual('visualPropStringPayload');
        });

        test('type check object for visualProps on initialize payload should not throw an error.', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // Call the initialize function and wait for it to resolve
            const promise = customChartContext.initialize();

            // Check that the hasInitializedPromise has resolved

            const mockInitializeContextPayloadWithVisualProps = {
                ...mockInitializeContextPayload,
                chartModel: {
                    ...mockInitializeContextPayload.chartModel,
                    visualProps: {
                        data: 'sample data',
                    },
                },
            };

            await eventProcessor({
                payload: mockInitializeContextPayloadWithVisualProps,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            await expect(promise).resolves.toBeUndefined();
            const chartModel = customChartContext.getChartModel();
            expect(typeof chartModel.visualProps).toEqual('object');
            expect(chartModel.visualProps).toEqual({
                data: 'sample data',
            });
        });

        test('multiple intializations should throw an error', async () => {
            // Call the initialize function and wait for it to resolve
            getChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
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
        test('correct app options config should be set on initialize', async () => {
            const mockAppConfigOptions = {
                appOptions: {
                    isMobile: false,
                    isPrintMode: false,
                    isLiveboardContext: false,
                    isDebugMode: true,
                },
            };
            expect(mockInitMessage).toHaveBeenCalled();

            // Call the initialize function and wait for it to resolve
            const promise = customChartContext.initialize();

            // Check that the hasInitializedPromise has resolved

            const mockInitializeContextPayloadWithVisualProps = {
                ...mockInitializeContextPayload,
                appConfig: mockAppConfigOptions,
                chartModel: {
                    ...mockInitializeContextPayload.chartModel,
                    visualProps: {
                        data: 'sample data',
                    },
                },
            };

            await eventProcessor({
                payload: mockInitializeContextPayloadWithVisualProps,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            await expect(promise).resolves.toBeUndefined();
            const appConfig = customChartContext.getAppConfig();
            expect(appConfig).toStrictEqual(mockAppConfigOptions);
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

        test('TSToChartEvent.ChartConfigValidate validation response testing', async () => {
            // Define initial context with object definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.ChartConfigValidate,
                source: 'ts-host-app',
            });
            // Verify response with object definitions
            expect(responseWithInitialContext).toStrictEqual({
                isValid: true,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
            });

            // Redefine context with function-returned definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: () => {
                    return { elements: [] };
                },
                chartConfigEditorDefinition: () => {
                    return [
                        {
                            key: 'x',
                            columnSections: [{ label: 'x-axis', key: 'x' }],
                        },
                    ];
                },
            });
            // Trigger event processor with updated context
            const responseWithUpdatedContext = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.ChartConfigValidate,
                source: 'ts-host-app',
            });
            // Verify response with function-returned definitions
            expect(responseWithUpdatedContext).toStrictEqual({
                isValid: true,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [
                    {
                        key: 'x',
                        columnSections: [{ label: 'x-axis', key: 'x' }],
                    },
                ],
            });
        });
        test('TSToChartEvent.ChartConfigValidate validation response for invalid config', async () => {
            // Define initial context with object definitions
            const mockChartConfigValidate = jest
                .fn()
                .mockReturnValue({ isValid: false });
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
                validateConfig: mockChartConfigValidate,
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.ChartConfigValidate,
                source: 'ts-host-app',
            });
            // Verify response with object definitions
            expect(responseWithInitialContext).toStrictEqual({
                isValid: false,
            });
        });
        test('TSToChartEvent.ChartConfigValidate validation response return invalid without validate function', async () => {
            // Define initial context with object definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
                validateConfig: undefined,
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.ChartConfigValidate,
                source: 'ts-host-app',
            });
            // Verify response with object definitions
            expect(responseWithInitialContext).toStrictEqual({
                isValid: false,
            });
        });

        test('TSToChartEvent.validateVisualProps validation response testing', () => {
            // Define initial context with object definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            // Verify response with object definitions
            expect(responseWithInitialContext).toStrictEqual({
                isValid: true,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [],
            });
            // Redefine context with function-returned definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: () => {
                    return { elements: [] };
                },
                chartConfigEditorDefinition: () => {
                    return [
                        {
                            key: 'x',
                            columnSections: [{ label: 'x-axis', key: 'x' }],
                        },
                    ];
                },
            });
            // Trigger event processor with updated context
            const responseWithFunctionReturnedValues = eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            // Verify response with function-returned definitions
            expect(responseWithFunctionReturnedValues).toStrictEqual({
                isValid: true,
                visualPropEditorDefinition: { elements: [] },
                chartConfigEditorDefinition: [
                    {
                        key: 'x',
                        columnSections: [{ label: 'x-axis', key: 'x' }],
                    },
                ],
            });
        });

        test('TSToChartEvent.validateVisualProps should work with activeColumnId', () => {
            // Define initial context with object definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: {
                    elements: [mockFormElements],
                    columnsVizPropDefinition: [
                        {
                            type: ColumnType.MEASURE,
                            columnSettingsDefinition: {
                                'column-id': { elements: [mockFormElements] },
                            },
                        },
                    ],
                },
                chartConfigEditorDefinition: [],
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = eventProcessor({
                payload: {
                    ...mockInitializeContextPayload,
                    activeColumnId: 'column-id',
                },
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            // Verify response with object definitions
            expect(responseWithInitialContext).toStrictEqual({
                isValid: true,
                visualPropEditorDefinition: {
                    elements: [mockFormElements],
                    columnsVizPropDefinition: [
                        {
                            type: ColumnType.MEASURE,
                            columnSettingsDefinition: {
                                'column-id': { elements: [mockFormElements] },
                            },
                        },
                    ],
                },
                chartConfigEditorDefinition: [],
            });
        });

        test('TSToChartEvent.validateVisualProps should be called with correct activeColumnId', () => {
            // Define initial context with object definitions
            const mockValidateVisualProps = jest
                .fn()
                .mockImplementation(
                    (_visualProps, _chartModel, activeColumnId) => {
                        if (activeColumnId === 'column-id')
                            return { isValid: true };
                        return { isValid: false };
                    },
                );
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: {
                    elements: [mockFormElements],
                    columnsVizPropDefinition: [
                        {
                            type: ColumnType.MEASURE,
                            columnSettingsDefinition: {
                                'column-id': { elements: [mockFormElements] },
                            },
                        },
                    ],
                },
                chartConfigEditorDefinition: [],
                validateVisualProps: mockValidateVisualProps,
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = eventProcessor({
                payload: {
                    ...mockInitializeContextPayload,
                    activeColumnId: 'column-id',
                },
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            // we only want the correct active columnId to be passed
            expect(mockValidateVisualProps).toHaveBeenCalledWith(
                undefined,
                {},
                'column-id',
            );
            const validationResponse = eventProcessor({
                payload: {
                    ...mockInitializeContextPayload,
                    activeColumnId: 'column-id-1',
                },
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            expect(validationResponse).toStrictEqual({ isValid: false });
        });
        test('TSToChartEvent.validateVisualProps returns invalid if no function is provided.', () => {
            // Define initial context with object definitions
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: {
                    elements: [mockFormElements],
                    columnsVizPropDefinition: [
                        {
                            type: ColumnType.MEASURE,
                            columnSettingsDefinition: {
                                'column-id': { elements: [mockFormElements] },
                            },
                        },
                    ],
                },
                chartConfigEditorDefinition: [],
                validateVisualProps: undefined, // mocking undefined value
            });

            const validationResponse = eventProcessor({
                payload: {
                    ...mockInitializeContextPayload,
                },
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            expect(validationResponse).toStrictEqual({ isValid: false });
        });
        test('VisualPropEditorDefintion function should recieve columnId', () => {
            // Define initial context with object definitions
            const mockValidateVisualProps = jest
                .fn()
                .mockImplementation(
                    (_visualProps, _chartModel, activeColumnId) => {
                        if (activeColumnId === 'column-id')
                            return { isValid: true };
                        return { isValid: false };
                    },
                );
            const mockVisualPropEditorDefintion = jest.fn().mockReturnValue({
                elements: [mockFormElements],
                columnsVizPropDefinition: [
                    {
                        type: ColumnType.MEASURE,
                        columnSettingsDefinition: {
                            'column-id': { elements: [mockFormElements] },
                        },
                    },
                ],
            });
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                visualPropEditorDefinition: mockVisualPropEditorDefintion,
                chartConfigEditorDefinition: [],
                validateVisualProps: mockValidateVisualProps,
            });

            // Trigger event processor with initial context
            const responseWithInitialContext = eventProcessor({
                payload: {
                    ...mockInitializeContextPayload,
                    activeColumnId: 'column-id',
                },
                eventType: TSToChartEvent.VisualPropsValidate,
                source: 'ts-host-app',
            });
            // we only want the correct active columnId to be passed
            expect(mockVisualPropEditorDefintion.mock.calls[0][2]).toBe(
                'column-id',
            );
        });

        test('should not trigger post message if host is not accurate', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // mock the event trigger for ChartConfigValidate
            const validateChartConfigResp = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.ChartConfigValidate,
            });
            // Check that the response was received
            expect(validateChartConfigResp).toEqual({
                isValid: true,
            });

            // mock the event trigger for VisualPropsValidate
            const validateVisualPropsResp = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.VisualPropsValidate,
            });
            // Check that the response was received
            expect(validateVisualPropsResp).toEqual({
                isValid: true,
            });

            // mock the event trigger for TriggerRenderChart
            const renderResp = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.TriggerRenderChart,
            });
            // Check that the response was received
            expect(renderChart).toHaveBeenCalled();

            // mock the event trigger for getQueriesFromChartConfig
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.GetDataQuery,
            });

            expect(getQueriesFromChartConfig).toHaveBeenCalled();
        });

        test('default external function testing', async () => {
            expect(mockInitMessage).toHaveBeenCalled();

            // mock the event trigger for DataUpdate

            const dataUpdateResp = await eventProcessor({
                payload: {
                    data: 'random data',
                },
                eventType: TSToChartEvent.DataUpdate,
            });
            // Check that the response was received
            expect(dataUpdateResp).toEqual({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().data).toBe('random data');

            // mock the event trigger for VisualPropsValidate
            const modelUpdateResp = await eventProcessor({
                payload: {
                    chartModel: {
                        data: 'random data2',
                        visualProps: null,
                    },
                },
                eventType: TSToChartEvent.ChartModelUpdate,
            });
            // Check that the response was received
            expect(modelUpdateResp).toEqual({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().data).toBe(
                'random data2',
            );
            expect(customChartContext.getChartModel().visualProps).toBe(null);

            // mock the event trigger for VisualPropsUpdate
            const visualPropsUpdateResp = await eventProcessor({
                payload: {
                    visualProps: 'random data',
                },
                eventType: TSToChartEvent.VisualPropsUpdate,
            });
            // Check that the response was received
            expect(visualPropsUpdateResp).toEqual({
                triggerRenderChart: true,
            });
            expect(customChartContext.getChartModel().visualProps).toBe(
                'random data',
            );

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
            const axisMenuClickResp = await eventProcessor({
                payload: {
                    customAction: {
                        id: 'custom-action-1',
                        columnIds: ['9f96b5b0-f7e4-4a5e-aa11-4c77fdf42125'],
                    },
                },
                eventType: TSToChartEvent.AxisMenuActionClick,
            });
            // Check that the response was valid which means action gets
            // executed successfully
            expect(axisMenuClickResp).toEqual({
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
            const ctxMenuResp = await eventProcessor({
                payload: {
                    customAction: {
                        id: 'custom-action-1',
                        columnIds: ['9f96b5b0-f7e4-4a5e-aa11-4c77fdf42125'],
                    },
                },
                eventType: TSToChartEvent.ContextMenuActionClick,
            });
            // Check that the response was valid which means action gets
            // executed successfully
            expect(ctxMenuResp).toEqual({
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

            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TEST_EVENT_TYPE,
            });
            // Check that the event listener was added to the eventListeners
            // object
            expect(testCallbackFn).toHaveBeenCalled();
        });

        test('should respond with an error to an unspecified event type', async () => {
            expect(mockInitMessage).toHaveBeenCalled();
            // Define a test event type and callback function
            const TEST_EVENT_TYPE = 'testEventType' as any;

            // mock the event trigger

            const resp = await eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TEST_EVENT_TYPE,
            });
            // Check that the event listener was added to the eventListeners
            // object
            expect(resp).toEqual({
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

            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TEST_EVENT_TYPE,
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

            eventProcessor({
                payload: {},
                eventType: TEST_EVENT_TYPE_1,
            });
            eventProcessor({
                payload: {},
                eventType: TEST_EVENT_TYPE_2,
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
            await expect(result).rejects.toBeDefined();
        });

        test('should resolve the promise if the chart context is initialized', async () => {
            // Check that the hasInitializedPromise has resolved

            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });

            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });

            const promise = customChartContext.initialize();
            await expect(promise).resolves.toBeUndefined();

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
            const mockCustomAction = jest.fn();
            let resolve: any;
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
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
                        onClick: mockCustomAction,
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
            eventProcessor({
                payload: {
                    customAction: {
                        id: 'custom-action-1',
                        clickedPoint: {},
                        event: {},
                        selectedPoints: [{}],
                    },
                },
                eventType: TSToChartEvent.ContextMenuActionClick,
            });
            expect(mockCustomAction).toHaveBeenCalled();
            expect(mockCustomAction).toHaveBeenCalledWith({
                clickedPoint: {},
                event: {},
                id: 'custom-action-1',
                selectedPoints: [{}],
            });
        });
        test('should process the event payload for axis menu custom actions', async () => {
            const mockCustomAction = jest.fn();
            let resolve: any;
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
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
                        onClick: mockCustomAction,
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

            eventProcessor({
                payload: {
                    customAction: {
                        id: 'custom-action-1',
                        columnIds: ['123'],
                        event: {},
                    },
                },
                eventType: TSToChartEvent.AxisMenuActionClick,
            });
            expect(mockCustomAction).toHaveBeenCalled();
            expect(mockCustomAction).toHaveBeenCalledWith({
                id: 'custom-action-1',
                columnIds: ['123'],
                event: {},
            });
        });

        test('should process the event payload for axis menu when custom actions are not defined', async () => {
            let resolve: any;
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
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
            let resolve: any;
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
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
