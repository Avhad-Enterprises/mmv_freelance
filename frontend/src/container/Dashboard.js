import React, { useState, useEffect } from "react";
import Layout from "./layout";
import MetricCard from "../components/MetricCard";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import positive from "../assets/svg/positive_metrix.svg";
import negative from "../assets/svg/negative_metrix.svg";

import notificationData from "../assets/json/notifications.json";
import campaignData from "../assets/json/campaigns.json";

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    setNotifications(notificationData);
  }, []);

  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    setCampaigns(campaignData);
  }, []);

  return (
    <Layout>
      <div className="container">
        <Row className="metrix-container">
          {/* Total Revenue */}

          <Col xs={4} md>
            <MetricCard>
              <p className="w-100">Total Revenue</p>
              <h3>₹7,825</h3>
              <div className="d-flex w-100 align-items-end justify-content-between">
                <span className="positive_metrix">22%</span>
                <span>
                  <img src={positive} alt="positive metrix" />
                </span>
              </div>
            </MetricCard>
          </Col>

          <Col xs={4} md>
            <MetricCard>
              <p className="w-100">Total Orders</p>
              <h3>172</h3>
              <div className="d-flex w-100 align-items-end justify-content-between">
                <span className="positive_metrix">22%</span>
                <span>
                  <img src={positive} alt="positive metrix" />
                </span>
              </div>
            </MetricCard>
          </Col>

          <Col xs={4} md>
            <MetricCard>
              <p className="w-100">New Restaurant Application</p>
              <h3>76</h3>
              <div className="d-flex  w-100 align-items-end justify-content-between">
                <span className="positive_metrix">22%</span>
                <span>
                  <img src={positive} alt="positive metrix" />
                </span>
              </div>
            </MetricCard>
          </Col>

          <Col xs={4} md>
            <MetricCard>
              <p className="w-100">Cancellation</p>
              <h3>182</h3>
              <div className="d-flex  w-100 align-items-end justify-content-between">
                <span className="negative_metrix">22%</span>
                <span>
                  <img src={negative} alt="negative metrix" />
                </span>
              </div>
            </MetricCard>
          </Col>

          <Col xs={4} md>
            <MetricCard>
              <p className="w-100">Refund</p>
              <h3>₹27,825</h3>
              <div className="d-flex  w-100 align-items-end justify-content-between">
                <span className="positive_metrix">22%</span>
                <span>
                  <img src={positive} alt="positive metrix" />
                </span>
              </div>
            </MetricCard>
          </Col>
        </Row>

        {/* Announcements Section */}
        <div className="row">
          <div className="col-md">
            <div className="section_card">
              <div className="d-flex justify-content-between">
                <h6 className="p-2">Announcements</h6>
                <a href="/announcements">see all</a>
              </div>
              <div className="home_table">
                {notifications.map((notification, index) => (
                  <div className="d-flex p-2 gap-1">
                    <img
                      src={notification.user}
                      className="profile-pic"
                      alt="profile"
                    />

                    <div className="col">
                      <div className="d-flex justify-content-between">
                        <div>
                          <label>{notification.title}</label>
                          <p>{notification.detail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-2 home_act">
                      <a href="#0">
                        <i className="bi p-1 bi-three-dots"></i>
                      </a>
                      <p>1 hour ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Store Optimisation Section */}
          <div className="col-md">
            <div className="section_card">
              <div className="d-flex justify-content-between">
                <h6 className="p-2">Store Optimisation</h6>
                <a href="#0">see all</a>
              </div>
              <div className="home_table">
                {campaigns.map((campaign, index) => (
                  <div className="d-flex p-2 gap-1">
                    <img
                      src={campaign.image}
                      className="profile-pic"
                      alt="profile"
                    />

                    <div className="col">
                      <div className="d-flex justify-content-between">
                        <div>
                          <label>{campaign.name}</label>
                          <p>{campaign.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-2 home_act">
                      <a href="#0">
                        <i className="bi p-1 bi-three-dots"></i>
                      </a>
                      <p>1 hour ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* New Customers Section */}
        <div className="row">
          <div className="col">
            <div className="section_card home_bottom">
              <div className="d-flex justify-content-between align-items-end">
                <h6 className="p-2">
                  New Customers This Month{" "}
                  <span className="positive_garph">
                    <i className="bi bi-graph-up-arrow"></i>2.75%
                  </span>
                </h6>
                <p>Join Today</p>
              </div>
              <div className="d-flex justify-content-between">
                <h2>{notifications.length}</h2>
                <div className="customer_profiles">
                  {notifications.slice(0, 3).map((member, index) => (
                    <img
                      key={index}
                      src={member.user}
                      alt="profile"
                      className="profile-pic"
                    />
                  ))}
                  <div className="profile-count">{notifications.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
