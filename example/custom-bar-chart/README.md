## Integrate Bar Charts through ts-chart-sdk

In this tutorial, we will walk you through the process of creating custom bar charts using the `Charts.js` library and integrating them with the TS-Chart-SDK. By the end of this tutorial, you will be able to create interactive bar charts that leverage ThoughtSpot's powerful capabilities, such as data drilling and embedding data into your application. Let's get started!

To integrate ThoughtSpot Chart SDK and complete these steps:

1. [Setup your environment](#setup-your-environment)
2. [Implementing sample bar chart](#implementing-sample-bar-chart)
3. [Intailizing chart context with ts-chart-sdk](#intialize-chart-context)
4. [Create DataModel for input data](#create-a-data-model-for-input-data)
5. [Implemeting the renderChart](#implementing-the-renderChart)
6. [Integrate to ThoughtSpot](#integrate)

### Setup Your Environment

-   For this you can refer to [setup your environment](../../README.md#set-up-your-environment) above section with the following changes: - While creating folder name it with **bar-chart**. - Give project name as **custom-bar-charts** or you can directly use `npm create vite@latest custom-bar-chart -- --template vanilla-ts` - Instead of highcharts install your chart library (which in this case is `charts.js`) using command-`npm i chart.js` to install chart.js and `npm install chartjs-plugin-datalabels` to install datalabels plugin.
    > NOTE:
    > For more information about the chart.js and chartjs-plugin-datalabels, refer to the following documentation resources respectively:
    >
    > -   [chart.js getting started](https://www.chartjs.org/docs/latest/getting-started/)
    > -   [chart-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/guide/#table-of-contents)

### Implementing Sample Bar Chart

In this section we will be rendering a sample bar chart in the application created from the preceding steps.

To implement the chart code in your application, complete these steps:

1. Delete the unwanted files from your project folder.These are metioned as follow-

```
/public [whole folder]
/src/counter.ts
/src/typescripts.svg
/src/style.css
```

1. Clear `main.ts` and rename it to `custom-charts.ts`. This step is not necessary but we advice this nomenclature of files.

2. Replace the content of `index.html` with the following snippet:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TS custom chart</title>
    </head>
    <body>
        <div style="width:99vw; height:95vh; position: relative;">
            <canvas id="chart" style="display:flex;"></canvas>
        </div>
        <script type="module" src="./custom-chart.ts"></script>
    </body>
</html>
```

1. Import `Charts` and `ChartsDataLabels` using following lines :

```ts
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
```

2. We are creating this sample chart with the help `chart.js` and `chartjs-plugin-datalabels` plugin. Here is the snippet-

```ts
var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    },
    options: {
        plugins: {
            datalabels: {
                color: 'white',
                anchor: 'end',
                align: 'top',
                formatter: function (value, context) {
                    return value + '%';
                },
            },
        },
    },
});
```

1. Your final folder structure should look like this:

```
.
├── index.html
├── package-lock.json
├── package.json
│── custom-charts.ts
└── tsconfig.json
```

1. Now you can run this using `npm run dev` command in your project root directry.You should see chart rendering.

## Intialize Chart Context

Chart Context is the main context object that helps in orchestrating ThoughtSpot APIs to render charts. It also acts as a core central point of all interactions on the charts.

To initialize the chart context, call `getChartContext`

```js
(async () => {
  const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
          const cols = chartModel.columns;

          const measureColumns = _.filter(
              cols,
              (col) => col.type === ColumnType.MEASURE,
          );

          const attributeColumns = _.filter(
              cols,
              (col) => col.type === ColumnType.ATTRIBUTE,
          );

          const axisConfig: ChartConfig = {
              key: 'column',
              dimensions: [
                  {
                      key: 'x',
                      columns: [attributeColumns[0]],
                  },
                  {
                      key: 'y',
                      columns: measureColumns.slice(0, 2),
                  },
              ],
          };
          return [axisConfig];
      },
      getQueriesFromChartConfig: (
          chartConfig: ChartConfig[],
      ): Array<Query> => {
          const queries = chartConfig.map(
              (config: ChartConfig): Query =>
                  _.reduce(
                      config.dimensions,
                      (acc: Query, dimension) => ({
                          queryColumns: [
                              ...acc.queryColumns,
                              ...dimension.columns,
                          ],
                      }),
                      {
                          queryColumns: [],
                      } as Query,
                  ),
          );
          return queries;
      },
        validateConfig: (
            updatedConfig: any[],
            chartModel: any,
        ): ValidationResponse => {
            if (updatedConfig.length <= 0) {
                return {
                    isValid: false,
                    validationErrorMessage: ['Invalid config. no config found'],
                };
            } else {
                return {
                    isValid: true,
                };
            }
        },
        chartConfigEditorDefinition: (
            currentChartConfig: ChartModel,
            ctx: CustomChartContext,
        ): ChartConfigEditorDefinition[] => {
            const { config, visualProps } = currentChartConfig;

            const yColumns = config?.chartConfig?.[0]?.dimensions.find(
                (dimension) => dimension.key === 'y' && dimension.columns,
            );

            const configDefinition = [
                {
                    key: 'column',
                    label: 'Custom Column',
                    descriptionText:
                        'X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. ' +
                        'Should have just 1 column in Y axis with colors columns.',
                    columnSections: [
                        {
                            key: 'x',
                            label: 'Custom X Axis',
                            allowAttributeColumns: true,
                            allowMeasureColumns: false,
                            allowTimeSeriesColumns: true,
                            maxColumnCount: 1,
                        },
                        {
                            key: 'y',
                            label: 'Custom Y Axis',
                            allowAttributeColumns: false,
                            allowMeasureColumns: true,
                            allowTimeSeriesColumns: false,
                        },
                    ],
                },
            ];
            if (yColumns?.columns.length) {
                for (let i = 0; i < yColumns.columns.length; i++) {
                    configDefinition[0].columnSections.push({
                        key: `layers${i}`,
                        label: `Measures layer${i}`,
                        allowAttributeColumns: false,
                        allowMeasureColumns: true,
                        allowTimeSeriesColumns: false,
                    });
                }
            }
            return configDefinition;
        },
        visualPropEditorDefinition: (
            currentVisualProps: ChartModel,
            ctx: CustomChartContext,
        ): VisualPropEditorDefinition => {
            const { visualProps } = currentVisualProps;
            const elements = [
                {
                    key: 'color',
                    type: 'radio',
                    defaultValue: 'red',
                    values: ['red', 'green', 'yellow'],
                    label: 'Colors',
                },
                {
                    type: 'section',
                    key: 'accordion',
                    label: 'Accordion',
                    children: [
                        {
                            key: 'datalabels',
                            type: 'toggle',
                            defaultValue: false,
                            label: 'Data Labels',
                        },
                    ],
                },
            ];
            if (visualProps?.length !== 0) {
                if (visualProps?.accordion?.datalabels) {
                    elements[1].children?.push({
                        key: 'Color2',
                        type: 'radio',
                        defaultValue: 'blue',
                        values: ['blue', 'white', 'red'],
                        label: 'Color2',
                    });
                }
            }
            return { elements };
        }
      renderChart: (ctx) => renderChart(ctx),
  });

  renderChart(ctx);
})();
```

> NOTE:
>
> -   Naming of folders does not affect functionality it is just advised to use this nomenclature, you can name file or folder according to your choice.

> NOTE:
> For more information about the chart context component, refer to the following documentation resources:
>
> -   [https://ts-chart-sdk-docs.vercel.app/types/CustomChartContextProps.html](https://ts-chart-sdk-docs.vercel.app/types/CustomChartContextProps.html)
> -   [https://github.com/thoughtspot/ts-chart-sdk/blob/main/src/main/custom-chart-context.ts#L40](https://github.com/thoughtspot/ts-chart-sdk/blob/main/src/main/custom-chart-context.ts#L40)
>     The custom chart context component must include the following mandatory properties to function:

-   [`getDefaultChartConfig (Doc)`](#getdefaultchartconfig-doc)
-   [`getQueriesFromChartConfig (Doc)`](#getQueriesFromChartConfig-doc)
-   [`validateConfig (Doc)`](#validateConfig-doc)
-   [`chartConfigEditorDefinition (Doc)`](#chartConfigEditorDefinition-doc)
-   [`visualPropEditorDefinition (Doc)`](#visualPropEditorDefinition-doc)
-   [`renderChart (Doc)`](#renderChart-doc)

#### getDefaultChartConfig (Doc)

This function takes in a [ChartModel](https://ts-chart-sdk-docs.vercel.app/interfaces/ChartModel.html) object and returns a well-formed point configuration definition.

Here we are creating bar chart so we will get chartModel with one column as attribute and other as measure so we are classifying them as `x` and `y` labels.

To create a bar version of the data set, the above-mentioned headers must be presented as columns from ThoughtSpot. The query on the ThoughtSpot Answer page should have all the above columns to plot a bar chart.

#### getQueriesFromChartConfig (Doc)

This method defines the data query that is required to fetch the data from ThoughtSpot to render the chart. For most use cases, you do not require the data outside of the columns listed in your chart.

This example bar chart all the columns in the configuration as an array of columns in the arguments.

#### validateConfig (Doc)

This method use to apply any custom validation that is required by developer on the chartconfig and chartModel. For example you want to user have a certain input validation in some form that changing chartconfig or chartModel you can do validations here. This a optional method.

In the code snippet we are checking if config is not empty. You can send your custom error message in `validationErrorMessage`.

#### chartConfigEditorDefinition (Doc)

This is a optional method provided in getChartContext where you can define the custom config editor that will be shown in settings in TS and leverage TS feature from there. It take `chartModel` and `customChartContext` as parameter and return the `chartConfigEditorDefinition[]` which contain `columnSection` where you can define editor column for each config axis.

In the current example we are defining editor for one attribute and remaining measure column values.

#### visualPropEditorDefinition (Doc)

This is a optional method provided in getChartContext where you can define custom visual editor property that can levarage TS features. This will be shown in setting in TS. It takes `currentVisualProp` and `customChartContext`based on which can define the current
visual prop editor. You can see type of propElement we support in [doc](https://ts-chart-sdk-docs.vercel.app/types/PropElement.html)

In this example we are defining radio element for applying different color in bar element and accordian for datalabels that when set to true will show `color2` which will used to select color for data labels.

#### renderChart (Doc)

This `renderChart (Doc)` function is required to render the chart implemented in your code. This function ensures that every time `chartContext` tries to re-render the chart due to the changes in data or chart model, the chart rendered in your application is updated.

> **Note**:
> You can control render and re-render by implementing more granular control for the updates on data, visual props, or chart model.

Till now you will be seeing error on `renderChart` function. Let's implement this-

#### Implement the renderChart function

To implement renderChart, complete the following steps:

1. Create a function and move all the custom bar chart code inside the `renderChart` function.

```jsx
const renderChart = (ctx) => {
    var ctx = document.getElementById('chart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [
                {
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            plugins: {
                datalabels: {
                    color: 'white',
                    anchor: 'end',
                    align: 'top',
                    formatter: function (value, context) {
                        return value + '%';
                    },
                },
            },
        },
    });
    return Promise.resolve();
};
```

> **Note**:
> Put following import statement while implementing `getchartcontext`. This will be used in this as well as in future context-

```js
import {
    ValidationResponse,
    VisualPropEditorDefinition,
} from '@thoughtspot/ts-chart-sdk';
import _ from 'loadash';
import {
    ChartColumn,
    ChartConfig,
    ChartModel,
    ChartToTSEvent,
    ColumnType,
    CustomChartContext,
    DataPointsArray,
    getChartContext,
    PointVal,
    Query,
    VisualProps,
} from '@thoughtspot/ts-chart-sdk';
import { ChartConfigEditorDefinition } from '@thoughtspot/ts-chart-sdk/src';
```

2. Run the app and open console you and the check the message:`Chart context: intialization start`

#### Run the chart in the Playground

To run the chart and test your implementation, you need a Playground.

1. Open the following link to test your implementation with predefined data sets:

[https://ts-chart-playground.vercel.app/](https://ts-chart-playground.vercel.app/)

> **NOTE :**
>
> You can check out the playground code on the [GitHub repository](https://github.com/thoughtspot/ts-chart-sdk/tree/main/playground/app) to your local environment and modify the data set to test your charts effectively.

2. Add the following details as shown in the following example:

-   App Url : `<your localhost url with port>`
-   Chart Model: `Gantt - 3 Attribute - 2 Date - 1 Measure`

## Create a Data Model from input data

The data model is unique to every chart. It defines how each point will be plotted on the chart. In this step we will deal with thoughtspot ChartModel to create dataModel and feed that dataModel to to `new Charts` in `render` function that we will be create in next step in `chart.js` required format.

Let's create dataModel with the following steps:

1. Create the function `getDataModel` that will take `chartModel` and return `columnchartModel` object. Code snippet is as follow-

```js
function getDataModel(chartModel: ChartModel) {
    // column chart model
    const columnChartModel = getColumnDataModel(
        chartModel.config?.chartConfig?.[0].dimensions ?? [],
        chartModel.data?.[0].data ?? [],
        'bar',
        chartModel.visualProps,
    );

    return columnChartModel;
}
```

2. Create two gloabal array that will have with name `availableColor` and `visualPropKeyMap` that will be used to provide default color configurations and mapping key value pair that we will be getting from in `visualProp`. The code snippet is as follow-

```ts
Chart.register(ChartDataLabels);

let globalChartReference: Chart;

const availableColor = ['red', 'green', 'blue'];

const visualPropKeyMap = {
    0: 'color',
    1: 'accordion.Color2',
    2: 'accordion.datalabels',
};
```

3. In this we will be implementing `getColumnDataModel` that is there in `getDataModel`. This will `chartConfig`,`chartData`(data),`type`and `visualprop`(current prop key and value) and return object with function such as `getLabel`,`getDatasets`(axisId,type,colorConfiguration),`getScales`(chart.js display configurations) and `getPointDetails`. Code snippet is given below-

```ts
function getColumnDataModel(
    configDimensions,
    dataArr: DataPointsArray,
    type,
    visualProps: VisualProps,
) {
    // this should be handled in a better way
    const xAxisColumns = configDimensions?.[0].columns ?? [];
    const yAxisColumns = configDimensions?.[1].columns ?? [];

    return {
        getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
        getDatasets: () =>
            _.map(yAxisColumns, (col, idx) => {
                const coldata = getDataForColumn(col, dataArr);
                const CFforColumn = getCfForColumn(col);
                const axisId = `${type}-y${idx.toString()}`;
                const color = coldata.map((value, index) =>
                    getBackgroundColor(
                        customStyleConfig,
                        visualProps,
                        idx,
                        dataArr,
                        CFforColumn,
                        index,
                        col.id,
                    ),
                );
                const { plotlines, plotbands } =
                    getPlotLinesAndBandsFromConditionalFormatting(
                        CFforColumn,
                        axisId,
                    );

                return {
                    label: col.name,
                    data: coldata,
                    yAxisID: axisId,
                    type: `${type}`,
                    backgroundColor: color,
                    borderColor: color,
                    datalabels: {
                        anchor: 'end',
                    },
                    plotlines, // Include plotlines in the dataset
                    plotbands, // Include plotbands in the dataset
                };
            }),

        getScales: () =>
            _.reduce(
                yAxisColumns,
                (obj: any, _val, idx: number) => {
                    // eslint-disable-next-line no-param-reassign
                    obj[`${type}-y${idx.toString()}`] = {
                        grid: {
                            display: true,
                        },
                        position: idx === 0 ? 'left' : 'right',
                        title: {
                            display: true,
                            text: _val.name,
                        },
                    };
                    return obj;
                },
                {},
            ),
        getPointDetails: (xPos: number, yPos: number): PointVal[] => [
            {
                columnId: xAxisColumns[0].id,
                value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
            },
            {
                columnId: yAxisColumns[yPos].id,
                value: getDataForColumn(yAxisColumns[yPos], dataArr)[xPos],
            },
        ],
    };
}
```

4. In the above implementation you will be getting error inside `getPointsdetails`
   beacuse we have a undefined function `getDataForColumn`. This function will take the column ids and return the specific cloumn data. Implement this function in with the following code snippet->

```js
function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, (colId) => column.id === colId);
    return _.map(dataArr.dataValue, (row) => row[idx]);
}
```
5. In the above implementation, you will need to implement the following functions to ensure that the conditional formatting and background colors are correctly applied, and that the plotlines and plotbands are drawn on the chart.

    `getBackgroundColor`: This function determines the background color for each data point based on custom style configurations, visual properties, and any applicable conditional formatting rules. Implement this function with the following code snippet:

    ```js
    export function getBackgroundColor(
        customStyleConfig: ChartSdkCustomStylingConfig,
        visualProps: VisualProps,
        idx: any,
        dataArr: any,
        CFforColumn: any,
        index: number,
        colId: any,
    ) {
        const color =
            customStyleConfig?.chartColorPalettes?.length &&
            customStyleConfig?.chartColorPalettes[0].colors.length > 0
                ? customStyleConfig?.chartColorPalettes[0].colors
                : _.get(visualProps, visualPropKeyMap?.[idx], availableColor[idx]);

        const applicableFormatting = applicableConditionalFormatting(
            index,
            colId,
            dataArr,
            CFforColumn,
        );
        let color2 = applicableFormatting?.solidBackgroundAttrs?.color;
        if (applicableFormatting?.plotAsBand) {
            color2 = null;
        }
        return color2 ?? color;
    }
    ```

    `getPlotLinesAndBandsFromConditionalFormatting`: This function extracts plotlines and plotbands from the given conditional formatting rules. Plotlines are single lines drawn at specific values on the chart, while plotbands are shaded areas between two values. Implement this function with the following code snippet:

    ```js    
        export function getPlotLinesAndBandsFromConditionalFormatting(
        CFforColumn: ConditionalFormatting | undefined,
        axisId: string,
    ) {
        const plotlines: any = [];
        const plotbands: any = [];

        CFforColumn?.rows?.forEach((metric) => {
            const value = metric?.value ? parseFloat(metric.value) : null;

            const color = metric?.solidBackgroundAttrs?.color;
            if (metric?.operator === Operators.IsBetween) {
                const value1 = metric?.rangeValues?.min ?? null;
                const value2 = metric?.rangeValues?.max ?? null;
                if (value1 !== null && value2 !== null) {
                    plotlines.push(
                        {
                            value: value1,
                            axisId,
                            color,
                            fill: metric?.plotAsBand,
                        },
                        {
                            value: value2,
                            axisId,
                            color,
                            fill: metric?.plotAsBand,
                        },
                    );
                    if (metric?.plotAsBand) {
                        plotbands.push({
                            from: value1,
                            to: value2,
                            axisId,
                            color,
                        });
                    }
                }
            } else if (value !== null) {
                plotlines.push({
                    value,
                    axisId,
                    color,
                    fill: metric?.plotAsBand,
                });
            }
        });
        return { plotlines, plotbands };
    }
    ```

## Implementing the renderChart

In this section we will be setting up `renderChart` function with the chartModel context.

1. Clear the content inside the `renderChart` function.
2. Since we will be creating some custom options in using `ChartToTSEvent.OpenContextMenu`(sending post messages from chart to TS) in `render` with label `Custom user action 1` and `Download chart` we need to create some function curresponding to that. Here are the snippet for that->

```ts
function getParsedEvent(evt: any) {
    return _.pick(evt.native, ['clientX', 'clientY']); // create a object with clicked position to open context menu there.
}

