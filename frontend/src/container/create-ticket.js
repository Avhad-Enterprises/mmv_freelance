import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import Aetextarea from "../components/Aetextarea";
import axios from "axios";
import { makePostRequest } from "../utils/api";

const AddNewTicket = () => {
    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        email: "",
        user_id: "",
        project_id: "",
        ticket_category: "",
        title: "",
        priority: "low",
        location: "",
        ip_address: "",
        os_info: "",
        browser_info: "",
        platform_used: "",
        support_language: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showMicroDetails, setShowMicroDetails] = useState(false);
    const [selectedMicroDetail, setSelectedMicroDetail] = useState(null);
    const [replyMessage, setReplyMessage] = useState(""); // NEW for reply input

    const handleReply = async () => {
        if (!formData.ticket_id) {
            alert("Missing ticket ID");
            return;
        }
        if (!formData.user_id) {
            alert("Missing sender ID");
            return;
        }
        if (!replyMessage.trim()) {
            alert("Reply message cannot be empty");
            return;
        }

        setLoading(true);

        const payload = {
            ticket_id: Number(formData.ticket_id),
            sender_id: Number(formData.user_id), // assuming user_id is the replier
            sender_role: "client", // or "admin" — adjust this as needed
            message: replyMessage.trim(),
        };

        console.log("Reply Payload:", payload);

        try {
            const res = await makePostRequest("support_ticket/reply", payload);
            alert("Reply sent successfully!");
            setReplyMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to send reply");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        if (!e?.target?.name) {
            console.error("Missing name in input event!", e);
            return; // or handle manually
        }
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggleMicroDetails = () => {
        setShowMicroDetails(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // ✅ Validate required
        if (
            !formData.subject.trim() ||
            !formData.ticket_category.trim() ||
            !formData.description.trim() ||
            !formData.email.trim()
        ) {
            setError("Please fill in subject, category, description, and email.");
            setLoading(false);
            return;
        }

        // ✅ Make safe payload
        const payload = {
            ...formData,
            user_id: formData.user_id && formData.user_id !== "" ? Number(formData.user_id) : null,
            project_id: formData.project_id && formData.project_id !== "" ? Number(formData.project_id) : null,
            status: 0
        };

        console.log("🚨 FINAL PAYLOAD:", payload);

        try {
            const res = await makePostRequest("support_ticket/create", payload);
            console.log("✅ Ticket created:", res.data);
            setSuccess("Ticket created successfully!");
            setFormData({
                subject: "",
                description: "",
                email: "",
                user_id: "",
                project_id: "",
                ticket_category: "",
                title: "",
                priority: "low",
                location: "",
                ip_address: "",
                os_info: "",
                browser_info: "",
                platform_used: "",
                support_language: ""
            });
        } catch (err) {
            console.error("❌ Failed:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <FormHeader title="Add New Ticket" backUrl="/customerservice" closeUrl="/" />

            <form onSubmit={handleSubmit}>
                <Row>
                    {/* === MAIN TICKET FORM === */}
                    <Col md={8}>
                        {/* Subject */}
                        <div className="form_section">
                            <Form.Group className="mb-3">
                                <Form.Label>Subject</Form.Label>
                                <Form.Control
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            {/* === EMAIL === */}
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email..."
                                />
                            </Form.Group>

                            {/* === CATEGORY === */}
                            <Form.Group className="mb-3">
                                <Form.Label>Ticket Category</Form.Label>
                                <Form.Control
                                    name="ticket_category"
                                    value={formData.ticket_category}
                                    onChange={handleChange}
                                    placeholder="Enter ticket category..."
                                />
                            </Form.Group>
                            {/* === USER ID === */}
                            <Form.Group className="mb-3">
                                <Form.Label>User ID (optional)</Form.Label>
                                <Form.Control
                                    name="user_id"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    placeholder="Enter user ID"
                                />
                            </Form.Group>

                            {/* === PROJECT ID === */}
                            <Form.Group className="mb-3">
                                <Form.Label>Project ID (optional)</Form.Label>
                                <Form.Control
                                    name="project_id"
                                    value={formData.project_id}
                                    onChange={handleChange}
                                    placeholder="Enter project ID"
                                />
                            </Form.Group>
                        </div>

                        {/* Requester Info */}
                        <div className="form_section p-3 border rounded mb-3">
                            <div className="d-flex align-items-center mb-3">
                                <div
                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                                    style={{ width: "40px", height: "40px" }}
                                >
                                    SP
                                </div>
                                <div>
                                    <strong>Email</strong>
                                    <p className="mb-0">{formData.email || "Name"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Macros & Details */}
                        <div className="form_section p-3 border rounded mb-3">
                            <Row className="align-items-center mb-3">
                                <Col>
                                    <div className="input-group">
                                        <span className="input-group-text">To:</span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.email}
                                            readOnly
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row className="align-items-center mb-3">
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Type your reply..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                    />
                                </Col>
                                <Col md={2}>
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        onClick={handleReply}
                                        disabled={loading}
                                        style={{ backgroundColor: "#001f3f", borderColor: "#0e032f", color: "#fff" }}
                                    >
                                        {loading ? "Sending..." : "Reply"}
                                    </button>
                                </Col>
                            </Row>


                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search macros by name, tags..."
                                />
                            </div>

                            <div className="mb-3 d-flex gap-3">
                                <span onClick={handleToggleMicroDetails} style={{ cursor: 'pointer' }}>
                                    + Add Tags
                                </span>
                                <span>Contact Reason: + Add</span>
                                <span>Product: + Add</span>
                                <span>Resolution: + Add</span>
                            </div>

                            {showMicroDetails && (
                                <div className="border p-2 rounded">
                                    <Row>
                                        <Col md={4}>
                                            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                <ul className="list-group">
                                                    {[
                                                        "Micro Details 1",
                                                        "Micro Details 2",
                                                        "Micro Details 3",
                                                        "Micro Details 4",
                                                        "Micro Details 5",
                                                        "Micro Details 6",
                                                        "Micro Details 7",
                                                        "Micro Details 8",
                                                        "Micro Details 9",
                                                        "Micro Details 10",
                                                    ].map((detail, idx) => (
                                                        <li
                                                            key={idx}
                                                            className={`list-group-item ${selectedMicroDetail === detail ? "active" : ""}`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => setSelectedMicroDetail(detail)}
                                                        >
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Col>
                                        <Col md={8}>
                                            {selectedMicroDetail ? (
                                                <Form.Control
                                                    as="textarea"
                                                    rows={8}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    placeholder={`Enter details for ${selectedMicroDetail}...`}
                                                />

                                            ) : (
                                                <p className="text-muted">Please select a Micro Detail to edit.</p>
                                            )}
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="d-flex justify-content-end gap-2">
                            <button type="submit" className="btn btn-primary" disabled={loading} onChange={handleSubmit}
                                style={{ backgroundColor: "#001f3f", borderColor: "#0e032f", color: "#fff" }}>
                                {loading ? "Submitting..." : "Send"}
                            </button>
                            <button type="submit" className="btn btn-secondary" disabled={loading}
                                style={{ backgroundColor: "#001f3f", borderColor: "#0e032f", color: "#fff" }}>
                                {loading ? "Submitting..." : "Save and Close"}
                            </button>
                        </div>
                    </Col>

                    {/* === SIDEBAR === */}
                    <Col md={4}>
                        <div className="form-section">
                            <div className="form_section p-3 border rounded mb-3">
                                <h6>Customer Details</h6>
                                <p>Name: Alex</p>
                                <p>Email: xyz@gmail.com</p>
                                <p>Contact Number: (+91) 8393839392</p>
                                <p>Shipping Address: Nashik</p>
                                <p>Billing Address: Same as shipping address</p>
                            </div>

                            <div className="form_section p-3 border rounded mb-3">
                                <h6>Payment Summary</h6>
                                <p>Sub Total: ₹1,125</p>
                                <p>Apply Discounts: ₹0</p>
                                <p>Delivery Charges: Free</p>
                                <p>Tax Estimate: ₹112.5</p>
                                <p>Total: ₹1,237.5</p>
                            </div>

                            <div className="form_section p-3 border rounded mb-3">
                                <h6>Timeline</h6>
                                <p>✔️ Heading - Details</p>
                                <p>✔️ Heading - Details</p>
                                <p>✔️ Heading - Details</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </form>

            {error && <div className="text-danger mt-2">{error}</div>}
            {success && <div className="text-success mt-2">{success}</div>}
        </Layout>
    );

};

export default AddNewTicket;
