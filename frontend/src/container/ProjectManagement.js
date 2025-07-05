import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest } from "../utils/api";
import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DataTable from "../components/DataTable";
import DateInput from "../components/DateInput";
import Button from "../components/Button";

import wallet from "../assets/svg/wallet.svg";
import calender from "../assets/svg/calender.svg";
import channel from "../assets/svg/channel.svg";
import group from "../assets/svg/group.svg";

const Projects = () => {
  const [projectData, setprojectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]); // assume this is your full dataset

  const handleDateChange = (range) => {
    if (!range || range.length === 0) {
      setFilteredData([]);
      return;
    }
  
    setSelectedDates(range);
  
    const formatDateOnly = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
  
    const [start, end] = range.length === 2 ? range.map(formatDateOnly) : [formatDateOnly(range[0]), formatDateOnly(range[0])];
  
    const filtered = allData.filter((item) => {
      if (!item.created_at) return false;
      const itemDate = formatDateOnly(item.created_at);
      return itemDate >= start && itemDate <= end;
    });
  
    console.log("Filtered Editors:", filtered);
    setFilteredData(filtered);
  };  

  useEffect(() => {
    const fetchprojectData = async () => {
      try {
        const response = await makeGetRequest("projectsTask/getactivedeletedprojectstask");
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Parsed Project Data:", data); // Debug log
        setprojectData(data);
        setAllData(data);
      } catch (error) {
        setprojectData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) fetchprojectData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const columns = [
    {
      headname: "Project Id",
      dbcol: "projects_task_id",
      type: "link",
      linkTemplate: "/projectmanagement/edit/:projects_task_id",
      linkLabelFromRow: "project_title",
      linkParamKey: "projects_task_id",
    },
    { headname: "Title", dbcol: "project_title" },
    { headname: "Client", dbcol: "client_id", type: "" },
    { headname: "Editor", dbcol: "editor_id", type: "" },
    {
      headname: "Status",
      dbcol: "is_active",
      type: "badge",
    },
    {
      headname: "Deadline",
      dbcol: "Deadline",
      type: "datetimetime",
    },
    {
      headname: "Budget",
      dbcol: "Budget",
      type: "badge",
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
          {/* <Button buttonType="import" label="Import" />
          <Button buttonType="export" label="Export" /> */}
          <div className="dropdown">
            <Button
              buttonType="add"
              onClick={() => navigate("/projectmanagement/create-project")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Projects in Progress"
              operation="count"
              column="project_title"
              jsonData={projectData}
              icon={calender}
              tooltipText="This shows the count of live blogs"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Completed Projects"
              operation="count"
              column="status"
              jsonData={projectData}
              icon={wallet}
              tooltipText="This shows the count of completed projects"
            />

          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Disputed Projects"
              operation="count"
              column="is_disputed"
              jsonData={projectData}
              customFilter={(item) => item.is_disputed === true}
              icon={channel}
              tooltipText="This shows the count of disputed projects"
            />

          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Milestones Completed"
              operation="total"
              column="milestones" // assuming it's an array in projectData
              jsonData={projectData}
              icon={group}
              tooltipText="This shows total completed milestones"
            />
          </Col>
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : projectData.length === 0 ? (
        <div>No Projects found.</div>
      ) : (
        <DataTable
          id="table1"
          tableRef={tableRef}
          columns={columns}
          data={filteredData.length > 0 ? filteredData : projectData} // ✅ Use filteredData if exists
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

export default Projects;
