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
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/projectmanagement") ? "active" : ""}`}>
                <Link to="/projectmanagement" className="d-flex align-items-center">
                  <i className="bi bi-menu-button-wide-fill"></i>
                  <div className="LeftMenuHead ml-2">Project Management</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/client") ? "active" : ""}`}>
                <Link to="/client" className="d-flex align-items-center">
                  <i className="bi bi-person-fill"></i>
                  <div className="LeftMenuHead ml-2">Clients</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div
                className={`nav-link d-flex justify-content-between align-items-center ${openDropdowns["editors"] ? "active" : ""}`}
                onClick={() => handleDropdown("editors")}
                style={{ cursor: "pointer" }}
              >
                <span className="d-flex align-items-center">
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/editors" ? "active" : ""}`}
                    to="/editors"
                  >
                    <i className="bi bi-person-workspace"></i>
                    <div className="LeftMenuHead ml-2">Freelancers</div>
                  </Link>
                </span>
                <i
                  className={`bi ${openDropdowns["editors"] ? "bi-chevron-down" : "bi-chevron-right"}`}
                ></i>
              </div>

              {/* Submenu */}
              <ul className={`submenu collapse ${openDropdowns["editors"] ? "show" : ""}`}>
                <li>
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/videoeditorhomepage" ? "active" : ""}`}
                    to="/videoeditorhomepage"
                  >
                    <i className="bi bi-dash"></i>
                    <div className="LeftMenuHead ml-2">Video Editors</div>
                  </Link>
                </li>
                <li>
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/videographerhomepage" ? "active" : ""}`}
                    to="/videographerhomepage"
                  >
                    <i className="bi bi-dash"></i>
                    <div className="LeftMenuHead ml-2">Videographers</div>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/tags") ? "active" : ""}`}>
                <Link to="/tags" className="d-flex align-items-center">
                  <i className="bi bi-tag"></i>
                  <div className="LeftMenuHead ml-2">Tag</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/skill") ? "active" : ""}`}>
                <Link to="/skill" className="d-flex align-items-center">
                  <i className="bi bi-patch-check"></i>
                  <div className="LeftMenuHead ml-2">Skill</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/category") ? "active" : ""}`}>
                <Link to="/category" className="d-flex align-items-center">
                  <i className="bi bi-folder2-open"></i>
                  <div className="LeftMenuHead ml-2">Category</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/faq") ? "active" : ""}`}>
                <Link to="/faq" className="d-flex align-items-center">
                  <i className="bi bi-question-circle"></i>
                  <div className="LeftMenuHead ml-2">FAQ</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div className={`nav-link d-flex align-items-center ${location.pathname.includes("/blog") ? "active" : ""}`}>
                <Link to="/blog" className="d-flex align-items-center">
                  <i className="bi bi-question-circle"></i>
                  <div className="LeftMenuHead ml-2">Blog</div>
                </Link>
              </div>
            </li>

            <li className="nav-item">
              <div
                className={`nav-link d-flex justify-content-between align-items-center ${openDropdowns["cms"] ? "active" : ""
                  }`}
                onClick={() => handleDropdown("cms")}
                style={{ cursor: "pointer" }}
              >
                <span className="d-flex align-items-center">
                  <i className="bi bi-shop" /> {/* or bi-cart3 / bi-bag-check for icon */}
                  <div className="LeftMenuHead ml-2">CMS</div>
                </span>
                <i
                  className={`bi ${openDropdowns["cms"] ? "bi-chevron-down" : "bi-chevron-right"
                    }`}
                />
              </div>

              <ul className={`submenu collapse ${openDropdowns["cms"] ? "show" : ""}`}>
                <li>
                  <Link
                    className={`dropdown-item d-flex align-items-center ${location.pathname === "/cmshome" ? "active" : ""}`}
                    to="/cmshome"
                  >
                    <i className="bi bi-dash"></i>
                    <div className="LeftMenuHead ml-2">Home</div>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <p className="logout">
          <a href="#0">
            Logout <i className="bi mx-1 bi-arrow-right"></i>
          </a>
        </p>
      </div>
    </>
  );
};

export default LeftSidebar;