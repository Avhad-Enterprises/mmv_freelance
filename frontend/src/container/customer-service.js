import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makePostRequest } from "../utils/api";
import DataTable from "../components/DataTable";
import { Row, Col } from "react-bootstrap";
import SocialMediaSelect from "../components/SocialMediaSelect";
import notificationData from "../assets/json/notifications.json";
import campaignData from "../assets/json/campaigns.json";
import NotificationCard from "../components/NotificationCard";
import CampaignCard from "../components/CampaignCard";
import DateInput from "../components/DateInput";
import Button from "../components/Button";

const Customer = () => {
  const tableRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState([]);
  const [setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState("");
  const [setSelectedPlatforms] = useState([]);
  const [setCurrentPreviewIndex] = useState(0);
  const [allData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [setTableKey] = useState(0);
  const [filters, setFilters] = useState([
    { field: "Status", operator: "is", value: "open" },
    { field: "Channel", operator: "is", value: "" },
    { field: "Assignee User", operator: "is", value: "" },
  ]);

  const fieldOptions = ["Status", "Channel", "Assignee User"];
  const operatorOptions = ["is", "is not"];
  const valueOptions = {
    Status: ["open", "closed", "pending"],
    Channel: ["Channel Name", "Email", "Live Chat", "WhatsApp"],
    "Assignee User": ["Name", "John Doe", "Jane Smith", "Support Bot"],
  };

  const handleDateChange = (range) => {
    if (!range || range.length === 0 || !range[0]) {
      setSelectedDates([]);
      setFilteredData([]);
      setIsFiltered(false);
      return;
    }

    setSelectedDates(range);

    const normalizeToLocalMidnight = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const start = normalizeToLocalMidnight(range[0]);
    const end = range.length === 2 ? normalizeToLocalMidnight(range[1]) : start;

    const filtered = allData.filter((item) => {
      if (!item.created_at) return false;
      const itemDate = normalizeToLocalMidnight(new Date(item.created_at));
      return itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
    setIsFiltered(true);
    setTableKey((prev) => prev + 1);
  };

  // Hardcoded for testing; replace with auth system
  const userId = 1; // Replace with dynamic user ID from auth (e.g., localStorage.getItem("user_id"))
  const userRole = "admin"; // Replace with dynamic role from auth

  // Fetch customer data
  const fetchCustomerData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await makePostRequest("support_ticket/get-all", {
        user_id: userId,
        role: userRole,
      });

      console.log("🟢 API Response:", response);

      // Expecting response shape: { tickets: [...] }
      const data = response.tickets || response.data?.tickets || [];
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format: tickets array not found");
      }

      console.log("✅ Fetched Tickets:", data);
      setCustomerData(data);
      setFilteredData(data); // Initialize filteredData with all data
    } catch (error) {
      console.error("❌ Error fetching customer data:", error);
      setError(error.response?.data?.message || "Failed to fetch tickets. Please try again.");
      setCustomerData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for JWT token or other auth mechanism
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      navigate("/login"); // Redirect to login page
      return;
    }

    fetchCustomerData();
  }, [navigate]);

  const columns = [
    { headname: "EMAIL", dbcol: "email", type: "link",
    linkTemplate: "/customerservice/viewticket",
    linkLabelFromRow: "email",
    linkParamKey: "id"},
    { headname: "CUSTOMER DETAIL", dbcol: "user_id" },
    { headname: "USER ASSIGNED", dbcol: "client_id" },
    { headname: "STATUS", dbcol: "status" },
    
  ];

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    setNotifications(notificationData);
  }, []);

  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    setCampaigns(campaignData);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePlatformChange = (selected) => {
    setSelectedPlatforms(selected);
    setCurrentPreviewIndex(0); // Reset preview index when platforms change
  };

  const updateFilter = (index, key, newValue) => {
    const updated = [...filters];
    updated[index][key] = newValue;
    // If field is changed, reset value to first valid option
    if (key === "field") {
      updated[index].value = valueOptions[newValue][0];
    }
    setFilters(updated);
  };

  const handleCreateView = () => {
    console.log("📌 Filters Applied:", filters);
    alert("✅ View Created");
  };

  const handleCancel = () => {
    setFilters([]);
  };

  console.log("Data passed to DataTable:", isFiltered ? filteredData : customerData);

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="mt-3 d-flex align-items-center">
          <div className="d-flex gap-5 md-date">
            <DateInput label="" type="range" includeTime={false} onChange={handleDateChange} />
          </div>
          <div className="mb-2 ps-3 md-refresh">
            <i className="bi bi-arrow-repeat icon-refresh" onClick={handleRefresh}></i>
          </div>
        </div>
        <div className="text-right gap-3 mt-3 ie-btn d-flex">
          <Button buttonType="import" label="Import" />
          <Button buttonType="export" label="Export" />
        </div>
      </div>

      <Row>
        <Col md={6}>
          <div className="form_section">
            <div className="d-flex justify-content-between">
              <h6 className="p-2">Notifications</h6>
              <a href="/notifications">See all</a>
            </div>
            <div className="home_table">
              {notifications.map((notification, index) => (
                <NotificationCard key={index} notification={notification} />
              ))}
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="form_section">
            <div className="d-flex justify-content-between">
              <h6 className="card-title">Agents</h6>
              <a href="/agents">see all</a>
            </div>
            <div className="d-flex flex-row flex-nowrap gap-4 metrix-container overflow-auto">
              {campaigns.map((campaign, index) => (
                <CampaignCard key={index} campaign={campaign} />
              ))}
            </div>
          </div>
          <div className="form-section">
            <SocialMediaSelect onSelectionChange={handlePlatformChange} />
          </div>
        </Col>
      </Row>
      <div className="form_section">
        <h6 className="p-2">Create New View</h6>
        {filters.map((filter, index) => (
          <div className="filter-row" key={index}>
            {index > 0 && <span className="and-label">And</span>}

            <div
              className={`dropdown-group ${index === 0 ? "primary-filter" : ""
                }`}
            >
              <select
                className="dropdown-field"
                value={filter.field}
                onChange={(e) => updateFilter(index, "field", e.target.value)}
              >
                {fieldOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                className="condition-dropdown operator"
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(index, "operator", e.target.value)
                }
              >
                {operatorOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              <select
                className="condition-dropdown value "
                value={filter.value}
                onChange={(e) => updateFilter(index, "value", e.target.value)}
              >
                {valueOptions[filter.field].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <div className="d-flex justify-content-end gap-2">
          <button className="a-btn-primary" onClick={handleCancel}>
            Cancel
          </button>
          <button className="a-btn-primary" onClick={handleCreateView}>
            Create View
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading tickets...</div>
      ) : customerData.length === 0 && !error ? (
        <div>No tickets found.</div>
      ) : (
        <DataTable
          id="ticketTable"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : customerData}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
          onFilteredDataChange={(data) => console.log("Filtered Data in DataTable:", data)}
        />
      )}
    </Layout>
  );
};

export default Customer;