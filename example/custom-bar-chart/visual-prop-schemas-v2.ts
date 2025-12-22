/**
 * @file Visual Prop Schemas V2 for Custom Bar Chart
 *
 * @fileoverview
 * Contains helper functions to generate visual prop definitions for settings V2
 *
 * @author Chetan Agrawal <chetan.agrawal@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

import {
    AccordionVariant,
    ChartColumn,
    ColumnType,
    SettingsElement,
    SettingsElementType,
} from '@thoughtspot/ts-chart-sdk';

/**
 * Helper function to create a section wrapper for visual prop definitions
 * @param options - Object with key and children, or just children array
 * @returns Section element with children
 */
const createSection = (options: { key?: string; children: any[] } | any[]) => {
    if (Array.isArray(options)) {
        return {
            elementType: SettingsElementType.SECTION,
            properties: {},
            children: options,
        };
    }
    return {
        elementType: SettingsElementType.SECTION,
        key: options.key,
        properties: {},
        children: options.children,
    };
};

/**
 * Helper function to create an accordion with minimal variant
 * @param key - The key for the accordion
 * @param children - The accordion items
 * @returns Accordion element
 */
const createAccordion = (key: string, children: any[]) => ({
    elementType: SettingsElementType.ACCORDION,
    key,
    properties: {
        variant: AccordionVariant.MINIMAL,
        firstItemExpanded: true,
    },
    children,
});

/**
 * Helper function to create an accordion item
 * @param key - The key for the accordion item
 * @param header - The header text
 * @param children - The children elements
 * @returns Accordion item element
 */
const createAccordionItem = (key: string, header: string, children: any[]) => ({
    elementType: SettingsElementType.ACCORDION_ITEM,
    key,
    properties: {
        header,
    },
    children,
});

/**
 * Creates a column rename input element - for renaming column headers
 */
export const createColumnRenameInput = (): SettingsElement => {
    const element: SettingsElement = {
        elementType: SettingsElementType.COLUMN_RENAME_INPUT,
    };

    return element;
};

/**
 * Creates a number formatter element - for formatting numeric values
 */
export const createNumberFormatter = (options: any): SettingsElement => {
    const { key, isAnswerProperty, typeProps, subTypeProps, formatProps } =
        options;

    const element: SettingsElement = {
        elementType: SettingsElementType.NUMBER_FORMATTER,
    };

    if (key) element.key = key;
    if (isAnswerProperty !== undefined)
        element.isAnswerProperty = isAnswerProperty;

    const mergedProperties: any = {};
    if (typeProps) mergedProperties.typeProps = typeProps;
    if (subTypeProps) mergedProperties.subTypeProps = subTypeProps;
    if (formatProps) mergedProperties.formatProps = formatProps;

    if (Object.keys(mergedProperties).length > 0) {
        element.properties = mergedProperties as any;
    }

    return element;
};

/**
 * Creates a conditional formatter element - for conditional formatting rules
 */
export const createConditionalFormatter = (): SettingsElement => {
    const element: SettingsElement = {
        elementType: SettingsElementType.CONDITIONAL_FORMATTER,
    };

    return element;
};

/**
 * Gets the display visual prop definition schema
 * Contains color radio button for bar colors
 * @returns Display visual prop definition array
 */
