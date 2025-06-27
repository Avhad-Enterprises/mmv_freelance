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


const Support = () => {
  const [cscomplaintsData, setCScomplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef();
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between">
        <div className="flex-grow-1 mt-3 d-flex align-items-center">
          <div className="d-flex gap-5 md-date">
            <DateInput label="" type="range" includeTime={false} />
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
              onClick={() => navigate("/events/create-event")}
              label="Add New"
            />
          </div>
        </div>
      </div>

      <div className="card-container gap-4 flex-wrap">
        <Row className="metrix-container">
          <Col xs={4} md={3}>
            <MetricCard
              title="Total Customers"
              operation="count"
              column="event_title"
              jsonData={cscomplaintsData}
              icon={wallet}
              tooltipText="Total number of events"
            />
          </Col>

          <Col xs={4} md={3}>
            <MetricCard
              title="Active Events"
              operation="count"
              column="event_title"
              jsonData={cscomplaintsData}
              icon={wallet}
              tooltipText="Events with active status"
              customFilter={(item) => item.is_active === 1}
            />
          </Col>

          <Col xs={4} md={3}>
            <MetricCard
              title="Upcoming Events"
              operation="count"
              column="event_title"
              jsonData={cscomplaintsData}
              icon={channel}
              tooltipText="Future events based on start date"
              customFilter={(item) => new Date(item.date) > new Date()}
            />
          </Col>
          <Col xs={4} md={3}>
            <MetricCard
              title="Completed Events"
              operation="count"
              column="event_title"
              jsonData={cscomplaintsData}
              icon={group}
              tooltipText="Total events whose date is in the past"
              customFilter={(item) => new Date(item.date) < new Date()}
            />
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Support;
