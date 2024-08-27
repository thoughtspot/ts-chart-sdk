import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import * as PostMessageEventBridge from '../main/post-message-event-bridge';
import { mockInitializeContextPayload } from '../test/test-utils';
import { ColumnType } from '../types/answer-column.types';
import { ChartToTSEvent } from '../types/chart-to-ts-event.types';
import { TSToChartEvent } from '../types/ts-to-chart-event.types';
import { contextChartProps } from './mocks/custom-chart-context-mock';
import { useChartContext } from './use-custom-chart-context';

describe('useChartContext initialization', () => {
    let eventProcessor: any;
    let mockInitMessage;
    let mockPostMessageToHost;
    const mockedChartModel = {
        columns: [{ type: ColumnType.MEASURE }, { type: ColumnType.ATTRIBUTE }],
        config: {},
    };
    beforeEach(() => {
        mockInitMessage = jest.spyOn(
            PostMessageEventBridge,
            'initMessageListener',
        );
        mockPostMessageToHost = jest.spyOn(
            PostMessageEventBridge,
            'postMessageToHostApp',
        );
        mockInitMessage.mockImplementation((fn: any) => {
            eventProcessor = fn;
            return () => null;
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
        PostMessageEventBridge.globalThis.isInitialized = false;
    });

    test('should initialize the context only after intialize completes', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );

        // Assert that the context is not initialized initially
        expect(result.current.hasInitialized).toBe(false);
        expect(result.current.chartModel).toBeUndefined();
        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: {
                componentId: 'COMPONENT_ID',
                hostUrl: 'https://some.chart.app',
                chartModel: mockedChartModel,
            },
            eventType: TSToChartEvent.Initialize,
        });
        await eventProcessor({
            payload: {},
            eventType: TSToChartEvent.InitializeComplete,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(true);
            expect(result.current.chartModel).toEqual(mockedChartModel);
        });
    });

    test('should trigger getDataQuery and fetch correct query response', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );

        // Assert that the context is not initialized initially
        expect(result.current.hasInitialized).toBe(false);
        expect(result.current.chartModel).toBeUndefined();
        await eventProcessor({
            payload: {
                componentId: 'COMPONENT_ID',
                hostUrl: 'https://some.chart.app',
                chartModel: mockedChartModel,
            },
            eventType: TSToChartEvent.Initialize,
        });
        const response = await eventProcessor({
            payload: {
                config: [
                    {
                        key: 'column',
                        dimensions: [
                            {
                                key: 'x',
                                columns: [mockedChartModel.columns[0]],
                            },
                            {
                                key: 'y',
                                columns: [mockedChartModel.columns[1]],
                            },
                        ],
                    },
                ],
            },
            eventType: TSToChartEvent.GetDataQuery,
            source: 'ts-host-app',
        });
        await eventProcessor({
            payload: {},
            eventType: TSToChartEvent.TriggerRenderChart,
            source: 'ts-host-app',
        });
        await eventProcessor({
            payload: {},
            eventType: TSToChartEvent.InitializeComplete,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(response.queries[0].queryColumns[0]).toBe(
                mockedChartModel.columns[0],
            );
            expect(response.queries[0].queryColumns[1]).toBe(
                mockedChartModel.columns[1],
            );
            expect(result.current.hasInitialized).toBeTruthy();
        });
    });

    test('should make sure hasInitialized to remain false when context initialization failed', async () => {
        jest.mock('../main/custom-chart-context', () => ({
            CustomChartContext: jest.fn().mockImplementation(() => ({
                initialize: jest
                    .fn()
                    .mockRejectedValue(new Error('Initialization failed')),
                emitEvent: jest.fn(),
                on: jest.fn(),
                getChartModel: jest.fn(),
                destroy: jest.fn(),
            })),
        }));

        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext({
                ...contextChartProps,
            }),
        );
        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(false);
            expect(result.current.chartModel).toBeUndefined();
        });
    });
});

