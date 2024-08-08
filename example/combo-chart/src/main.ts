/**
 * @file Combo Chart Implementation from chart.js library
 *
 * @fileoverview
 *
 * @author Rohit Singh <rohit.singh@thoughtspot.com>
 *
 * Copyright: ThoughtSpot Inc. 2023
 */

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
    ValidationResponse,
  } from "@thoughtspot/ts-chart-sdk";
  import Chart from "chart.js/auto";
  import { htmlLegendPlugin } from "./legend-plugin";
  import ChartDataLabels from "chartjs-plugin-datalabels";
  import _ from "lodash";
  
  const logger = console;
  
  Chart.register(ChartDataLabels);
  
  let globalChartReference: Chart;
  
  const visualPropKeyMap = ["datalabels", "hideLegend"];
  
  const availableColors = [
    "#66CCFF",
    "#E3394A",
    "#F5CB4E",
    "#32CD32",
    "#FF00FF",
    "#00FFFF",
    "#FF4500",
    "#8A2BE2",
    "#1E90FF",
    "#FFD700",
    "#9932CC",
    "#8B0000",
    "#228B22",
    "#008080",
    "#FF6347",
    "#40E0D0",
    "#800080",
    "#2E8B57",
    "#FF8C00",
    "#8B4513",
    "#008B8B",
    "#FF69B4",
    "#7CFC00",
    "#4169E1",
    "#FF1493",
    "#ADFF2F",
    "#800000",
    "#20B2AA",
    "#F08080",
  ];
  
  const COMBO_CHART_TYPE = {
    bar: "bar",
    line: "line",
    stack: "bar-stack",
    scatter: "scatter",
  };
  
  const MIN_WIDTH_TO_SHOW_LEGEND = 300;
  
  const CHART_ORDER = {
    bar: 0,
    line: -1,
    stack: 0,
    scatter: -2,
  };
  
  const numberFormatter = (value: number) => {
    if (value > 1000000000) {
      return (value / 1000000000).toFixed(2) + "B";
    }
    if (value > 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    }
    if (value > 1000) {
      return (value / 1000).toFixed(2) + "K";
    }
    return value;
  };
  
  function getDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, (colId: any) => column.id === colId);
    return _.uniq(_.map(dataArr.dataValue, (row: { [x: string]: any; }) => row[idx]));
  }
  
  function getSeriesDataForColumn(column: ChartColumn, dataArr: DataPointsArray) {
    const idx = _.findIndex(dataArr.columns, (colId: any) => column.id === colId);
    return _.uniq(_.map(dataArr.dataValue, (row: { [x: string]: any; }) => row[idx]));
  }
  
  function getDataForColumnForSeries(
    column: ChartColumn,
    dataArr: DataPointsArray,
    legendValue: any
  ) {
    const idx = _.findIndex(dataArr.columns, (colId: any) => column.id === colId);
    return dataArr.dataValue
      .filter((item: any[]) => item[2] === legendValue) // item[2] -> Legend data value
      .map((row: { [x: string]: any; }) => row[idx]);
  }
  
  function getChartDataModel(
    configDimensions: any[],
    dataArr: DataPointsArray,
    chartType: string
  ) {
    const xAxisColumns =
      configDimensions.find((dim: { key: string; }) => dim.key === "x")?.columns ?? [];
    const yAxisColumns =
      configDimensions.find((dim: { key: string; }) => dim.key === "y")?.columns ?? [];
    const legend =
      configDimensions.find((dim: { key: string; }) => dim.key === "legend")?.columns[0] ?? [];
    const type = chartType.split("-")[0];
    const isStacked = chartType.split("-").length > 1;
  
    return {
      getLabels: () => getDataForColumn(xAxisColumns[0], dataArr),
      getDatasets: () => {
        if (!_.isEmpty(legend)) {
          return _.map(
            getSeriesDataForColumn(legend, dataArr),
            (legendValue: any, idx: { toString: () => string; }) => {
              return {
                label: `${legendValue}- ${chartType}`,
                data: getDataForColumnForSeries(
                  yAxisColumns[0],
                  dataArr,
                  legendValue
                ),
                type: `${type}`,
                // yAxisID: `${type}-y${idx.toString()}`,
                stack: `${type}-x0${
                  isStacked ? "-stacked" : "y" + idx.toString()
                }`,
                yPos: idx,
                backgroundColor: "",
                borderColor: "",
                datalabels: {
                  anchor: "end",
                },
                order: CHART_ORDER[chartType],
              };
            }
          );
        } else {
          return _.map(yAxisColumns, (col: { name: any; }, idx: { toString: () => string; }) => {
            return {
              label: `${col.name}- ${chartType}`,
              data: getDataForColumn(col, dataArr),
              //yAxisID: `${type}-y${idx.toString()}`,
              stack: `${type}-x0${isStacked ? "-stacked" : "y" + idx.toString()}`,
              type: `${type}`,
              backgroundColor: "",
              borderColor: "",
              yPos: idx,
              datalabels: {
                anchor: "end",
              },
              order: CHART_ORDER[chartType],
            };
          });
        }
      },
  
      getPointDetails: (xPos: number, yPos: number): PointVal[] => {
        if (!_.isEmpty(legend)) {
          return [
            {
              columnId: legend.id,
              value: getDataForColumn(legend, dataArr)[yPos],
            },
            {
              columnId: xAxisColumns[0].id,
              value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
            },
            {
              columnId: yAxisColumns[0].id,
              value: getDataForColumn(yAxisColumns[0], dataArr)[xPos],
            },
          ];
        } else {
          return [
            {
              columnId: xAxisColumns[0].id,
              value: getDataForColumn(xAxisColumns[0], dataArr)[xPos],
            },
            {
              columnId: yAxisColumns[yPos].id,
              value: getDataForColumn(yAxisColumns[yPos], dataArr)[xPos],
            },
          ];
        }
      },
    };
  }
  
  function getDataModel(chartModel: ChartModel) {
    const xColumnDimension = chartModel.config?.chartConfig
      ?.find((config: { key: string; }) => config.key === "xAxis")
      .dimensions.filter((dim: { key: string; }) => dim.key === "x")[0];
    // column chart model
    const columnChartModel = getChartDataModel(
      [
        xColumnDimension,
        ...chartModel.config?.chartConfig?.find(
          (config: { key: string; }) => config.key === COMBO_CHART_TYPE.bar
        ).dimensions,
      ] ?? [],
      chartModel.data?.[1].data ?? ([] as any),
      COMBO_CHART_TYPE.bar
    );
  
    // line chart model
    const lineChartModel = getChartDataModel(
      [
        xColumnDimension,
        ...chartModel.config?.chartConfig?.find(
          (config: { key: string; }) => config.key === COMBO_CHART_TYPE.line
        ).dimensions,
      ] ?? [],
      chartModel.data?.[2].data ?? ([] as any),
      COMBO_CHART_TYPE.line
    );
  
    // stacked chart model
    const stackedChartModel = getChartDataModel(
      [
        xColumnDimension,
        ...chartModel.config?.chartConfig?.find(
          (config: { key: string; }) => config.key === COMBO_CHART_TYPE.stack
        ).dimensions,
      ] ?? [],
      chartModel.data?.[3].data ?? ([] as any),
      COMBO_CHART_TYPE.stack
    );
  
    // scatter chart model
    const scatterChartModel = getChartDataModel(
      [
        xColumnDimension,
        ...chartModel.config?.chartConfig?.find(
          (config: { key: string; }) => config.key === COMBO_CHART_TYPE.scatter
        ).dimensions,
      ] ?? [],
      chartModel.data?.[4].data ?? ([] as any),
      COMBO_CHART_TYPE.scatter
    );
  
    return {
      getLabels: columnChartModel.getLabels,
      getDatasets: () => {
        const dataSets = [
          ...columnChartModel.getDatasets(),
          ...lineChartModel.getDatasets(),
          ...stackedChartModel.getDatasets(),
          ...scatterChartModel.getDatasets(),
        ];
        dataSets.forEach((set, index) => {
          set.backgroundColor = availableColors[index % 30];
          set.borderColor = availableColors[index % 30];
        });
        return dataSets;
      },
      getPointDetails: (x: number, y: number, chartType?: any) => {
        if (chartType === COMBO_CHART_TYPE.bar) {
          return columnChartModel.getPointDetails(x, y);
        }
        if (chartType === COMBO_CHART_TYPE.line) {
          return lineChartModel.getPointDetails(x, y);
        }
        if (chartType === COMBO_CHART_TYPE.stack) {
          return stackedChartModel.getPointDetails(x, y);
        }
        if (chartType === COMBO_CHART_TYPE.scatter) {
          return scatterChartModel.getPointDetails(x, y);
        }
      },
    };
  }
  
  function getParsedEvent(evt: any) {
    return _.pick(evt.native, ["clientX", "clientY"]);
  }
  
  function render(ctx: CustomChartContext) {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel(chartModel);
    const xAxisColumnName = chartModel.config?.chartConfig
      ?.find((config: { key: string; }) => config.key === "xAxis")
      .dimensions.filter((dim: { key: string; }) => dim.key === "x")[0].columns[0].name;
    const allowLabels = _.get(chartModel.visualProps, visualPropKeyMap[0], false);
    const allowLegends = _.get(chartModel.visualProps, visualPropKeyMap[1], true);
    if (!dataModel) {
      return;
    }
  
    try {
      const canvas = document.getElementById("chart") as any;
      const legend = document.getElementById("legend");
      const chartWrapper = document.getElementById("chartWrapper");
      if (allowLegends) {
        legend.style.display = "flex";
        chartWrapper.style.width = "100%";
      } else {
        legend.style.display = "flex";
        chartWrapper.style.width = "100%";
      }
      // clear canvas.
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      globalChartReference = new Chart(canvas as any, {
        type: "bar",
        data: {
          labels: dataModel.getLabels(),
          datasets: dataModel.getDatasets() as any,
        },
        options: {
          animation: {
            duration: 0,
          },
          scales: {
            y: {
              ticks: {
                callback: (value: number) => {
                  if (value > 10000000) return numberFormatter(value);
                },
              },
            },
          },
          plugins: {
            // Change options for ALL labels of THIS CHART
            datalabels: {
              display: allowLabels ? "auto" : false,
              formatter: (value: any) => numberFormatter(value),
              color: "blue",
              textStrokeColor: "white",
              textStrokeWidth: 5,
              labels: {
                title: {
                  font: {
                    weight: "bold",
                  },
                },
                value: {
                  color: "black",
                },
              },
            },
            tooltip: {
              enabled: true,
              displayColors: false,
              position: "nearest",
              callbacks: {
                label: (item: { dataset: { data: { [x: string]: any; }; label: string; }; dataIndex: string | number; }) => {
                  const value = item.dataset.data[item.dataIndex];
                  const localeValue = numberFormatter(value);
                  return `${item.dataset.label.split("-")[0]}: ${localeValue}`;
                },
                title: (item: { label: any; }[]) => {
                  return `${xAxisColumnName}: ${item[0].label}`;
                },
              },
              titleFont: { size: 11, weight: "none" },
            },
            legend: {
              display: false,
            },
          },
  
          // responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "point",
            intersect: true,
          },
          onClick: (e: any) => {
            const activeElement = e.chart.getActiveElements()[0];
            if (!activeElement) {
              ctx.emitEvent(ChartToTSEvent.CloseContextMenu);
              return;
            }
            const dataX = activeElement?.index;
            let {
              type: chartType,
              stack,
              yPos,
            } = activeElement?.element.$datalabels[0].$context.dataset;
            const dataY = yPos;
            if (stack.includes("stack")) {
              chartType = "bar-stack";
            }
            logger.info(
              "ChartPoint",
              dataX,
              dataY,
              dataModel.getPointDetails(dataX, dataY)
            );
            ctx.emitEvent(ChartToTSEvent.OpenContextMenu, {
              event: getParsedEvent(e),
              clickedPoint: {
                tuple: dataModel.getPointDetails(dataX, dataY, chartType),
              },
            });
          },
        },
  
        plugins: [htmlLegendPlugin],
      });
      window.addEventListener("resize", () => {
        if (
          window.document.activeElement.getBoundingClientRect().width <
          MIN_WIDTH_TO_SHOW_LEGEND
        ) {
          legend.style.display = "none";
        } else {
          legend.style.display = "flex";
        }
      });
    } catch (e) {
      logger.error("renderfailed", e);
      throw e;
    }
  }
  
  const renderChart = async (ctx: CustomChartContext): Promise<void> => {
    if (globalChartReference) {
      globalChartReference.destroy();
    }
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
  
  (async () => {
    // populate it for multiple configs, need to populate common x-axis config
    const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
        const cols = chartModel.columns;
  
        const measureColumns = _.filter(
          cols,
          (col: { type: any; }) => col.type === ColumnType.MEASURE
        );
  
        const attributeColumns = _.filter(
          cols,
          (col: { type: any; }) => col.type === ColumnType.ATTRIBUTE
        );
  
        const axisConfig: ChartConfig[] = [
          {
            key: "xAxis",
            dimensions: [
              {
                key: "x",
                columns: [attributeColumns[0]],
              },
            ],
          },
          {
            key: "bar",
            dimensions: [
              {
                key: "y",
                columns: measureColumns.slice(0, 2),
              },
            ],
          },
          {
            key: "line",
            dimensions: [],
          },
          {
            key: "bar-stack",
            dimensions: [],
          },
          {
            key: "scatter",
            dimensions: [],
          },
        ];
        return axisConfig;
      },
      getQueriesFromChartConfig: (chartConfig: ChartConfig[]): Array<Query> => {
        const xAxisColumn = chartConfig[0].dimensions.filter(
          (col: { key: string; }) => col.key === "x"
        )[0].columns;
        const queries = chartConfig.map(
          (config: ChartConfig): Query =>
            _.reduce(
              config.dimensions,
              (acc: Query, dimension: { key: string; columns: any; }) => {
                // we want to avoid adding x axis columns multiple times.
                if (dimension.key === "x") {
                  return acc;
                }
                return {
                  queryColumns: [...acc.queryColumns, ...dimension.columns],
                };
              },
              {
                queryColumns: [xAxisColumn[0]],
              } as Query
            )
        );
        return queries;
      },
      renderChart: (ctx: any) => renderChart(ctx),
      chartConfigEditorDefinition: [
        {
          key: "xAxis",
          label: "Common Axis",
          descriptionText: "X Axis can only have attributes",
          columnSections: [
            {
              key: "x",
              label: "X Axis",
              allowAttributeColumns: true,
              allowMeasureColumns: false,
              allowTimeSeriesColumns: true,
              maxColumnCount: 1,
            },
          ],
        },
        {
          key: "bar",
          label: "Column",
          descriptionText:
            "X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. " +
            "Should have just 1 column in Y axis with colors columns.",
          columnSections: [
            {
              key: "y",
              label: "Y Axis",
              allowAttributeColumns: false,
              allowMeasureColumns: true,
              allowTimeSeriesColumns: false,
            },
            {
              key: "legend",
              label: "Slice with color",
              allowAttributeColumns: true,
              allowMeasureColumns: false,
              allowTimeSeriesColumns: false,
            },
          ],
        },
        {
          key: "line",
          label: "Line",
          descriptionText:
            "X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. " +
            "Should have just 1 column in Y axis with colors columns.",
          columnSections: [
            {
              key: "y",
              label: "Y Axis",
              allowAttributeColumns: false,
              allowMeasureColumns: true,
              allowTimeSeriesColumns: false,
            },
            {
              key: "legend",
              label: "Slice with color",
              allowAttributeColumns: true,
              allowMeasureColumns: false,
              allowTimeSeriesColumns: false,
            },
          ],
        },
        {
          key: "bar-stack",
          label: "Stacked Column",
          descriptionText:
            "X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. " +
            "Should have just 1 column in Y axis with colors columns.",
          columnSections: [
            {
              key: "y",
              label: "Y Axis",
              allowAttributeColumns: false,
              allowMeasureColumns: true,
              allowTimeSeriesColumns: false,
            },
            {
              key: "legend",
              label: "Slice with color",
              allowAttributeColumns: true,
              allowMeasureColumns: false,
              allowTimeSeriesColumns: false,
            },
          ],
        },
        {
          key: "scatter",
          label: "Scatter",
          descriptionText:
            "X Axis can only have attributes, Y Axis can only have measures, Color can only have attributes. " +
            "Should have just 1 column in Y axis with colors columns.",
          columnSections: [
            {
              key: "y",
              label: "Y Axis",
              allowAttributeColumns: false,
              allowMeasureColumns: true,
              allowTimeSeriesColumns: false,
            },
            {
              key: "legend",
              label: "Slice with color",
              allowAttributeColumns: true,
              allowMeasureColumns: false,
              allowTimeSeriesColumns: false,
            },
          ],
        },
      ],
      visualPropEditorDefinition: {
        elements: [
          {
            key: "datalabels",
            type: "checkbox",
            defaultValue: false,
            label: "Data Labels",
          },
          {
            key: "hideLegend",
            type: "checkbox",
            defaultValue: true,
            label: "Legends",
          },
        ],
      },
      validateConfig: (updatedConfig: any[], chartModel: any): ValidationResponse => {
        if (updatedConfig.length <= 0) {
          return {
            isValid: false,
            validationErrorMessage: ["Invalid config. no config found"],
          };
        }
  
        const xAxisDimensions = updatedConfig.find(
          (config: { key: string; }) => config.key === "xAxis"
        );
        const yAxisDimensions = updatedConfig
          .map((config: { key: any; dimensions: any; }) => ({ type: config.key, dimensions: config.dimensions }))
          .filter((item: { dimensions: any[]; }) => {
            const filteredColumns = item.dimensions.filter(
              (column: { key: string; }) => column.key === "y"
            );
            return filteredColumns.length;
          });
  
        const legendValidation = () => {
          const res = {
            isValid: true,
            errorMessage: undefined,
          };
  
          for (const chart of updatedConfig) {
            const legend = chart.dimensions.find((dim: { key: string; }) => dim.key === "legend");
  
            if (legend && legend.columns.length > 0) {
              // Check if "y" axis column is not empty
              const yDimension = chart.dimensions.find((dim: { key: string; }) => dim.key === "y");
  
              if (yDimension) {
                if (yDimension.columns.length === 0) {
                  res.isValid = false;
                  res.errorMessage = `Invalid config. Y axis column should not be empty for ${chart.key} chart while slicing with an attribute`;
                  return res;
                }
                if (yDimension.columns.length > 1) {
                  res.isValid = false;
                  res.errorMessage = `Invalid config. Y axis column should not be more than 1 for ${chart.key} chart while slicing with an attribute`;
                  return res;
                }
                if (legend.columns.length > 1) {
                  res.isValid = false;
                  res.errorMessage = `Invalid config. Legend column should not be more than 1 for ${chart.key} chart`;
                  return res;
                }
              }
            }
          }
          return res;
        };
  
        const xAxisValidation = () => {
          if (xAxisDimensions.dimensions[0].columns.length === 0) {
            return {
              isValid: false,
              errorMessage: "Invalid config. X axis columns cannot be empty",
            };
          } else {
            return {
              isValid: true,
            };
          }
        };
  
        const yAxisValidation = () => {
          if (yAxisDimensions.length !== 0) {
            return { isValid: true };
          } else {
            return {
              isValid: false,
              errorMessage:
                "Invalid config. Y axis column cannot be empty (need one y-axis column for any of the chart type)",
            };
          }
        };
  
        if (
          !xAxisValidation().isValid ||
          !yAxisValidation().isValid ||
          !legendValidation().isValid
        ) {
          return {
            isValid: false,
            validationErrorMessage: [
              xAxisValidation().errorMessage ||
                yAxisValidation().errorMessage ||
                legendValidation().errorMessage,
            ],
          };
        }
        return {
          isValid: true,
        };
      },
    });
  
    renderChart(ctx);
  })();
  