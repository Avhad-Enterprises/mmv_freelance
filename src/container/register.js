import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { makePostRequest, makeGetRequest } from "../utils/api";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import "../login-page.css";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isInvitation, setIsInvitation] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (tokenValue) => {
    setVerifying(true);
    setTokenError("");
    
    try {
      const response = await makeGetRequest(
        `admin/invites/verify?token=${encodeURIComponent(tokenValue)}`
      );
      
      // Pre-fill email from invitation
      setFormData(prev => ({
        ...prev,
        email: response.data.data.email
      }));
      setIsInvitation(true);
    } catch (error) {
      setTokenError(
        error.response?.data?.message || "Invalid or expired invitation token"
      );
      showErrorToast(
        error.response?.data?.message || "Invalid invitation token"
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      showErrorToast("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      showErrorToast("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    let payload, endpoint, successMessage;
    
    if (isInvitation) {
      // Handle invitation acceptance with new API
      payload = {
        token: token,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      };
      endpoint = "admin/invites/register";
      successMessage = "Registration completed successfully!";
    } else {
      // Handle regular registration
      payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        assigned_role: "CLIENT",
      };
      endpoint = "auth/register";
      successMessage = "Registration successful! Please log in.";
    }

    try {
      const response = await makePostRequest(endpoint, payload);
      showSuccessToast(response.data.message || successMessage);
      
      if (isInvitation && response.data.data?.token) {
        // Auto-login for invitation acceptance
        localStorage.setItem("jwtToken", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Redirect to login for regular registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      showErrorToast(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show verifying state
  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Verifying Invitation...</h2>
          </div>
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (token && tokenError && !isInvitation) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Invalid Invitation</h2>
          </div>
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {tokenError}
          </div>
          <button 
            className="btn btn-primary w-100" 
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            {isInvitation ? "Complete Admin Registration" : "Create Account"}
          </h2>
          <p className="auth-subtitle">
            {isInvitation
              ? "Complete your registration to join as an administrator"
              : "Join the MMV Freelance platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isInvitation && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person me-2"></i>
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-envelope me-2"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <small className="form-text">
                    Password must be at least 8 characters
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </>
          )}

          {isInvitation && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person me-2"></i>
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    minLength={2}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-envelope me-2"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                  style={{ backgroundColor: "#f7fafc", cursor: "not-allowed" }}
                />
                <small className="form-text">
                  This email is from your invitation
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <small className="form-text">
                    Minimum 8 characters
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirm_password"
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                {isInvitation ? "Accept Invitation" : "Create Account"}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?
            <button className="link-button" onClick={() => navigate("/login")}>
              Sign in here
            </button>
          </p>
          <button className="link-button" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-1"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
