import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";

const CreateTag = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tag_name: "",
    tag_value: "",
    tag_type: "", // e.g., "editor" or "videographer"
    is_active: true,
  });
  const [, setLoading] = useState(false);

  // 🔄 Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🚀 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      setLoading(false);
      return;
    }

    const payload = {
      tag_name: formData.tag_name.trim(),
      tag_value: formData.tag_value.trim(),
      tag_type: formData.tag_type.trim(),
      is_active: formData.is_active,
      created_by: user.user_id,
      updated_by: user.user_id,
    };

    try {
      const response = await makePostRequest("tags", payload);
      showSuccessToast(response.data?.message || "Tag created successfully!");
      navigate("/tags"); // redirect to tag list page
      setFormData({ tag_name: "", tag_value: "", tag_type: "", is_active: true });
    } catch (error) {
      console.error("Create tag error:", error);
      showErrorToast(
        error?.response?.data?.message ||
          "Failed to create tag. Please try again."
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
        <div className="w-100" style={{ maxWidth: "500px" }}>
          <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
            <h5 className="mb-4 fw-bold">Create Tag</h5>

            {/* Tag Name */}
            <div className="mb-3">
              <label className="form-label">Tag Name</label>
              <input
                type="text"
                className="form-control"
                name="tag_name"
                value={formData.tag_name}
                onChange={handleChange}
                required
                placeholder="Enter tag name"
              />
            </div>

            {/* Tag Value */}
            <div className="mb-3">
              <label className="form-label">Tag Value</label>
              <input
                type="text"
                className="form-control"
                name="tag_value"
                value={formData.tag_value}
                onChange={handleChange}
                required
                placeholder="Enter tag value"
              />
            </div>

            {/* Tag Type */}
            <div className="mb-3">
              <label className="form-label">Tag Type</label>
              <select
                className="form-select"
                name="tag_type"
                value={formData.tag_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="blog">blog</option>
                <option value="project">project</option>
              </select>
            </div>

            {/* Active Checkbox */}
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

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100">
              Create Tag
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTag;
