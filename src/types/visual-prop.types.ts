/**
 * @file Custom Visual Props Types Definition
 * @fileoverview
 * Following types define the configuration that
 * would be rendered to configure custom visual props
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import { CustomChartContext } from '../main/custom-chart-context';
import { ColumnType } from './answer-column.types';
import { ChartModel } from './common.types';
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
    defaultValue?: string;
    /**
     * List of values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[];
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-3 | ThoughtSpot:
     */
    disabled?: boolean;
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
    defaultValue?: string;
    /**
     * List of values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[];
    /**
     * Determines whether it should be disabled or not
     *
     * @version SDK: 0.0.2-alpha.13 | ThoughtSpot:
     */
    disabled?: boolean;
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
     *
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
    | DropDownFormDetail;

/**
 * Define Column settings, based on column type, settings needs to be defined in
 * visualPropEditorDefinition using the current config columns,
 * @version SDK: 0.2 | ThoughtSpot:
 */
export interface ColumnProp {
    type: ColumnType;
    columnSettingsDefinition: {
        [columnId: string]: { elements: PropElement[] };
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
    elements: PropElement[];
    /**
     *To Define column level settings.
     *
     * @version SDK: 0.2 | ThoughtSpot:
     */
    columnsVizPropDefinition?: ColumnProp[];
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
