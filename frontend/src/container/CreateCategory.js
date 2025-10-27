import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";

const CreateCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_name: "",
    category_type: "", // e.g., "editor" or "videographer"
    is_active: true,
  });
  const [, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit form
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
      category_name: formData.category_name.trim(),
      category_type: formData.category_type.trim(),
      is_active: formData.is_active,
      created_by: user.user_id,
      updated_by: user.user_id,
    };

    try {
      const response = await makePostRequest("categories", payload);
      showSuccessToast(response.data?.message || "Category created successfully!");
      navigate("/category"); // redirect to category list page
      setFormData({ category_name: "", category_type: "", is_active: true });
    } catch (error) {
      console.error("Create category error:", error);
      showErrorToast(
        error?.response?.data?.message || "Failed to create category. Please try again."
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
          <form
            onSubmit={handleSubmit}
            className="p-4 shadow rounded bg-white"
          >
            <h5 className="mb-4 fw-bold">Create Category</h5>

            <div className="mb-3">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-control"
                name="category_name"
                value={formData.category_name}
                onChange={handleChange}
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category Type</label>
              <select
                className="form-select"
                name="category_type"
                value={formData.category_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="editor">Editor</option>
                <option value="videographer">Videographer</option>
              </select>
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

            <button type="submit" className="btn btn-primary w-100">
              Create Category
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCategory;
