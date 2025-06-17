/**
 * @file Custom Visual Props Types Definition
 * @fileoverview
 * Following types define the configuration that
 * would be rendered to configure custom visual props
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import type { CustomChartContext } from '../main/custom-chart-context';
import { ColumnType } from './answer-column.types';
import { ChartModel } from './common.types';

export type TSTooltipConfig = {
    columnIds: Array<string>;
};

/**
 * Represents a value that needs to be translated in visual properties.
 * This type is used when a value needs to be displayed in different languages
 * or when the display value needs to be different from the actual value.
 *
 * @example
 * ```typescript
 * const translatedValue: TranslatedValue = {
 *   value: "show_all",
 *   valueTranslation: "SHOW_ALL_LABELS"
 * };
 * ```
 *
 * @property valueTranslation - The translation key that will be used to look up the translated text
 * @property value - The actual value that will be used in the application logic
 */
export type TranslatedValue = { valueTranslation: string; value: string };

type Value = string | boolean | number | object | any[];

type ElementProperties = {
    [key: string]: Value;
} & {
    labelTranslation?: string;
};

export enum AccordionVariant {
    BASIC = 'basic',
    MULTI_LEVEL = 'nested',
    LONG_LIST = 'long',
    SIDE_NAV = 'sideNav',
    MINIMAL = 'minimal',
}

/**
 * Enum for the keys of the answer properties.
 *
 * These are the keys you can use when `isAnswerProperty` is true.
 *
 * @enum {string}
 */
export enum AnswerPropertyKeys {
    /** The name of the property */
    NAME = 'name',
    /** Sort configuration */
    SORT_CONFIG = 'sortConfig',
    /** Number formatter */
    NUMBER_FORMATTER = 'numberFormatter',
    /** Aggregation type */
    SORT_ORDER_VALUE = 'aggregationType',
    /** Time bucket */
    SORT_ORDER_VALUE_VALUE = 'timeBucket',
    /** Background property */
    BACKGROUND = 'Background',
    /** Handle missing values */
    HANDLE_MISSING_VALUES = 'handleMissingValues',
}

export enum VisualPropComponentTranslationKeys {
    SHOW_ALL_LABELS = 'SHOW_ALL_LABELS',
    TOO_MANY_LABELS = 'TOO_MANY_LABELS',
    MAP_TILE_LABEL = 'MAP_TILE_LABEL',
    ENABLE_MARKERS = 'ENABLE_MARKERS',
    SHOW_REGRESSION_LINE = 'SHOW_REGRESSION_LINE',
    X_AXIS_GRID_LINE = 'X_AXIS_GRID_LINE',
    Y_AXIS_GRID_LINE = 'Y_AXIS_GRID_LINE',
    MAX_DATA_POINTS = 'MAX_DATA_POINTS',
    HIGH_CARDINALITY_BATCH_SIZE_DISABLED = 'highCardinalityBatchSizeDisabled',
    HIGH_CARDINALITY_BATCH_SIZE_LIMIT = 'highCardinalityBatchSizeLimit',
    CHART_CUSTOMIZE = 'CHART_CUSTOMIZE',
    SELECT_AN_AREA = 'chartConfigurator.SELECT_AN_AREA',
    RESET_ZOOM = 'chartConfigurator.RESET_ZOOM',
    EDIT_TOOLTIP = 'EDIT_TOOLTIP',
    DONT_SHOW = 'DONT_SHOW',
    SHOW_GAP = 'SHOW_GAP',
    SHOW_AS_ZERO = 'SHOW_AS_ZERO',
    HANDLE_MISSING_VALUES = 'HANDLE_MISSING_VALUES',
    SHOW_NULL_AS_ZERO = 'SHOW_NULL_AS_ZERO',
    EXCLUDE_NULL_VALUES = 'EXCLUDE_NULL_VALUES',
    COLUMN_CUSTOMIZE = 'COLUMN_CUSTOMIZE',
    SHOW_TOTAL_LABELS = 'SHOW_TOTAL_LABELS',
    SHOW_DETAILED_LABELS = 'SHOW_DETAILED_LABELS',
    SHOW_DATA_LABELS = 'SHOW_DATA_LABELS',
    SHOW_AXIS_AS_PERCENT = 'SHOW_AXIS_AS_PERCENT',
    RIGHT_LEGEND = 'RIGHT_LEGEND',
    LEFT_LEGEND = 'LEFT_LEGEND',
    TOP_LEGEND = 'TOP_LEGEND',
    BOTTOM_LEGEND = 'BOTTOM_LEGEND',
}

/**
 * Type of the element in the Chart Settings V2
 */
