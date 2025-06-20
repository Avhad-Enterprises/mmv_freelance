import React, { useState, useRef, useEffect } from "react";

const SelectComponent = ({
  label,
  name,
  options,
  value, // Controlled value prop
  info,
  isMulti = false,
  onChange,
  listStyle = "",
  dropdownWidth = "100%",
  required = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState(isMulti ? [] : "");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectRef = useRef(null);

  // Sync state with value prop
  useEffect(() => {
    if (isMulti) {
      setSelectedValues(Array.isArray(value) ? value : []);
    } else {
      setSelectedValues(value || "");
      const selectedOption = options.find((opt) => opt.value === value);
      setSelectedLabel(selectedOption ? selectedOption.label : "");
    }
  }, [value, options, isMulti]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value, label, event) => {
    event.stopPropagation(); // Prevent click from bubbling to wrapper
    if (isMulti) {
      setSelectedValues((prevValues) => {
        const newValues = prevValues.includes(value)
          ? prevValues.filter((v) => v !== value)
          : [...prevValues, value];
        if (onChange) onChange(newValues);
        return newValues;
      });
    } else {
      setSelectedValues(value);
      setSelectedLabel(label);
      if (onChange) onChange(value);
      setIsDropdownOpen(false); // Close dropdown immediately
    }
    setSearchTerm("");
  };

  const removeTag = (value, event) => {
    event.stopPropagation(); // Prevent click from bubbling to wrapper
    const newValues = selectedValues.filter((v) => v !== value);
    setSelectedValues(newValues);
    if (onChange) onChange(newValues);
  };

  return (
    <div
      className="form-group"
      ref={selectRef}
      style={{ position: "relative" }}
    >
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      <div
        className={`ae-select-wrapper ${isMulti ? "ae-multiple-select" : ""}`}
        style={{ position: "relative" }}
      >
        {isMulti && (
          <div className="ae-selected-options">
            {selectedValues.map((value) => {
              const label = options.find((opt) => opt.value === value)?.label;
              return (
                <div className="ae-tag" key={value}>
                  {label}
                  <span
                    className="ae-remove-tag"
                    onClick={(e) => removeTag(value, e)}
                  >
                    ×
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="ae-search-container">
          {isMulti && <i className="bi bi-search"></i>}
          <input
            type="text"
            className="ae-search-input"
            placeholder={isMulti ? "Search Options..." : "Select..."}
            value={isDropdownOpen ? searchTerm : (isMulti ? "" : selectedLabel)}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
            readOnly={!isMulti && !isDropdownOpen} // Read-only only for single-select when closed
          />
          <i
            className={`bi ${isDropdownOpen ? "bi-chevron-up" : "bi-chevron-down"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          ></i>
        </div>

        <select
          className="ae-select"
          name={name}
          multiple={isMulti}
          style={{ display: "none" }}
          required={required}
          value={selectedValues} // Ensure form sync
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isDropdownOpen && (
          <div
            className={`ae-options-list ${listStyle}`}
            style={{
              position: "absolute",
              top: "100%",
              left: -20,
              width: dropdownWidth,
              zIndex: 999,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={
                    isMulti
                      ? selectedValues.includes(option.value)
                        ? "selected"
                        : ""
                      : selectedValues === option.value
                        ? "selected"
                        : ""
                  }
                  onClick={(e) => handleSelect(option.value, option.label, e)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor: isMulti
                      ? selectedValues.includes(option.value)
                        ? "#f0f0f0"
                        : "#fff"
                      : selectedValues === option.value
                        ? "#f0f0f0"
                        : "#fff",
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="no-options" style={{ padding: "8px 12px" }}>
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {info && (
        <>
          <br />
          <small>{info}</small>
        </>
      )}
    </div>
  );
};

export default SelectComponent;