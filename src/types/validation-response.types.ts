import { ChartConfigEditorDefinition } from './configurator.types';
import { VisualPropEditorDefinition } from './visual-prop.types';

// Validation Response for valid config or visual props
export type SuccessValidationResponse = {
    chartConfigEditorDefinition: ChartConfigEditorDefinition[];
    visualPropEditorDefinition: VisualPropEditorDefinition;
};

// Generic Validation Response
export type ValidationResponse = {
    isValid: boolean;
    validationErrorMessage?: string[];
};