export enum SettingsElementType {
    TEXT_INPUT = 'InputText',
    NUMBER_INPUT = 'InputNumber',
    DATE_INPUT = 'InputText',
    RADIO = 'Radio',
    RADIO_GROUP = 'RadioGroup',
    CHECKBOX = 'Checkbox',
    CHECKBOX_GROUP = 'CheckboxGroup',
    CHECKBOX_GROUP_ITEM = 'CheckboxGroupItem',
    NUMBER_RANGE = 'NumberRange',
    DROPDOWN = 'Dropdown',
    COLOR_PICKER = 'ColorPicker',
    TOGGLE = 'Toggle',
    BUTTON = 'Button',
    TYPOGRAPHY = 'Typography',
    TAB = 'Tab',
    TAB_ITEM = 'TabItem',
    ACCORDION = 'Accordion',
    ACCORDION_ITEM = 'AccordionItem',
    FONT_FORMATTER = 'Formatter',
    NUMBER_FORMATTER = 'NumberFormatter',
    LINE_FORMATTER = 'LineFormatter',
    INTERVAL_FORMATTER = 'IntervalFormatter',
    BACKGROUND_FORMATTER = 'BackgroundFormatter',
    MARKER_FORMATTER = 'MarkerFormatter',
    VIEW = 'View',
    TOOLTIP_CONFIGURATOR = 'TooltipConfigurator',
    CONDITIONAL_FORMATTER = 'ConditionalFormatter',
    POSITION_CONTROL = 'PositionControl',
    INHERITANCE_WIDGET = 'InheritanceWidget',
    SECTION = 'Section',
    LABELLED_VIEW = 'LabelledView',
    MULTILEVEL_DROPDOWN = 'MultilevelDropdown',
    CHART_ZOOM = 'ChartZoom',
    BACKGROUND_IMAGE_EDITOR = 'BackgroundImageEditor',
}

/**
 * Common interface for all Chart Settings V2 elements
 *
 * @version SDK: 2.0.0 | ThoughtSpot:
 */
export interface SettingsElement {
    /**
     * Unique identifier for the element
     */
    key?: string;
    /**
     * Type of the element
     */
    elementType: SettingsElementType;
    /**
     * Children elements
     */
    children?: SettingsElement[];
    /**
     * Properties of the element
     */
    properties?: ElementProperties;
    /**
     * Class name of the element
     */
    className?: string;
    /**
     * Whether the element is disabled
     */
    isDisable?: boolean;
    /**
     * Whether the element can have an auto value
     */
    canHaveAutoValue?: boolean;
    /**
     * Whether the element is advanced
     */
    isAdvanced?: boolean;
    /**
     * Whether the element is an answer property
     */
    isAnswerProperty?: boolean;
    /**
     * Helper text to display when the element is hovered
     */
    helperText?: string;
    /**
     * Run time properties to be used in the chart
     */
    runTimeProperties?: {
        [key: string]: any;
    };
    /**
     * Link to another element
     */
    link?: { elementId: string; isLinked: boolean };
}

/**
 * Configuration for input validation rules
 */
