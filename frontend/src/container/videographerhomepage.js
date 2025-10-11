import React, { useState, useEffect, useRef } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest } from "../utils/api";
import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast } from "../utils/toastUtils";

import wallet from "../assets/svg/wallet.svg";
import calender from "../assets/svg/calender.svg";
import channel from "../assets/svg/channel.svg";
import group from "../assets/svg/group.svg";

const VideoGraphers = () => {
  const [grapherData, setGrapherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [filteredData] = useState([]);
  const [isFiltered] = useState(false);
  const [tableKey] = useState(0);

  useEffect(() => {
    const fetchGrapherData = async () => {
      try {
        // 👇 Update this endpoint according to your backend route
        const response = await makeGetRequest("videographers/getvideographers");
        console.log("Videographers API Response:", response);

        const data = Array.isArray(response.data?.data)
          ? response.data.data.map((grapher) => ({
              ...grapher,
              full_name: `${grapher.first_name || ""} ${grapher.last_name || ""}`.trim(),
            }))
          : [];

        console.log("Parsed Videographer Data:", data);

        setGrapherData(data);
      } catch (error) {
        console.error("Error fetching videographers:", error);
        showErrorToast("Failed to load videographer data.");
        setGrapherData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchGrapherData();
    } else {
      showErrorToast("Please log in to view videographers.");
      navigate("/login");
    }
  }, [navigate]);

  const columns = [
    {
      headname: "Name",
      dbcol: "full_name",
      type: "link",
      linkTemplate: "/videographer/edit/:user_id",
      linkLabelFromRow: "full_name",
      linkParamKey: "user_id",
    },
    {
      headname: "Projects Done",
      dbcol: "projects_done",
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
        <div className="mt-3 d-flex align-items-center"></div>
        <div className="text-right gap-3 mt-3 ie-btn d-flex">
          <div className="dropdown">
            <Button
              buttonType="add"
              onClick={() => navigate("/editors/videographers")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Active Videographers"
              operation="count"
              column="is_active"
              jsonData={grapherData}
              customFilter={(item) => item.is_active === true}
              icon={calender}
              tooltipText="This shows the count of active videographers"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Projects Done"
              operation="total"
              column="projects_done"
              jsonData={grapherData}
              icon={wallet}
              tooltipText="This shows the total number of projects completed"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Average Rating"
              operation="average"
              column="rating"
              jsonData={grapherData}
              icon={channel}
              tooltipText="This shows the average rating of videographers"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Total Earnings"
              operation="sum"
              column="total_earnings"
              jsonData={grapherData}
              icon={group}
              tooltipText="This shows the total earnings of all videographers"
            />
          </Col>
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : grapherData.length === 0 ? (
        <div>No videographers found.</div>
      ) : (
        <DataTable
          key={tableKey}
          id="table3"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : grapherData}
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

export default VideoGraphers;
