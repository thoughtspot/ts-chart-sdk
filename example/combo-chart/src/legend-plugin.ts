import _ from "lodash";

const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer.querySelector("ul");

  if (!listContainer) {
    listContainer = document.createElement("ul");
    listContainer.style.display = "flex";
    listContainer.style.flexDirection = "column";
    listContainer.style.margin = "0";
    listContainer.style.height = "95vh";
    listContainer.style.overflowY = "overlay";
    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

export const htmlLegendPlugin = {
  id: "htmlLegendPlugin",
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, "legend");

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator

    const chartMap = {
      column: [],
      line: [],
      stack: [],
      scatter: [],
    };
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach((style) => {
      const textParts = style.text.split("- ");
      const chartType = textParts[1]; // Extracting the chart type (bar, line, etc.)

      switch (chartType) {
        case "bar":
          chartMap.column.push(style);
          break;
        case "line":
          chartMap.line.push(style);
          break;
        case "bar-stack":
          chartMap.stack.push(style);
          break;
        case "scatter":
          chartMap.scatter.push(style);
          break;
        default:
          break;
      }
    });
    _.entries(chartMap).forEach((item) => {
      const div = document.createElement("div");
      div.innerHTML = `<p style="
      font-family: sans-serif; font-size:14px;
  ">${
        item[0].charAt(0).toUpperCase() + item[0].slice(1)
      }</p>`;
      item[1].forEach((item) => {
        const li = document.createElement("li");
        li.style.alignItems = "center";
        li.style.cursor = "pointer";
        li.style.display = "flex";
        li.style.flexDirection = "row";
        li.style.marginLeft = "10px";
        li.style.marginBottom = "10px";
        li.style.minWidth = '110px';
        li.style.opacity = item.hidden ? "0.3" : "1";

        li.onclick = () => {
          const { type } = chart.config;
          if (type === "pie" || type === "doughnut") {
            // Pie and doughnut charts only have a single dataset and visibility is per item
            chart.toggleDataVisibility(item.index);
          } else {
            chart.setDatasetVisibility(
              item.datasetIndex,
              !chart.isDatasetVisible(item.datasetIndex)
            );
          }
          chart.update();
        };

        // Color box
        const boxSpan = document.createElement("span");
        boxSpan.style.background = item.fillStyle;
        boxSpan.style.borderColor = item.strokeStyle;
        boxSpan.style.borderWidth = item.lineWidth + "px";
        boxSpan.style.display = "inline-block";
        boxSpan.style.flexShrink = "0";
        boxSpan.style.height = "10px";
        boxSpan.style.marginRight = "10px";
        boxSpan.style.width = "10px";
        boxSpan.style.borderRadius = "100%";

        // Text
        const textContainer = document.createElement("p");
        textContainer.style.color = item.fontColor;
        textContainer.style.margin = "0";
        textContainer.style.padding = "0";
        textContainer.style.fontFamily = "sans-serif";
        textContainer.style.fontWeight = "500";
        textContainer.style.fontSize = "0.85rem";

        const text = document.createTextNode(item.text.split("- ")[0]);
        textContainer.appendChild(text);

        li.appendChild(boxSpan);
        li.appendChild(textContainer);
        ul.appendChild(div);
        div.appendChild(li);
      });
    });
  },
};
