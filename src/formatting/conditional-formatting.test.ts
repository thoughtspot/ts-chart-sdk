import _ from 'lodash';
import {
    ChartColumn,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../types/answer-column.types';
import { DataPointsArray } from '../types/common.types';
import {
    ConditionalFormatting,
    ConditionalFormattingComparisonTypes,
    ConditionalMetric,
    Operators,
} from '../types/conditional-formatting.types';
import {
    applicableConditionalFormatting,
    getCfForColumn,
    isConditionSatisfied,
    validateCfCondition,
} from './conditional-formatting';

const mockDataAttr: DataPointsArray = {
    columns: ['col1', 'col2'],
    dataValue: [
        [123, 'abc'],
        [456, 'def'],
    ],
};

const mockConditionalFormatting: ConditionalFormatting = {
    rows: [
        {
            lhsColumnId: 'col1',
            rhsColumnId: 'col2',
            operator: Operators.EqualTo,
            comparisonType: ConditionalFormattingComparisonTypes.ColumnBased,
        },
        // Add more mock conditional metrics as needed for testing
    ],
};

describe('validateCfCondition', () => {
    test('validates COLUMN_BASED comparison correctly', () => {
        const conditionalMetric: ConditionalMetric = {
            lhsColumnId: 'col1',
            rhsColumnId: 'col2',
            operator: Operators.EqualTo,
            comparisonType: ConditionalFormattingComparisonTypes.ColumnBased,
        };
        const result = validateCfCondition(conditionalMetric, 0, mockDataAttr);
        expect(result).toBeTruthy();
    });

    // Additional tests for PARAMETER_BASED and VALUE_BASED comparisons
});

describe('isConditionSatisfied', () => {
    it('returns true for matching VALUE_BASED comparison', () => {
        const metric: ConditionalMetric = {
            operator: Operators.EqualTo,
            value: 'abc',
            comparisonType: ConditionalFormattingComparisonTypes.ValueBased,
        };

        expect(isConditionSatisfied(metric, undefined, 'abc', undefined)).toBe(
            true,
        );
    });

    // More tests for different operators and comparison types
});

describe('applicableConditionalFormatting', () => {
    it('returns the first applicable ConditionalMetric', () => {
        const idx = 0; // Index of the data point to evaluate

        const result = applicableConditionalFormatting(
            idx,
            mockDataAttr,
            mockConditionalFormatting,
        );

        expect(result).toEqual(mockConditionalFormatting);
    });

    it('returns undefined if no conditions are met', () => {
        // Assuming none of the conditions are met for the given data point
        const idx = 1; // Index for which no condition is met

        const result = applicableConditionalFormatting(
            idx,
            mockDataAttr,
            mockConditionalFormatting,
        );

        expect(result).toBeUndefined();
    });
});

describe('getCfForColumn', () => {
    it('returns null if there is no conditional formatting for the specified column', () => {
        const column: ChartColumn = {
            id: 'col3',
            name: '',
            type: ColumnType.MEASURE,
            timeBucket: ColumnTimeBucket.AUTO,
            dataType: DataType.UNKNOWN,
        }; // Assuming 'col3' has no conditional formatting

        const result = getCfForColumn(column, mockDataAttr, [
            mockConditionalFormatting,
        ]);

        expect(result).toBeNull();
    });
});
