import React, { useState, useRef } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";

const Filter = ({ columns, data, onFilter }) => {
  const [filterText, setFilterText] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(columns[0].dbcol);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown manually
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  // Attach event listener when dropdown is open
  React.useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Apply filter
  const applyFilter = (filterText, column, subCategory) => {
    const filtered = data.filter((item) => {
      const value = item[column];
      const isSubcategoryMatch = subCategory
        ? String(value) === subCategory
        : true;
      const isTextMatch =
        value && String(value).toLowerCase().includes(filterText.toLowerCase());
      return isSubcategoryMatch && isTextMatch;
    });

    onFilter(filtered); // Update filtered data based on filter
  };

  // Handle text input filter
  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilterText(text);
    applyFilter(text, selectedColumn, selectedSubCategory);
  };

  // Handle column selection
  const handleColumnChange = (dbcol) => {
    setSelectedColumn(dbcol);
    applyFilter(filterText, dbcol, selectedSubCategory);
  };

  // Get unique subcategories
  const getSubCategories = (column) => {
    const subcategories = new Set();
    data.forEach((row) => {
      if (row[column]) {
        subcategories.add(row[column]);
      }
    });
    return Array.from(subcategories);
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory(subCategory);
    applyFilter(filterText, selectedColumn, subCategory);
  };

  return (
    <div className="filter-container" ref={dropdownRef}>
      <DropdownButton
        id="filter-dropdown"
        title={<i className="bi bi-filter"></i>}
        className="table-btn"
        variant="primary"
        show={dropdownOpen}
        onToggle={toggleDropdown}
      >
        {/* Column Selection */}
        <Dropdown.Item as="div" onClick={(e) => e.stopPropagation()}>
          <label htmlFor="columnFilter">Select Column</label>
          <select
            id="columnFilter"
            className="form-select"
            value={selectedColumn}
            onChange={(e) => handleColumnChange(e.target.value)}
          >
            {columns.map((column, index) => (
              <option key={index} value={column.dbcol}>
                {column.headname}
              </option>
            ))}
          </select>
        </Dropdown.Item>

        {/* Subcategory Selection */}
        {getSubCategories(selectedColumn).length > 0 && (
          <Dropdown.Item as="div" onClick={(e) => e.stopPropagation()}>
            <label htmlFor="subCategoryFilter">Select Subcategory</label>
            <select
              id="subCategoryFilter"
              className="form-select"
              value={selectedSubCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
            >
              <option value="">Select Subcategory</option>
              {getSubCategories(selectedColumn).map((subCategory, index) => (
                <option key={index} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </Dropdown.Item>
        )}
      </DropdownButton>
    </div>
  );
};

export default Filter;
