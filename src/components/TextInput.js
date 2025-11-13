import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

const TextInput = forwardRef(
  (
    {
      label,
      type = "text",
      placeholder = "Enter value...",
      info = "",
      name = "customInput",
      value = "",
      required = false,
      onChange,
      placeholderColor = "#e7e7e7ab",
      minLength,
      maxLength
    },
    ref
  ) => {
    const [error, setError] = useState("");
    const inputRef = useRef();

    // Expose validation method to parent using ref
    useImperativeHandle(ref, () => ({
      validate: () => {
        if (required && !value.trim()) {
          setError("This field is required.");
          inputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          inputRef.current?.focus();
          return false;
        }

        if (type === "email" && value && !validateEmail(value)) {
          setError("Invalid email format.");
          inputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          inputRef.current?.focus();
          return false;
        }

        if (type === "number" && value && !validateNumeric(value)) {
          setError("Only numeric values are allowed.");
          // scrollAndFocus();
          inputRef.current?.focus();
          return false;
        }

        if (minLength && value.length < minLength) {
          setError(`Minimum length is ${minLength} digits.`);
          // scrollAndFocus();
          return false;
        }

        if (maxLength && value.length > maxLength) {
          setError(`Maximum length is ${maxLength} digits.`);
          // scrollAndFocus();
          return false;
        }

        setError("");
        return true;
      },
    }));

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateNumeric = (val) => /^[0-9]+$/.test(val);

    const handleChange = (e) => {
      let inputValue = e.target.value;
      if (type === "url") {
        inputValue = inputValue.toLowerCase().replace(/\s+/g, "-");
      }
      if (onChange) onChange(name, inputValue);
      setError("");
    };

    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          ref={inputRef}
          type={type}
          name={name}
          className={`form-control ${error ? "input-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          style={{ "--placeholder-color": placeholderColor }}
        />
        {error && <small className="error-text text-danger">{error}</small>}
        <br />
        <small>{info}</small>
      </div>
    );
  }
);

export default TextInput;
