import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { showSuccessToast } from "../utils/toastUtils";
import "../login-page.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
        "http://localhost:8000/api/v1/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { data } = response.data;

      if (data?.token) {
        localStorage.setItem("jwtToken", data.token);
        const decoded = jwtDecode(data.token);
        const fullName = `${decoded.first_name} ${decoded.last_name}`;

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
    <div className="login-container">
      <div className="login-card">
        <h3 className="login-title">Login</h3>
        {errorMessage && <div className="error">{errorMessage}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;