describe('useChartContext emit', () => {
    let eventProcessor: any;
    let mockInitMessage;
    let mockPostMessageToHost: any;
    beforeEach(() => {
        mockInitMessage = jest.spyOn(
            PostMessageEventBridge,
            'initMessageListener',
        );
        mockPostMessageToHost = jest.spyOn(
            PostMessageEventBridge,
            'postMessageToHostApp',
        );
        mockInitMessage.mockImplementation((fn: any) => {
            eventProcessor = fn;
            return () => null;
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
        PostMessageEventBridge.globalThis.isInitialized = false;
    });

    test('should trigger the emitter correctly when context is initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );
        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: mockInitializeContextPayload,
            eventType: TSToChartEvent.Initialize,
        });

        await eventProcessor({
            payload: {},
            eventType: TSToChartEvent.InitializeComplete,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(true);
        });
        const contextPayload = {
            clickedPoint: { tuple: [{ columnId: '123', value: 12 }] },
            event: {} as any,
        };
        result.current.emitOpenContextMenu(contextPayload);
        expect(mockPostMessageToHost).toHaveBeenCalledWith(
            mockInitializeContextPayload.componentId,
            mockInitializeContextPayload.hostUrl,
            contextPayload,
            ChartToTSEvent.OpenContextMenu,
        );
        result.current?.destroy();
    });

    test('should not defined emitter when context is not initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );
        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: mockInitializeContextPayload,
            eventType: TSToChartEvent.Initialize,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(false);
        });
        const promise = result.current.emitRenderStart();
        await expect(promise).rejects.toThrow('Context not initialized');
    });
});

describe('useChartContext setOn listeners', () => {
    let eventProcessor: any;
    let mockInitMessage;
    let mockPostMessageToHost;
    const mockedChartModel = { columns: [], config: {} };
    beforeEach(() => {
        mockInitMessage = jest.spyOn(
            PostMessageEventBridge,
            'initMessageListener',
        );
        mockPostMessageToHost = jest.spyOn(
            PostMessageEventBridge,
            'postMessageToHostApp',
        );
        mockInitMessage.mockImplementation((fn: any) => {
            eventProcessor = fn;
            return () => null;
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
        PostMessageEventBridge.globalThis.isInitialized = false;
    });

    test('should trigger the setOnEvent correctly when context is initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );

        // Assert that the context is not initialized initially
        expect(result.current.hasInitialized).toBe(false);
        expect(result.current.chartModel).toBeUndefined();
        await eventProcessor({
            payload: {
                componentId: 'COMPONENT_ID',
                hostUrl: 'https://some.chart.app',
                chartModel: mockedChartModel,
            },
            eventType: TSToChartEvent.Initialize,
        });

        await eventProcessor({
            payload: {},
            eventType: TSToChartEvent.InitializeComplete,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(true);
            expect(result.current.chartModel).toEqual(mockedChartModel);
        });

        const resp = await eventProcessor({
            payload: { chartModel: {} },
            eventType: TSToChartEvent.ChartModelUpdate,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(resp).toEqual({
                triggerRenderChart: true,
            });
            expect(result.current.chartModel).toEqual({});
        });

        const propsUpdateResp = await eventProcessor({
            payload: { visualProps: { color: 'red' } },
            eventType: TSToChartEvent.VisualPropsUpdate,
            source: 'ts-host-app',
        });

        expect(propsUpdateResp).toEqual({
            triggerRenderChart: true,
        });
        await waitFor(() => {
            expect(result.current.chartModel?.visualProps).toEqual({
                color: 'red',
            });
        });
        result.current?.destroy();
    });

    test('should not defined setOnEvent when context is not initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );
        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: mockInitializeContextPayload,
            eventType: TSToChartEvent.Initialize,
            source: 'ts-host-app',
        });

        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(false);
        });
        const promise = result.current.setOnVisualPropsUpdate((payload) => {
            //
        });
        await expect(promise).rejects.toThrow('Context not initialized');
        const offPromise = result.current.setOffVisualPropsUpdate();
        await expect(offPromise).rejects.toThrow('Context not initialized');
    });
});

