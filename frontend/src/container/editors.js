import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makePostRequest } from "../utils/api"; // Changed to makePostRequest
import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DataTable from "../components/DataTable";
import DateInput from "../components/DateInput";
import Button from "../components/Button";
import { showErrorToast } from "../utils/toastUtils"; // Added for error handling

import wallet from "../assets/svg/wallet.svg";
import calender from "../assets/svg/calender.svg";
import channel from "../assets/svg/channel.svg";
import group from "../assets/svg/group.svg";

const Editors = () => {
  const [editorsData, setEditorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]); // assume this is your full dataset
  const [isFiltered, setIsFiltered] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const handleDateChange = (range) => {
    if (!range || range.length === 0 || !range[0]) {
      setSelectedDates([]);
      setFilteredData([]);
      setIsFiltered(false); // No filter
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
    setTableKey(prev => prev + 1); // 👈 Force remount
  };


  useEffect(() => {
    const fetcheditorData = async () => {
      try {
        // Use makePostRequest to match backend route
        const response = await makeGetRequest("users/freelancers/active");
        console.log("Editors API Response:", response); // Debug log
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log("Parsed Editor Data:", data); // Debug log
        setEditorsData(data);
        setAllData(data);
      } catch (error) {
        console.error("Error fetching editors:", error);
        showErrorToast("Failed to load editor data.");
        setEditorsData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetcheditorData();
    } else {
      showErrorToast("Please log in to view editors.");
      navigate("/login");
    }
  }, [navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Updated columns to match expected API response fields
  const columns = [
    {
      headname: "Editor ID",
      dbcol: "user_id",
      type: "link",
      linkTemplate: "/editors/edit/:user_id",
      linkLabelFromRow: "first_name", // Changed to use name for link label
      linkParamKey: "user_id",
    },
    {
      headname: "Name",
      dbcol: "first_name", // Updated to match API response
      type: "",
    },
    {
      headname: "Projects Handled",
      dbcol: "projects_completed", // Updated to match a likely field name
      type: "",
    },
    {
      headname: "Rating",
      dbcol: "review_id", // Updated to match a likely field name
      type: "",
    },
    {
      headname: "Status",
      dbcol: "is_active",
      type: "badge",
    },
    {
      headname: "Joined Date",
      dbcol: "created_at",
      type: "datetimetime",
    },
  ];


  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="mt-3 d-flex align-items-center">
          <div className="d-flex gap-5 md-date">
            <DateInput label="" type="range" includeTime={false} onChange={handleDateChange} />
          </div>
          <div className="mb-2 ps-3 md-refresh">
            <i
              className="bi bi-arrow-repeat icon-refresh"
              onClick={handleRefresh}
            ></i>
          </div>
        </div>
        <div className="text-right gap-3 mt-3 ie-btn d-flex">
          <div className="dropdown">
            <Button
              buttonType="add"
              onClick={() => navigate("/editor/create-project")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Active Editors"
              operation="count"
              column="is_active"
              jsonData={editorsData}
              customFilter={(item) => item.is_active === 1} // Filter active editors
              icon={calender}
              tooltipText="This shows the count of active editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Assign Projects"
              operation="sum"
              column="projects_posted"
              jsonData={editorsData}
              icon={wallet}
              tooltipText="This shows the total number of projects posted"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Pending Reviews"
              operation="sum"
              column="total_spend" // Updated to match a likely field name
              jsonData={editorsData}
              icon={channel}
              tooltipText="This shows the total spend by editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Editor Ratings"
              operation="average"
              column="average_rating" // Updated to match a likely field name
              jsonData={editorsData}
              icon={group}
              tooltipText="This shows the average editor rating"
            />
          </Col>
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : editorsData.length === 0 ? (
        <div>No Editors found.</div>
      ) : (
        <DataTable
          key={tableKey} // 👈 This forces re-render
          id="table1"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : editorsData}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
          onFilteredDataChange={(data) => console.log("Filtered Data:", data)}
        />

      )}
    </Layout>
  );
};

export default Editors;