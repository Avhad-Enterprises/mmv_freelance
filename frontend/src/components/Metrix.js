import React, { useState, useEffect } from "react";

const getRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#5733FF", "#089cff", "#FFD700", "#00CED1", "#FF1493", "#253154"];
    return colors[Math.floor(Math.random() * colors.length)];
};

const formatCount = (count) => {
    if (count < 10) return "1+";
    if (count < 100) return Math.floor(count / 10) * 10 + "+";
    if (count < 1000) return Math.floor(count / 100) * 1000 + "+";
    return Math.floor(count / 1000) * 1000 + "+";
};

const Metrix = ({ title, operation, column, tableRef, jsonData }) => {
    const [metricValue, setMetricValue] = useState(null);
    const [dotColor, setDotColor] = useState(getRandomColor());

    const extractTableData = () => {
        const table = tableRef?.current;
        if (!table) return [];

        return Array.from(table.querySelectorAll("tbody tr")).map((row) => {
            const rowData = {};
            column?.split(",").forEach((col) => {
                rowData[col] = row.querySelector(`[data-col="${col}"]`)?.textContent?.trim();
            });
            return rowData;
        });
    };

    const processMetrics = (data) => {
        let result = 0, count = 0, positiveCount = 0, negativeCount = 0, sum = 0, totalEntries = 0;
        let totalDays = 0, ratioNumerator = 0, ratioDenominator = 0;

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
                        if (row[col] === "true") positiveCount += 1;
                    });
                    break;
                case "negativeCount":
                    columnsArray.forEach((col) => {
                        if (row[col] === "false") negativeCount += 1;
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

        const mean = operation === "mean" && totalEntries > 0 ? (sum / totalEntries).toFixed(2) : 0;
        const average = operation === "average" && totalEntries > 0 ? (totalDays / totalEntries).toFixed(2) : 0;
        const percentage = operation === "percentage" && data.length > 0 ? ((result / data.length) * 100).toFixed(2) : "0.00%";
        const ratio = operation === "ratio" && ratioDenominator > 0 ? (ratioNumerator / ratioDenominator).toFixed(2) : "0.00";

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
        if (!operation) return;
        const data = jsonData || extractTableData();
        processMetrics(data);
    }, [operation, column, tableRef, jsonData]);

    return (
        <li style={{ display: "flex", flexWrap:"wrap", alignItems: "center", gap: "8px" }}>
            <span
                style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    display: "inline-block",
                }}
            ></span>
            <strong>{title}:</strong> {metricValue}
        </li>
    );
};

export default Metrix;