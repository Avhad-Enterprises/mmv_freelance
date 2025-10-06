import React, { useState } from "react";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const SendInvitation = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
      };

      const response = await makePostRequest("users/send-invitation", payload);

      console.log("API Response:", response);

      showSuccessToast(response.data?.message || "Invitation sent successfully!");

      //Reset Form
      setFormData({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
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
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="w-100" style={{ maxWidth: "700px" }}>
          <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white">
            {/* Heading inside form */}
            <h5 className="mb-4 fw-bold">Send Invitation</h5>

            {/* First + Last Name Row */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
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
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit phone number"
              />
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
