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

const VideoEditors = () => {
  const [editorData, setEditorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [filteredData] = useState([]);
  const [isFiltered] = useState(false);
  const [tableKey] = useState(0);

  useEffect(() => {
    const fetchEditorData = async () => {
      try {
        const response = await makeGetRequest("videoeditors/getvideoeditors");
        console.log("Editors API Response:", response);

        const data = Array.isArray(response.data?.data)
          ? response.data.data.map((editor) => ({
            ...editor,
            full_name: `${editor.first_name || ""} ${editor.last_name || ""}`.trim(),
          }))
          : [];

        console.log("Parsed Editor Data:", data);

        setEditorData(data);
      } catch (error) {
        console.error("Error fetching editors:", error);
        showErrorToast("Failed to load editor data.");
        setEditorData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchEditorData();
    } else {
      showErrorToast("Please log in to view editors.");
      navigate("/login");
    }
  }, [navigate]);

  const columns = [
    {
      headname: "Name",
      dbcol: "full_name",
      type: "link",
      linkTemplate: "/videoeditorhomepage/edit/:user_id",
      linkLabelFromRow: "full_name",
      linkParamKey: "user_id",
    },
    {
      headname: "Projects Done",
      dbcol: "projects_completed",
      type: "",
      render: (row) => row.projects_done || "-",
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
              onClick={() => navigate("/editors/video")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Active Video Editors"
              operation="count"
              column="is_active"
              jsonData={editorData}
              customFilter={(item) => item.is_active === true}
              icon={calender}
              tooltipText="This shows the count of active editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Projects Done"
              operation="total"
              column="projects_done"
              jsonData={editorData}
              icon={wallet}
              tooltipText="This shows the total number of projects completed"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Average Rating"
              operation="average"
              column="rating"
              jsonData={editorData}
              icon={channel}
              tooltipText="This shows the average rating of editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Total Earnings"
              operation="sum"
              column="total_earnings"
              jsonData={editorData}
              icon={group}
              tooltipText="This shows the total earnings of all editors"
            />
          </Col>
        </Row>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : editorData.length === 0 ? (
        <div>No editors found.</div>
      ) : (
        <DataTable
          key={tableKey}
          id="table2"
          tableRef={tableRef}
          columns={columns}
          data={isFiltered ? filteredData : editorData}
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

export default VideoEditors;
