import React, { useState } from "react";

const TabPanel = ({ tabs, setActiveTab }) => {
  const [activeTab, setTab] = useState(0); // ✅ Track active tab

  const handleTabClick = (index) => {
    setTab(index);
    setActiveTab(index); // ✅ Update Parent Component's Active Tab
  };

  return (
    <div className="">
      {/* ✅ Tab Buttons */}
      <div className="tab-buttons d-flex justify-content-between">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button ${activeTab === index ? "active" : ""}`}
            onClick={() => handleTabClick(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ✅ Tab Content */}
      <div className="tab-content">{tabs[activeTab].content}</div>
    </div>
  );
};

export default TabPanel;