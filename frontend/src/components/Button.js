import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons are available

const Button = ({
  buttonType = "", // 'import', 'export', 'add' ,'edit'
  label = "Button",
  onClick,
  href = "#",
  asLink = false,
  btnStyle = "", // Default button style
  style = {}, // Pass the inline style here
  type = "button", // 'button' or 'submit'
}) => {
  // Determine icon class based on buttonType
  const getIconClass = () => {
    switch (buttonType) {
      case "import":
        return "bi bi-box-arrow-in-down-left"; // Import icon
      case "export":
        return "bi bi-box-arrow-up-right"; // Export icon
      case "add":
        return "bi bi-plus-lg"; // Add icon
      case "check":
        return "bi bi-check-lg"; // Check icon
      case "uncheck":
        return "bi bi-x"; // Uncheck icon
      case "grow":
        return "bi bi-graph-up-arrow"; // Grow icon
      case "edit":
        return "bi bi-pencil-square"; // Edit icon
        case "bulkuplaod":
        return "bi bi-arrow-down-left-circle"; // Edit icon
        case "pause":
        return "bi bi-pause-fill"; // Edit icon
      default:
        return "";
    }
  };

  return asLink ? (
    // Render as <a> tag if asLink is true
    <a href={href} className={`btn a-btn-primary ${btnStyle}`} onClick={onClick}>
      {buttonType === "add" && <i className={getIconClass()}></i>} {/* Icon on left for add */}
      {label}
      {buttonType !== "add" && <i className={getIconClass()}></i>} {/* Icon on right for import/export */}
    </a>
  ) : (
    // Render as <button> tag otherwise
    <button type={type} style={style} className={`btn a-btn-primary ${btnStyle}`} onClick={onClick}>
      {buttonType === "add" && <i className={getIconClass()}></i>} {/* Icon on left for add */}
      {label}
      {buttonType !== "add" && <i className={getIconClass()}></i>} {/* Icon on right for import/export */}
    </button>
  );
};

export default Button;
