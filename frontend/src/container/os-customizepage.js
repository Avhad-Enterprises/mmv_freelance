import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PreviewSwitch from "../components/PreviewSwitch";
import Header from "./header";

const CustomizePage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("desktop");
  const [openSection, setOpenSection] = useState(null);
  const [settings, setSettings] = useState({
    title: "Find & Hire Experts for any Job",
    subtitle: "Jobs & Job search. Find jobs in global. Executive jobs & work.",
    leftImage: "https://via.placeholder.com/261x430",
    rightImage: "https://via.placeholder.com/244x433",
  });

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle image upload
  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSettings({
        ...settings,
        [key]: imageUrl,
      });
    }
  };

  return (
    <div className="d-flex" style={{ height: "70vh" }}>

      {/* CMS Sidebar */}
      <div className="p-4 border-end" style={{ width: "300px", background: "#f8f9fa" }}>
        <button className="btn btn-secondary w-100 mt-3" onClick={() => navigate("/onlinestore")}> Back </button>

        {/* <h4>Customize Store</h4> */}

        <div className="mb-3">
          <div onClick={() => toggleSection("main")} >
            <h4>Site Title</h4>
          </div>
          <div
            id="collapseOne"
            className="accordion-collapse collapse show"
            data-bs-parent="#cmsAccordion"
          ></div>

          {openSection === "main" && (
            <div className="mt-3">
              <label className="form-label">Title</label>
              <input type="text" className="form-control" placeholder="Enter Title" value={settings.title} onChange={handleChange} />
              <label className="form-label mt-3">Subtitle</label>
              <input type="text" className="form-control" placeholder="Enter Subtitle" value={settings.subtitle} onChange={handleChange} />
            </div>
          )}
        </div>

        <div className="mb-3">
          <div onClick={() => toggleSection("mmain")} >
            <h4>Media Library</h4>
          </div>

          {openSection === "mmain" && (
            <div className="mt-3">
              <label className="form-label">Title</label>
              <input type="text" className="form-control" placeholder="Enter Title" />
              <label className="form-label">Upload Image</label>
              <input type="file" className="form-control" accept="image/*" onChange={(e) => handleImageUpload(e, "leftImage")} />
              {/* File Preview */}
              {settings.leftImage && (
                <div className="mt-3">
                  <img
                    src={settings.leftImage}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>
              )}
              <label className="form-label">URL</label>
              <input type="text" className="form-control" placeholder="Enter URL" />
            </div>
          )}
        </div>

        {/* <button
          className="btn btn-primary w-100 mt-3">Save Changes
        </button> */}

        <button className="btn btn-secondary w-100 mt-3">
          Add Section
        </button>
      </div>

      <div className="flex-grow-1 d-flex flex-column">

        <Header />

        <div
          className="d-flex justify-content-end align-items-center py-2 px-4"
          style={{ background: "#fff" }} >

          {/* Action Buttons and PreviewSwitch */}
          <PreviewSwitch activeView={activeView} setActiveView={setActiveView} />
          <button className="btn btn-success me-3">Publish</button>
          <button className="btn btn-secondary">Save</button>
        </div>

        {/* Right Side - Live Preview */}
        <div className="flex-grow-1">
          <iframe
            src="http://13.232.209.100:3000/"
            title="Live Preview"
            style={{ width: "100%", height: "180%", border: "none" }}
          />
        </div>
      </div>
    </div>
  );
};
export default CustomizePage;