import React, { useState } from "react";
import PreviewSwitch from "./PreviewSwitch";
import PreviewIframe from "./PreviewIframe";
import { useNavigate } from "react-router-dom";

// Reusable Card Component for previewing
const PreviewCard = ({ src, title }) => {
  const [activeView, setActiveView] = useState("desktop");
  const navigate = useNavigate();

  const handleCustomize = () => {
    navigate("/customize", {
      state: {
        src: "http://jobi-template.s3-website.ap-south-1.amazonaws.com/dashboard",  // 👈 your website preview URL
        title: "My Store",
      },
    });
  };

  return (
    <div className="section_card">
      <label className="form-label mb-4 live">
        Live <i className="bi bi-record-circle-fill"></i>
      </label>
      {/* Toggle Views */}
      <PreviewSwitch activeView={activeView} setActiveView={setActiveView} />

      <div className="OnlinStorePreMain">
        {/* Desktop View */}
        <div
          className={`preview desktop ${activeView === "desktop" ? "d-block" : "d-none"
            }`}
        >
          <p className="preview-title">Desktop View</p>
          <PreviewIframe
            src={src}
            title={title}
            style={{ display: "block" }}
          />
        </div>

        {/* Mobile View */}
        <div
          className={`preview mobile ${activeView === "mobile" ? "d-block" : "d-none"
            }`}
          style={{ textAlign: "center" }}
        >
          <p className="preview-title">Mobile View</p>
          <div className="mobile-frame">
            <PreviewIframe
              src={src}
              title={title}
              style={{
                border: "1px solid #ccc",
                margin: "auto",
                display: "block",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>
      </div>

      <h4 className="card-title mt-5">Name</h4>
      <label className="form-label">Description</label>
      <br />
      <br />
      <div className="btn-sack">
        <button type="button" className="a-btn-primary" onClick={handleCustomize}>
          Customize
        </button>
      </div>
    </div>
  );
};

export default PreviewCard;