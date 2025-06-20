import React from "react";
import "../dashboard.css";

const StatusBadge = ({ status }) => {
  const statusClass =
    status === "Active" ? "status-badge active" : "status-badge inactive";

  return <span className={statusClass}>{status}</span>;
};

export default StatusBadge;