export const getDisplayVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('displayAccordion', [
                createAccordionItem('color', 'Colors', [
                    {
                        elementType: SettingsElementType.RADIO_GROUP,
                        key: 'color',
                        properties: {
                            label: 'Colors',
                            value: 'red',
                            defaultValue: 'red',
                        },
                        children: [
                            {
                                elementType: SettingsElementType.RADIO,
                                properties: {
                                    label: 'Red',
                                    value: 'red',
                                },
                            },
                            {
                                elementType: SettingsElementType.RADIO,
                                properties: {
                                    label: 'Green',
                                    value: 'green',
                                },
                            },
                            {
                                elementType: SettingsElementType.RADIO,
                                properties: {
                                    label: 'Yellow',
                                    value: 'yellow',
                                },
                            },
                        ],
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Gets the data label visual prop definition schema
 * Contains toggle for showing/hiding data labels
 * @returns Data label visual prop definition array
 */
export const getDataLabelVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('dataLabelAccordion', [
                createAccordionItem('datalabels', 'Data Labels', [
                    {
                        elementType: SettingsElementType.CHECKBOX,
                        key: 'datalabels',
                        properties: {
                            label: 'Data Labels',
                            value: false,
                            defaultValue: false,
                        },
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Gets the tooltip visual prop definition schema
 * Contains configuration for tooltip display
 * @returns Tooltip visual prop definition array
 */
export const getTooltipVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('tooltipAccordion', [
                createAccordionItem('tooltipconfig1', 'ToolTip', [
                    {
                        elementType: SettingsElementType.TOOLTIP_CONFIGURATOR,
                        key: 'tooltipconfig1',
                        properties: {
                            label: 'ToolTip',
                            defaultValue: {
                                columnIds: [],
                            },
                        },
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Axis settings constants (similar to valkyrie-charts)
 */
const AxisSettings = {
    axisName: 'axis-name',
    showAxisTitle: 'show-axis-title',
    axisMin: 'axis-min',
    axisMax: 'axis-max',
} as const;

/**
 * Creates axis settings for a specific field (X or Y axis)
 * Uses keys from AxisSettings constants
 * Storage structure: axisVisualProps[fieldId][settingKey] = value
 *
 * @param field - The chart column for this axis
 * @returns Array of settings elements for the axis
 */
function createAxisSettingsForField(field: ChartColumn): SettingsElement[] {
    const isMeasure = field.type === ColumnType.MEASURE;

    const settings: SettingsElement[] = [
        {
            elementType: SettingsElementType.TEXT_INPUT,
            key: AxisSettings.axisName,
            properties: {
                label: 'Axis Name',
                defaultValue: field.name,
                placeholder: field.name,
            },
        },
        {
            elementType: SettingsElementType.CHECKBOX,
            key: AxisSettings.showAxisTitle,
            properties: {
                label: 'Show Axis Title',
                value: true,
                defaultValue: true,
            },
        },
    ];

    // Add min/max inputs for measures only
    if (isMeasure) {
        settings.push({
            elementType: SettingsElementType.NUMBER_INPUT,
            key: AxisSettings.axisMin,
            properties: {
                label: 'Axis Min',
                placeholder: 'Auto',
            },
        });
        settings.push({
            elementType: SettingsElementType.NUMBER_INPUT,
            key: AxisSettings.axisMax,
            properties: {
                label: 'Axis Max',
                placeholder: 'Auto',
            },
        });
    }

    return settings;
}

/**
 * Gets the axis visual prop definition schema with tab-based UI
 * Creates proper X-axis/Y-axis tab segregation
 *
 * CRITICAL: Container elements (TAB, TAB_ITEM, SECTION) have NO keys
 * to avoid nested storage. Only actual input elements have keys,
 * which get stored directly under axisVisualProps.
 *
 * @param xAxisColumns - Array of X-axis columns
 * @param yAxisColumns - Array of Y-axis columns
 * @returns Axis visual prop definition array with tab structure
 */
export const getAxisVizPropDefinition = (
    xAxisColumns: ChartColumn[],
    yAxisColumns: ChartColumn[],
) => {
    const allFields = [...xAxisColumns, ...yAxisColumns];

    // Create tab structure for axis settings
    const axisTabsContainer: SettingsElement = {
        elementType: SettingsElementType.TAB,
        // NO key - avoid nesting under tab container
        properties: {
            layout: 'Horizontal',
            size: 'Medium',
            headerAlignment: 'left',
            enableOverflowControls: allFields.length > 3,
        },
        children: [],
    };

    const tabItems: SettingsElement[] = [];

    // Create X-axis tabs
    xAxisColumns.forEach((field: ChartColumn, index: number) => {
        const tabName =
            xAxisColumns.length > 1 ? `X-axis-${index + 1}` : 'X-axis';
        const tabId = `x-axis-${field.id}`;

        tabItems.push({
            elementType: SettingsElementType.TAB_ITEM,
            // NO key - avoid nesting under tab item
            properties: {
                id: tabId,
                name: tabName,
            },
            children: [
                createSection({
                    key: field.id,
                    children: createAxisSettingsForField(field),
                }),
            ],
        });
    });

    // Create Y-axis tabs
    yAxisColumns.forEach((field: ChartColumn, index: number) => {
        const tabName =
            yAxisColumns.length > 1 ? `Y-axis-${index + 1}` : 'Y-axis';
        const tabId = `y-axis-${field.id}`;

        tabItems.push({
            elementType: SettingsElementType.TAB_ITEM,
            // NO key - avoid nesting under tab item
            properties: {
                id: tabId,
                name: tabName,
            },
            children: [
                createSection({
                    key: field.id,
                    children: createAxisSettingsForField(field),
                }),
            ],
        });
    });

    // Assign all tab items to the container
    axisTabsContainer.children = tabItems;

    return [axisTabsContainer];
};

/**
 * Gets the legend visual prop definition schema
 * Contains dropdown for legend position
 * @returns Legend visual prop definition array
 */
export const getLegendVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('legendAccordion', [
                createAccordionItem('legendPosition', 'Legend Position', [
                    {
                        elementType: SettingsElementType.DROPDOWN,
                        key: 'legendPosition',
                        properties: {
                            label: 'Legend Position',
                            value: 'top',
                            dropdownWidth: 'targetWidth',
                            optionsGroups: [
                                {
                                    options: [
                                        {
                                            id: 'top',
                                            label: 'Top',
                                            value: 'top',
                                        },
                                        {
                                            id: 'bottom',
                                            label: 'Bottom',
                                            value: 'bottom',
                                        },
                                        {
                                            id: 'left',
                                            label: 'Left',
                                            value: 'left',
                                        },
                                        {
                                            id: 'right',
                                            label: 'Right',
                                            value: 'right',
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Gets the column settings definition schema for column-level settings
 * Currently empty but can be extended for future column-specific settings
 * @returns Column settings definition object
 */
export const getColumnSettingsDefinition = (col: ChartColumn) => {
    const settings: SettingsElement[] = [createColumnRenameInput()];
    if (col.type === ColumnType.ATTRIBUTE) {
        // settings.push(createColumnRenameInput());
    }
    if (col.type === ColumnType.MEASURE) {
        settings.push(
            createNumberFormatter({
                key: 'numberFormatter',
                isAnswerProperty: true,
                typeProps: {
                    ariaLabel: 'number-type',
                },
            }),
        );
        settings.push(createConditionalFormatter());
    }
    return {
        elementType: SettingsElementType.SECTION,
        children: [
            createAccordion('columnAccordion', [
                createAccordionItem('columnSettings', col.name, settings),
            ]),
        ],
    };
};
