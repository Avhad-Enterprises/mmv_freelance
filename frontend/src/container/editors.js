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

const Editors = () => {
  const [editorsData, setEditorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();
  const [filteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [isFiltered] = useState(false);
  const [tableKey] = useState(0);

  useEffect(() => {
    const fetcheditorData = async () => {
      try {
        const response = await makeGetRequest("freelancers/getfreelancers");
        console.log("Editors API Response:", response);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log("Parsed Editor Data:", data);
        const formattedData = data.map((item) => ({
          ...item,
          full_name: `${item.first_name || ""} ${item.last_name || ""}`.trim(),
        }));
        setEditorsData(formattedData);
        setAllData(formattedData);
      } catch (error) {
        console.error("Error fetching editors:", error);
        showErrorToast("Failed to load editor data.");
        setEditorsData([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchEditorCounts = async () => {
      try {
        const response = await makeGetRequest("videoeditors/available");
        const counts = Array.isArray(response.data?.data) ? response.data.data : [];

        // Merge counts into editorsData
        setEditorsData((prevEditors) =>
          prevEditors.map((editor) => {
            const match = counts.find((c) => c.editor_id === editor.user_id);
            return { ...editor, task_count: match?.task_count ?? 0 };
          })
        );
      } catch (error) {
        console.error("Error fetching editor project counts:", error);
        showErrorToast("Failed to load editor project counts.");
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetcheditorData();
      fetchEditorCounts();
    } else {
      showErrorToast("Please log in to view editors.");
      navigate("/login");
    }
  }, [navigate]);

  // useEffect(() => {
  //   const fetchEditorCounts = async () => {
  //     try {
  //       const response = await makeGetRequest("users/geteditorcount/active");
  //       const counts = Array.isArray(response.data?.data) ? response.data.data : [];

  //       // Merge counts into editorsData
  //       setEditorsData((prevEditors) =>
  //         prevEditors.map((editor) => {
  //           const match = counts.find((c) => c.editor_id === editor.user_id);
  //           return { ...editor, task_count: match?.task_count ?? 0 };
  //         })
  //       );
  //     } catch (error) {
  //       console.error("Error fetching editor project counts:", error);
  //       showErrorToast("Failed to load editor project counts.");
  //     }
  //   };

  //   if (localStorage.getItem("jwtToken")) {
  //     fetchEditorCounts();
  //   }
  // }, []);


  const columns = [
    // {
    //   headname: "Editor ID",
    //   dbcol: "user_id",
    //   type: "link",
    //   linkTemplate: "/editors/edit/:user_id",
    //   linkLabelFromRow: "full_name", // Changed to use name for link label
    //   linkParamKey: "user_id",
    // },
    {
      headname: "Name",
      dbcol: "full_name", // Updated to match API response
      type: "link",
      linkTemplate: "/editors/edit/:user_id",
      linkLabelFromRow: "full_name",
      linkParamKey: "user_id",
    },
    {
      headname: "Projects Handled",
      dbcol: "task_count", // Updated to match a likely field name
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
      type: "date",
    },
  ];


  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="mt-3 d-flex align-items-center">
        </div>
        {/* <div className="text-right gap-3 mt-3 ie-btn d-flex">
          <div className="dropdown">
            <Button
              buttonType="add"
              onClick={() => navigate("/editor/add-new-editors")}
              label="Add New"
            />
          </div>
        </div> */}
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Active Freelancers"
              operation="count"
              column="is_active"
              jsonData={editorsData}
              customFilter={(item) => item.is_active === true} // Filter active editors
              icon={calender}
              tooltipText="This shows the count of active editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Assign Projects"
              operation="total"
              column="task_count"
              jsonData={editorsData}
              icon={wallet}
              tooltipText="This shows the total number of projects posted"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Total Spend"
              operation="sum"
              column="total_spend" // Updated to match a likely field name
              jsonData={editorsData}
              icon={channel}
              tooltipText="This shows the total spend by editors"
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Client Ratings"
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
          key={tableKey}
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