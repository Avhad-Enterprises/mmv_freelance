import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import "../dashboard.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { makePostRequest } from "../utils/api";
import { getLoggedInUser } from "../utils/auth";
import { showErrorToast } from "../utils/toastUtils";
import Settings from "./Settings";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ full_name: ""});
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = getLoggedInUser();
        if (!user?.user_id) {
          showErrorToast("Please log in to continue.");
          navigate("/login");
          return;
        }

        const payload = { user_id: parseInt(user.user_id, 10) };
        const response = await makePostRequest(`users/${user.user_id}`, payload);
        const userDetails = response.data?.data;

        if (!userDetails) {
          showErrorToast("User not found.");
          setUserData({ full_name: ""});
          setLoading(false);
          return;
        }

        setUserData({
          full_name: userDetails.full_name || "",
          profile_picture: userDetails.profile_picture || "https://ae-event-management-bucket.s3.ap-south-1.amazonaws.com/uploads/usericon.jpeg",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showErrorToast("Failed to load user data.");
        setUserData({ full_name: "" });
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchUserData();
    } else {
      showErrorToast("Please log in to continue.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = getLoggedInUser();
        const payload = { user_id: user.user_id };

        const response = await makePostRequest("notification/getnotification", payload);
        setNotifications(response.data?.data || []);

        // Count unread
        const countRes = await makePostRequest(`notification/count/${user.user_id}`);
        setUnreadCount(countRes.data?.data || 0);

      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchNotifications();
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await makePostRequest(`notification/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const user = getLoggedInUser();
    try {
      await makePostRequest(`notification/read-all`, { user_id: user.user_id });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // or just remove auth token
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const isDefaultActive = ["/search", "/notification", "/profile"].every(
    (path) => location.pathname !== path
  );

  return (
    <div className="col">
      {/* Main Header */}
      <div className="headview d-flex justify-content-between align-items-center p-5">
        <div>
          <i className="bi bi-brightness-low-fill brightness-icon"></i>
          <a
            href="#0"
            className="hamburger-icon"
            onClick={toggleSidebar}
            aria-label="Toggle hamburger"
          >
            <i className="bi bi-list"></i>
          </a>
        </div>

        <div className="search-container d-flex">
          <div className="search-icon">
            <i className="bi bi-search"></i>
          </div>
          <input type="text" className="search-input" placeholder="Search..." />
        </div>

        <div className="d-flex">
          <div className="d-flex align-items-center position-relative">
            {/* <div className="position-relative me-3">
              <div
                className="notification-icon d-flex"
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => setShowNotificationDropdown((prev) => !prev)}
              >
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && (
                  <span
                    className="badge bg-danger rounded-pill"
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "10px",
                      fontSize: "10px"
                    }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {showNotificationDropdown && (
                <ul
                  className="dropdown-menu dropdown-menu-end notification-dropdown show"
                  aria-labelledby="notificationDropdown"
                  ref={dropdownRef}
                  style={{ position: "absolute", right: 10 }}
                >
                  <li className="notification-title d-flex justify-content-between">
                    Notifications
                    <button className="btn btn-link p-0" onClick={markAllAsRead} style={{ fontSize: "12px" }}>
                      Mark all as read
                    </button>
                  </li>
                  {notifications.length === 0 ? (
                    <li><div className="dropdown-item">No notifications</div></li>
                  ) : (
                    notifications.map((n) => (
                      <li key={n.id}>
                        <div
                          className={`dropdown-item DropDownItems ${n.is_read ? "" : "fw-bold"}`}
                          onClick={() => markAsRead(n.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <strong>{n.title}</strong>: {n.message}
                        </div>
                      </li>
                    ))
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link to="/notification" className="dropdown-item text-primary">
                      See All Notifications
                    </Link>
                  </li>
                </ul>
              )}

            </div> */}
            <div
              className="down-icon d-flex align-items-center"
              onClick={() => setShowDropdown((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-chevron-down me-2"></i>
            </div>
            <div className="daisy-text">
              {loading ? "Loading..." : userData.full_name}
            </div>
            <img
              className="img-thumbnail profile-pic"
              src={userData.profile_picture}
              alt="Profile"
            />
            {showDropdown && (
              <div
                className="dropdown-menu show"
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: "58%",
                  right: 220,
                  marginTop: "10px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minWidth: "180px",
                }}
              >
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/register")}
                >
                  New Registration
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  My Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => setShowSettings(true)}
                >
                  Change Password
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/team-membersr")}
                >
                  Team Member
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/sendinvitation")}
                >
                  Invitation
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
          <Settings show={showSettings} onClose={() => setShowSettings(false)} />
        </div>
        <div className="headview-md">
          <div className="d-flex align-items-center">
            <a
              href="#0"
              className="hamburger-icon"
              onClick={toggleSidebar}
              aria-label="Toggle hamburger"
            >
              <i className="bi bi-list"></i>
            </a>
            <h4 className="card-title p-3">
              Hey {loading ? "User" : userData.full_name}, Welcome Back!
            </h4>
          </div>
          <Row className="sections">
            <Col>
              <a
                href="#0"
                className={isDefaultActive ? "active" : ""}
                onClick={() => navigate("/gb_canteen")}
              >
                <i className="bi bi-grid"></i>
              </a>
            </Col>
            <Col>
              <a
                href="#0"
                className={isActive("/search") ? "active" : ""}
                onClick={() => navigate("/search")}
              >
                <i className="bi bi-search"></i>
              </a>
            </Col>
            <Col>
              <a
                href="#0"
                className={isActive("/notification") ? "active" : ""}
                onClick={() => navigate("/notification")}
              >
                <i className="bi bi-bell"></i>
              </a>
            </Col>
            <Col>
              <a
                href="#0"
                className={isActive("/profile") ? "active" : ""}
                onClick={() => navigate("/profile")}
              >
                <i className="bi bi-person"></i>
              </a>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Header;
