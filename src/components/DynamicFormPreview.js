import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "./Button";
import Container from 'react-bootstrap/Container';
import { TbArrowBackUp } from "react-icons/tb";

const DynamicFormPreview = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { formtitle = "", description = "", fields = [] } = state || {};
    const renderField = (field) => {
        const { id, label, type, description, image, video, options = [], required } = field;

        return (
            <div key={id} className="form-group mb-3 border p-3 rounded">
                <label className="form-label fw-semibold">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
                {description && <p className="text-muted small">{description}</p>}

                {type === "text" && (
                    <input type="text" className="form-control" placeholder="Text input" />
                )}
                {type === "number" && (
                    <input type="number" className="form-control" placeholder="Number input" />
                )}
                {type === "textarea" && (
                    <textarea className="form-control" placeholder="Textarea input" />
                )}
                {type === "radio" && (
                    <div>
                        {options.map((option, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name={`radio-${id}`}

                                />
                                <label className="form-check-label">{option}</label>
                            </div>
                        ))}
                    </div>
                )}
                {type === "checkbox" && (
                    <div>
                        {options.map((option, index) => (
                            <div key={index} className="form-check">
                                <input type="checkbox" className="form-check-input" />
                                <label className="form-check-label">{option}</label>
                            </div>
                        ))}
                    </div>
                )}
                {type === "dropdown" && (
                    <select className="form-control" >
                        <option>-- Select --</option>
                        {options.map((option, index) => (
                            <option key={index}>{option}</option>
                        ))}
                    </select>
                )}
                {type === "file" && (
                    <input type="file" className="form-control" />
                )}
                {type === "date" && (
                    <input type="date" className="form-control" />
                )}

                {image?.preview && (
                    <div className="mt-2">
                        <img
                            src={image.preview}
                            alt="Preview"
                            style={{ maxWidth: "200px", borderRadius: "4px" }}
                        />
                        <p className="text-muted small">Image: {image.name}</p>
                    </div>
                )}
                {video?.preview && (
                    <div className="mt-2">
                        <video
                            src={video.preview}
                            controls
                            style={{ maxWidth: "300px", borderRadius: "4px" }}
                        />
                        <p className="text-muted small">Video: {video.name}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title">Form Preview</h4>
                <Button
                    buttonType="back"
                    onClick={() => navigate("/registration-form/add", { state })}
                    label={ <TbArrowBackUp size={20} />}
                />
            </div>
            <Row>
                <Col md={10}>
                    <div className="form_section">
                        <h6 className="card-title">{formtitle || "Untitled Form"}</h6>
                        {description && <p className="text-muted">{description}</p>}
                        {fields.length === 0 ? (
                            <p>No fields added yet.</p>
                        ) : (
                            fields.map((field) => renderField(field))
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
}


export default DynamicFormPreview;