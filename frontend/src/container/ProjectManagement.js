import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makePostRequest } from "../utils/api";
import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DataTable from "../components/DataTable";
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
  const [filteredData] = useState([]);
  const [isFiltered] = useState(false);
  const [tableKey] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const fetchprojectData = async () => {
      try {
        const response = await makeGetRequest("projectsTask/getallprojects_task");
        const data = Array.isArray(response.data.data) ? response.data.data : [];

        // Combine first and last names
        const formattedData = data.map((item) => ({
          ...item,
          client_name: `${item.client_first_name || ''} ${item.client_last_name || ''}`.trim(),
          editor_name: `${item.editor_first_name || ''} ${item.editor_last_name || ''}`.trim(),
        }));

        for (const project of formattedData) {
          try {
            const countRes = await makePostRequest(
              "applications/projects/get-application-count",
              { projects_task_id: project.projects_task_id }
            );
            project.count = countRes.data?.count || 0;
          } catch (err) {
            console.error(`Failed to get count for project ${project.projects_task_id}`, err);
            project.count = 0;
          }
        }

        console.log("Formatted Project Data:", formattedData); // Debug log
        setprojectData(formattedData);
      } catch (error) {
        setprojectData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) fetchprojectData();
  }, []);

  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const response = await makeGetRequest("applications/projects/completed-count");
        console.log("Completed Projects Count: ",response);
        setCompletedCount(response.data?.count || 0);
      } catch (error) {
        console.error("Failed to fetch completed projects count", error);
        setCompletedCount(0);
      }
    };

    if (localStorage.getItem("jwtToken")) fetchCompletedProjects();
  }, []);


  const columns = [
    // {
    //   headname: "Project Id",
    //   dbcol: "projects_task_id",
    //   type: "link",
    //   linkTemplate: "/projectmanagement/edit/:projects_task_id",
    //   linkLabelFromRow: "project_title",
    //   linkParamKey: "projects_task_id",
    // },
    {
      headname: "Title",
      dbcol: "project_title",
      type: "link",
      linkTemplate: "/projectmanagement/edit/:projects_task_id",
      linkLabelFromRow: "project_title",
      linkParamKey: "projects_task_id",
    },
    { headname: "Client Name", dbcol: "client_name", type: "" },
    {
      headname: "Editor Name",
      dbcol: "editor_name",
      type: "",
    },
    {
      headname: "Application",
      dbcol: "count",
      type: "link",
      linkTemplate: "/projectmanagement/:projects_task_id",
      linkLabelFromRow: "count",
      linkParamKey: "projects_task_id",
    },
    {
      headname: "Status",
      dbcol: "is_active",
      type: "badge",
    },
    {
      headname: "Deadline",
      dbcol: "deadline",
      type: "date",
    },
    {
      headname: "Budget",
      dbcol: "budget",
      type: "badge",
    },
  ];

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="mt-3 d-flex align-items-center">
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
          <Col xs={4} md={4}>
            <MetricCard
              title="Projects in Progress"
              operation="count"
              column="is_active"
              jsonData={projectData}
              customFilter={(item) => item.is_active === 1}
              icon={calender}
              tooltipText="This shows the count of live blogs"
            />
          </Col>
          <Col xs={4} md={4}>
            <MetricCard
              title="Completed Projects"
              operation="total"
              column="count"
              jsonData={[{ count: completedCount }]}
              // customFilter={(row) => row.status === "completed"}
              icon={wallet}
              tooltipText="This shows the count of completed projects"
            />

          </Col>
          <Col xs={4} md={4}>
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
          {/* <Col xs={4} md={3}>
            <MetricCard
              title="Milestones Completed"
              operation="total"
              column="milestones" // assuming it's an array in projectData
              jsonData={projectData}
              icon={group}
              tooltipText="This shows total completed milestones"
            />
          </Col> */}
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : projectData.length === 0 ? (
        <div>No Projects found.</div>
      ) : (
        <DataTable
          key={tableKey} // 👈 This forces re-render
          id="table1"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : projectData}
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
