import { Row, Col, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { makePostRequest } from "../utils/api";
import { convertFileToBase64 } from "../utils/convertToBase64";
import React, { useState, useRef } from "react";

const allowedTypes = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
  txt: [
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  pdf: ["application/pdf"],
  excel: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
};

const RepeaterComponent = ({
  items = [],
  onAdd,
  onRemove,
  onChange,
  allowedClasses,
  fields = [],
  folderPath = "uploads/images",
  required = false,
}) => {

  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const validateFileType = (file) => {
    const classList = allowedClasses?.split(" ") || [];
    return classList.some((cls) => allowedTypes[cls]?.includes(file.type));
  };

  const uploadToAWS = async (file, folderPath) => {
    try {
      if (!file || !file.name || typeof file.name !== "string") {
        throw new Error("Invalid file: filename is missing or not a string");
      }

      const base64String = await convertFileToBase64(file);
      if (!base64String || typeof base64String !== "string") {
        throw new Error("Invalid base64 conversion: result is empty or not a string");
      }

      const payload = {
        filename: file.name,
        base64String: base64String,
        folderPath: folderPath,
      };

      const response = await makePostRequest("files/uploadtoaws", payload);
      return response.data.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file to AWS: " + error.message);
    }
  };

  const handleFileSelection = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validatedFiles = selectedFiles.map((file) => ({
      file,
      isValid: validateFileType(file),
      fileUrl: null,
    }));

    setFiles(validatedFiles);

    const updatedFiles = [...validatedFiles];
    for (let i = 0; i < validatedFiles.length; i++) {
      const fileData = validatedFiles[i];
      if (fileData.isValid) {
        try {
          const fileUrl = await uploadToAWS(fileData.file, folderPath);
          updatedFiles[i].fileUrl = fileUrl;
          setFiles([...updatedFiles]);
          setError("");
        } catch (error) {
          updatedFiles[i].isValid = false;
          setFiles([...updatedFiles]);
          setError("Error uploading file. Please try again.");
        }
      } else {
        setError("Unsupported file format.");
      }
    }

    if (onChange) onChange(updatedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer.files;
    inputRef.current.files = droppedFiles;
    handleFileSelection({ target: { files: droppedFiles } });
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onChange) onChange(updatedFiles);
    if (required && updatedFiles.length === 0) {
      setError("This field is required.");
    }
  };

  const handleBlur = () => {
    if (required && files.length === 0) {
      setError("This field is required.");
    } else {
      setError("");
    }
  };

  return (
    <div className="repeater-section">
      {items.map((item, index) => (
        <div
          key={index}
          className="repeater-item-container position-relative mb-4 p-3 border rounded"
        >
          <Button
            variant="dark"
            size="sm"
            onClick={() => onRemove(index)}
            title="Remove"
            className="position-absolute"
            style={{ top: "-10px", right: "-8px", zIndex: 2 }}
          >
            <ImCross />
          </Button>

          <Row className="align-items-start">
            {fields.map((field) => (
              <Col
                md={field.col || 4}
                key={`${field.name}-${index}`}
                className="mb-3"
              >
                <div className="form-group">
                  {field.type === "file" ? (
                    <>
                      <field.component
                        label={field.label}
                        name={field.name}
                        allowedClasses={field.allowedClasses}
                        info={field.info}
                        onChange={(file, isValid) =>
                          onChange(index, field.name, [file])
                        }
                        required={false}
                        initialFile={
                          Array.isArray(item[field.name]) &&
                            item[field.name].length > 0
                            ? item[field.name][0]
                            : null
                        }
                      />
                      {field.description && (
                        <small className="text-muted">
                          {field.description}
                        </small>
                      )}
                    </>
                  ) : field.type === "time" ? (
                    <>
                      <label className="form-label">{field.label}</label>
                      <input
                        type="time"
                        className="form-control"
                        name={field.name}
                        value={item[field.name]}
                        onChange={(e) =>
                          onChange(index, field.name, e.target.value)
                        }
                      />
                      {field.description && (
                        <small className="text-muted">
                          {field.description}
                        </small>
                      )}
                    </>
                  ) : (
                    <>
                      <field.component
                        label={field.label}
                        name={field.name}
                        value={item[field.name]}
                        placeholder={field.placeholder}
                        info={field.info}
                        onChange={(name, value) => onChange(index, name, value)}
                      />
                      {field.description && (
                        <small className="text-muted">
                          {field.description}
                        </small>
                      )}
                    </>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <Button variant="dark" size="sm" onClick={onAdd}>
        <FaPlus />
      </Button>
    </div>
  );
};

export default RepeaterComponent;
