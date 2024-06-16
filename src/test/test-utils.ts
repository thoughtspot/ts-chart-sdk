import { ChartModel } from '../types/common.types';
import {
    BackgroundFormatTypes,
    ConditionalFormattingComparisonTypes,
    ConditionalMetric,
    Operators,
} from '../types/conditional-formatting.types';

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

export const createMetricOperator = (
    operator: Operators,
    lhsColumnId?: string,
    rhsColumnId?: string,
    comparisonParameterId?: string,
    comparisonType = ConditionalFormattingComparisonTypes.ValueBased,
): ConditionalMetric => {
    return {
        solidBackgroundAttrs: {
            color: '#000',
        },
        backgroundFormatType: 'SOLID' as BackgroundFormatTypes,
        operator,
        value: '200',
        plotAsBand: false,
        comparisonParameterId,
        comparisonType,
        lhsColumnId,
        rhsColumnId,
    };
};

export const createBetweenMetricOperator = (
    operator: Operators,
    min = 100,
    max = 200,
): ConditionalMetric => {
    return {
        backgroundFormatType: 'SOLID' as BackgroundFormatTypes,
        solidBackgroundAttrs: {
            color: '#000',
        },
        operator,
        rangeValues: {
            min,
            max,
        },
        plotAsBand: false,
        lhsColumnId: undefined,
        rhsColumnId: undefined,
        comparisonParameterId: undefined,
        comparisonType: ConditionalFormattingComparisonTypes.ValueBased,
    };
};

export const createAttributeOperator = (
    operator: Operators,
    comparisonType?: ConditionalFormattingComparisonTypes,
): ConditionalMetric => {
    return {
        backgroundFormatType: 'SOLID' as BackgroundFormatTypes,
        operator,
        value: 'check attribute',
        comparisonType,
    };
};
