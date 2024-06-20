/**
 * @file: Test Conditional Formatting Utils
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */
import {
    BackgroundFormatTypes,
    ConditionalFormattingComparisonTypes,
    ConditionalMetric,
    Operators,
} from '../types/conditional-formatting.types';

/**
 * Creates a metric operator for conditional formatting.
 *
 * @param operator - The operator to use for the metric (e.g., LessThan, GreaterThan).
 * @param lhsColumnId - (Optional) The ID of the left-hand side column.
 * @param rhsColumnId - (Optional) The ID of the right-hand side column.
 * @param comparisonParameterId - (Optional) The ID of the comparison parameter.
 * @param comparisonType - The type of comparison to use (default is ValueBased).
 * @returns A ConditionalMetric object configured with the specified parameters.
 */
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

/**
 * Creates a between metric operator for conditional formatting.
 *
 * @param operator - The operator to use for the metric (e.g., IsBetween).
 * @param min - The minimum value for the range (default is 100).
 * @param max - The maximum value for the range (default is 200).
 * @returns A ConditionalMetric object configured with the specified parameters.
 */
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

/**
 * Creates an attribute operator for conditional formatting.
 *
 * @param operator - The operator to use for the attribute (e.g., Is, IsNot).
 * @param comparisonType - (Optional) The type of comparison to use.
 * @returns A ConditionalMetric object configured with the specified parameters.
 */
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
