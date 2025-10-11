import React from "react";

// Reusable ProgressBar Component
const ProgressBar = ({ label, value, colorClass }) => {
  return (
    <div className=" p-0 d-flex flex-column justify-content-between col-3">
      <div className="lite_text">{label}</div>
      <div className="progress w-75">
        <div className={`progress-bar ${colorClass}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

// Main Component: SessionProgress
const SessionProgressCard = ({ data }) => {
  return (
    <div className=" section_card">
      <label className="form-label mb-4">Session by device type</label>
      <div className="row">
        {data.map((item, index) => (
          <ProgressBar
            key={index}
            label={item.label}
            value={item.value}
            colorClass={item.colorClass}
          />
        ))}
      </div>
    </div>
  );
};

export default SessionProgressCard;