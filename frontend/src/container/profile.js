import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { Form, Button } from "react-bootstrap";
import { makePostRequest, makeGetRequest } from "../utils/api";
import { getLoggedInUser } from "../utils/auth";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TextInput from "../components/TextInput";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import DataTable from "../components/DataTable";
import FileUploadComponent from "../components/FileUploadComponent";

const Profile = () => {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [invitesData, setinvitesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const [activeTab, setActiveTab] = useState("personal");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    username: "",
    address_line_first: "",
    address_line_second: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const handleUserInputChange = (name, value) => {
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [userData, setUserData] = useState({
    full_name: "",
    profile_picture: "",
  });

  const [initialUserForm, setInitialUserForm] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;
        const decoded = jwtDecode(token);
        const user_id = decoded.user_id;
        const response = await makePostRequest("users/get_user_by_id", { user_id });
        const user = response.data?.data;
        if (user) {
          const full_name = `${user.first_name} ${user.last_name}`;
          setUserData({
            full_name,
            profile_picture: user.profile_picture || "",
          });
        }
        setUserForm({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          username: user.username || "",
          phone_number: user.phone_number || "",
          address_line_first: user.address_line_first || "",
          address_line_second: user.address_line_second || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          pincode: user.pincode || "",
          profile_picture: user.profile_picture || "",
        });
        setInitialUserForm({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          username: user.username || "",
          phone_number: user.phone_number || "",
          address_line_first: user.address_line_first || "",
          address_line_second: user.address_line_second || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          pincode: user.pincode || "",
          profile_picture: user.profile_picture || "",
        });
      } catch (error) {
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          showErrorToast("Please log in to view notifications.");
          return;
        }
        const decoded = jwtDecode(token);
        const user_id = decoded.user_id;
        const response = await makePostRequest("notification/getnotification", { user_id });
        setNotifications(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        showErrorToast("Failed to load notifications.");
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (activeTab === "notification" && localStorage.getItem("jwtToken")) {
      fetchNotifications();
    }
  }, [activeTab]);

  const notificationColumns = [
    { headname: "Title", dbcol: "title" },
    { headname: "Message", dbcol: "message" },
    { headname: "Type", dbcol: "type" },
    {
      headname: "Read Status",
      dbcol: "is_read",
      type: "boolean",
      render: (value) => (value ? "Read" : "Unread"),
    },
    { headname: "Created At", dbcol: "created_at", type: "datetime" },
    {
      headname: "Action",
      dbcol: "id",
      render: (id, row) =>
        !row.is_read && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => markAsRead(id)}
          >
            Mark as Read
          </button>
        ),
    },
  ];

  const markAsRead = async (id) => {
    try {
      await makeGetRequest(`notification/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showSuccessToast("Notification marked as read!");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showErrorToast("Failed to mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;
      await makePostRequest(`notification/read-all`, { user_id });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showSuccessToast("All notifications marked as read!");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showErrorToast("Failed to mark all notifications as read.");
    }
  };

  const isFormChanged = () => {
    return JSON.stringify(userForm) !== JSON.stringify(initialUserForm);
  };

  const handleUserProfileSave = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;

      const payload = {
        user_id,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        username: userForm.username,
        email: userForm.email,
        phone_number: userForm.phone_number,
        address_line_first: userForm.address_line_first,
        address_line_second: userForm.address_line_second,
        city: userForm.city,
        state: userForm.state,
        country: userForm.country,
        pincode: userForm.pincode,
        profile_picture: userForm.profile_picture,
      };

      const response = await makePostRequest("users/update_user_by_id", payload);

      if (response.data?.success || response.status === 200) {
        showSuccessToast("🎉 Profile updated successfully!");
      } else {
        showErrorToast("Something went wrong while updating the profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const response = await makeGetRequest("users/invitations");
        setinvitesData(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        setinvitesData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) fetchEventsData();
  }, []);

  const invitationcolumns = [
    { headname: "Name", dbcol: "full_name" },
    { headname: "Department", dbcol: "department" },
    { headname: "Job Title", dbcol: "job_title" },
    { headname: "Email", dbcol: "email" },
    { headname: "Expiry", dbcol: "expires_at", type: "datetime" },
    {
      headname: "Status",
      dbcol: "used",
      type: "used",
    },
  ];

  const handleInviteSend = async () => {
    setInviteError("");

    if (!inviteName || !inviteEmail || !inviteDept || !inviteTitle) {
      setInviteError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
      setInviteError("Please enter a valid email.");
      return;
    }

    try {
      const res = await makePostRequest("users/invite", {
        full_name: inviteName,
        email: inviteEmail,
        department: inviteDept,
        job_title: inviteTitle,
      });

      if (res.data.success) {
        showSuccessToast("✅ Invitation sent!");
        setInviteName("");
        setInviteEmail("");
        setInviteDept("");
        setInviteTitle("");
      } else {
        setInviteError("Failed to send invite.");
      }
    } catch (err) {
      setInviteError("Something went wrong. Please try again.");
    }
  };

  const [adminUsersData, setAdminUsersData] = useState([]);

  useEffect(() => {
    const fetchAdminUsersData = async () => {
      try {
        const response = await makeGetRequest("users/admin-users/active");
        const rawData = Array.isArray(response.data.data) ? response.data.data : [];

        // Add full_name
        const modifiedData = rawData.map((user) => ({
          ...user,
          full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        }));

        setAdminUsersData(modifiedData);
      } catch (error) {
        setAdminUsersData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) fetchAdminUsersData();
  }, []);

  const AdminusersColumns = [
    { headname: "Name", dbcol: "full_name" },
    { headname: "Email", dbcol: "email" },
    { headname: "Role", dbcol: "role" },
    {
      headname: "Status",
      dbcol: "account_status",
      type: "badge",
    },
  ];


  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <>
            <h5 className="mb-3">Personal Info</h5>

            <Row>
              <Col md={6} className="mb-3">
                <FileUploadComponent
                  name="profile_picture"
                  folderPath="uploads/profile"
                  allowedClasses="image"
                  info="Required Size: 300 x 300px, 500 x 500px, Formats: JPG, PNG, JPEG"
                  multiple={false}
                  onChange={(files) => {
                    const uploadedUrl = files?.[0]?.fileUrl;
                    if (uploadedUrl) {
                      setUserForm((prev) => ({
                        ...prev,
                        profile_picture: uploadedUrl,
                      }));
                    }
                  }}
                />
              </Col>
            </Row>

            <Row>
              <Col className="mb-3">

              </Col>
            </Row>

            <Row>
              <Col>
                <TextInput
                  label="First Name"
                  placeholder="Enter your first name"
                  name="first_name"
                  value={userForm.first_name}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  label="Username"
                  placeholder="Enter your username"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  label="Phone Number"
                  placeholder="Enter phone number"
                  name="phone_number"
                  value={userForm.phone_number}
                  onChange={handleUserInputChange}
                  required={true}
                />
                <TextInput
                  label="Address Line 2"
                  placeholder="Area, Sector, Locality"
                  name="address_line_second"
                  value={userForm.address_line_second}
                  onChange={handleUserInputChange}
                />
                <TextInput
                  label="State"
                  name="state"
                  value={userForm.state}
                  onChange={handleUserInputChange}
                />
                <TextInput
                  label="Pincode"
                  name="pincode"
                  value={userForm.pincode}
                  onChange={handleUserInputChange}
                />
              </Col>
              <Col>
                <TextInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  name="last_name"
                  value={userForm.last_name}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  label="Address Line 1"
                  placeholder="Flat, Building, Street"
                  name="address_line_first"
                  value={userForm.address_line_first}
                  onChange={handleUserInputChange}
                />

                <TextInput
                  label="City"
                  name="city"
                  value={userForm.city}
                  onChange={handleUserInputChange}
                />
                <TextInput
                  label="Country"
                  name="country"
                  value={userForm.country}
                  onChange={handleUserInputChange}
                />


              </Col>

            </Row>
          </>
        );
      case "invitations":
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Invitations</h5>
            </div>

            <div className="form_section mb-4">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="inviteName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="inviteName"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="inviteEmail" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email to invite"
                  />
                  {inviteError && <div className="text-danger mt-1">{inviteError}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="inviteDept" className="form-label">Department</label>
                  <select
                    className="form-select"
                    id="inviteDept"
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {[
                      "Engineering",
                      "Product",
                      "Design",
                      "Marketing",
                      "Sales",
                      "Customer Support",
                      "Finance",
                      "Human Resources",
                      "Legal",
                      "Operations"
                    ].map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="inviteTitle" className="form-label">Job Title</label>
                  <select
                    className="form-select"
                    id="inviteTitle"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                  >
                    <option value="">Select Job Title</option>
                    {[
                      "Software Engineer",
                      "Frontend Developer",
                      "Backend Developer",
                      "Product Manager",
                      "UI/UX Designer",
                      "Marketing Manager",
                      "Sales Executive",
                      "HR Manager",
                      "Customer Support Agent",
                      "Finance Analyst",
                      "Legal Advisor",
                      "Operations Lead"
                    ].map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 d-flex justify-content-end">
                  <button className="btn a-btn-primary" onClick={handleInviteSend}>Send Invite</button>
                </div>
              </div>
            </div>


            {loading ? (
              <div>Loading...</div>
            ) : invitesData.length === 0 ? (
              <div>No invites found.</div>
            ) : (
              <DataTable
                id="table1"
                tableRef={tableRef}
                columns={invitationcolumns}
                data={invitesData}
                defaultView="table"
                searchable
                filterable
                sortable
                paginated
                onFilteredDataChange={(data) => console.log("Filtered Data:", data)}
              />
            )}
          </>
        );

      case "team-members":
        return (
          <>
            <h5 className="mb-3">Team Members</h5>

            {loading ? (
              <div>Loading...</div>
            ) : adminUsersData.length === 0 ? (
              <div>No Data found.</div>
            ) : (
              <DataTable
                id="table1"
                tableRef={tableRef}
                columns={AdminusersColumns}
                data={adminUsersData}
                defaultView="table"
                searchable
                filterable
                sortable
                paginated
                onFilteredDataChange={(data) => console.log("Filtered Data:", data)}
              />
            )}
          </>
        );

      case "settings":
        return (
          <>
            <h5 className="mb-3">Settings</h5>
            <Form>
              <Form.Check type="switch" label="Enable email notifications" className="mb-2" />
              <Form.Check type="switch" label="Enable 2FA login" className="mb-2" />
              <Button variant="primary">Save Preferences</Button>
            </Form>
          </>
        );

      case "notification":
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Notifications</h5>
              {notifications.length > 0 && (
                <button
                  className="btn btn-link text-primary p-0"
                  style={{ fontSize: "0.8rem" }}
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </button>
              )}
            </div>
            {notificationsLoading ? (
              <div>Loading...</div>
            ) : notifications.length === 0 ? (
              <div>No notifications found.</div>
            ) : (
              <DataTable
                id="notificationTable"
                tableRef={tableRef}
                columns={notificationColumns}
                data={notifications}
                defaultView="table"
                searchable
                filterable
                sortable
                paginated
                onFilteredDataChange={(data) => console.log("Filtered Notifications:", data)}
              />
            )}
          </>
        );
      default:
        return <p>Select a menu option</p>;
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-end">
        {isFormChanged() && (
          <Button
            variant="btn a-btn-primary"
            className="ms-auto"
            onClick={handleUserProfileSave}
          >
            Save
          </Button>
        )}
      </div>
      <div className="main-content container py-4">
        <div className="row">
          {/* Left Menu */}
          <div className="col-md-3 mb-3">
            <div className="form_section">
              <div className="d-flex justify-content-center flex-column align-items-center mb-3">
                <img
                  src={userData.profile_picture || "https://img.freepik.com/free-photo/one-beautiful-woman-smiling-looking-camera-exuding-confidence-generated-by-artificial-intelligence_188544-126053.jpg?t=st=1735450234~exp=1735453834~hmac=a300e3ba21a31cb8631eab23d0b36d09d351e20f240756dc296bd090ab1259b7&w=1380"}
                  alt="Profile"
                  className="rounded-circle d-block mx-auto img-thumbnail"
                  style={{ width: "150px", height: "150px", objectFit: "cover", marginBottom: "10px" }}
                />
                <h3 className="d-block mt-2 text-muted fw-bold" style={{ fontSize: "18px" }}>
                  {userData.full_name}
                </h3>
              </div>
              <ul className="list-unstyled profile-menu">
                <li>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("personal");
                    }}
                    className={`d-block mb-2 cursor-pointer ${activeTab === "personal" ? "active-link" : ""}`}
                  >
                    Personal Info
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("invitations");
                    }}
                    className={`d-block mb-2 cursor-pointer ${activeTab === "invitations" ? "active-link" : ""}`}
                  >
                    Invitations
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("team-members");
                    }}
                    className={`d-block mb-2 cursor-pointer ${activeTab === "team-members" ? "active-link" : ""}`}
                  >
                    Team Members
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("settings");
                    }}
                    className={`d-block cursor-pointer ${activeTab === "settings" ? "active-link" : ""}`}
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("notification");
                    }}
                    className={`d-block mb-2 cursor-pointer ${activeTab === "notification" ? "active-link" : ""}`}
                  >
                    Notifications
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="form_section">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;