import React from "react";
import { BsChevronDown } from "react-icons/bs"; // Importing Bootstrap Icons (React version)

const RowsPerPageSelector = ({ rowsPerPage, setRowsPerPage }) => {
  const handleChange = (event) => {
    setRowsPerPage(Number(event.target.value)); // Set rows per page
  };

  return (
    <div className="rowsPerPage">
      <div className="rows-per-page-selector">
        <label htmlFor="rowsPerPage">Rows per page: </label>
        <div className="select-wrapper">
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="chevron-icon">
            <BsChevronDown /> {/* Chevron icon */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RowsPerPageSelector;



