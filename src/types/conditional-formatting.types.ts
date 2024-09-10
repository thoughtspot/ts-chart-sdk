/**
 * @file: Conditional Formatting Types
 * @fileoverview All CF types for the Custom Chart implementations
 * @author Yashvardhan Nehra <yashvardhan.nehra@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2024
 */

import type { InputMaybe, Maybe, Scalars } from './common.types';

export type ConditionalFormatting = {
    __typename?: 'ConditionalFormatting';
    rows?: Maybe<Array<Maybe<ConditionalMetric>>>;
};
export declare enum BackgroundFormatTypes {
    Gradient = 'GRADIENT',
    Solid = 'SOLID',
}
export enum ConditionalFormattingComparisonTypes {
    ColumnBased = 'COLUMN_BASED',
    ParameterBased = 'PARAMETER_BASED',
    ValueBased = 'VALUE_BASED',
}
export type FontAttrs = {
    __typename?: 'FontAttrs';
    bold?: Maybe<Scalars['Boolean']>;
    color?: Maybe<Scalars['String']>;
    italic?: Maybe<Scalars['Boolean']>;
    strikeThrough?: Maybe<Scalars['Boolean']>;
    underline?: Maybe<Scalars['Boolean']>;
};
export type GradientBackgroundAttrs = {
    __typename?: 'GradientBackgroundAttrs';
    backgroundFormatMidpoint?: Maybe<Scalars['Float']>;
    backgroundFormatRange?: Maybe<Array<Maybe<Scalars['Float']>>>;
    colors?: Maybe<Array<Maybe<Scalars['String']>>>;
};
export enum Operators {
    Contains = 'CONTAINS',
    DoesNotContain = 'DOES_NOT_CONTAIN',
    EndsWith = 'ENDS_WITH',
    EqualTo = 'EQUAL_TO',
    GreaterThan = 'GREATER_THAN',
    GreaterThanEqualTo = 'GREATER_THAN_EQUAL_TO',
    Is = 'IS',
    IsBetween = 'IS_BETWEEN',
    IsEmpty = 'IS_EMPTY',
    IsNot = 'IS_NOT',
    IsNotEmpty = 'IS_NOT_EMPTY',
    IsNotNull = 'IS_NOT_NULL',
    IsNull = 'IS_NULL',
    LessThan = 'LESS_THAN',
    LessThanEqualTo = 'LESS_THAN_EQUAL_TO',
    NotEqualTo = 'NOT_EQUAL_TO',
    StartsWith = 'STARTS_WITH',
}
export type SolidBackgroundAttrs = {
    __typename?: 'SolidBackgroundAttrs';
    color?: Maybe<Scalars['String']>;
};
export type Range = {
    __typename?: 'Range';
    max?: Maybe<Scalars['Float']>;
    min?: Maybe<Scalars['Float']>;
};
export type ConditionalMetric = {
    __typename?: 'ConditionalMetric';
    backgroundFormatType?: Maybe<BackgroundFormatTypes>;
    comparisonParameterId?: Maybe<Scalars['String']>;
    comparisonType?: Maybe<ConditionalFormattingComparisonTypes>;
    fontProperties?: Maybe<FontAttrs>;
    gradientBackgroundAttrs?: Maybe<GradientBackgroundAttrs>;
    isHighlightRow?: Maybe<Scalars['Boolean']>;
    lhsColumnId?: Maybe<Scalars['String']>;
    operator?: Maybe<Operators>;
    plotAsBand?: Maybe<Scalars['Boolean']>;
    rangeValues?: Maybe<Range>;
    rhsColumnId?: Maybe<Scalars['String']>;
    solidBackgroundAttrs?: Maybe<SolidBackgroundAttrs>;
    value?: Maybe<Scalars['String']>;
};

export type Parameter = {
    __typename?: 'Parameter';
    dataType: FalconDataType;
    defaultValue: Scalars['String'];
    description: Scalars['String'];
    id: Scalars['GUID'];
    name: Scalars['String'];
    /** If not present, the parameter has not been overridden */
    overrideValue?: Maybe<Scalars['String']>;
    owner: ParameterOwnerInfo;
    valueList?: Maybe<Array<ParameterValueListItem>>;
    valueRange?: Maybe<ParameterValueRange>;
    valueType: ParameterValueType;
};

export enum FalconDataType {
    Bool = 'BOOL',
    Char = 'CHAR',
    Date = 'DATE',
    DateTime = 'DATE_TIME',
    Double = 'DOUBLE',
    Float = 'FLOAT',
    Int32 = 'INT32',
    Int64 = 'INT64',
    List = 'LIST',
    ListBool = 'LIST_BOOL',
    ListDate = 'LIST_DATE',
    ListDateTime = 'LIST_DATE_TIME',
    ListDouble = 'LIST_DOUBLE',
    ListInt = 'LIST_INT',
    ListString = 'LIST_STRING',
    ListTime = 'LIST_TIME',
    MaxType = 'MAX_TYPE',
    Time = 'TIME',
    Unknown = 'UNKNOWN',
}
export type ParameterOwnerInfo = {
    __typename?: 'ParameterOwnerInfo';
    id: Scalars['GUID'];
    name: Scalars['String'];
    type: ParameterOwnerType;
};

export enum ParameterOwnerType {
    Answer = 'ANSWER',
    Worksheet = 'WORKSHEET',
}

export type ParameterValueListItem = {
    __typename?: 'ParameterValueListItem';
    displayAs?: Maybe<Scalars['String']>;
    value: Scalars['String'];
};

export type ParameterValueListItemInput = {
    displayAs?: InputMaybe<Scalars['String']>;
    value: Scalars['String'];
};

export type ParameterValueRange = {
    __typename?: 'ParameterValueRange';
    max?: Maybe<Scalars['Float']>;
    min?: Maybe<Scalars['Float']>;
};

export type ParameterValueRangeInput = {
    max?: InputMaybe<Scalars['Float']>;
    min?: InputMaybe<Scalars['Float']>;
};

export enum ParameterValueType {
    Any = 'ANY',
    List = 'LIST',
    Range = 'RANGE',
}
