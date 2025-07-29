import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import Aetextarea from "../components/Aetextarea";
import axios from "axios";
import { makePostRequest } from "../utils/api";

const ViewTicket = () => {
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

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const res = await makePostRequest("support_ticket/details", {
                    ticket_id: 1, // replace with your ticket ID
                    requester_role: "client",
                });
                const ticket = res.data.ticket;
                setFormData({
                    ...formData,
                    ticket_id: ticket.id,
                    user_id: ticket.user_id,
                    email: ticket.email,
                    subject: ticket.subject,
                    description: ticket.description,
                    ticket_category: ticket.ticket_category,
                    // any other fields...
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchTicketDetails();
    }, []);

    const [customerData, setCustomerData] = useState({
        name: "Alex",

        phone: "N/A",
        shipping: "N/A",
        billing: "N/A",
    });

    const [paymentSummary, setPaymentSummary] = useState({
        subtotal: 1125,
        discount: 0,
        delivery: "Free",
        tax: 112.5,
        total: 1237.5,
    });

    const [timeline, setTimeline] = useState([
        { completed: false, heading: "Heading", details: "Details", date: "Date & Time" },
        { completed: true, heading: "Heading", details: "Details", date: "Date & Time" },
        { completed: true, heading: "Heading", details: "Details", date: "Date & Time" },
    ]);


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
                                    <p className="mb-0">{formData.email || ""}</p>
                                    <strong>Description</strong>
                                    <p className="mb-0">{formData.description || ""}</p>
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

                        {/* === CUSTOMER DETAILS === */}
                        <div className="form_section">
                            <h6 className="fw-bold mb-3">Customer Details</h6>
                            <div className="d-flex align-items-center mb-3">
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="Profile"
                                    className="rounded-circle me-2"
                                    width={40}
                                    height={40}
                                />
                                <div>
                                    <p className="mb-0 fw-bold">{customerData.name}</p>
                                    <a
                                        href={`mailto:${formData.email}`}
                                        className="text-decoration-none small text-dark"
                                    >
                                        {formData.email}
                                    </a>
                                </div>
                            </div>
                            <p className="mb-1"><strong>Contact Number</strong></p>
                            <p className="mb-1">{customerData.phone}</p>
                            <p className="mb-1"><strong>Shipping Address</strong></p>
                            <p className="mb-1">{customerData.shipping}</p>
                            <p className="mb-1"><strong>Billing Address</strong></p>
                            <p className="mb-0">{customerData.billing}</p>
                        </div>

                        {/* === PAYMENT SUMMARY === */}
                        <div className="form_section">
                            <h6 className="fw-bold mb-3">Payment Summary</h6>
                            <div className="d-flex justify-content-between mb-1">
                                <span>Sub Total</span>
                                <span>₹{paymentSummary.subtotal}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span className="text-primary" style={{ cursor: "pointer" }}>
                                    Apply Discounts
                                </span>
                                <span>₹{paymentSummary.discount}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span>Delivery Charges</span>
                                <span>{paymentSummary.delivery}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <span>Tax Estimate (10%)</span>
                                <span>₹{paymentSummary.tax}</span>
                            </div>
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total</span>
                                <span>₹{paymentSummary.total}</span>
                            </div>
                        </div>

                        {/* === TIMELINE === */}
                        <div className="form_section">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0">Timeline</h6>
                                <a href="#" className="small" style={{color: "#089CFF"}}>View All</a>
                            </div>
                            <div>
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="d-flex mb-3">
                                        <div className="me-2">
                                            {item.completed ? (
                                                <span className="bi bi-check-circle-fill" style={{ fontSize: "32px", color: "#9CDDA6" }}></span>
                                            ) : (
                                                <span className="bi bi-arrow-clockwise" style={{ fontSize: "32px", color: "#FFE990" }}></span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="mb-1 fw-bold">{item.heading}</p>
                                            <p className="mb-1 small">{item.details}</p>
                                            <p className="mb-0 small text-muted">{item.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </Col>


                </Row>
            </form>

            {error && <div className="text-danger mt-2">{error}</div>}
            {success && <div className="text-success mt-2">{success}</div>}
        </Layout >
    );
};

export default ViewTicket;
