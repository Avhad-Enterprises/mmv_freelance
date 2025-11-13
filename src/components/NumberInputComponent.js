import React, { useState, useEffect, useRef } from "react";

const NumberInputComponent = ({
  label = "Number",
  name,
  value = "",
  onChange,
  min = 0,
  max = 999999999,
  step = 1,
  placeholder = "",
  maxDigits = null,
  required = false,
  autoFocusError = false,
}) => {
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (error && autoFocusError && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current.focus();
    }
  }, [error, autoFocusError]);

  const handleChange = (e) => {
    let val = e.target.value;

    // Allow empty input and enforce maxDigits restriction
    if (maxDigits !== null && val.replace(/\D/g, "").length > maxDigits) {
      return;
    }

    // Allow updating parent with any input to let it control the field
    onChange({ target: { name, value: val } });

    if (val === "") {
      setError(required ? "This field is required." : "");
      return;
    }

    const number = parseInt(val, 10);
    if (!isNaN(number) && number >= min && (max === null || number <= max)) {
      setError("");
    } else {
      setError("Invalid number");
    }
  };

  const handleBlur = () => {
    if (required && (value === null || value === undefined || value === "")) {
      setError("This field is required.");
    }
  };

  return (
    <div className="form-group mb-3">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        className={`form-control ${error ? "input-error" : ""}`}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
      />
      {error && <small className="error-text text-danger">{error}</small>}
    </div>
  );
};

export default NumberInputComponent;
