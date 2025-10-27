import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const CreateFaq = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "general",
    tags: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert tags from comma-separated string to array
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const payload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      type: formData.type.trim(),
      tags: tagsArray,
      is_active: formData.is_active,
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
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="w-100" style={{ maxWidth: "600px" }}>
          <form
            onSubmit={handleSubmit}
            className="p-4 shadow rounded bg-white"
          >
            <h5 className="mb-4 fw-bold">Create FAQ</h5>

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

            <div className="mb-3">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. project, posting"
              />
            </div>

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
              className="btn btn-primary w-100"
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
