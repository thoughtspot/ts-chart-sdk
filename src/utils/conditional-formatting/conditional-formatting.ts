/**
 * @file: Conditional Formatting Utils
 * @fileoverview All CF utils for the Custom Chart implementations
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import _ from 'lodash';
import { ChartColumn } from '../../types/answer-column.types';
import { DataPointsArray } from '../../types/common.types';
import {
    ConditionalFormatting,
    ConditionalFormattingComparisonTypes,
    ConditionalMetric,
    Operators,
    Parameter,
} from '../../types/conditional-formatting.types';

export const getMinRangeValue = (
    metric: ConditionalMetric,
): number | undefined | null => metric?.rangeValues?.min;

export const getMaxRangeValue = (
    metric: ConditionalMetric,
): number | undefined | null => metric?.rangeValues?.max;

/**
 * Performs a value-based comparison between two values based on the specified operator in the
 * metric.
 *
 * @param metric - The conditional formatting metric info
 * @param lhsValue - The left-hand side value to compare.
 * @param rhsValue - The right-hand side value to compare.
 * @returns Boolean indicating the result of the comparison.
 */
const doValueBasedComparison = (
    metric: ConditionalMetric,
    lhsValue?: string | number | null,
    rhsValue?: string | number | null,
): boolean => {
    switch (metric.operator) {
        case Operators.Is:
        case Operators.EqualTo:
            return (
                !_.isNil(lhsValue) &&
                !_.isNil(rhsValue) &&
                (_.isEqual(lhsValue, rhsValue) ||
                    _.isEqual(_.toString(lhsValue), _.toString(rhsValue)))
            );
        case Operators.IsNot:
        case Operators.NotEqualTo: {
            if (_.isNil(lhsValue) || _.isNil(rhsValue))
                return lhsValue !== rhsValue;
            return !_.isEqual(_.toString(lhsValue), _.toString(rhsValue));
        }
        case Operators.IsNull:
        case Operators.IsEmpty:
            return _.isNil(lhsValue);
        case Operators.IsNotNull:
        case Operators.IsNotEmpty:
            return !_.isNil(lhsValue);
        case Operators.LessThan:
            return _.toNumber(lhsValue) < _.toNumber(rhsValue);
        case Operators.LessThanEqualTo:
            return _.toNumber(lhsValue) <= _.toNumber(rhsValue);
        case Operators.GreaterThan:
            return _.toNumber(lhsValue) > _.toNumber(rhsValue);
        case Operators.GreaterThanEqualTo:
            return _.toNumber(lhsValue) >= _.toNumber(rhsValue);
        case Operators.IsBetween:
            return (
                lhsValue != null &&
                +lhsValue >= (getMinRangeValue(metric) ?? -Infinity) &&
                +lhsValue <= (getMaxRangeValue(metric) ?? Infinity)
            );
        case Operators.Contains:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.includes(_.toString(lhsValue), rhsValue.toString())
            );
        case Operators.DoesNotContain:
            return (
                lhsValue != null &&
                rhsValue != null &&
                !_.includes(_.toString(lhsValue), rhsValue.toString())
            );
        case Operators.StartsWith:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.startsWith(_.toString(lhsValue), rhsValue.toString())
            );
        case Operators.EndsWith:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.endsWith(_.toString(lhsValue), rhsValue.toString())
            );
        default:
            return false;
    }
};

/**
 * Evaluates whether the condition defined by the metric is satisfied.
 *
 * @param metric - The conditional formatting metric info
 * @param parameters - An array of parameters that may include the parameter needed for ParameterBased comparison.
 * @param lhsColValue - The value of the left-hand side column, used in ColumnBased and some ValueBased comparisons.
 * @param rhsColValue - The value of the right-hand side column, used in ColumnBased comparisons.
 * @returns Boolean indicating whether the condition is satisfied.
 */
