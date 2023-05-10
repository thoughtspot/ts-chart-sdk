/**
 * @file Custom Visual Props Types Definition
 * @fileoverview
 * Following types define the configuration that
 * would be rendered to configure custom visual props
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

/**
 * Text Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface TextInputFormDetail {
    type: 'text';
    /**
     * key to store the value
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
     * Allow multiline text
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
}

/**
 * Toggle Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface ToggleFormDetail {
    type: 'toggle';
    /**
     * key to store the value
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
}

/**
 * Checkbox Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface CheckboxFormDetail {
    type: 'checkbox';
    /**
     * key to store the value
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
}

/**
 * Radio Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface RadioButtonFormDetail {
    type: 'radio';
    /**
     * key to store the value
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
     * list fo values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[];
}

/**
 * Dropdown Form Element for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface DropDownFormDetail {
    type: 'dropdown';
    /**
     * key to store the value
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
     * list fo values to select from
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    values: string[];
}

/**
 * Element to define sections of form for the visual props editor
 *
 * @group Visual Properties Editor
 */
export interface Section {
    type: 'section';
    /**
     * key to define & store the children's parent
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
     * defines form alignment in the view for the section
     *
     * @version SDK: 0.1 | ThoughtSpot:
     */
    alignment?: 'row' | 'column';
}

/**
 * Common type placeholder for all the input element types
 *
 * @group Visual Properties Editor
 */
export type PropElement =
    | Section
    | TextInputFormDetail
    | ToggleFormDetail
    | CheckboxFormDetail
    | RadioButtonFormDetail
    | DropDownFormDetail;

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
}

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
