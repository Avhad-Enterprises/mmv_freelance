import React, { useState, useRef, useEffect } from "react";
import { makePostRequest } from "../utils/api";
import { convertFileToBase64 } from "../utils/convertToBase64";

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

const MultiFileUploaderComponent = ({
  label = "Upload Files",
  name,
  allowedClasses = "image",
  onChange,
  info,
  multiple = true,
  required = false,
  folderPath = "uploads/images",
  initialFiles = [],
}) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState(initialFiles || []);
  const [showError, setShowError] = useState(false);

  // Sync when initialFiles prop updates
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const validateFileType = (file) => {
    const classList = allowedClasses.split(" ");
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
    const selectedFiles = Array.from(event.target.files || []);
    const validated = selectedFiles.map((file) => ({
      file,
      isValid: validateFileType(file),
      fileUrl: null,
      uploading: true,
      error: null,
    }));

    let updatedFiles = [...files, ...validated];
    setFiles(updatedFiles);
    if (onChange) onChange(updatedFiles);
    setShowError(required && updatedFiles.length === 0);

    for (let i = files.length; i < updatedFiles.length; i++) {
      const fileData = updatedFiles[i];
      if (fileData.isValid) {
        try {
          const fileUrl = await uploadToAWS(fileData.file, folderPath);
          updatedFiles[i] = {
            ...fileData,
            fileUrl,
            uploading: false,
            error: null,
          };
        } catch (error) {
          updatedFiles[i] = {
            ...fileData,
            isValid: false,
            uploading: false,
            error: error.message,
          };
        }
      } else {
        updatedFiles[i] = {
          ...fileData,
          uploading: false,
          error: "Invalid file type",
        };
      }
      setFiles([...updatedFiles]);
      if (onChange) onChange([...updatedFiles]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    inputRef.current.files = droppedFiles;
    handleFileSelection({ target: { files: droppedFiles } });
  };

  const handleRemoveFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onChange) onChange(updated);
    if (required && updated.length === 0) {
      setShowError(true);
    }
  };

  const handleBlur = () => {
    if (required && files.length === 0) {
      setShowError(true);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      <div
        className="file-upload"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onBlur={handleBlur}
        tabIndex={0}
      >
        <label className="form-label">
          Drag & drop or <u>Browse</u>
        </label>
        <input
          type="file"
          name={name}
          className={allowedClasses}
          ref={inputRef}
          onChange={handleFileSelection}
          multiple={multiple}
          style={{ display: "none" }}
        />
      </div>

      {info && <small className="text-muted">{info}</small>}

      {showError && (
        <small className="text-danger d-block mt-1">
          This field is required
        </small>
      )}

      {files.length > 0 && (
        <div className="file-preview-container mt-3 d-flex flex-wrap gap-3">
          {files.map(({ file, isValid, fileUrl, uploading, error }, index) => (
            <div
              key={index}
              className={`file-preview ${isValid && !error ? "success" : "error"} mb-3`}
              style={{ position: "relative" }}
            >
              <div
                className="preview-wrapper"
                style={{ position: "relative", display: "inline-block" }}
              >
                {isValid && !error && fileUrl && /\.(jpe?g|png|gif|webp)$/i.test(fileUrl) && (
                  <img
                    src={fileUrl}
                    alt={`Preview ${index}`}
                    style={{
                      width: "184px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  />
                )}

                {isValid && !error && file.type?.startsWith("image/") && !fileUrl && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    style={{
                      width: "184px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  />
                )}

                {isValid && !error && file.type?.startsWith("video/") && (
                  <video
                    width="140"
                    height="100"
                    controls
                    style={{
                      borderRadius: "8px",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    <source src={fileUrl || URL.createObjectURL(file)} type={file.type} />
                    Your browser does not support the video tag.
                  </video>
                )}

                <button
                  type="button"
                  className="remove-file"
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "15px",
                    background: "rgba(0, 0, 0, 0.9)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="message mt-1">
                {uploading && (
                  <div className="message mt-1">
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileUploaderComponent;
