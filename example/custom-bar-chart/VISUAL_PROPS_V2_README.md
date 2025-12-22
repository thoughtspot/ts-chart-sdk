# Visual Props V2 Architecture

This document explains the modular architecture for Settings V2 visual props implementation.

## File Structure

### 1. `visual-prop-schemas-v2.ts` - **Visual Prop Creation**
**Purpose:** Defines the schema and structure for Settings V2 visual prop definitions.

**Contents:**
- Helper functions for creating UI elements (sections, accordions, accordion items)
- Visual prop definition functions that return the structure for each settings section:
  - `getDisplayVizPropDefinition()` - Display settings (color selection)
  - `getDataLabelVizPropDefinition()` - Data label settings (toggle)
  - `getTooltipVizPropDefinition()` - Tooltip configuration
  - `getAxisVizPropDefinition()` - Axis name settings
  - `getLegendVizPropDefinition()` - Legend position settings
  - `getColumnSettingsDefinition()` - Column-level settings (rename, formatting, conditional formatting)

**Usage:** Used in `visualPropEditorDefinition` to create the settings UI structure.

```typescript
visualPropEditorDefinition: (chartModel, ctx) => {
    return {
        displayVizPropDefinition: getDisplayVizPropDefinition(),
        dataLabelVizPropDefinition: getDataLabelVizPropDefinition(),
        // ... other definitions
    };
}
```

---

### 2. `visual-prop-utils-v2.ts` - **Visual Prop Extraction**
**Purpose:** Extracts values from the nested V2 visual props structure returned by ThoughtSpot.

**Contents:**
- `getV2VisualPropValue()` - Helper to safely extract values from nested paths
- `extractV2VisualProps()` - Main function to extract all V2 visual props into a flat structure
- `getColumnVisualProps()` - Extract column-specific visual props

**Usage:** Used in the `render()` function to get the actual values set by users.

```typescript
function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    
    if (isChartSettingsV2Enabled) {
        // Extract V2 visual props
        const v2Props = extractV2VisualProps(chartModel.visualProps);
        const allowLabels = v2Props.datalabels;
        const legendPosition = v2Props.legendPosition;
        // ... use extracted props
    }
}
```

---

### 3. `custom-chart.ts` - **Main Implementation**
**Purpose:** Main chart implementation that uses both creation and extraction utilities.

**Key Sections:**

#### Imports
```typescript
// Visual prop schema creation (for settings UI)
import {
    getAxisVizPropDefinition,
    getColumnSettingsDefinition,
    // ... other schema definitions
} from './visual-prop-schemas-v2';

// Visual prop extraction (for rendering)
import { extractV2VisualProps } from './visual-prop-utils-v2';
```

#### Visual Prop Definition (Settings UI)
```typescript
visualPropEditorDefinition: (chartModel, ctx) => {
    if (isChartSettingsV2Enabled) {
        return {
            displayVizPropDefinition: getDisplayVizPropDefinition(),
            dataLabelVizPropDefinition: getDataLabelVizPropDefinition(),
            // ... creates the settings UI
        };
    }
    // V1 fallback
}
```

#### Rendering (Using Extracted Values)
```typescript
function render(ctx: CustomChartContext) {
    if (isChartSettingsV2Enabled) {
        // Extract values set by user
        const v2Props = extractV2VisualProps(chartModel.visualProps);
        
        // Apply to chart
        allowLabels = v2Props.datalabels;
        legendPosition = v2Props.legendPosition;
        // ... apply other settings
    }
}
```

---

## V2 Visual Props Structure

When users interact with Settings V2, ThoughtSpot returns visual props in this structure:

```typescript
{
    // Display settings
    "displayVisualProps": {
        "displayAccordion": {
            "color": { "color": "red" | "green" | "yellow" }
        }
    },
    
    // Data label settings
    "dataLabelVisualProps": {
        "dataLabelAccordion": {
            "datalabels": { "datalabels": boolean }
        }
    },
    
    // Legend settings
    "legendVisualProps": {
        "legendAccordion": {
            "legendPosition": { 
                "legendPosition": "top" | "bottom" | "left" | "right" 
            }
        }
    },
    
    // Axis settings
    "axisVisualProps": {
        "axisAccordion": {
            "xAxisName": { "xAxisName": string },
            "yAxisName": { "yAxisName": string }
        }
    },
    
    // Tooltip settings
    "tooltipVisualProps": {
        "tooltipAccordion": {
            "tooltipconfig1": {
                "tooltipconfig1": { "columnIds": string[] }
            }
        }
    },
    
    // Column-level settings
    "columnVisualProps": {
        "[columnId]": {
            "columnAccordion": {
                "columnSettings": { /* column-specific settings */ }
            }
        }
    }
}
```

---

## Benefits of This Architecture

1. **Separation of Concerns**
   - Schema creation (UI structure) is separate from value extraction (runtime logic)
   - Each file has a single, clear responsibility

2. **Reusability**
   - Extraction utilities can be reused across multiple charts
   - Schema definitions can be mixed and matched

3. **Maintainability**
   - Easy to add new settings sections
   - Clear where to make changes (schema vs extraction)

4. **Testability**
   - Each module can be tested independently
   - Mock data structures are clear and documented

5. **Readability**
   - Main chart file is cleaner and more focused
   - Helper functions are organized logically

---

## Adding New Settings

### Step 1: Add Schema Definition (visual-prop-schemas-v2.ts)
```typescript
export const getNewSettingVizPropDefinition = () => {
    return [
        createSection([
            createAccordion('newSettingAccordion', [
                createAccordionItem('newSetting', 'New Setting', [
                    {
                        elementType: SettingsElementType.CHECKBOX,
                        key: 'newSetting',
                        properties: {
                            label: 'New Setting',
                            value: false,
                            defaultValue: false,
                        },
                    },
                ]),
            ]),
        ]),
    ];
};
```

### Step 2: Add Extraction Logic (visual-prop-utils-v2.ts)
```typescript
export function extractV2VisualProps(visualProps: any) {
    return {
        // ... existing props
        newSetting: getV2VisualPropValue(
            visualProps,
            'newSettingVisualProps.newSettingAccordion.newSetting.newSetting',
            false,
        ),
    };
}
```

### Step 3: Use in Chart (custom-chart.ts)
```typescript
// In visualPropEditorDefinition
newSettingVizPropDefinition: getNewSettingVizPropDefinition(),

// In render function
const v2Props = extractV2VisualProps(chartModel.visualProps);
const newSettingValue = v2Props.newSetting;
// Use newSettingValue in chart rendering
```

---

## Backward Compatibility

The implementation maintains full backward compatibility with V1 settings:

```typescript
if (isChartSettingsV2Enabled) {
    // Use V2 schema and extraction
    const v2Props = extractV2VisualProps(chartModel.visualProps);
} else {
    // Fall back to V1 logic
    const v1Props = extractV1VisualProps(chartModel.visualProps);
}
```

This ensures charts work correctly whether Settings V2 is enabled or not.

