/**
 * @file: Conditional Formatting Spec
 *
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */
import _ from 'lodash';
import {
    createAttributeOperator,
    createBetweenMetricOperator,
    createMetricOperator,
} from '../../test/test-conditional-formatting-utils';
import {
    ChartColumn,
    ChartSpecificColumnType,
    ColumnTimeBucket,
    ColumnType,
    DataType,
} from '../../types/answer-column.types';
import { DataPointsArray } from '../../types/common.types';
import {
    ConditionalFormatting,
    ConditionalFormattingComparisonTypes,
    FalconDataType,
    Operators,
    ParameterValueType,
} from '../../types/conditional-formatting.types';
import {
    applicableConditionalFormatting,
    getCfForColumn,
    isConditionSatisfied,
    validateCfCondition,
} from './conditional-formatting';

const mockDataAttr: DataPointsArray = {
    columns: ['col1', 'col2'],
    dataValue: [
        [1, 'abc'],
        [100, 'def'],
        [150, 'ghi'],
        [200, 'jkl'],
        [300, 'mno'],
    ],
};

// Measure operators
const lessThanOperator = createMetricOperator(Operators.LessThan);
const greaterThanOperator = createMetricOperator(Operators.GreaterThan);
const lessThanEqualToOperator = createMetricOperator(Operators.LessThanEqualTo);
const greaterThanEqualToOperator = createMetricOperator(
    Operators.GreaterThanEqualTo,
);
const equalToOperator = createMetricOperator(Operators.EqualTo);
const notEqualToOperator = createMetricOperator(Operators.NotEqualTo);
const isBetweenOperator = createBetweenMetricOperator(Operators.IsBetween);
const isNullOperator = createMetricOperator(Operators.IsNull);
const isNotNullOperator = createMetricOperator(Operators.IsNotNull);

// Attribute operators
const isOperator = createAttributeOperator(Operators.Is);
const isNotOperator = createAttributeOperator(Operators.IsNot);
const containsOperator = createAttributeOperator(Operators.Contains);
const doesNotContainOperator = createAttributeOperator(
    Operators.DoesNotContain,
);
const startsWithOperator = createAttributeOperator(Operators.StartsWith);
const endsWithOperator = createAttributeOperator(Operators.EndsWith);

const invalidOperator = createMetricOperator('invalid-operator' as any);

const parameter = undefined;

const mockConditionalFormatting: ConditionalFormatting = {
    rows: [lessThanOperator, greaterThanOperator, isBetweenOperator],
};

const parameters = [
    {
        id: 'parameter1',
        defaultValue: 'abc',
        dataType: FalconDataType.Char,
        description: '',
        owner: null as any,
        valueType: ParameterValueType.Any,
        name: 'parameter1',
    },
];

describe('validateCfCondition', () => {
    test('verify validateCfCondition util', () => {
        expect(
            validateCfCondition(lessThanOperator, 0, 'col1', mockDataAttr),
        ).toBe(true);
        expect(
            validateCfCondition(lessThanOperator, 3, 'col1', mockDataAttr),
        ).toBe(false);
        expect(
            validateCfCondition(
                lessThanEqualToOperator,
                3,
                'col1',
                mockDataAttr,
            ),
        ).toBe(true);
        expect(
            validateCfCondition(greaterThanOperator, 4, 'col1', mockDataAttr),
        ).toBe(true);
        expect(
            validateCfCondition(greaterThanOperator, 3, 'col1', mockDataAttr),
        ).toBe(false);
        expect(
            validateCfCondition(
                greaterThanEqualToOperator,
                3,
                'col1',
                mockDataAttr,
            ),
        ).toBe(true);
        expect(
            validateCfCondition(isBetweenOperator, 0, 'col1', mockDataAttr),
        ).toBe(false);
        expect(
            validateCfCondition(isBetweenOperator, 1, 'col1', mockDataAttr),
        ).toBe(true);
        expect(
            validateCfCondition(isBetweenOperator, 2, 'col1', mockDataAttr),
        ).toBe(true);
        expect(
            validateCfCondition(isBetweenOperator, 3, 'col1', mockDataAttr),
        ).toBe(true);
        expect(
            validateCfCondition(isBetweenOperator, 4, 'col1', mockDataAttr),
        ).toBe(false);
        expect(
            validateCfCondition(invalidOperator, 4, 'col1', mockDataAttr),
        ).toBe(false);

        const operatorWithColId = createMetricOperator(
            Operators.LessThan,
            'col1',
            'col2',
        );

        expect(
            validateCfCondition(operatorWithColId, 4, '', mockDataAttr),
        ).toBe(false);
    });
});

describe('applicableConditionalFormatting', () => {
    test('returns the first applicable ConditionalMetric or null', () => {
        expect(
            applicableConditionalFormatting(
                0,
                'col1',
                mockDataAttr,
                mockConditionalFormatting,
            ),
        ).toEqual(lessThanOperator);
        expect(
            applicableConditionalFormatting(
                3,
                'col1',
                mockDataAttr,
                mockConditionalFormatting,
            ),
        ).toEqual(isBetweenOperator);
        expect(
            applicableConditionalFormatting(
                4,
                'col1',
                mockDataAttr,
                mockConditionalFormatting,
            ),
        ).toEqual(greaterThanOperator);
        expect(
            applicableConditionalFormatting(
                0,
                'col2',
                mockDataAttr,
                mockConditionalFormatting,
            ),
        ).toBeNull();
    });
});

