import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa6";
import { ImBin } from "react-icons/im";

const FormHeader = ({
  title,
  backUrl = "/",
  previewUrl = null,
  showAdd = false,
  showUpdate = false,
  showDelete = false,
  showPreview = false,
  onDelete = () => { },
  onBack = null,
  onPreview = null,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backUrl);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else if (previewUrl) {
      navigate(previewUrl);
    }
  };

  return (
    <h3 className="d-flex justify-content-between align-items-center">
      <a onClick={handleBack} style={{ cursor: "pointer" }}>
        <i className="bi bi-arrow-left m-3"></i>
        {title}
      </a>
      <div className="d-flex gap-2">
        {showPreview && (
          <button type="button" className="btn secondary-btn-primary" onClick={handlePreview}>
            <FaEye size={16} />
          </button>
        )}
        {showAdd && (
          <button type="submit" className="btn a-btn-primary">
            Add
          </button>
        )}
        {showDelete && (
          <button
            type="button"
            className="btn secondary-btn-primary"
            onClick={onDelete}
          >
            <ImBin size={16} />
          </button>
        )}
        {showUpdate && (
          <button type="submit" className="btn a-btn-primary">
            Update
          </button>
        )}
      </div>
    </h3>
  );
};

export default FormHeader;