function downloadChartAsPNG() {
    const imageLink = document.createElement('a');
    const canvas = document.getElementById('chart') as any;
    imageLink.download = 'bar-chart.png';
    imageLink.href = canvas.toDataURL('image/png', 1);
    imageLink.click();
} // that will be there in onClick.
```

-   Note:
    -   For more info on `CharttoTSEvent` refer [doc](https://ts-chart-sdk-docs.vercel.app/enums/ChartToTSEvent.html).

3. Create a `render(ctx:CustomChartContext)` function which will deal with `chart.js` setup and using `dataModel`.Do the following steps to create a `render` function.

```ts
function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    const allowLabels = _.get(
        chartModel.visualProps,
        visualPropKeyMap[2],
        false,
    );
    const labelColor = _.get(
        chartModel.visualProps,
        visualPropKeyMap[1],
        availableColor[0],
    );
    if (!dataModel) {
        return;
    }

    try {
        const canvas = document.getElementById('chart') as any;
        // clear canvas.
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        globalChartReference = new Chart(canvas as any, {
            type: 'bar',
            data: {
                labels: dataModel.getLabels(),
                datasets: dataModel.getDatasets() as any,
            },
            options: {
                animation: {
                    duration: 0,
                },
                scales: dataModel.getScales(),
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        display: allowLabels,
                        color: labelColor,
                        labels: {
                            title: {
                                font: {
                                    weight: 'bold',
                                },
                            },
                            value: {
                                color: 'black',
                            },
                        },
                    },
                },
                // responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'point',
                    intersect: true,
                },
                onClick: (e: any) => {
                    const activeElement = e.chart.getActiveElements()[0];
                    const dataX = activeElement.index;
                    const dataY = activeElement.datasetIndex;

                    ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
                        event: getParsedEvent(e),
                        clickedPoint: {
                            tuple: dataModel.getPointDetails(dataX, dataY),
                        },
                        customActions: [
                            {
                                id: 'custom-action-1',
                                label: 'Custom user action 1',
                                icon: '',
                                onClick: (...arg) => {
                                    console.log(
                                        'custom action 1 triggered',
                                        arg,
                                    );
                                },
                            },
                            {
                                id: 'download-chart',
                                label: 'Download chart',
                                icon: '',
                                onClick: () => {
                                    downloadChartAsPNG();
                                },
                            },
                        ],
                    });
                },
            },
            plugins: [
                createPlotlinePlugin(dataModel), // Add the custom plotline plugin
                createPlotbandPlugin(dataModel), // Add the custom plotband plugin
            ],
        });
    } catch (e) {
        console.error('renderfailed', e);
        throw e;
    }
}
```

4. In `renderChart` we will be calling render function and integrating it some custom `CharttoTSEvent` that will help in notifying ThoughtSpot different rendering stages. Copy the snippet below to implement it:

> NOTE:
> For more information about the ChartToTSEvents component, refer to the following documentation resources:
>
> -   [https://ts-chart-sdk-docs.vercel.app/interfaces/ChartToTSEventsPayloadMap.html](https://ts-chart-sdk-docs.vercel.app/interfaces/ChartToTSEventsPayloadMap.html)

```ts
const renderChart = async (ctx: CustomChartContext): Promise<void> => {
    try {
        ctx.emitEvent(ChartToTSEvent.RenderStart);
        render(ctx);
    } catch (e) {
        ctx.emitEvent(ChartToTSEvent.RenderError, {
            hasError: true,
            error: e,
        });
    } finally {
        ctx.emitEvent(ChartToTSEvent.RenderComplete);
    }
};
```

## Integrate to thoughtspot

In this sectiom we will be working on integrating your custom chart with thoughtspot. For integrating do the following steps->

1. Deploy this custom app on any hosting services currenly i am using ngrok to local take a url with ngrok you will get url `https://<random_string>.ngrok-free.app`
2. Redeploy the cluster with the correct flag settings.
3. Open thoughtspot go `admin` go to `chart customization` then go to `custom charts`
4. Click on `create charts` then name it. We are going with `custom-bar-chart` for current example put the url where you deployed the app for example:`https://<random_string>.ngrok-free.app`.
    > NOTE:
    >
    > - This is for local development and to add charts to cluster this needs to be deployed to a service preferably vercel.
    > - Urls needs to be whitelisted in TS cluster please contact your TS admin to whitelist for the same.
