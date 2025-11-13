import React from "react";
import { useNavigate } from "react-router-dom";
import "../login-page.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="homepage-header">
          <h1 className="homepage-title">MMV Freelance</h1>
          <h2 className="homepage-subtitle">Admin Panel</h2>
        </div>
        
        <p className="homepage-description">
          Welcome to the MMV Freelance Administration Portal. 
          Manage projects, clients, freelancers, and more from one central dashboard.
        </p>

        <div className="homepage-actions">
          <button 
            className="btn-primary" 
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/register")}
          >
            <i className="bi bi-person-plus me-2"></i>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;