export interface InputValidation {
    /**
     * Determines if the input is required.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    required?: boolean;
    /**
     * Error message to display when input is required but not provided.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    requiredError?: string;
    /**
     * Regular expression pattern to validate the input against.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    regex?: string;
    /**
     * Error message to display when input doesn't match the regex pattern.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    regexError?: string;
    /**
     * Minimum length required for the input.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    minLength?: number;
    /**
     * Error message to display when input length is less than the required minimum.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    minLengthError?: string;
    /**
     * Range of values allowed for the input.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    range?: string;
    /**
     * Error message to display when input value is outside the allowed range.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    rangeError?: string;
}

/**
 * Text Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface TextInputFormDetail {
    type: 'text';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Use text as password
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    password?: boolean;
    /**
     * Allows multiline text
     *
     * @default false
     * @version SDK: 0.1 | ThoughtSpot:
     */
    multiline?: boolean;
    /**
     * Placeholder text
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    placeholder?: string;
    /**
     * Default value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultValue?: string;
    /**
     * inputValidation config for input field
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    inputValidation?: InputValidation;
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Number Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface NumberInputFormDetail {
    type: 'number';
    /**
     * Key to store the value
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    label?: string;
    /**
     * Default value
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    defaultValue?: number;
    /**
     * inputValidation config for input field
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    inputValidation?: InputValidation;
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Color Picker Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface ColorPickerFormDetail {
    type: 'colorpicker';
    /**
     * Key to store the value
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    label?: string;
    /**
     * Display selected color with font or with color only
     *
     * @default COLOR
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    selectorType?: 'FONT' | 'COLOR';
    /**
     * Default value
     *
     * @version SDK: 0.0.1-alpha.7 | ThoughtSpot:
     */
    defaultValue?: string;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Toggle Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface ToggleFormDetail {
    type: 'toggle';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Default value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultValue?: boolean;
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Checkbox Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface CheckboxFormDetail {
    type: 'checkbox';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Default value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultValue?: boolean;
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Radio Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface RadioButtonFormDetail {
    type: 'radio';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Default value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultValue?: string | TranslatedValue;
    /**
     * List of values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[] | TranslatedValue[];
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-3 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Dropdown Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface DropDownFormDetail {
    type: 'dropdown';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Default value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    defaultValue?: string | TranslatedValue;
    /**
     * List of values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[] | TranslatedValue[];
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Element to define sections of the form for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface Section {
    type: 'section';
    /**
     * Key to define & store the children's parent
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;
    /**
     * I18n'ed string to show the section name label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Can include either form elements or nested sections
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    children?: PropElement[];
    /**
     * Defines form alignment in the view for the section
     * @version SDK: 0.1 | ThoughtSpot:
     */
    alignment?: 'row' | 'column';
    /**
     * Defines form layout in the view for the section.
     * default will be 'accordion' for first section if nothing specified
     * and will be 'none' for all nested section.
     *
     * @version SDK: 0.0.1-alpha.3 | ThoughtSpot:
     */
    layoutType?: 'accordion' | 'tab' | 'none';
    /**
     * Determines whether section should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.18 | ThoughtSpot:
     */
    disabled?: boolean;
    /* Optional property to make the accordian expanded by default. If
     * not passed the accordian will remain closed by default. Only works with layout type
     * 'accordian'
     *
     * @version SDK: 0.0.2-alpha.19 | ThoughtSpot:
     */
    isAccordianExpanded?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Native charts edit tool tip component defined for regular charts in TS Advance Chart Settings
 *
 * @group Visual Properties Editor
 */
export interface NativeEditToolTip {
    type: 'tooltipconfig';
    /**
     * Key to store the value
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    key: string;

    /*
     List of column ids that are present in ToolTipConfig by default 
    */

    defaultValue?: TSTooltipConfig;

    /**
     * I18n'ed string to show on the form label
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    label?: string;
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
    /**
     * Translation key for the label
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    labelTranslation?: VisualPropComponentTranslationKeys | string;
}

/**
 * Common type placeholder for all the input element types
 *
 * @group Visual Properties Editor
 */
export type PropElement =
    | Section
    | TextInputFormDetail
    | NumberInputFormDetail
    | ColorPickerFormDetail
    | ToggleFormDetail
    | CheckboxFormDetail
    | RadioButtonFormDetail
    | DropDownFormDetail
    | NativeEditToolTip;

/**
 * Define Column settings, based on column type, settings needs to be defined in
 * visualPropEditorDefinition using the current config columns,
 * @version SDK: 0.2 | ThoughtSpot:
 */
export interface ColumnProp {
    type: ColumnType;
    columnSettingsDefinition: {
        [columnId: string]: { elements: PropElement[] | SettingsElement[] };
    };
}

/**
 * Visual property editor definition object
 *
 * @group Visual Properties Editor
 */
export interface VisualPropEditorDefinition {
    /**
     * Define all the form elements or sections that are required
     * to be configured in the visual prop editor
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    elements?: PropElement[];
    /**
     *To Define column level settings.
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    columnsVizPropDefinition?: ColumnProp[];
    /**
     *To Define axis settings.
     *
     * @version SDK: 2.0.0 | ThoughtSpot:
     */
    axisVizPropDefinition?: SettingsElement[];
    /**
     *To Define data label settings.
     *
     * @version SDK: 2.0.0 | ThoughtSpot:
     */
    dataLabelVizPropDefinition?: SettingsElement[];
    /**
     *To Define tooltip settings.
     *
     * @version SDK: 2.0.0 | ThoughtSpot:
     */
    tooltipVizPropDefinition?: SettingsElement[];
    /**
     *To Define legend settings.
     *
     * @version SDK: 2.0.0 | ThoughtSpot:
     */
    legendVizPropDefinition?: SettingsElement[];
    /**
     *To Define display settings.
     *
     * @version SDK: 2.0.0 | ThoughtSpot:
     */
    displayVizPropDefinition?: SettingsElement[];
}

export type VisualEditorDefinitionSetter = (
    currentState: ChartModel,
    ctx: CustomChartContext,
    activeColumnId?: string,
) => VisualPropEditorDefinition;

/**
 * Example config to be able to store config in the following keys
 * 1. range.xaxis.min
 * 2. range.xaxis.max
 * 3. range.yaxis.min
 * 4. range.yaxis.max
 const visualPropEditorDefinition = [
     {
         key: 'range',
         type: 'section',
         children: [
             {
                 key: 'xaxis',
                 label: 'X-Axis'
                 type: 'section',
                 children: [
                    { key: 'minValue', type: 'TextInput' },
                    { key: 'maxValue', type: 'TextInput' }
                ],
             },
             {
                 key: 'yaxis',
                 type: 'section',
                 label: 'Y-Axis'
                 children: [
                     { key: 'minValue', type: 'TextInput' },
                     { key: 'maxValue', type: 'TextInput' },
                 ],
             },
         ],
     },
 ];
 */
