import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest } from "../utils/api"; // Changed to makePostRequest
import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast } from "../utils/toastUtils"; // Added for error handling

import wallet from "../assets/svg/wallet.svg";
import calender from "../assets/svg/calender.svg";
import channel from "../assets/svg/channel.svg";
import group from "../assets/svg/group.svg";

const Clients = () => {
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [filteredData] = useState([]);
  const [isFiltered] = useState(false);
  const [tableKey] = useState(0);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Use makePostRequest to match backend route
        const response = await makeGetRequest("users/client/active");
        console.log("Clients API Response:", response); // Debug log
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log("Parsed Client Data:", data); // Debug log

        const clientsWithCounts = await Promise.all(
          data.map(async (client) => {
            try {
              const res = await makeGetRequest(`projectsTask/count/client/${client.user_id}`);
              console.log("Client:",client.user_id, "API Response:", res.data);
              return { ...client, projects_posted: res.data?.projects_count || 0 };
            } catch (err) {
              console.error(`Error fetching project count for client ${client.user_id}`, err);
              return { ...client, projects_posted: 0 };
            }
          })
        );
        setClientData(clientsWithCounts);
      } catch (error) {
        console.error("Error fetching clients:", error);
        showErrorToast("Failed to load client data.");
        setClientData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchClientData();
    } else {
      showErrorToast("Please log in to view clients.");
      navigate("/login");
    }
  }, [navigate]);

  // useEffect(() => {
  //   const fetchProjectCount = async () => {
  //     try {
  //       const res = await makeGetRequest("projectsTask/countbyprojects_task");
  //       console.log("Project Count API:", res.data);
  //       setTotalProjects(res.data?.count || 0);
  //     } catch (err) {
  //       console.error("Error fetching project count:", err);
  //       setTotalProjects(0);
  //     }
  //   };

  //   fetchProjectCount();
  // }, []);


  const columns = [
    {
      headname: "Client ID",
      dbcol: "user_id",
      type: "link",
      linkTemplate: "/client/edit/:user_id",
      linkLabelFromRow: "first_name", // Changed to use name for link label
      linkParamKey: "user_id",
    },
    {
      headname: "Name",
      dbcol: "full_name", // Updated to match API response
      type: "",
    },
    {
      headname: "Projects Posted",
      dbcol: "projects_posted", // Updated to match a likely field name
      type: "",
    },
    // {
    //   headname: "Rating",
    //   dbcol: "review_id", // Updated to match a likely field name
    //   type: "",
    // },
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
        </div>
        <div className="text-right gap-3 mt-3 ie-btn d-flex">
          <div className="dropdown">
            <Button
              buttonType="add"
              onClick={() => navigate("/client/add-new-client")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Active Clients"
              operation="count"
              column="is_active"
              jsonData={clientData}
              customFilter={(item) => item.is_active === true} // Filter active clients
              icon={calender}
              tooltipText="This shows the count of active clients"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Projects Posted"
              operation="total"
              column="projects_posted"
              jsonData={clientData}
              icon={wallet}
              tooltipText="This shows the total number of projects posted"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Total Spend"
              operation="sum"
              column="total_spend" // Updated to match a likely field name
              jsonData={clientData}
              icon={channel}
              tooltipText="This shows the total spend by clients"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Client Ratings"
              operation="average"
              column="average_rating" // Updated to match a likely field name
              jsonData={clientData}
              icon={group}
              tooltipText="This shows the average client rating"
            />
          </Col>
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : clientData.length === 0 ? (
        <div>No clients found.</div>
      ) : (
        <DataTable
          key={tableKey} 
          id="table1"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : clientData}
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

export default Clients;