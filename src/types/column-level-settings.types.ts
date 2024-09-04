/**
 * Type to support dynamic column level settings for a specific chart column.
 * @version SDK 0.2 | ThoughtSpot
 */

import { CustomChartContext } from '../main/custom-chart-context';
import { ChartModel } from './common.types';
import { VisualPropEditorDefinition } from './visual-prop.types';

export type ColumnSettingsEditorDefinition = Partial<{
    [key: string]: VisualPropEditorDefinition;
}>;

/**
 * Function Type to dynamically set column level settings for a specific chart column.
 * Will be called on changing any setting.
 * @version SDK 0.2 | ThoughtSpot
 */

export type ColumnSettingsEditorDefinitionSetter = (
    currentState: ChartModel,
    ctx: CustomChartContext,
) => ColumnSettingsEditorDefinition;
