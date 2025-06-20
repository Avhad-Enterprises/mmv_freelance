import React, { useState, useEffect } from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

const formatCount = (count) => {
  if (count < 10) return "1+";
  if (count < 100) return Math.floor(count / 10) * 10 + "+";
  if (count < 1000) return Math.floor(count / 100) * 100 + "+";
  return Math.floor(count / 1000) * 1000 + "+";
};

const MetricCard = ({
  title,
  operation,
  column,
  tableRef,
  jsonData,
  tooltipText,
  icon,
  children,
}) => {
  const [metricValue, setMetricValue] = useState(null);
  const [borderColor, setBorderColor] = useState("#ccc"); // Default color
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1137);

  // ✅ Function to check if an image URL is valid
  const isValidImage = (url) => {
    return (
      url &&
      (url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".svg"))
    );
  };

  // ✅ Function to extract dominant color from an image
  const getDominantColor = (imageUrl) => {
    return new Promise((resolve) => {
      if (!isValidImage(imageUrl)) {
        resolve(getRandomColor()); // Use random color if the image is invalid
        return;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get pixel data from the center of the image
        const data = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
        const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
        resolve(color);
      };

      img.onerror = () => {
        resolve(getRandomColor()); // If error, assign a random color
      };
    });
  };

  // ✅ Function to get a random color if no image is available
  const getRandomColor = () => {
    const colors = [
      "#007aff",
      "#11AF22",
      "#ED231C",
      "#1e293b",
      "#6366f1",
      "#FF870F",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // ✅ Detect mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1137);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Set border color based on image or random color
  useEffect(() => {
    if (icon) {
      getDominantColor(icon).then((color) => setBorderColor(color));
    } else {
      setBorderColor(getRandomColor());
    }
  }, [icon]);

  const extractTableData = () => {
    const table = tableRef?.current;
    if (!table) return [];

    return Array.from(table.querySelectorAll("tbody tr")).map((row) => {
      const rowData = {};
      column?.split(",").forEach((col) => {
        rowData[col] = row
          .querySelector(`[data-col="${col}"]`)
          ?.textContent?.trim();
      });
      return rowData;
    });
  };

  const processMetrics = (data) => {
    let result = 0,
      count = 0,
      positiveCount = 0,
      negativeCount = 0,
      sum = 0,
      totalEntries = 0;
    let totalDays = 0,
      ratioNumerator = 0,
      ratioDenominator = 0;

    data.forEach((row) => {
      const columnsArray = column?.split(",");

      switch (operation) {
        case "total":
          columnsArray.forEach((col) => {
            if (!isNaN(row[col])) result += parseFloat(row[col]);
          });
          break;
        case "count":
          count += 1;
          break;
        case "positiveCount":
          columnsArray.forEach((col) => {
            if (row[col] === "true" || row[col] === "Active")
              positiveCount += 1;
          });
          break;
        case "negativeCount":
          columnsArray.forEach((col) => {
            if (row[col] === "false" || row[col] === "Inactive")
              negativeCount += 1;
          });
          break;
        case "mean":
          columnsArray.forEach((col) => {
            if (!isNaN(row[col])) {
              sum += parseFloat(row[col]);
              totalEntries += 1;
            }
          });
          break;
        case "average":
          if (columnsArray.length === 2) {
            const startDate = new Date(row[columnsArray[0]]);
            const endDate = new Date(row[columnsArray[1]]);
            if (!isNaN(startDate) && !isNaN(endDate)) {
              totalDays += (endDate - startDate) / (1000 * 60 * 60 * 24);
              totalEntries += 1;
            }
          }
          break;
        case "percentage":
          columnsArray.forEach((col) => {
            if (!isNaN(row[col])) result += parseFloat(row[col]);
          });
          break;
        case "1000+":
          columnsArray.forEach((col) => {
            if (!isNaN(row[col]) && parseFloat(row[col]) >= 1000) result += 1;
          });
          break;
        case "ratio":
          if (columnsArray.length === 2) {
            const numerator = parseFloat(row[columnsArray[0]]);
            const denominator = parseFloat(row[columnsArray[1]]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
              ratioNumerator += numerator;
              ratioDenominator += denominator;
            }
          }
          break;
        default:
          break;
      }
    });

    const mean =
      operation === "mean" && totalEntries > 0
        ? (sum / totalEntries).toFixed(2)
        : 0;
    const average =
      operation === "average" && totalEntries > 0
        ? (totalDays / totalEntries).toFixed(2)
        : 0;
    const percentage =
      operation === "percentage" && data.length > 0
        ? ((result / (data.length * 100)) * 100).toFixed(2)
        : "0.00%";
    const ratio =
      operation === "ratio" && ratioDenominator > 0
        ? (ratioNumerator / ratioDenominator).toFixed(2)
        : "0.00";

    if (operation === "total") setMetricValue(result);
    else if (operation === "count") setMetricValue(count);
    else if (operation === "positiveCount") setMetricValue(positiveCount);
    else if (operation === "negativeCount") setMetricValue(negativeCount);
    else if (operation === "mean") setMetricValue(mean);
    else if (operation === "average") setMetricValue(average);
    else if (operation === "percentage") setMetricValue(`${percentage}%`);
    else if (operation === "1000+") setMetricValue(formatCount(result));
    else if (operation === "ratio") setMetricValue(ratio);
  };

  useEffect(() => {
    if (!operation && !children) return; // Skip processing if only using child elements
    const data = jsonData || extractTableData();
    processMetrics(data);
  }, [operation, column, tableRef, jsonData]);

  return (
    <div
      className="metrix"
      style={isMobile ? { border: `2px solid ${borderColor}` } : {}}
    >
      <div className="d-flex flex-column">
        {icon && (
          <div className="d-flex mt-2 justify-content-center">
            <img
              src={icon}
              alt=""
              className="icon-md"
              style={{
                width: "35px",
                backgroundColor: borderColor,
                borderRadius: "8px",
                height: "35px",
              }}
            />
          </div>
        )}
        <div className="d-flex  mt-2 justify-content-between">
          {title && <h6 style={{ margin: 0 }}>{title}</h6>}
          {tooltipText && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip">{tooltipText}</Tooltip>}
            >
              <i
                className="bi bi-exclamation-circle"
                style={{ fontSize: "15px", cursor: "pointer" }}
              ></i>
            </OverlayTrigger>
          )}
        </div>
        <div className="d-flex  mt-2 justify-content-between">
          {icon && (
            <img
              src={icon}
              alt=""
              className="icon"
              style={{
                width: "35px",
                backgroundColor: borderColor,
                borderRadius: "8px",
                height: "35px",
              }}
            />
          )}
          {operation && <h3 style={{ margin: 0 }}>{metricValue}</h3>}
        </div>
        {children && <div className="d-flex flex-wrap">{children}</div>}
      </div>
    </div>
  );
};

export default MetricCard;