export const isConditionSatisfied = (
    metric: ConditionalMetric,
    parameters?: Parameter[],
    lhsColValue?: string | number | null,
    rhsColValue?: string | number | null,
): boolean => {
    let parameter = null;
    let parameterValue = null;
    switch (metric.comparisonType) {
        case ConditionalFormattingComparisonTypes.ValueBased:
            return doValueBasedComparison(metric, lhsColValue, metric.value);
        case ConditionalFormattingComparisonTypes.ParameterBased:
            parameter = parameters?.find(
                (parameter: Parameter) =>
                    parameter.id === metric.comparisonParameterId,
            );
            parameterValue =
                parameter?.overrideValue || parameter?.defaultValue;
            return doValueBasedComparison(metric, lhsColValue, parameterValue);
        case ConditionalFormattingComparisonTypes.ColumnBased:
            return doValueBasedComparison(metric, lhsColValue, rhsColValue);
        default:
            return doValueBasedComparison(metric, lhsColValue, metric.value);
    }
};

/**
 * Validates if the conditional rule is applicable or not.
 *
 * @param conditionalMetric - The conditional rule to be validated.
 * @param index - The index of the data point to evaluate.
 * @param columnId - The ID of the column for which to validate the rule.
 * @param dataAttr - The data points array containing the data for the chart.
 * @param inScopeParameters - The list of parameters available for the chart.
 * @returns Boolean indicating if the conditional rule is applicable or not.
 */
export function validateCfCondition(
    conditionalMetric: ConditionalMetric,
    index: number,
    columnId: string,
    dataAttr?: DataPointsArray,
    inScopeParameters?: Parameter[],
): boolean {
    let lhsColumnValue;
    let rhsColumnValue;
    if (dataAttr?.columns) {
        const columnIdx = _.findIndex(
            dataAttr.columns,
            (colId) => colId === columnId,
        );
        lhsColumnValue = dataAttr?.dataValue[index][columnIdx];
    }
    const lhsId = conditionalMetric.lhsColumnId;
    const rhsId = conditionalMetric.rhsColumnId;
    if (lhsId && dataAttr?.columns) {
        const lhsIdx = _.findIndex(
            dataAttr.columns,
            (colId) => colId === lhsId,
        );
        lhsColumnValue = dataAttr?.dataValue[index][lhsIdx];
    }
    if (rhsId && dataAttr?.columns) {
        const rhsIdx = _.findIndex(
            dataAttr.columns,
            (colId) => colId === rhsId,
        );
        rhsColumnValue = dataAttr?.dataValue[index][rhsIdx];
    }
    return isConditionSatisfied(
        conditionalMetric,
        inScopeParameters,
        lhsColumnValue,
        rhsColumnValue,
    );
}

/**
 * Evaluates all conditional formatting rules against a specific data point and returns the first
 * applicable rule.
 *
 * @param idx - The index of the data point to evaluate.
 * @param columnId - The ID of the column for which to validate the rule.
 * @param dataArr - The array of data points against which the conditional formatting rules will be evaluated.
 * @param conditionalFormatting - The conditional formattings applied on a column.
 * @returns The first ConditionalMetric that is applicable to the specified data point, or null if no rules are applicable.
 */
export const applicableConditionalFormatting = (
    idx: number,
    columnId: string,
    dataArr: DataPointsArray,
    conditionalFormatting?: ConditionalFormatting,
): ConditionalMetric | null => {
    return (
        _.find(conditionalFormatting?.rows, (conditionalMetric) => {
            return validateCfCondition(
                conditionalMetric as ConditionalMetric,
                idx,
                columnId,
                dataArr,
            );
        }) || null
    );
};

/**
 * Retrieves all conditional formatting rules applied to a column.
 *
 * @param column - The column for which to retrieve conditional formatting rules.
 * @returns An array of ConditionalFormatting configurations applied to the specified column, or undefined if no configurations are applicable.
 */
export function getCfForColumn(
    column: ChartColumn,
): ConditionalFormatting | undefined {
    return column?.columnProperties?.conditionalFormatting || undefined;
}
