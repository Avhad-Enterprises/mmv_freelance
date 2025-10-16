import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { Form, Button } from "react-bootstrap";
import { makePostRequest, makeGetRequest, makePutRequest } from "../utils/api";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import TextInput from "../components/TextInput";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import DataTable from "../components/DataTable";

const Profile = () => {
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [invitesData, setinvitesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const [activeTab, setActiveTab] = useState("personal");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(null);
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
  const inputRefs = useRef({});

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

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;
      const response = await makeGetRequest(`users/${user_id}`);
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

  useEffect(() => {
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
    return JSON.stringify(userForm) !== JSON.stringify(initialUserForm) || selectedProfilePhoto !== null;
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
        return;
      }
      setSelectedProfilePhoto(file);
    }
  };

  const handleUserProfileSave = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        showErrorToast("User not authenticated.");
        return;
      }

      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;

      // Build FormData
      const fd = new FormData();
      fd.append("user_id", user_id);
      fd.append("first_name", userForm.first_name);
      fd.append("last_name", userForm.last_name);
      fd.append("username", userForm.username);
      fd.append("email", userForm.email);
      fd.append("phone_number", userForm.phone_number);
      fd.append("address_line_first", userForm.address_line_first);
      fd.append("address_line_second", userForm.address_line_second);
      fd.append("city", userForm.city);
      fd.append("state", userForm.state);
      fd.append("country", userForm.country);
      fd.append("pincode", userForm.pincode);

      // Append profile picture if selected
      if (selectedProfilePhoto) {
        fd.append("profile_picture", selectedProfilePhoto);
      } else {
        fd.append("profile_picture", userForm.profile_picture || "");
      }

      // Send request using fetch
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${user_id}`,
        {
          method: "PUT",
          body: fd,
          headers: {
            Authorization: `Bearer ${token}`, // << Add this line
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        showSuccessToast("🎉 Profile updated successfully!");

        // Update displayed profile picture
        setUserData((prev) => ({
          ...prev,
          profile_picture: selectedProfilePhoto
            ? URL.createObjectURL(selectedProfilePhoto)
            : userForm.profile_picture,
        }));

        setSelectedProfilePhoto(null);
      } else {
        showErrorToast(data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showErrorToast("Something went wrong. Please try again.");
    }
  };


  const handleDeleteProfilePic = async () => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete your profile picture?");
      if (!confirmDelete) return;

      const token = localStorage.getItem("jwtToken");
      if (!token) return;

      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;

      // Call API to delete profile picture (set it to null or empty string)
      const response = await makePutRequest(`users/${user_id}`, { profile_picture: "" });

      if (response.data?.success || response.status === 200) {
        showSuccessToast("Profile picture deleted successfully!");
        window.location.reload();
      } else {
        showErrorToast("Failed to delete profile picture.");
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      showErrorToast("Something went wrong. Please try again.");
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

    if (!inviteFirstName || !inviteLastName || !inviteEmail || !inviteTitle) {
      setInviteError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
      setInviteError("Please enter a valid email.");
      return;
    }

    try {
      const res = await makePostRequest("users/invite", {
        first_name: inviteFirstName,
        last_name: inviteLastName,
        email: inviteEmail,
        // department: inviteDept,
        job_title: inviteTitle,
      });

      if (res.data.success) {
        showSuccessToast("✅ Invitation sent!");
        setInviteFirstName("");
        setInviteLastName("");
        setInviteEmail("");
        // setInviteDept("");
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
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="form-control"
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
                  ref={(el) => (inputRefs.current.first_name = el)}
                  label="First Name"
                  placeholder="Enter your first name"
                  name="first_name"
                  value={userForm.first_name}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  ref={(el) => (inputRefs.current.username = el)}
                  label="Username"
                  placeholder="Enter your username"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  ref={(el) => (inputRefs.current.phone_number = el)}
                  type="number"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  name="phone_number"
                  value={userForm.phone_number}
                  onChange={handleUserInputChange}
                  required={true}
                  minLength={10}
                  maxLength={10}

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
                  ref={(el) => (inputRefs.current.last_name = el)}
                  label="Last Name"
                  placeholder="Enter your last name"
                  name="last_name"
                  value={userForm.last_name}
                  onChange={handleUserInputChange}
                  required={true}
                />

                <TextInput
                  ref={(el) => (inputRefs.current.email = el)}
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
                  label="Country"
                  name="country"
                  value={userForm.country}
                  onChange={handleUserInputChange}
                />
                <TextInput
                  label="City"
                  name="city"
                  value={userForm.city}
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
                  <label htmlFor="inviteFirstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="inviteFirstName"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="inviteLastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="inviteLastName"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Enter last name"
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

                {/* <div className="col-md-6 mb-3">
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
                </div> */}

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
                  src={
                    userData.profile_picture ||
                    "https://ae-event-management-bucket.s3.ap-south-1.amazonaws.com/uploads/usericon.jpeg"
                  }
                  alt="Profile"
                  className="rounded-circle d-block mx-auto img-thumbnail"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    // marginBottom: "10px",
                  }}
                />

                {/* ✅ Show delete button only if profile_picture exists */}
                {userData.profile_picture && (
                  <button
                    className="btn btn-sm btn-outline-danger mt-2"
                    onClick={handleDeleteProfilePic}
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                )}
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
                {/* <li>
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
                </li> */}
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