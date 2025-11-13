import React, { useState, useRef } from "react";
import Layout from "./layout";

import FormHeader from "../components/FormHeader";
import Button from "../components/Button";
import TabsComponent from "../components/TabsComponent";
import Modal from "../components/Modal";
import logsdata from "../assets/json/logsdata.json";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";

const Prefernces = () => {
  const tableRef = useRef();
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab] = useState("footerpages");

  const columns1 = [
    { headname: "id", type: "id", dbcol: "col1" },
    { headname: "Title", type: "", dbcol: "col2" },
    { headname: "Deleted at", type: "time", dbcol: "col3" },
    { headname: "Action by", type: "", dbcol: "col4" },
    { headname: "Action Taken", type: "", dbcol: "col5" },
  ];

  const tabs = [
    {
      id: "footerpages",
      label: "Footer Pages",
      content: <div className="section-card">{/* Add New Button */}</div>,
    },
    {
      id: "technical-SEO",
      label: "Technical SEO",
      content: <div>Technical SEO content goes here</div>,
    },
    {
      id: "Lgo-Favicon",
      label: "Lgo/Favicon",
      content: <div>Lgo/Favicon content goes here</div>,
    },
    {
      id: "Store-Restrictions",
      label: "Store Restrictions",
      content: <div>Store Restrictions content goes here</div>,
    },
  ];
  // const handleTabClick = (tabId) => {
  //   setActiveTab(tabId);
  // };

  return (
    <Layout>
      <FormHeader title="Preferences" backUrl="/onlinestore" closeUrl="/" />

      <div className="container">
        {/* Conditionally Render Buttons When Footer Pages Tab is Active */}
        {activeTab === "footerpages" && (
          <div className="gap-2 d-flex justify-content-end">
            <div className="dropdown">
              <Button
                buttonType="add"
                label="Add New"
                onClick={() => navigate("/add-blogs")}
              />
            </div>
          </div>
        )}

        {activeTab === "footerpages" && (
          <div className="gap-2 d-flex justify-content-end mt-3">
            <Button
              type="submit"
              label="Logs"
              className="a-btn-primary"
              onClick={() => setModalOpen(true)}
            />

            <Modal
              isOpen={isModalOpen}
              onClose={() => setModalOpen(false)}
              title="Logs"
            >
              <DataTable
                id="table1"
                tableRef={tableRef}
                columns={columns1}
                data={logsdata}
                defaultView="table"
                searchable={true}
                filterable={true}
                sortable={true}
                paginated={false}
              />
            </Modal>
          </div>
        )}
      </div>
      <div className="container">
        {/* Tabs Component */}
        <TabsComponent tabs={tabs} />
      </div>
    </Layout>
  );
};

export default Prefernces;