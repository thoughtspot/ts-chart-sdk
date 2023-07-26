// // Import the necessary dependencies and testing utilities
// import { fireEvent, render, waitFor } from '@testing-library/react';
// import React from 'react';
// import * as CustomChartContext from '../main/custom-chart-context';
// import { ChartToTSEvent } from '../types/chart-to-ts-event.types';
// import { TSToChartEvent } from '../types/ts-to-chart-event.types';
// import { ChartContext, ChartProvider } from './custom-chart.context';

// // // Mock the CustomChartContext to test the functionality
// // jest.mock('../main/custom-chart-context', () => {
// //     return {
// //         CustomChartContext: jest.fn().mockImplementation(() => ({
// //             initialize: jest.fn(),
// //             emitEvent: jest.fn(),
// //             on: jest.fn(),
// //             getChartModel: jest.fn().mockReturnValue({}),
// //         })),
// //     };
// // });

// describe('ChartProvider', () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     test('renders children correctly for empty data', () => {
//         const { getByTestId } = render(
//             <ChartProvider
//                 contextProps={{
//                     getDefaultChartConfig: (chartModel) => [],
//                     getQueriesFromChartConfig: (chartConfig) => [],
//                     renderChart: () => Promise.resolve(),
//                 }}
//             >
//                 <div data-testid="child-component">Test Child</div>
//             </ChartProvider>,
//         );
//         const childContent = getByTestId('child-component').textContent;
//         expect(childContent).toBe('Test Child');
//     });

//     // test('initializes the provider correctly', () => {
//     //     render(
//     //         <ChartProvider contextProps={{}}>
//     //             <div>Test Child</div>
//     //         </ChartProvider>,
//     //     );

//     //     // Check if CustomChartContext is initialized with the correct props
//     //     expect(CustomChartContext).toHaveBeenCalledWith(
//     //         expect.objectContaining({}),
//     //     );
//     // });

//     test.only('emitters and event listeners work as expected', async () => {
//         // Mock emitEvent and on methods of CustomChartContext
//         const emitEvent = jest.fn().mockResolvedValue(true);
//         const on = jest.fn();
//         jest.mock('../main/custom-chart-context', () => {
//             return {
//                 CustomChartContext: jest.fn().mockImplementation(() => ({
//                     initialize: jest.fn().mockImplementation(async () => {
//                         return Promise.resolve();
//                     }),
//                     emitEvent,
//                     on,
//                     getChartModel: jest.fn().mockReturnValue({}),
//                 })),
//             };
//         });

//         const TestComponent = () => {
//             const chartContext = React.useContext(ChartContext);
//             const emitRenderChart = async () => {
//                 await chartContext.emitRenderStart([]);
//             };
//             if (!chartContext.hasInitialized) {
//                 return <div>Loading...</div>;
//             }
//             return (
//                 <div>
//                     <button onClick={emitRenderChart}>Emit Event</button>
//                 </div>
//             );
//         };

//         const { getByRole } = render(
//             <ChartProvider
//                 contextProps={{
//                     getDefaultChartConfig: (chartModel) => [],
//                     getQueriesFromChartConfig: (chartModel) => [],
//                     renderChart: (ctx) => Promise.resolve(),
//                 }}
//             >
//                 <TestComponent />
//             </ChartProvider>,
//         );

//         // Find the button and click it to trigger the event
//         await waitFor(() => {
//             expect(getByRole('button')).toBeDefined();
//         });
//         const button = getByRole('button');
//         fireEvent.click(button);

//         // Check if the emitEvent function was called correctly
//         expect(emitEvent).toHaveBeenCalledWith(ChartToTSEvent.RenderStart);

//         // Now, we can also test if the event listener is working correctly.
//         // You can add similar tests for other event listeners as well.
//         const chartModelUpdateCallback = jest.fn();
//         on.mockImplementation((event, callback) => {
//             if (event === TSToChartEvent.ChartModelUpdate) {
//                 chartModelUpdateCallback();
//             }
//         });

//         // Simulate the event listener callback
//         expect(chartModelUpdateCallback).toHaveBeenCalled();
//     });

//     // test('correctly updates chartModel state on events', async () => {
//     //     const TestComponent = () => {
//     //         const chartContext = React.useContext(ChartContext);
//     //         const { emitRenderStart, onChartModelUpdate } = chartContext;

//     //         // Simulate event listener callback to update chartModel state
//     //         React.useEffect(() => {
//     //             onChartModelUpdate((chartModel) => {
//     //                 // Update chartModel state when the event is triggered
//     //                 setChartModel(chartModel);
//     //             });
//     //         }, [onChartModelUpdate]);

//     //         return (
//     //             <div>
//     // <button onClick={emitRenderStart}>Emit RenderStart</button> </div>
//     //         );
//     //     };

//     //     render(
//     //         <ChartProvider contextProps={{}}>
//     //             <TestComponent />
//     //         </ChartProvider>,
//     //     );

//     //     const button = screen.getByRole('button');

