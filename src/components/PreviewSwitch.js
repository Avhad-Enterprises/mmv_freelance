import React from "react";

// Reusable Component for toggling views (desktop/mobile)
const PreviewSwitch = ({ activeView, setActiveView }) => {
  return (
    <div className="view-buttons">
      <button
        className={`btn btn-view ${activeView === "desktop" ? "active" : ""}`}
        onClick={() => setActiveView("desktop")}
      >
        <i className="bi bi-pc-display-horizontal"></i>
      </button>
      <button
        className={`btn btn-view ${activeView === "mobile" ? "active" : ""}`}
        onClick={() => setActiveView("mobile")}
      >
        <i className="bi bi-phone"></i>
      </button>
    </div>
  );
};

export default PreviewSwitch;