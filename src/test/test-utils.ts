import { ChartModel } from '../types/common.types';

const mockChartModel = {
    config: {
        chartConfig: {},
    },
} as ChartModel;

export const mockInitializeContextPayload = {
    componentId: 'COMPONENT_ID',
    hostUrl: 'https://some.chart.app',
    chartModel: mockChartModel,
};
