import React, { useState, useEffect, useMemo } from "react";
import RowsPerPageSelector from "./RowsPerPageSelector";
import moment from "moment";
import Button from "../components/Button";
import ProductDropdown from "../components/ProductDropdown";
import { useSweetAlert } from "../components/SweetAlert";
import { RxCross1 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa6";
import { FaQuestion } from "react-icons/fa6";

const Table = ({
  id,
  tableRef,
  data,
  columns,
  filteredData,
  onStatusChange,
  setFilteredData,
  paginated = true,
  updateQuantity,
  showCheckbox = true,
  enableHorizontalScroll = false,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortedData, setSortedData] = useState(data || []);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [countryFlags, setCountryFlags] = useState({});
  const [quantities, setQuantities] = useState({});
  const { showAlert } = useSweetAlert();

  // Ensure filteredData is an array
  // Memoize safeFilteredData to stabilize it
  const safeFilteredData = useMemo(
    () => (Array.isArray(filteredData) ? filteredData : []),
    [filteredData]
  );

  const startIndex = paginated ? (currentPage - 1) * rowsPerPage : 0;
  const endIndex = paginated ? startIndex + rowsPerPage : safeFilteredData.length;
  const currentData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(safeFilteredData.length / rowsPerPage) || 1;

  const handleEditClick = (rowData) => {
    showAlert({
      title: "Edit Row",
      text: `Are you sure you want to edit the row with ID ${rowData.id}?`,
      icon: "question",
      confirmButton: {
        text: "Edit",
        backgroundColor: "#28a745",
        textColor: "#fff",
      },
      cancelButton: {
        text: "Cancel",
        backgroundColor: "#dc3545",
        textColor: "#fff",
      },
      onConfirm: () => {
        console.log("Editing row:", rowData);
        // Add your edit logic here (e.g., open a modal, call an API)
      },
      onCancel: () => {
        console.log("Edit cancelled");
      },
    });
  };

  useEffect(() => {
    setSortedData(safeFilteredData);
  }, [filteredData, safeFilteredData, setSortedData]);

  useEffect(() => {
    setQuantities(
      (data || []).reduce(
        (acc, item) => ({ ...acc, [item.id]: item.quantity || 1 }),
        {}
      )
    );
  }, [data]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const flags = {};
        data.forEach((country) => {
          flags[country.name.common] = country.flags.svg;
        });
        setCountryFlags(flags);
      })
      .catch((error) => console.error("Error fetching country flags:", error));
  }, []);

  useEffect(() => {
    if (sortColumn && sortOrder) {
      const sorted = sortData(data || [], sortColumn, sortOrder);
      setSortedData(sorted);
    } else {
      setSortedData(data || []);
    }
  }, [data, sortColumn, sortOrder, setSortedData]);

  const sortData = (data, column, order) => {
    return [...data].sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (valueA === undefined || valueA === null) valueA = "";
      if (valueB === undefined || valueB === null) valueB = "";

      if (typeof valueA === "string" && typeof valueB === "string") {
        return order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return order === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (Date.parse(valueA) && Date.parse(valueB)) {
        return order === "asc"
          ? new Date(valueA) - new Date(valueB)
          : new Date(valueB) - new Date(valueA);
      }

      return 0;
    });
  };

  const updateTableQuantity = (rowId, newQuantity) => {
    const updatedQuantity = Math.max(1, parseInt(newQuantity) || 1);
    setQuantities((prev) => ({ ...prev, [rowId]: updatedQuantity }));
    if (updateQuantity) {
      updateQuantity(rowId, updatedQuantity);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleCheckboxChange = (rowIndex) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rowIndex)
        ? prevSelectedRows.filter((index) => index !== rowIndex)
        : [...prevSelectedRows, rowIndex]
    );
  };

  const updateAcceptReject = (productId, newAcceptValue) => {
    setFilteredData((prevData) =>
      (prevData || []).map((product) =>
        product.id === productId
          ? {
            ...product,
            accept: Math.max(0, Math.min(newAcceptValue, product.total || 10)),
            cancel: (product.total || 10) - Math.max(0, Math.min(newAcceptValue, product.total || 10)),
            progress: `${Math.max(0, Math.min(newAcceptValue, product.total || 10))}/${product.total || 10}`,
          }
          : product
      )
    );
  };

  const removeAcceptReject = (productId, newRejectValue) => {
    setFilteredData((prevData) =>
      (prevData || []).map((product) =>
        product.id === productId
          ? {
            ...product,
            cancel: Math.max(0, Math.min(newRejectValue, product.total || 10)),
            accept: (product.total || 10) - Math.max(0, Math.min(newRejectValue, product.total || 10)),
            progress: `${(product.total || 10) - Math.max(0, Math.min(newRejectValue, product.total || 10))}/${product.total || 10}`,
          }
          : product
      )
    );
  };

  const badgeColors = {
    positive: "positive_garph",
    negative: "critical",
    pending: "pending",
    default: ["blue", "purpul", "voilet"],
  };

  const badgeColorMap = new Map();

  const getBadgeClass = (value) => {
    const numValue = Number(value);

    if (numValue === 1) return badgeColors.positive;
    if (numValue === 0) return badgeColors.negative;
    if (numValue === 2) return badgeColors.pending;

    const strValue = String(value).toLowerCase().trim();

    if (badgeColorMap.has(strValue)) return badgeColorMap.get(strValue);

    const newColor = badgeColors.default[badgeColorMap.size % badgeColors.default.length];
    badgeColorMap.set(strValue, newColor);

    return newColor;
  };

  const getBadgeLabel = (value) => {
    const numValue = Number(value);
    if (numValue === 1) return "Active";
    if (numValue === 0) return "Inactive";
    if (numValue === 2) return "Achieved";
    return String(value) || "Undefined";
  };

  const renderCellContent = (column, value, rowData) => {
    const type = column.type || "text";

    if (type === "status") {
      return (
        <>
          {rowData.status === 0 ? (
            <div className="status-control d-flex align-items-center">
              <button
                className="btn btn-outline-success me-2"
                onClick={() => onStatusChange(rowData.projects_task_id, 1, rowData.user_id)} // Accept
                title="Accept"
              >
                <FaCheck />
              </button>
              <button
                className="btn btn-outline-danger me-2"
                onClick={() => onStatusChange(rowData.projects_task_id, 2, rowData.user_id)} // Reject
                title="Reject"
              >
                <RxCross1 />
              </button>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => onStatusChange(rowData.projects_task_id, 0, rowData.user_id)} // Pending
                title="Pending"
              >
                <FaQuestion />
              </button>
            </div>
          ) : (
            <>
              {rowData.status === 1 && (
                <span className="text-success fw-bold">Accepted</span>
              )}
              {rowData.status === 2 && (
                <span className="text-danger fw-bold">Rejected</span>
              )}
              {rowData.status === 0 && (
                <span className="text-secondary fw-bold">Pending</span>
              )}
            </>
          )}
        </>
      );
    }

    if (type === "quantity") {
      return (
        <div className="quantity-control">
          <button
            className="btn a-btn-primary qty-btn"
            onClick={() => updateTableQuantity(rowData.id, (quantities[rowData.id] || rowData.quantity || 1) - 1)}
          >
            -
          </button>
          <input
            type="text"
            className="form-control qty-input"
            value={quantities[rowData.id] ?? rowData.quantity ?? 1}
            onChange={(e) => updateTableQuantity(rowData.id, e.target.value)}
          />
          <button
            className="btn a-btn-primary qty-btn"
            onClick={() => updateTableQuantity(rowData.id, (quantities[rowData.id] || rowData.quantity || 1) + 1)}
          >
            +
          </button>
        </div>
      );
    }

    if (type === "grouped") {
      return (
        <div className="col">
          <h6>{rowData.heading || "N/A"}</h6>
          <p>{rowData.p1 || ""}</p>
          <p>{rowData.p2 || ""}</p>
        </div>
      );
    }

    if (type === "accept") {
      return (
        <div className="quantity-control">
          <button
            className="btn qty-btn"
            onClick={() => updateAcceptReject(rowData.id, (rowData.accept || 0) - 1)}
          >
            -
          </button>
          <input
            type="text"
            className="form-control qty-input"
            value={rowData.accept || 0}
            onChange={(e) => updateAcceptReject(rowData.id, parseInt(e.target.value) || 0)}
          />
          <button
            className="btn qty-btn"
            onClick={() => updateAcceptReject(rowData.id, (rowData.accept || 0) + 1)}
          >
            +
          </button>
        </div>
      );
    }

    if (type === "cancel") {
      return (
        <div className="quantity-control">
          <button
            className="btn qty-btn"
            onClick={() => removeAcceptReject(rowData.id, (rowData.cancel || 0) - 1)}
          >
            -
          </button>
          <input
            type="text"
            className="form-control qty-input"
            value={rowData.cancel || 0}
            onChange={(e) => removeAcceptReject(rowData.id, parseInt(e.target.value) || 0)}
          />
          <button
            className="btn qty-btn"
            onClick={() => removeAcceptReject(rowData.id, (rowData.cancel || 0) + 1)}
          >
            +
          </button>
        </div>
      );
    }

    if (type === "ar-progress") {
      const total = rowData.total || 10;
      const accepted = rowData.accept || 0;
      const progressPercentage = (accepted / total) * 100;

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "100px",
              height: "8px",
              background: "#FFB3B3",
              borderRadius: "5px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: "100%",
                background: "#BDE275",
                borderRadius: "5px",
              }}
            ></div>
          </div>
          <span>{accepted}/{total}</span>
        </div>
      );
    }

    if (type === "img") {
      return (
        <img
          src={value || ""}
          alt={value ? "Table image" : ""}
          style={{ width: "100%", height: "40px", borderRadius: "5px" }}
        />
      );
    }

    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={selectedRows.includes(rowData.id)}
          onChange={() => handleCheckboxChange(rowData.id)}
        />
      );
    }

    if (type === "badge") {
      return (
        <span className={`badge ${getBadgeClass(value)}`}>
          {getBadgeLabel(value)}
        </span>
      );
    }

    if (type === "tags") {
      return (
        <div className="tags-container">
          {Array.isArray(value) ? (
            value.map((tag, i) => (
              <span key={i} className="badge blue mx-1">{tag}</span>
            ))
          ) : (
            <span className="badge blue mx-1">{String(value)}</span>
          )}
        </div>
      );
    }

    if (type === "time") {
      const now = moment();
      const inputTime = moment(value);
      const diffHours = now.diff(inputTime, "hours");
      const diffDays = now.diff(inputTime, "days");

      if (!value) return "—";
      if (diffHours < 1) return <span>{inputTime.fromNow()}</span>;
      if (diffDays < 1) return <span>{inputTime.fromNow()}</span>;
      if (diffDays === 1) return <span>Yesterday</span>;

      return <span>{inputTime.format("Do MMM YYYY")}</span>;
    }

    if (type === "date") {
      if (!value) return "—";
      const formatted = moment(value).format("DD MMM YYYY");
      return <span>{formatted}</span>;
    }

    if (type === "onlytime") {
      if (!value) return "—";
      const formattedTime = moment(value, "HH:mm:ss").format("hh:mm A");
      return <span>{formattedTime}</span>;
    }

    if (type === "datetimetime") {
      if (!value) return "—";
      const dateTime = moment(value);
      return <span>{dateTime.format("Do MMM YYYY, hh:mm A")}</span>; // e.g., 29th Jun 2025, 10:33 AM
    }

    if (type === "datetimetimezone") {
      if (!value) return "—";
      const dateTime = moment(value);
      const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return (
        <span>
          {dateTime.format("Do MMM YYYY, hh:mm A")} ({localZone})
        </span>
      );
    }

    if (type === "rating") {
      const rating = Math.min(Math.max(Number(value) || 0, 0), 5);
      return (
        <span className="rating">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </span>
      );
    }

    if (type === "currency") {
      return <span>${parseFloat(value || 0).toFixed(2)}</span>;
    }

    if (type === "country") {
      return countryFlags[value] ? (
        <>
          <img
            src={countryFlags[value]}
            alt={value}
            title={value}
            style={{ width: "30px", height: "20px", marginRight: "5px" }}
          />
          {value}
        </>
      ) : (
        value || "—"
      );
    }

    if (type === "button") {
      return (
        <Button
          buttonType="edit"
          label="Edit"
          onClick={() => handleEditClick(rowData)}
          className="edit-button"
          style={{ fontSize: "13px", width: "auto" }}
        />
      );
    }

    if (type === "progress") {
      const progressValue = value || "0/10";
      const [completed, total] = progressValue.split("/").map(Number);
      const percentage = (completed / (total || 1)) * 100;

      let progressBarColor = "#D9D9D9";
      if (completed === total) {
        progressBarColor = "#BDE275";
      } else if (completed > 0 && completed < total) {
        progressBarColor = "#FFB3B3";
      }

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            className="progress"
            style={{
              width: "100px",
              height: "8px",
              background: "#e0e0e0",
              borderRadius: "5px",
            }}
          >
            <div
              className="progress-bar"
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: progressBarColor,
                borderRadius: "5px",
              }}
              role="progressbar"
              aria-valuenow={completed}
              aria-valuemin="0"
              aria-valuemax={total}
            ></div>
          </div>
          <span>{`${completed}/${total}`}</span>
        </div>
      );
    }

    if (type === "product") {
      return <ProductDropdown items={rowData.items || []} />;
    }

    if (type === "link") {
      const label = rowData[column.linkLabelFromRow] || "View";
      const paramKey = column.linkParamKey || "id";
      const paramValue = rowData[paramKey];

      if (!paramValue) return <span>{label}</span>;

      let targetUrl = "#";

      if (typeof column.getLink === 'function') {
        targetUrl = column.getLink(rowData);
      }
      else if (typeof column.linkTemplate === 'string') {
        targetUrl = column.linkTemplate.replace(`:${paramKey}`, paramValue);
      }

      return (
        <a href={targetUrl} className="Columnlink">
          {label}
        </a>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div className="nested-object">
          {Object.entries(value).map(([key, val], idx) => (
            <div key={idx}>
              {key.toUpperCase()}: {String(val)}
            </div>
          ))}
        </div>
      );
    }

    return String(value) || "—";
  };

  return (
    <div className="section_card">
      <div
        className={`table-container list-view ${!paginated ? "scrollable-table" : ""} ${enableHorizontalScroll ? "horizontal-scrollable" : ""}`}
        style={enableHorizontalScroll ? { overflowX: "auto" } : {}}
      >
        <table
          className="table ae-table"
          ref={tableRef}
          id={id}
          style={enableHorizontalScroll ? { minWidth: "1200px" } : {}}
        >
          <thead>
            <tr>
              {showCheckbox && (
                <th style={{ whiteSpace: "nowrap" }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === safeFilteredData.length && safeFilteredData.length > 0}
                    onChange={() => {
                      setSelectedRows(
                        selectedRows.length === safeFilteredData.length
                          ? []
                          : safeFilteredData.map((_, index) => index)
                      );
                    }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.dbcol}
                  onClick={() => handleSort(column.dbcol)}
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  {(column.headname || column.headerName || column.dbcol || "").toUpperCase()}
                  {sortColumn === column.dbcol && (
                    <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody id="tableBody">
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr key={row.id || index}>
                  {showCheckbox && (
                    <td style={{ whiteSpace: "nowrap" }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(startIndex + index)}
                        onChange={() => handleCheckboxChange(startIndex + index)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.dbcol} style={{ whiteSpace: "nowrap" }}>
                      {renderCellContent(column, row[column.dbcol], row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginated ? (
        <>
          <br />
          <br />
          <div className="pagination-controls">
            <RowsPerPageSelector
              rowsPerPage={rowsPerPage}
              setRowsPerPage={handleRowsPerPageChange}
            />
            <div
              className="btn-sack position-relative"
              style={{ padding: "10px" }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="scroll-indicator"></div>
      )}
    </div>
  );
};

export default Table;