describe('getCfForColumn', () => {
    it('returns conditional formatting or null for the specified column', () => {
        const column: ChartColumn = {
            id: 'col3',
            name: '',
            type: ColumnType.MEASURE,
            chartSpecificColumnType: ChartSpecificColumnType.UNKNOWN,
            timeBucket: ColumnTimeBucket.AUTO,
            dataType: DataType.UNKNOWN,
            columnProperties: {
                conditionalFormatting: mockConditionalFormatting,
            },
        };

        expect(getCfForColumn(column)).toEqual(mockConditionalFormatting);
    });
});

describe('isConditionSatisfied', () => {
    test('verify isConditionSatisfied util', () => {
        expect(isConditionSatisfied(lessThanOperator, parameter, 100)).toBe(
            true,
        );
        expect(isConditionSatisfied(lessThanOperator, parameter, 200)).toBe(
            false,
        );
        expect(
            isConditionSatisfied(lessThanOperator, parameter, undefined),
        ).toBe(false);
        expect(isConditionSatisfied(greaterThanOperator, parameter, 300)).toBe(
            true,
        );
        expect(isConditionSatisfied(greaterThanOperator, parameter, 100)).toBe(
            false,
        );
        expect(
            isConditionSatisfied(lessThanEqualToOperator, parameter, 200),
        ).toBe(true);
        expect(
            isConditionSatisfied(lessThanEqualToOperator, parameter, 300),
        ).toBe(false);
        expect(
            isConditionSatisfied(greaterThanEqualToOperator, parameter, 200),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                greaterThanEqualToOperator,
                parameter,
                undefined,
            ),
        ).toBe(false);
        expect(
            isConditionSatisfied(greaterThanEqualToOperator, parameter, 100),
        ).toBe(false);
        expect(isConditionSatisfied(equalToOperator, parameter, 200)).toBe(
            true,
        );
        expect(isConditionSatisfied(equalToOperator, parameter, 100)).toBe(
            false,
        );
        expect(isConditionSatisfied(notEqualToOperator, parameter, 300)).toBe(
            true,
        );
        expect(isConditionSatisfied(notEqualToOperator, parameter, 200)).toBe(
            false,
        );
        expect(isConditionSatisfied(notEqualToOperator, parameter, null)).toBe(
            true,
        );
        expect(isConditionSatisfied(isBetweenOperator, parameter, 200)).toBe(
            true,
        );
        expect(isConditionSatisfied(isBetweenOperator, parameter, 150)).toBe(
            true,
        );
        expect(isConditionSatisfied(isBetweenOperator, parameter, 201)).toBe(
            false,
        );
        expect(isConditionSatisfied(isBetweenOperator, parameter, 50)).toBe(
            false,
        );
        expect(isConditionSatisfied(isBetweenOperator, parameter, 50)).toBe(
            false,
        );

        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                -2.54,
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                -2.5412312,
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                -2.5412313,
            ),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                2.1,
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                2.112312,
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                createBetweenMetricOperator(
                    Operators.IsBetween,
                    -2.5412312,
                    2.112312,
                ),
                parameter,
                2.112313,
            ),
        ).toBe(false);

        expect(isConditionSatisfied(isNullOperator, parameter, undefined)).toBe(
            true,
        );
        expect(isConditionSatisfied(isNullOperator, parameter, 50)).toBe(false);
        expect(isConditionSatisfied(isNullOperator, parameter, null)).toBe(
            true,
        );
        expect(isConditionSatisfied(isNotNullOperator, parameter, 50)).toBe(
            true,
        );
        expect(
            isConditionSatisfied(isNotNullOperator, parameter, undefined),
        ).toBe(false);

        expect(
            isConditionSatisfied(isOperator, parameter, 'check attribute'),
        ).toBe(true);
        expect(
            isConditionSatisfied(isOperator, parameter, 'check not attribute'),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                isNotOperator,
                parameter,
                'check not attribute',
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(isNotOperator, parameter, 'check attribute'),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                containsOperator,
                parameter,
                'check attribute check',
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                { operator: Operators.Contains, value: '4' },
                parameter,
                4099,
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                { operator: Operators.Contains, value: '4' },
                parameter,
                5099,
            ),
        ).toBe(false);
        expect(
            isConditionSatisfied(containsOperator, parameter, 'check attribut'),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                doesNotContainOperator,
                parameter,
                'check attribut',
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                doesNotContainOperator,
                parameter,
                'check attribute check',
            ),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                startsWithOperator,
                parameter,
                'check attribute check',
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                startsWithOperator,
                parameter,
                'check check attribute',
            ),
        ).toBe(false);
        expect(
            isConditionSatisfied(
                endsWithOperator,
                parameter,
                'check check attribute',
            ),
        ).toBe(true);
        expect(
            isConditionSatisfied(
                endsWithOperator,
                parameter,
                'check attribute check',
            ),
        ).toBe(false);

        // Column Based
        const columnBasedOperator = createMetricOperator(
            Operators.EqualTo,
            'col1',
            'col2',
            '',
            ConditionalFormattingComparisonTypes.ColumnBased,
        );
        expect(
            isConditionSatisfied(columnBasedOperator, undefined, 'abc', 'abc'),
        ).toBe(true);
        expect(
            isConditionSatisfied(columnBasedOperator, undefined, 'abc', 'def'),
        ).toBe(false);

        // Parameter Based
        const parameterBasedOperator = createMetricOperator(
            Operators.EqualTo,
            'col1',
            'col2',
            'parameter1',
            ConditionalFormattingComparisonTypes.ParameterBased,
        );
        expect(
            isConditionSatisfied(
                parameterBasedOperator,
                parameters,
                'abc',
                'abc',
            ),
        ).toBe(true);
    });
});
