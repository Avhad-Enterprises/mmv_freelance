import React, { useState } from "react";
import Layout from "./layout";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";

const SendInvitation = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email };

      const response = await makePostRequest("admin/invites", payload);

      console.log("API Response:", response);

      showSuccessToast(response.data?.message || "Invitation sent successfully!");

      // Reset Form
      setEmail("");
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
            <h5 className="mb-4 fw-bold">Send Admin Invitation</h5>
            <p className="text-muted mb-4">
              Enter the email address of the person you'd like to invite as an admin.
              They will receive an email with a registration link.
            </p>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="newadmin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <small className="form-text text-muted">
                The recipient will complete their registration details via email
              </small>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SendInvitation;
