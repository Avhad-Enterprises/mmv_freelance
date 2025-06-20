import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";
import "../dashboard.css";

const LeftSidebar = ({ isVisible, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Initialize dropdown state based on current route
  const initialDropdownState = {
    events: location.pathname.includes("/events"),
    bookings: location.pathname.includes("/bookings") || location.pathname.includes("/tickets"),
    attendees: location.pathname.includes("/attendees"),
  };
  const [openDropdowns, setOpenDropdowns] = useState(initialDropdownState);
  const isMobile = windowWidth <= 1137;

  const handleDropdown = (dropdownName, path = null) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));

    if (path) {
      navigate(path);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, isMobile, toggleSidebar]);

  return (
    <>
      {isMobile && isVisible && (
        <div
          className="sidebar-overlay"
          onClick={() => toggleSidebar(false)}
        ></div>
      )}
      <div id="left" className={`left ${isVisible ? "show" : ""}`}></div>
      <div
        id="left"
        ref={sidebarRef}
        className={`left-container ${isVisible ? "show" : ""}`}
        style={{ width: "287px" }}
      >
        <div className="d-flex md-user align-items-center">
          <img
            className="img-thumbnail profile-pic"
            src="https://img.freepik.com/free-photo/one-beautiful-woman-smiling-looking-camera-exuding-confidence-generated-by-artificial-intelligence_188544-126053.jpg?t=st=1735450234~exp=1735453834~hmac=a300e3ba21a31cb8631eab23d0b36d09d351e20f240756dc296bd090ab1259b7&w=1380"
            alt="Profile"
          />
          <h6>Daisy</h6>
        </div>

        <Link to="/dashboard" className={`home-text ${location.pathname === "/dashboard" ? "active" : ""}`}>
          <div className="home-rectangle">
            <i className="bi bi-columns-gap home-icon"></i>
            <div className="LeftHeading">Home</div>
          </div>
        </Link>

        <div className="sec mt-3">
          <ul className="p-0">

            <li className="nav-item">
              <div
                className={`nav-link d-flex justify-content-between align-items-center ${openDropdowns["resources"] ? "active" : ""}`}
                onClick={() => handleDropdown("resources")}
              >
                <span className="d-flex align-items-center">
                  <i className="bi bi-journal-text"></i>
                  <div className="LeftMenuHead ml-2">Resources</div>
                </span>
                <i
                  className={`bi ${openDropdowns["resources"] ? "bi-chevron-down" : "bi-chevron-right"}`}
                ></i>
              </div>
              <ul className={`submenu collapse ${openDropdowns["resources"] ? "show" : ""}`}>
                <li>
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/docs" ? "active" : ""}`}
                    to="/docs"
                  >
                    <i className="bi bi-dash"></i>
                    <div className="LeftMenuHead ml-2">Docs</div>
                  </Link>
                </li>
                <li>
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/faqs" ? "active" : ""}`}
                    to="/faqs"
                  >
                    <i className="bi bi-dash"></i>
                    <div className="LeftMenuHead ml-2">FAQs</div>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/sample") ? "active" : ""}`}>
                <Link to="/sample" className="d-flex align-items-center">
                  <i className="bi bi-menu-button-wide-fill"></i>
                  <div className="LeftMenuHead ml-2">Sample</div>
                </Link>
              </div>
            </li>

          </ul>
        </div>

        <p className="logout">
          <a href="#">
            Logout <i className="bi mx-1 bi-arrow-right"></i>
          </a>
        </p>
      </div>
    </>
  );
};

export default LeftSidebar;