/**
 *  Custom chart context spec file
 *
 *  @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 */
import _ from 'lodash';
import { mockInitializeContextPayload } from '../test/test-utils';
import { ColumnType } from '../types/answer-column.types';
import { ChartToTSEvent, ErrorType } from '../types/chart-to-ts-event.types';
import {
    DownloadExcelTriggerPayload,
    TSToChartEvent,
} from '../types/ts-to-chart-event.types';
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
                    allowGradientColoring: false,
                    allowMeasureNamesAndValues: false,
                },
                persistedVisualPropKeys: undefined,
                chartConfigParameters: {
                    measureNameValueColumns: {
                        enableMeasureNameColumn: false,
                        enableMeasureValueColumn: false,
                        measureNameColumnAlias: 'Measure Name',
                        measureValueColumnAlias: 'Measure Values',
                    },
                    batchSizeLimit: 20000,
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
                customVisualProps: undefined,
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
                customVisualProps: undefined,
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
                customVisualProps: undefined,
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
                customVisualProps: undefined,
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
                customVisualProps: undefined,
            });
        });

        test('should handle GetColumnData event with valid columnId', async () => {
            // Set up mock data in the chart model
            const mockData = {
                data: [
                    {
                        data: {
                            columns: ['col1', 'col2', 'col3'],
                            dataValue: [
                                [1, 2, 3],
                                [4, 5, 6],
                                [7, 8, 9],
                            ],
                        },
                    },
                ],
            };

            (customChartContext as any).chartModel = mockData;

            const response = await eventProcessor({
                payload: {
                    columnId: 'col2',
                },
                eventType: TSToChartEvent.GetColumnData,
            });

            expect(response).toEqual({
                data: [2, 5, 8],
            });
        });

        test('should return empty array for non-existent columnId', async () => {
            // Set up mock data in the chart model
            const mockData = {
                data: [
                    {
                        data: {
                            columns: ['col1', 'col2', 'col3'],
                            dataValue: [
                                [1, 2, 3],
                                [4, 5, 6],
                            ],
                        },
                    },
                ],
            };

            (customChartContext as any).chartModel = mockData;

            const response = await eventProcessor({
                payload: {
                    columnId: 'non-existent-column',
                },
                eventType: TSToChartEvent.GetColumnData,
            });

            expect(response).toEqual({
                data: [],
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
                {},
                undefined,
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

        test('TSToChartEvent.MixpanelEvent should call trackMixpanelEvent handler when provided', () => {
            // Create a mock handler that returns event name and payload
            const mockTrackMixpanelEvent = jest.fn().mockReturnValue({
                eventName: 'custom.visual-prop-changed',
                mixpanelPayload: {
                    settingPath: 'color',
                    newValue: 'blue',
                    chartType: 'bar',
                },
            });

            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                trackMixpanelEvent: mockTrackMixpanelEvent,
            });

            const mockPayload = {
                previousValue: 'red',
                columnId: 'col-123',
                changeInfo: {
                    path: 'color',
                    value: 'blue',
                },
                context: {
                    chartType: 'bar',
                    answerId: 'answer-456',
                },
            };

            // Trigger the MixpanelEvent
            const response = eventProcessor({
                payload: mockPayload,
                eventType: TSToChartEvent.MixpanelEvent,
                source: 'ts-host-app',
            });

            // Verify handler was called with correct payload and chart state
            expect(mockTrackMixpanelEvent).toHaveBeenCalledWith(mockPayload, {
                visualProps: undefined,
            });

            // Verify response contains event name and mixpanel payload
            expect(response).toEqual({
                eventName: 'custom.visual-prop-changed',
                mixpanelPayload: {
                    settingPath: 'color',
                    newValue: 'blue',
                    chartType: 'bar',
                },
            });
        });

        test('TSToChartEvent.MixpanelEvent should return empty object when no handler is provided', () => {
            // Create context without trackMixpanelEvent handler
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });

            const mockPayload = {
                previousValue: 'red',
                changeInfo: {
                    path: 'color',
                    value: 'blue',
                },
            };

            // Trigger the MixpanelEvent
            const response = eventProcessor({
                payload: mockPayload,
                eventType: TSToChartEvent.MixpanelEvent,
                source: 'ts-host-app',
            });

            // eventProcessor returns {} as fallback when handler returns
            // undefined
            expect(response).toEqual({});
        });

        test('TSToChartEvent.MixpanelEvent handler can return undefined to skip event', () => {
            // Create a handler that conditionally returns undefined
            const mockTrackMixpanelEvent = jest.fn().mockReturnValue(undefined);

            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                trackMixpanelEvent: mockTrackMixpanelEvent,
            });

            const mockPayload = {
                changeInfo: {
                    path: 'internalSetting',
                    value: 'someValue',
                },
            };

            const response = eventProcessor({
                payload: mockPayload,
                eventType: TSToChartEvent.MixpanelEvent,
                source: 'ts-host-app',
            });

            expect(mockTrackMixpanelEvent).toHaveBeenCalledWith(mockPayload, {
                visualProps: undefined,
            });
            // eventProcessor returns {} as fallback when handler returns
            // undefined
            expect(response).toEqual({});
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

        describe('axisMenuCustomActionPreProcessor', () => {
            let customChartContext: CustomChartContext;

            beforeEach(() => {
                customChartContext = new CustomChartContext({
                    getDefaultChartConfig,
                    getQueriesFromChartConfig,
                    renderChart,
                });
            });

            afterEach(() => {
                customChartContext.destroy();
                eventProcessor = null;
                jest.resetAllMocks();
            });

            test('should return original payload when customActions is empty', () => {
                const eventPayload = [
                    {
                        customActions: [],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                expect(result).toEqual(eventPayload);
            });

            test('should return original payload when customActions is undefined', () => {
                const eventPayload = [
                    {
                        customActions: undefined,
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                expect(result).toEqual(eventPayload);
            });

            test('should process basic custom actions correctly', () => {
                const mockOnClick = jest.fn();
                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'action-1',
                                label: 'Action 1',
                                icon: 'icon-1',
                                onClick: mockOnClick,
                                itemDisabled: false,
                                itemDisabledTooltip: 'Tooltip 1',
                            },
                            {
                                id: 'action-2',
                                label: 'Action 2',
                                icon: 'icon-2',
                                onClick: undefined,
                                itemDisabled: true,
                                itemDisabledTooltip: 'Tooltip 2',
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                // Verify the processed payload structure
                expect(result[0].customActions).toHaveLength(2);
                expect(result[0].customActions?.[0]).toEqual({
                    id: 'action-1',
                    label: 'Action 1',
                    icon: 'icon-1',
                    itemDisabled: false,
                    itemDisabledTooltip: 'Tooltip 1',
                    cascadingItems: undefined,
                });
                expect(result[0].customActions?.[1]).toEqual({
                    id: 'action-2',
                    label: 'Action 2',
                    icon: 'icon-2',
                    itemDisabled: true,
                    itemDisabledTooltip: 'Tooltip 2',
                    cascadingItems: undefined,
                });

                // Verify callbacks are stored in handler
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'action-1'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'action-2'
                    ],
                ).toBe(_.noop);
            });

            test('should process cascading items correctly', () => {
                const mockParentOnClick = jest.fn();
                const mockChildOnClick = jest.fn();
                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'parent-action',
                                label: 'Parent Action',
                                icon: 'parent-icon',
                                onClick: mockParentOnClick,
                                cascadingItems: [
                                    {
                                        title: 'Submenu 1',
                                        items: [
                                            {
                                                id: 'child-action-1',
                                                label: 'Child Action 1',
                                                icon: 'child-icon-1',
                                                onClick: mockChildOnClick,
                                                itemDisabled: false,
                                                itemDisabledTooltip:
                                                    'Child Tooltip 1',
                                                isSelected: true,
                                            },
                                            {
                                                id: 'child-action-2',
                                                label: 'Child Action 2',
                                                icon: 'child-icon-2',
                                                onClick: undefined,
                                                itemDisabled: true,
                                                itemDisabledTooltip:
                                                    'Child Tooltip 2',
                                                isSelected: false,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                // Verify the processed payload structure
                expect(result[0].customActions).toHaveLength(1);
                expect(
                    result[0].customActions?.[0]?.cascadingItems,
                ).toHaveLength(1);
                expect(
                    result[0].customActions?.[0]?.cascadingItems?.[0],
                ).toEqual({
                    title: 'Submenu 1',
                    items: [
                        {
                            id: 'child-action-1',
                            label: 'Child Action 1',
                            icon: 'child-icon-1',
                            itemDisabled: false,
                            itemDisabledTooltip: 'Child Tooltip 1',
                            isSelected: true,
                        },
                        {
                            id: 'child-action-2',
                            label: 'Child Action 2',
                            icon: 'child-icon-2',
                            itemDisabled: true,
                            itemDisabledTooltip: 'Child Tooltip 2',
                            isSelected: false,
                        },
                    ],
                });

                // Verify callbacks are stored in handler
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'parent-action'
                    ],
                ).toBe(mockParentOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'child-action-1'
                    ],
                ).toBe(mockChildOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'child-action-2'
                    ],
                ).toBe(_.noop);
            });

            test('should handle multiple cascading items', () => {
                const mockOnClick = jest.fn();
                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'parent-action',
                                label: 'Parent Action',
                                icon: 'parent-icon',
                                onClick: mockOnClick,
                                cascadingItems: [
                                    {
                                        title: 'Submenu 1',
                                        items: [
                                            {
                                                id: 'child-1-1',
                                                label: 'Child 1-1',
                                                icon: 'child-icon-1-1',
                                                onClick: mockOnClick,
                                            },
                                            {
                                                id: 'child-1-2',
                                                label: 'Child 1-2',
                                                icon: 'child-icon-1-2',
                                                onClick: mockOnClick,
                                            },
                                        ],
                                    },
                                    {
                                        title: 'Submenu 2',
                                        items: [
                                            {
                                                id: 'child-2-1',
                                                label: 'Child 2-1',
                                                icon: 'child-icon-2-1',
                                                onClick: mockOnClick,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                // Verify the processed payload structure
                expect(result[0].customActions).toHaveLength(1);
                expect(
                    result[0].customActions?.[0]?.cascadingItems,
                ).toHaveLength(2);
                expect(
                    result[0].customActions?.[0]?.cascadingItems?.[0]?.title,
                ).toBe('Submenu 1');
                expect(
                    result[0].customActions?.[0]?.cascadingItems?.[0]?.items,
                ).toHaveLength(2);
                expect(
                    result[0].customActions?.[0]?.cascadingItems?.[1]?.title,
                ).toBe('Submenu 2');
                expect(
                    result[0].customActions?.[0]?.cascadingItems?.[1]?.items,
                ).toHaveLength(1);

                // Verify callbacks are stored in handler
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'parent-action'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'child-1-1'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'child-1-2'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'child-2-1'
                    ],
                ).toBe(mockOnClick);
            });

            test('should clear existing axisMenuActionHandler before processing', () => {
                // First, add some existing handlers
                (customChartContext as any).axisMenuActionHandler = {
                    'existing-action': jest.fn(),
                };

                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'new-action',
                                label: 'New Action',
                                icon: 'new-icon',
                                onClick: jest.fn(),
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                customChartContext.axisMenuCustomActionPreProcessor(
                    eventPayload as any,
                );

                // Verify that only the new action handler exists
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'existing-action'
                    ],
                ).toBeUndefined();
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'new-action'
                    ],
                ).toBeDefined();
            });

            test('should handle mixed actions with and without cascading items', () => {
                const mockOnClick = jest.fn();
                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'simple-action',
                                label: 'Simple Action',
                                icon: 'simple-icon',
                                onClick: mockOnClick,
                            },
                            {
                                id: 'complex-action',
                                label: 'Complex Action',
                                icon: 'complex-icon',
                                onClick: mockOnClick,
                                cascadingItems: [
                                    {
                                        title: 'Submenu',
                                        items: [
                                            {
                                                id: 'nested-action',
                                                label: 'Nested Action',
                                                icon: 'nested-icon',
                                                onClick: mockOnClick,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                // Verify the processed payload structure
                expect(result[0].customActions).toHaveLength(2);
                expect(
                    result[0].customActions?.[0]?.cascadingItems,
                ).toBeUndefined();
                expect(
                    result[0].customActions?.[1]?.cascadingItems,
                ).toBeDefined();

                // Verify callbacks are stored in handler
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'simple-action'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'complex-action'
                    ],
                ).toBe(mockOnClick);
                expect(
                    (customChartContext as any).axisMenuActionHandler[
                        'nested-action'
                    ],
                ).toBe(mockOnClick);
            });

            test('should preserve original event and other properties', () => {
                const eventPayload = [
                    {
                        customActions: [
                            {
                                id: 'action-1',
                                label: 'Action 1',
                                icon: 'icon-1',
                                onClick: jest.fn(),
                            },
                        ],
                        event: { clientX: 100, clientY: 200 },
                        otherProperty: 'other-value',
                    },
                ];

                const result =
                    customChartContext.axisMenuCustomActionPreProcessor(
                        eventPayload as any,
                    );

                // Verify original properties are preserved
                expect(result[0].event).toEqual({ clientX: 100, clientY: 200 });
                expect((result[0] as any).otherProperty).toBe('other-value');
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

        test('should update visual props on successful visual prop editor definition update', async () => {
            // Initialize context
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            await customChartContext.initialize();

            // Mock successful response for UpdateVisualPropEditorDefinition
            const mockVisualProps = { color: 'blue' };
            mockPostMessageToHost.mockResolvedValue({
                hasError: false,
                data: mockVisualProps,
            });

            // Emit event and wait for post-processing
            await customChartContext.emitEvent(
                ChartToTSEvent.UpdateVisualPropEditorDefinition,
                { visualPropEditorDefinition: { elements: [] } },
            );

            // Verify that visualProps in chartModel is updated
            expect(customChartContext.getChartModel().visualProps).toEqual(
                mockVisualProps,
            );
        });
    });
    describe('DownloadExcelTrigger', () => {
        let customChartContext: CustomChartContext;

        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
        });

        afterEach(() => {
            customChartContext.destroy();
            eventProcessor = null;
            jest.resetAllMocks();
        });

        test('should return default response when no custom handler is provided', async () => {
            const response = await eventProcessor({
                payload: {},
                eventType: TSToChartEvent.DownloadExcelTrigger,
            });

            expect(response).toEqual({
                isDownloadHandled: true,
                fileName: '',
                error: '',
                message: 'Download Excel not implemented.',
            });
        });

        test('should use custom handler when provided', async () => {
            const mockDownloadHandler = jest.fn().mockReturnValue({
                isDownloadHandled: true,
                fileName: 'custom-report.xlsx',
                error: '',
                message: 'Success',
            });

            // Create new context with custom handler
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });

            // Register custom handler
            customChartContext.on(
                TSToChartEvent.DownloadExcelTrigger,
                mockDownloadHandler,
            );

            const testPayload = {
                customData: 'test',
            };

            const response = await eventProcessor({
                payload: testPayload,
                eventType: TSToChartEvent.DownloadExcelTrigger,
            });

            expect(mockDownloadHandler).toHaveBeenCalledWith(testPayload);
            expect(response).toEqual({
                isDownloadHandled: true,
                fileName: 'custom-report.xlsx',
                error: '',
                message: 'Success',
            });
        });

        test('should handle errors in custom handler', async () => {
            const mockDownloadHandler = jest.fn().mockReturnValue({
                isDownloadHandled: true,
                fileName: '',
                error: 'Failed to generate excel',
                message: 'Error occurred',
            });

            // Create new context with custom handler
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });

            // Register custom handler
            customChartContext.on(
                TSToChartEvent.DownloadExcelTrigger,
                mockDownloadHandler,
            );

            const response = await eventProcessor({
                payload: {},
                eventType: TSToChartEvent.DownloadExcelTrigger,
            });

            expect(mockDownloadHandler).toHaveBeenCalled();
            expect(response).toEqual({
                isDownloadHandled: true,
                fileName: '',
                error: 'Failed to generate excel',
                message: 'Error occurred',
            });
        });

        test('should pass through payload to custom handler', async () => {
            const mockDownloadHandler = jest.fn().mockReturnValue({
                isDownloadHandled: true,
                fileName: 'test.xlsx',
                error: '',
                message: 'Success',
            });

            // Create new context with custom handler
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });

            // Register custom handler
            customChartContext.on(
                TSToChartEvent.DownloadExcelTrigger,
                mockDownloadHandler,
            );

            const testPayload = {
                format: 'xlsx',
                filters: ['test1', 'test2'],
                customOptions: {
                    includeHeaders: true,
                },
            };

            await eventProcessor({
                payload: testPayload,
                eventType: TSToChartEvent.DownloadExcelTrigger,
            });

            expect(mockDownloadHandler).toHaveBeenCalledWith(testPayload);
        });

        test('should chain responses through multiple handlers in LIFO order when reverseEventExecutionOrder is true', async () => {
            const firstHandler = jest
                .fn()
                .mockImplementation(
                    async (
                        testPayload: DownloadExcelTriggerPayload,
                        response?: any,
                    ) => {
                        if (response) {
                            return response;
                        }
                        return {
                            isDownloadHandled: true,
                            fileName: 'first.xlsx',
                            error: '',
                            message: 'First handler response',
                            customField: 'first',
                        };
                    },
                );

            const secondHandler = jest.fn().mockReturnValue({
                isDownloadHandled: true,
                fileName: 'second.xlsx',
                error: '',
                message: 'Second handler response',
                customField: 'second',
            });

            // Create new context with custom handlers
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
                reverseEventExecutionOrder: true,
            });

            // Register handlers - second will execute first (LIFO)
            customChartContext.on(
                TSToChartEvent.DownloadExcelTrigger,
                firstHandler,
            );
            customChartContext.on(
                TSToChartEvent.DownloadExcelTrigger,
                secondHandler,
            );

            const testPayload = {
                format: 'xlsx',
                filters: ['test1', 'test2'],
            };

            const result = await eventProcessor({
                payload: testPayload,
                eventType: TSToChartEvent.DownloadExcelTrigger,
            });

            // Verify handlers were called in correct order
            expect(secondHandler).toHaveBeenCalledWith(testPayload, undefined);
            expect(firstHandler).toHaveBeenCalledWith(testPayload, {
                isDownloadHandled: true,
                fileName: 'second.xlsx',
                error: '',
                message: 'Second handler response',
                customField: 'second',
            });

            // Verify final result comes from first handler's return value
            // (last custom handler to execute)
            expect(result).toEqual({
                isDownloadHandled: true,
                fileName: 'second.xlsx',
                error: '',
                message: 'Second handler response',
                customField: 'second',
            });
        });
    });

    describe('showGlobalAlertToast', () => {
        let customChartContext: CustomChartContext;

        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            customChartContext.initialize();
        });

        afterEach(() => {
            customChartContext.destroy();
            eventProcessor = null;
            jest.resetAllMocks();
        });

        test('should process ShowGlobalAlertToast event and handle action click', async () => {
            const mockOnClick = jest.fn();
            const toastPayload = {
                alertMessage: 'Test message',
                primaryActionButton: {
                    id: 'test-action',
                    label: 'Test Action',
                    onClick: mockOnClick,
                },
            };

            customChartContext.emitEvent(
                ChartToTSEvent.ShowGlobalAlertToast,
                toastPayload,
            );

            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                {
                    alertMessage: 'Test message',
                    primaryActionButton: {
                        id: 'test-action',
                        label: 'Test Action',
                        tooltip: undefined,
                        type: undefined,
                    },
                },
                ChartToTSEvent.ShowGlobalAlertToast,
            );

            // Check if the handler is stored
            expect(
                (customChartContext as any).globalToastActionHandler[
                    'test-action'
                ],
            ).toBe(mockOnClick);

            // Simulate the action click from host
            await eventProcessor({
                eventType: TSToChartEvent.GlobalToastActionClick,
                payload: {
                    alertAction: {
                        id: 'test-action',
                    },
                },
            });

            expect(mockOnClick).toHaveBeenCalled();
        });

        test('should process ShowGlobalAlertToast without primary action', () => {
            const toastPayload = {
                alertMessage: 'Test message without action',
            };

            customChartContext.emitEvent(
                ChartToTSEvent.ShowGlobalAlertToast,
                toastPayload,
            );

            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                toastPayload,
                ChartToTSEvent.ShowGlobalAlertToast,
            );
            expect(
                (customChartContext as any).globalToastActionHandler,
            ).toEqual({});
        });
    });

    describe('TrackChartInteraction', () => {
        let customChartContext: CustomChartContext;

        beforeEach(() => {
            customChartContext = new CustomChartContext({
                getDefaultChartConfig,
                getQueriesFromChartConfig,
                renderChart,
            });
            eventProcessor({
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
            });
            eventProcessor({
                payload: {},
                eventType: TSToChartEvent.InitializeComplete,
            });
            customChartContext.initialize();
        });

        afterEach(() => {
            customChartContext.destroy();
            eventProcessor = null;
            jest.resetAllMocks();
        });

        test('should emit TrackChartInteraction event with correct payload', () => {
            const interactionPayload = {
                eventName: 'pivot.context-expand-all',
                mixpanelPayload: {
                    actionId: 'expand-all',
                    chartType: 'pivot',
                    columnIds: ['col-1', 'col-2'],
                },
            };

            customChartContext.emitEvent(
                ChartToTSEvent.TrackChartInteraction,
                interactionPayload,
            );

            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                interactionPayload,
                ChartToTSEvent.TrackChartInteraction,
            );
        });

        test('should emit TrackChartInteraction with minimal payload', () => {
            const minimalPayload = {
                eventName: 'chart.render-complete',
                mixpanelPayload: {},
            };

            customChartContext.emitEvent(
                ChartToTSEvent.TrackChartInteraction,
                minimalPayload,
            );

            expect(mockPostMessageToHost).toHaveBeenCalledWith(
                mockInitializeContextPayload.componentId,
                mockInitializeContextPayload.hostUrl,
                minimalPayload,
                ChartToTSEvent.TrackChartInteraction,
            );
        });
    });
});
