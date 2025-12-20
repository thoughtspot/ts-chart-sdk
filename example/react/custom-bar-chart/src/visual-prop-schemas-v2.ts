import {
    AccordionVariant,
    SettingsElementType,
} from '@thoughtspot/ts-chart-sdk';

/**
 * Helper function to create a section wrapper for visual prop definitions
 * @param children - The children elements to wrap in a section
 * @returns Section element with children
 */
const createSection = (children: any[]) => ({
    elementType: SettingsElementType.SECTION,
    properties: {},
    children,
});

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
        labelVariant: 'p-small-bold',
    },
    children,
});

/**
 * Gets the display visual prop definition schema
 * @returns Display visual prop definition array
 */
export const getDisplayVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('displayAccordion', [
                createAccordionItem('color', 'Line Band Color', [
                    {
                        elementType: SettingsElementType.RADIO_GROUP,
                        key: 'color',
                        properties: {
                            label: 'Line Band Color',
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
 * @returns Tooltip visual prop definition array
 */
export const getTooltipVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('tooltipAccordion', [
                createAccordionItem('showTooltip', 'Show Tooltip', [
                    {
                        elementType: SettingsElementType.CHECKBOX,
                        key: 'showTooltip',
                        properties: {
                            label: 'Show Tooltip',
                            value: true,
                            defaultValue: true,
                        },
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Gets the axis visual prop definition schema
 * @param getColumnNameFromChartConfig - Function to get column name from chart config
 * @returns Axis visual prop definition array
 */
export const getAxisVizPropDefinition = (
    getColumnNameFromChartConfig: (dimensionKey: string) => string,
) => {
    return [
        createSection([
            createAccordion('axisAccordion', [
                createAccordionItem('xAxisName', 'X Axis Name', [
                    {
                        elementType: SettingsElementType.TEXT_INPUT,
                        key: 'xAxisName',
                        properties: {
                            label: 'X Axis Name',
                            defaultValue: getColumnNameFromChartConfig('x'),
                        },
                    },
                ]),
                createAccordionItem('yAxisName', 'Y Axis Name', [
                    {
                        elementType: SettingsElementType.TEXT_INPUT,
                        key: 'yAxisName',
                        properties: {
                            label: 'Y Axis Name',
                            defaultValue: getColumnNameFromChartConfig('y'),
                        },
                    },
                ]),
            ]),
        ]),
    ];
};

/**
 * Gets the legend visual prop definition schema
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
 * Gets the column settings definition schema for opacity
 * @returns Column settings definition object
 */
export const getColumnOpacitySettingsDefinition = () => {
    return {
        elementType: SettingsElementType.SECTION,
        properties: {},
        children: [
            {
                elementType: SettingsElementType.ACCORDION,
                key: 'columnOpacityAccordion',
                properties: {
                    variant: AccordionVariant.MINIMAL,
                    firstItemExpanded: true,
                },
                children: [
                    {
                        elementType: SettingsElementType.ACCORDION_ITEM,
                        key: 'opacity',
                        properties: {
                            header: 'Line Opacity',
                        },
                        children: [
                            {
                                elementType: SettingsElementType.NUMBER_INPUT,
                                key: 'opacity',
                                properties: {
                                    label: 'Line Opacity',
                                    value: 1,
                                    defaultValue: 1,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    };
};
