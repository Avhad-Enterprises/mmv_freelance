import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import "../login-page.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      navigate(`/register?token=${token}`);
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Email are required.");
      return;
    }
    if (!password) {
      setErrorMessage("password are required.");
      return;
    }

    try {
      const response = await axios.post(
        // "http://13.235.113.131:8000/api/v1/users/login",
        "https://api.makemyvid.io/api/v1/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { data } = response.data;

      if (data?.token) {
        localStorage.setItem("jwtToken", data.token);
        // const decoded = jwtDecode(data.token);
        const fullName = `${data.user.first_name} ${data.user.last_name}`;

        showSuccessToast(`🎉 Welcome, ${fullName}!`);
        navigate("/dashboard");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage("Email not found.");
      } else if (error.response?.status === 401) {
        setErrorMessage("Incorrect password.");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-envelope me-2"></i>
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="bi bi-lock me-2"></i>
              Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-100">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Sign In
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? 
            <button 
              className="link-button" 
              onClick={() => navigate("/register")}
            >
              Register here
            </button>
          </p>
          <button 
            className="link-button" 
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;