describe('useChartContext on React Wrapper component', () => {
    let eventProcessor: any;
    let mockInitMessage;
    let mockPostMessageToHost;
    const mockedChartModel = { columns: [], config: {} };
    beforeEach(() => {
        mockInitMessage = jest.spyOn(
            PostMessageEventBridge,
            'initMessageListener',
        );
        mockPostMessageToHost = jest.spyOn(
            PostMessageEventBridge,
            'postMessageToHostApp',
        );
        mockInitMessage.mockImplementation((fn: any) => {
            eventProcessor = fn;
            return () => null;
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
        PostMessageEventBridge.globalThis.isInitialized = false;
    });
    test('TSChartContext renders children and should not increase counter for useEffect on chartModel if visualProps is updated', async () => {
        const CustomChartComponent = () => {
            const [counter, setCounter] = React.useState(0);
            const { TSChartContext, chartModel, hasInitialized } =
                useChartContext(contextChartProps);
            React.useEffect(() => {
                setCounter((prevCount) => prevCount + 1);
            }, [chartModel]);
            return (
                <TSChartContext>
                    <div data-testid="child-element">
                        Child Element counter: {counter}
                        {(chartModel?.visualProps as any)?.color ?? ''}
                    </div>
                </TSChartContext>
            );
        };

        const { getByTestId, rerender } = render(<CustomChartComponent />);

        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: {
                componentId: 'COMPONENT_ID',
                hostUrl: 'https://some.chart.app',
                chartModel: mockedChartModel,
            },
            eventType: TSToChartEvent.Initialize,
        });

        rerender(<CustomChartComponent />);

        // Check if the child element is rendered
        await waitFor(() => {
            expect(getByTestId('child-element').textContent).toBe(
                'Child Element counter: 1',
            );
        });

        await eventProcessor({
            payload: { visualProps: { color: 'red' } },
            eventType: TSToChartEvent.VisualPropsUpdate,
            source: 'ts-host-app',
        });

        // Re-render the component with a new key
        // Check if the child element is still in the document after re-render
        const updatedChildElement = getByTestId('child-element');
        await waitFor(() => {
            expect(updatedChildElement.textContent).toBe(
                'Child Element counter: 1red',
            );
        });
    });

    test('TSChartContext renders children should increase counter for useEffect on chartModel.visualProps if visualProps is updated', async () => {
        const CustomChartComponent = () => {
            const [counter, setCounter] = React.useState(0);
            const { TSChartContext, chartModel, hasInitialized } =
                useChartContext(contextChartProps);
            React.useEffect(() => {
                setCounter((prevCount) => prevCount + 1);
            }, [chartModel?.visualProps]);
            return (
                <TSChartContext>
                    <div data-testid="child-element">
                        Child Element counter: {counter}
                        {(chartModel?.visualProps as any)?.color ?? ''}
                    </div>
                </TSChartContext>
            );
        };

        const { getByTestId, rerender } = render(<CustomChartComponent />);

        // Check if the child element is rendered
        const childElement = getByTestId('child-element');
        await waitFor(() => {
            expect(childElement.textContent).toBe('Child Element counter: 1');
        });

        // Re-render the component with a new key
        const mockPostMessage = jest.fn();
        await eventProcessor({
            payload: {
                componentId: 'COMPONENT_ID',
                hostUrl: 'https://some.chart.app',
                chartModel: mockedChartModel,
            },
            eventType: TSToChartEvent.Initialize,
            source: 'ts-host-app',
        });

        await eventProcessor({
            payload: { visualProps: { color: 'red' } },
            eventType: TSToChartEvent.VisualPropsUpdate,
            source: 'ts-host-app',
        });

        rerender(<CustomChartComponent />);
        // Check if the child element is still in the document after re-render
        const updatedChildElement = getByTestId('child-element');
        await waitFor(() => {
            expect(updatedChildElement.textContent).toBe(
                'Child Element counter: 2red',
            );
        });
    });
});
