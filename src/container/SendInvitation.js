import React, { useState } from "react";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const SendInvitation = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    assigned_role: "CLIENT",
  });
  const [, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nameParts = formData.full_name.trim().split(" ");
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";

      const payload = {
        first_name,
        last_name,
        email: formData.email,
        assigned_role: formData.assigned_role,
        password: formData.password,
      };

      const response = await makePostRequest("admin/invites", payload);

      console.log("API Response:", response);

      showSuccessToast(response.data?.message || "Invitation sent successfully!");

      //Reset Form
      setFormData({
        full_name: "",
        email: "",
        password: "",
        assigned_role: "CLIENT",
      });
    } catch (error) {
      console.error("Failed to send invitation:", error);
      showErrorToast(
        error?.response?.data?.message || "Failed to send invitation. Please try again."
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
        <div className="w-100" style={{ maxWidth: "700px" }}>
          <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
            {/* Heading inside form */}
            <h5 className="mb-4 fw-bold">Send Invitation</h5>

            {/* First + Last Name Row */}
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Assigned Role</label>
              <select
                className="form-control"
                name="assigned_role"
                value={formData.assigned_role}
                onChange={handleChange}
                required
              >
                <option value="CLIENT">Client</option>
                <option value="VIDEOGRAPHER">Videographer</option>
                <option value="VIDEO_EDITOR">Video Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SendInvitation;