//     //     // Emit an event to trigger onChartModelUpdate callback
//     //     button.click();

//     //     // Check if chartModel state is correctly updated after the event
//     //     expect(chartModelUpdateCallback).toHaveBeenCalled();
//     // });

//     // test('correctly emits RenderStart event', async () => {
//     //     const TestComponent = () => {
//     //         const chartContext = React.useContext(ChartContext);
//     //         const { emitRenderStart } = chartContext;

//     //         const handleEmitRenderStart = async () => {
//     //             // Call the emitter function to emit RenderStart event
//     //             await emitRenderStart();
//     //         };

//     //         return (
//     //             <div>
//     //                 <button onClick={handleEmitRenderStart}>
//     //                     Emit RenderStart
//     //                 </button>
//     //             </div>
//     //         );
//     //     };

//     //     render(
//     //         <ChartProvider contextProps={{}}>
//     //             <TestComponent />
//     //         </ChartProvider>,
//     //     );

//     //     const button = screen.getByRole('button');

//     //     // Emit an event to trigger the emitter function
//     //     button.click();

//     //     // Check if the emitEvent function was called correctly with the
//     //     // appropriate event and payload
//     // expect(emitEvent).toHaveBeenCalledWith(ChartToTSEvent.RenderStart, {});
//     // });

//     // test('correctly returns ChartContext values with emitters and listeners',
//     // () => { const contextProps = {};
//     //     const mockEmitEvent = jest.fn().mockResolvedValue();
//     //     const mockOnEvent = jest.fn();
//     //     CustomChartContext.mockImplementation(() => ({
//     //         initialize: jest.fn().mockResolvedValue(),
//     //         emitEvent: mockEmitEvent,
//     //         on: mockOnEvent,
//     //         getChartModel: jest.fn().mockReturnValue({}),
//     //     }));

//     //     const TestComponent = () => {
//     //         const chartContext = React.useContext(ChartContext);

//     //         // Call emitters and listeners to ensure they are available in the
//     //         // context
//     //         chartContext.emitRenderStart();
//     //         chartContext.onChartModelUpdate(() => {});

//     //         return (
//     //             <div>
//     //                 <p>Test Component</p>
//     //             </div>
//     //         );
//     //     };

//     //     render(
//     //         <ChartProvider contextProps={contextProps}>
//     //             <TestComponent />
//     //         </ChartProvider>,
//     //     );

//     //     // Check if getChartContextValues returns the correct object with
//     //     // emitters and listeners
//     //     const expectedContextValues = {
//     //         hasInitialized: false,
//     //         chartModel: {},
//     //         emitRenderStart: expect.any(Function),
//     //         onChartModelUpdate: expect.any(Function),
//     //     };
//     //     expect(mockEmitEvent).toHaveBeenCalledTimes(1);
//     //     expect(mockOnEvent).toHaveBeenCalledTimes(1);
//     //     expect(mockOnEvent).toHaveBeenCalledWith(
//     //         TSToChartEvent.ChartModelUpdate,
//     //         expect.any(Function),
//     //     );
//     //     expect(emitEvent).toHaveBeenCalledTimes(1);
//     // expect(emitEvent).toHaveBeenCalledWith(ChartToTSEvent.RenderStart, {});
//     // expect(chartModelUpdateCallback).toHaveBeenCalled();
//     // });

//     // test('correctly emits OpenContextMenu event', async () => {
//     //     const emitEvent = jest.fn();

//     //     // Mock the CustomChartContext instance
//     //     const MockCustomChartContext = jest.fn(() => ({
//     //         initialize: jest.fn(),
//     //         emitEvent,
//     //         // ... Other mocked methods of CustomChartContext if needed
//     //     }));
//     //     const TestComponent = () => {
//     //         const chartContext = React.useContext(ChartContext);
//     //         const { emitOpenContextMenu } = chartContext;

//     //         const handleEmitOpenContextMenu = async () => {
//     //             // Call the emitter function to emit OpenContextMenu event
//     //             await emitOpenContextMenu({
//     //                 x: 100,
//     //                 y: 200,
//     //                 data: { id: 1, name: 'Item 1' },
//     //             });
//     //         };

//     //         return (
//     //             <div>
//     //                 <button onClick={handleEmitOpenContextMenu}>
//     //                     Emit OpenContextMenu
//     //                 </button>
//     //             </div>
//     //         );
//     //     };

//     //     render(
//     //         <ChartProvider contextProps={{}}>
//     //             <TestComponent />
//     //         </ChartProvider>,
//     //     );

//     //     const button = screen.getByRole('button');

//     //     // Emit an event to trigger the emitter function
//     //     button.click();

//     //     // Check if the emitEvent function was called correctly with the
//     //     // appropriate event and payload
//     // expect(emitEvent).toHaveBeenCalledWith(ChartToTSEvent.OpenContextMenu, {
//     // x: 100,
//     //         y: 200,
//     //         data: { id: 1, name: 'Item 1' },
//     //     });
//     // });
// });
