import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormHeader from "../components/FormHeader";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";
import TagInput from "../components/TagInput";

const CreateFaq = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        type: "general",
        tags: [],
        is_active: true,
    });
    const [loading, setLoading] = useState(false);

    // ✅ Handle normal input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // ✅ Handle tags update (from TagInput)
    const handleTagsChange = (newTags) => {
        setFormData((prev) => ({ ...prev, tags: newTags }));
    };

    // ✅ Submit FAQ
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            setLoading(false);
            return;
        }

        // Prepare payload
        const payload = {
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            type: formData.type.trim(),
            tags: formData.tags, // already array from TagInput
            is_active: formData.is_active,
            created_by: user.user_id,
            updated_by: user.user_id,
        };

        try {
            const response = await makePostRequest("faq", payload);
            showSuccessToast(response.data?.message || "FAQ created successfully!");
            navigate("/faq");
        } catch (error) {
            console.error("Create FAQ error:", error);
            showErrorToast(
                error?.response?.data?.message ||
                "Failed to create FAQ. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <FormHeader
                title="Create New FAQ"
                // showAdd
                backUrl="/faq"
                onBack={() => navigate("/faq")}
            />
            <div
                className="container d-flex justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <div className="w-100" style={{ maxWidth: "600px" }}>
                    <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
                        <h5 className="mb-4 fw-bold">Create FAQ</h5>

                        {/* Question */}
                        <div className="mb-3">
                            <label className="form-label">Question</label>
                            <input
                                type="text"
                                className="form-control"
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                required
                                placeholder="Enter FAQ question"
                            />
                        </div>

                        {/* Answer */}
                        <div className="mb-3">
                            <label className="form-label">Answer</label>
                            <textarea
                                className="form-control"
                                name="answer"
                                rows="4"
                                value={formData.answer}
                                onChange={handleChange}
                                required
                                placeholder="Enter FAQ answer"
                            ></textarea>
                        </div>

                        {/* Type */}
                        <div className="mb-3">
                            <label className="form-label">Type</label>
                            <select
                                className="form-select"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="general">General</option>
                                <option value="project">Project</option>
                                <option value="account">Account</option>
                                <option value="payment">Payment</option>
                                <option value="technical">Technical</option>
                            </select>
                        </div>

                        {/* ✅ Tags Input */}
                        <div className="mb-3">
                            <TagInput
                                tags={formData.tags}
                                setTags={handleTagsChange}
                                placeholder="Add tags (e.g., password, account, reset)"
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_active">
                                Active
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn a-btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create FAQ"}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateFaq;
