import _ from 'lodash';
import { ChartColumn } from '../types/answer-column.types';
import { DataPointsArray } from '../types/common.types';
import {
    ConditionalFormatting,
    ConditionalFormattingComparisonTypes,
    ConditionalMetric,
    Operators,
    Parameter,
} from '../types/conditional-formatting.types';

export const getMinRangeValue = (
    metric: ConditionalMetric,
): number | undefined | null => metric.rangeValues?.min;

export const getMaxRangeValues = (
    metric: ConditionalMetric,
): number | undefined | null => metric?.rangeValues?.max;

/**
 * Performs a value-based comparison between two values based on the specified operator in the
 * metric.
 *
 * @param metric - The conditional formatting metric Info
 * @param lhsValue - The left-hand side value to compare.
 * @param rhsValue - The right-hand side value to compare.
 * @returns Boolean indicating the result of the comparison.
 */

const doValueBasedComparison = (
    metric: ConditionalMetric,
    lhsValue?: string | number | null,
    rhsValue?: string | number | null,
): boolean => {
    if (
        lhsValue == null ||
        rhsValue == null ||
        lhsValue === undefined ||
        rhsValue === undefined
    ) {
        return false;
    }
    switch (metric.operator) {
        case Operators.Is:
        case Operators.EqualTo:
            return _.isEqual(_.toString(lhsValue), _.toString(rhsValue));
        case Operators.IsNot:
        case Operators.NotEqualTo:
            return !_.isEqual(_.toString(lhsValue), _.toString(rhsValue));
        case Operators.IsEmpty:
            return _.isNil(lhsValue);
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
                +lhsValue >= (getMinRangeValue(metric) ?? -Infinity) &&
                +lhsValue <= (getMaxRangeValues(metric) ?? Infinity)
            );
        case Operators.Contains:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.includes(lhsValue as string, rhsValue.toString())
            );
        case Operators.DoesNotContain:
            return (
                lhsValue != null &&
                rhsValue != null &&
                !_.includes(lhsValue as string, rhsValue.toString())
            );
        case Operators.StartsWith:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.startsWith(lhsValue as string, rhsValue.toString())
            );
        case Operators.EndsWith:
            return (
                lhsValue != null &&
                rhsValue != null &&
                _.endsWith(lhsValue as string, rhsValue.toString())
            );
        default:
            // logger.warn(
            //     'observed a corrupted client state, there maybe some loss of conditional formatting data',
            // );
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
    lhsColValue?: string | number,
    rhsColValue?: string | number,
): boolean => {
    let parameter = null;
    let parameterValue = null;
    switch (metric.comparisonType) {
        case ConditionalFormattingComparisonTypes.ValueBased:
            // todo: lhsColValue is undefined?
            return doValueBasedComparison(metric, lhsColValue, metric.value);

        case ConditionalFormattingComparisonTypes.ParameterBased:
            parameter = parameters?.find(
                (parameter: Parameter) =>
                    parameter.id === metric.comparisonParameterId,
            );
            parameterValue =
                parameter?.overrideValue || parameter?.defaultValue;
            return doValueBasedComparison(
                metric,
                lhsColValue,
                // lhsColValue === undefined ? value : lhsColValue,
                parameterValue,
            );

        case ConditionalFormattingComparisonTypes.ColumnBased:
            return doValueBasedComparison(metric, lhsColValue, rhsColValue);

        default:
            return doValueBasedComparison(metric, lhsColValue, metric.value);
    }
};

/**
 *
 * @param conditionalMetric - conditional rule to be validated
 * @param allSeries - list of series in the chart
 * @param serieIndex - row number of cell
 * @param axis - comparison is done for x or y axis
 * @param dataRow - data point in series
 * @param inScopeParameters - list of parameters available for chart
 * @returns if the conditional rule is applicable or not
 */
export function validateCfCondition(
    conditionalMetric: ConditionalMetric,
    index: number,
    dataAttr?: DataPointsArray,
    inScopeParameters?: Parameter[],
) {
    let lhsColumnValue;
    let rhsColumnValue;
    const lhsId = conditionalMetric.lhsColumnId;
    const rhsId = conditionalMetric.rhsColumnId;
    if (lhsId !== null && dataAttr?.columns) {
        const lhsIdx = _.findIndex(
            dataAttr.columns,
            (colId) => colId === lhsId,
        );
        lhsColumnValue = dataAttr?.dataValue[index][lhsIdx];
    }
    if (rhsId !== null && dataAttr?.columns) {
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
 * @param idx The index of the data point to evaluate.
 * @param The array of data points against which the conditional formatting rules will be evaluated.
 * @param The conditional formattings applied on a column.
 * @returns The first ConditionalMetric that is applicable to the specified data point, or undefined if no rules are applicable.
 */
export const applicableConditionalFormatting = (
    idx: number,
    dataArr: DataPointsArray,
    conditionalFormatting: ConditionalFormatting,
): ConditionalMetric | null => {
    return (
        _.find(conditionalFormatting?.rows, (ConditionalMetric) => {
            return validateCfCondition(
                ConditionalMetric as ConditionalMetric,
                idx,
                dataArr,
            );
        }) || null
    );
};
/**
 * Retrieves all conditional formatting rules applied to a specified column.
 *
 * @param column The column for which to retrieve conditional formatting rules.
 * @param dataArr The array of data points, used to determine the relevant column index.
 * @param conditionalFormatting An array of conditional formatting configurations, each potentially applicable to the column.
 * @returns An array of ConditionalFormatting configurations applied to the specified column, or null if no configurations are applicable.
 */
export function getCfForColumn(
    column: ChartColumn,
    dataArr: DataPointsArray,
    conditionalFormatting: ConditionalFormatting[],
) {
    if (conditionalFormatting === undefined) {
        return null;
    }
    const idx = _.findIndex(
        dataArr.columns,
        (colId: any) => column.id === colId,
    );
    return conditionalFormatting[idx] || null;
}
