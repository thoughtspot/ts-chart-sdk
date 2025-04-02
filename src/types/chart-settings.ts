type Value = string | boolean | number | object | any[];

type ElementProperties = { [key: string]: Value };

export enum ChartSettingsElementType {
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
    TICK_FORMATTER = 'TickFormatter',
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
}

/**
 * Base interface for all chart setting elements
 */
export interface ChartSettingElement {
    key?: string;
    elementType: ChartSettingsElementType;
    children?: ChartSettingElement[];
    properties?: ElementProperties;
    className?: string;
    isDisable?: boolean;
    isAdvanced?: boolean;
    canHaveAutoValue?: boolean;
    visibleWhen?: { elementKey: string; value: Value };
    helperText?: string;
    link?: { elementId: string; isLinked: boolean };
}

/**
 * Chart Settings Configuration
 */
export interface ChartSettings {
    elements: ChartSettingElement[];
}
