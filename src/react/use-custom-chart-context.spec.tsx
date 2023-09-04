import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import * as PostMessageEventBridge from '../main/post-message-event-bridge';
import { mockInitializeContextPayload } from '../test/test-utils';
import { ChartToTSEvent } from '../types/chart-to-ts-event.types';
import { TSToChartEvent } from '../types/ts-to-chart-event.types';
import { contextChartProps } from './mocks/custom-chart-context-mock';
import { useChartContext } from './use-custom-chart-context';

jest.mock('../main/post-message-event-bridge');

describe('useChartContext initialization', () => {
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
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
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
        eventProcessor({
            data: {
                payload: {
                    componentId: 'COMPONENT_ID',
                    hostUrl: 'https://some.chart.app',
                    chartModel: mockedChartModel,
                },
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
        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(true);
            expect(result.current.chartModel).toEqual(mockedChartModel);
        });
        result.current?.destroy();
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
                renderChart: jest.fn(),
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
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
    });

    test('should trigger the emitter correctly when context is initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );
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
        eventProcessor({
            data: {
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
        });
        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(false);
        });
        const promise = result.current.emitRenderStart();
        await expect(promise).rejects.toThrow('Context not initialized');
        expect(mockPostMessageToHost).not.toHaveBeenCalled();
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
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
    });

    test('should trigger the setOnEvent correctly when context is initialized', async () => {
        // Render the hook with the custom chart context props
        const { result, waitFor } = renderHook(() =>
            useChartContext(contextChartProps),
        );

        // Assert that the context is not initialized initially
        expect(result.current.hasInitialized).toBe(false);
        expect(result.current.chartModel).toBeUndefined();
        const mockPostMessage = jest.fn();
        eventProcessor({
            data: {
                payload: {
                    componentId: 'COMPONENT_ID',
                    hostUrl: 'https://some.chart.app',
                    chartModel: mockedChartModel,
                },
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
        await waitFor(() => {
            expect(result.current.hasInitialized).toBe(true);
            expect(result.current.chartModel).toEqual(mockedChartModel);
        });

        eventProcessor({
            data: {
                payload: { chartModel: {} },
                eventType: TSToChartEvent.ChartModelUpdate,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
        });
        await waitFor(() => {
            expect(mockPostMessage).toHaveBeenCalledWith({
                triggerRenderChart: true,
            });
            expect(result.current.chartModel).toEqual({});
        });

        eventProcessor({
            data: {
                payload: { visualProps: { color: 'red' } },
                eventType: TSToChartEvent.VisualPropsUpdate,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
        });
        expect(mockPostMessage).toHaveBeenCalledWith({
            triggerRenderChart: true,
        });
        await waitFor(() => {
            expect(mockPostMessage).toHaveBeenCalledWith({
                triggerRenderChart: true,
            });
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
        eventProcessor({
            data: {
                payload: mockInitializeContextPayload,
                eventType: TSToChartEvent.Initialize,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
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
        });

        mockPostMessageToHost.mockImplementation(() => {
            return global.Promise.resolve();
        });
    });
    afterEach(() => {
        // Clear mock implementations after each test
        jest.clearAllMocks();
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
        eventProcessor({
            data: {
                payload: {
                    componentId: 'COMPONENT_ID',
                    hostUrl: 'https://some.chart.app',
                    chartModel: mockedChartModel,
                },
                eventType: TSToChartEvent.Initialize,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
        });
        rerender(<CustomChartComponent />);

        // Check if the child element is rendered
        await waitFor(() => {
            expect(getByTestId('child-element').textContent).toBe(
                'Child Element counter: 1',
            );
        });

        eventProcessor({
            data: {
                payload: { visualProps: { color: 'red' } },
                eventType: TSToChartEvent.VisualPropsUpdate,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
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
        eventProcessor({
            data: {
                payload: {
                    componentId: 'COMPONENT_ID',
                    hostUrl: 'https://some.chart.app',
                    chartModel: mockedChartModel,
                },
                eventType: TSToChartEvent.Initialize,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
        });
        eventProcessor({
            data: {
                payload: { visualProps: { color: 'red' } },
                eventType: TSToChartEvent.VisualPropsUpdate,
                source: 'ts-host-app',
            },
            ports: [{ postMessage: mockPostMessage }],
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
