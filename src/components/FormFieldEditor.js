import React, { useState, useRef, useEffect } from "react";
import { ImCross, ImBin } from "react-icons/im";
import { PiDotsSixBold } from "react-icons/pi";
import { MdOutlineContentCopy } from "react-icons/md";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoChevronDown } from "react-icons/io5";

const fieldTypes = [
    { label: "Text - Single line", value: "text" },
    { label: "Number - Enter Number", value: "number" },
    { label: "Textarea - Multi-line Textbox", value: "textarea" },
    { label: "Radio - Multiple Choice", value: "radio" },
    { label: "Checkbox - Checkboxes", value: "checkbox" },
    { label: "Dropdown - Select from a list", value: "dropdown" },
    { label: "File Upload", value: "file" },
    { label: "Date Picker", value: "date" },
];

const FormFieldEditor = ({ field, onDelete, onUpdate, onDuplicate }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleLabelChange = (e) => {
        onUpdate(field.id, { label: e.target.value });
    };

    const handleRequiredToggle = () => {
        onUpdate(field.id, { required: !field.required });
    };

    const handleOptionChange = (optIndex, newValue) => {
        const newOptions = [...field.options];
        newOptions[optIndex] = newValue;
        onUpdate(field.id, { options: newOptions });
    };

    const handleAddOption = () => {
        const newOptions = [...(field.options || []), "New Option"];
        onUpdate(field.id, { options: newOptions });
    };

    const handleRemoveOption = (optIndex) => {
        const newOptions = field.options.filter((_, i) => i !== optIndex);
        onUpdate(field.id, { options: newOptions });
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleDescription = () => {
        onUpdate(field.id, { showDescription: !field.showDescription });
    };

    const handleDescriptionChange = (e) => {
        onUpdate(field.id, { description: e.target.value });
    };

    const handleToggleImage = () => {
        onUpdate(field.id, { showImage: !field.showImage, image: field.showImage ? null : field.image });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            onUpdate(field.id, {
                image: {
                    file,
                    preview: previewUrl,
                    name: file.name,
                },
            });
        }
    };

    const handleToggleVideo = () => {
        onUpdate(field.id, { showVideo: !field.showVideo, video: field.showVideo ? null : field.video });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            onUpdate(field.id, {
                video: {
                    file,
                    preview: previewUrl,
                    name: file.name,
                },
            });
        }
    };

    const handleRemoveImage = () => {
        onUpdate(field.id, { image: null });
    };

    const handleRemoveVideo = () => {
        onUpdate(field.id, { video: null });
    };

    const handleDuplicate = () => {
        onDuplicate({
            ...field,
            id: `field_${Date.now()}`, // Temporary ID, will be reassigned in DynamicFormAdd.js
            image: field.image ? { ...field.image, preview: URL.createObjectURL(field.image.file) } : null,
            video: field.video ? { ...field.video, preview: URL.createObjectURL(field.video.file) } : null,
        });
    };

    return (
        <div className="form-group mb-3 border p-3 rounded my-5 position-relative">
            <div className="d-flex justify-content-center me-2 mt-1">
                <span className="drag-handle" title="Drag to Reorder" style={{ cursor: "grab" }}>
                    <PiDotsSixBold size={20} />
                </span>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="w-100">
                    <Row className="align-items-center">
                        <Col md={8}>
                            <label className="form-label fw-semibold mb-1">Enter Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter field label"
                                value={field.label}
                                onChange={handleLabelChange}
                            />
                        </Col>
                        <Col md={4}>
                            <label className="form-label fw-semibold mb-1">Field Type</label>
                            <select
                                className="form-control"
                                value={field.type}
                                onChange={(e) => {
                                    const type = e.target.value;
                                    const defaultOptions = ["Option 1", "Option 2"];
                                    const needsOptions = ["radio", "checkbox", "dropdown"].includes(type);
                                    const shouldClearOptions = !needsOptions && field.options?.length > 0;

                                    onUpdate(field.id, {
                                        type,
                                        options: needsOptions ? (field.options?.length > 0 ? field.options : defaultOptions) : [],
                                        ...(shouldClearOptions && { options: [] }),
                                    });
                                }}
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </Col>
                    </Row>
                </div>

                <div className="d-flex align-items-center position-absolute" style={{ top: "-15px", right: "-15px" }}>
                    <button
                        type="button"
                        className="btn btn-light btn-sm me-2"
                        onClick={handleDuplicate}
                        title="Duplicate"
                    >
                        <MdOutlineContentCopy />
                    </button>
                    <button
                        type="button"
                        className="btn btn-dark btn-sm"
                        onClick={onDelete}
                        title="Delete"
                    >
                        <ImCross />
                    </button>
                </div>
            </div>

            {field.showDescription && (
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter description..."
                        value={field.description || ""}
                        onChange={handleDescriptionChange}
                    />
                </div>
            )}

            {field.showImage && (
                <div className="mb-3">
                    <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {field.image?.preview && (
                        <div className="mt-2">
                            <img
                                src={field.image.preview}
                                alt="Preview"
                                style={{ maxWidth: "200px", borderRadius: "4px" }}
                            />
                            <div className="">
                                <small className="text-muted">Selected: {field.image.name}</small>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleRemoveImage}
                                    title="Remove Image"
                                >
                                    <ImBin />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {field.showVideo && (
                <div className="mb-3">
                    <input
                        type="file"
                        className="form-control"
                        accept="video/*"
                        onChange={handleVideoChange}
                    />
                    {field.video?.preview && (
                        <div className="mt-2">
                            <video
                                src={field.video.preview}
                                controls
                                style={{ maxWidth: "300px", borderRadius: "4px" }}
                            />
                            <div className="">
                                <small className="text-muted">Selected: {field.video.name}</small>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={handleRemoveVideo}
                                    title="Remove Video"
                                >
                                    <ImBin />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="custom-toggle-switch d-flex justify-content-end align-items-center mb-3">
                <div className="d-flex mx-3">
                    <label className="switch">
                        <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={handleRequiredToggle}
                        />
                        <span className="slider round"></span>
                    </label>
                    <div className="ms-2">Required</div>
                </div>

                <div className="position-relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="btn"
                        onClick={toggleDropdown}
                        style={{ border: "none", background: "transparent", padding: "0" }}
                    >
                        <BsThreeDotsVertical size={20} />
                    </button>

                    {showDropdown && (
                        <div
                            className="shadow-sm border bg-white rounded p-2"
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "30px",
                                minWidth: "180px",
                                zIndex: 999,
                            }}
                        >
                            <div className="fw-bold small text-muted mb-2">Show</div>
                            <button
                                className="dropdown-item small"
                                onClick={handleToggleDescription}
                            >
                                {field.showDescription ? "Hide" : "Show"} Description
                            </button>
                            <button
                                className="dropdown-item small"
                                onClick={handleToggleImage}
                            >
                                {field.showImage ? "Hide" : "Show"} Image
                            </button>
                            <button
                                className="dropdown-item small"
                                onClick={handleToggleVideo}
                            >
                                {field.showVideo ? "Hide" : "Show"} Video
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {["radio", "checkbox", "dropdown"].includes(field.type) && (
                <div className="mb-2">
                    <label className="form-label">Options:</label>
                    {field.options?.map((opt, i) => (
                        <div key={i} className="input-group mb-1">
                            <div className="input-group-text" style={{ height: "38px" }}>
                                {field.type === "radio" && <input type="radio" disabled />}
                                {field.type === "checkbox" && <input type="checkbox" disabled />}
                                {field.type === "dropdown" && <span><IoChevronDown /></span>}
                            </div>

                            <input
                                type="text"
                                className="form-control"
                                style={{ height: "38px" }}
                                value={opt}
                                onChange={(e) => handleOptionChange(i, e.target.value)}
                            />

                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleRemoveOption(i)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={handleAddOption}
                    >
                        ➕ Add Option
                    </button>
                </div>
            )}
        </div>
    );
};

export default FormFieldEditor;