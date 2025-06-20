import React, { useState, useRef } from "react";
import { makePostRequest } from "../utils/api";
import { convertFileToBase64 } from "../utils/convertToBase64";

const allowedTypes = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/quicktime", "video/x-matroska", "video/webm"],
};

const FileUploadComponent = ({
  label,
  labelText = "Upload File",
  name,
  allowedClasses,
  onChange,
  info,
  multiple = false,
  required = false,
  folderPath = 'uploads/images',
  initialFile = null,
}) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState(initialFile);

  const validateFileType = (file) => {
    if (!file) return false;
    const classList = allowedClasses?.split(" ") || [];
    return classList.some((cls) => allowedTypes[cls]?.includes(file.type));
  };

  const uploadToAWS = async (file, folderPath) => {
    try {
      if (!file || !file.name || typeof file.name !== "string") {
        throw new Error("Invalid file: filename is missing or not a string");
      }
      console.log("Uploading file:", file.name, "to folder:", folderPath);

      const base64String = await convertFileToBase64(file);
      if (!base64String || typeof base64String !== "string") {
        throw new Error("Invalid base64 conversion: result is empty or not a string");
      }
      console.log("Base64 length:", base64String.length);

      const payload = {
        filename: file.name,
        base64String: base64String,
        folderPath: folderPath,
      };
      console.log("Payload for uploadToAWS:", payload);

      const response = await makePostRequest("files/uploadtoaws", payload);
      console.log("Upload response:", response);
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
    if (event.dataTransfer.files.length > 0) {
      inputRef.current.files = event.dataTransfer.files;
      handleFileSelection({ target: inputRef.current });
    }
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
    <div className="form-group">
      <label className="form-label">
        {label || labelText}{" "}
        {required && <span className="text-danger">*</span>}
      </label>

      {!previewFile && files.length === 0 && (
        <div
          className="file-upload"
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onBlur={handleBlur}
        >
          <label className="form-label">
            Drag & drop files
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
      )}

      {info && <small className="text-muted">{info}</small>}
      {error && <div className="text-danger mt-1">{error}</div>}

      {/* {previewFile.name} */}
      {previewFile && (
        <div className="file-preview-container mt-3">
          <div className="file-preview success" style={{ marginBottom: "1rem" }}>
            <div className="preview-wrapper" style={{ position: "relative", display: "inline-block" }}>
              {/* Image Preview */}
              {/\.jpe?g$|\.png$|\.gif$|\.webp$/i.test(initialFile?.fileUrl || "") && (
                <img
                  src={initialFile?.fileUrl}
                  alt="Initial Preview"
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              )}

              {/* Video Preview */}
              {/\.mp4$|\.webm$|\.mov$|\.mkv$/i.test(initialFile?.fileUrl || "") && (
                <video
                  controls
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                >
                  <source src={initialFile?.fileUrl} />
                  Your browser does not support the video tag.
                </video>
              )}

              <button
                type="button"
                onClick={() => {
                  setPreviewFile(null);
                  if (onChange) onChange([]);
                  if (required) setError("This field is required.");
                }}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "#000",
                  color: "#000",
                  border: "none",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-trash3" style={{ color: "white" }}></i>
              </button>
            </div>
          </div>
        </div>
      )}


      {files.length > 0 && (
        <div className="file-preview-container mt-3">
          {files.map(({ file, isValid, fileUrl }, index) => (
            <div
              key={index}
              className={`file-preview ${isValid ? "success" : "error"}`}
              style={{ marginBottom: "1rem" }}
            >
              <div
                className="preview-wrapper"
                style={{ position: "relative", display: "inline-block" }}
              >
                {isValid && file.type.startsWith("image/") && (
                  <img
                    src={fileUrl || URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="preview-image"
                    style={{
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  />
                )}

                {isValid && file.type.startsWith("video/") && (
                  <video
                    controls
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  >
                    <source
                      src={fileUrl || URL.createObjectURL(file)}
                      type={file.type}
                    />
                    Your browser does not support the video tag.
                  </video>
                )}

                <button
                  type="button"
                  className="remove-file"
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>

              <div className="message mt-2">
                {isValid && fileUrl
                  ? "File uploaded successfully"
                  : isValid
                    ? "Uploading..."
                    : "Unsupported file format"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;