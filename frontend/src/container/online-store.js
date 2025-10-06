import React from "react";
import Layout from "./layout";

import MetricCard from "../components/MetricCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SessionProgressCard from "../components/SessionProgressCard";
import PreviewCard from "../components/PreviewCard";

const OnlineStore = () => {

    const sessionData = [
        { label: "70% Mobile", value: 75, colorClass: "orange_progress" },
        { label: "20% Desktop", value: 20, colorClass: "green_progress" },
        { label: "30% Tablet", value: 30, colorClass: "violet_progress" },
        { label: "7% Other", value: 7, colorClass: "blueishgreen_progress" },
    ];

    return (
        <Layout>
            <Row >
                <Col md>
                    <SessionProgressCard data={sessionData} />
                </Col>
                <Col md>
                    <Row className="metrix-container h-100">
                        <Col xs={4}>
                            <MetricCard
                                title="Loading speed"
                            >
                                <div>3 Seconds</div>
                                <div class="d-flex mt-3 justify-content-end">
                                    <span class="moderate">Moderate</span>
                                </div>
                            </MetricCard>
                        </Col>
                        <Col xs={4}>
                            <MetricCard
                                title="Interactivity"
                            >
                                <div>213 ms</div>
                                <div class="d-flex mt-3 justify-content-end">
                                    <span class="moderate">Moderate</span>
                                </div>
                            </MetricCard>
                        </Col>
                        <Col xs={4}>
                            <MetricCard
                                title="Visual Stability"
                            >
                                <div>0.02</div>
                                <div class="d-flex mt-3 justify-content-end">
                                    <span class="good">Good</span>
                                </div>
                            </MetricCard>
                        </Col>
                    </Row>

                </Col>

            </Row>
            <PreviewCard
                src="http://jobi-template.s3-website.ap-south-1.amazonaws.com/dashboard"
                title="Live Preview"
            />

            <div className="section_card theme">
                <h4 className="card-title">Theme Library</h4>
                <p>These themes are only visible to you. You can switch to another theme by publishing it to your store.</p>

                <div className="mt-5">
                    <div className="row">
                        <div className="col-4 col-md-2">
                            <img
                                src="https://img.freepik.com/free-photo/one-beautiful-woman-smiling-looking-camera-exuding-confidence-generated-by-artificial-intelligence_188544-126053.jpg?t=st=1735450234~exp=1735453834~hmac=a300e3ba21a31cb8631eab23d0b36d09d351e20f240756dc296bd090ab1259b7&w=1380"
                                className="rounded float-start"
                                alt="profile"
                            />
                        </div>
                        <div className="flex-column col">
                            <h4 className="card-title">Name</h4>
                            <label className="form-label">
                                Last saved at Monday, 4:13 pm <a href="#">View logs</a>
                            </label>
                            <label className="form-label">Version</label>
                            <p>
                                <i className="bi bi-lock"></i>Private
                            </p>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group justify-content-between row gap-5 p-3 text-center">
                                <button type="button" className="btn col-md a-btn-primary">Publish</button>
                                <button type="button" className="btn col-md a-btn-primary">Customize</button>
                            </div>
                        </div>
                        <hr />
                    </div>
                </div>
                <div className="mt-5">
                    <div className="row">
                        <div className="col-4 col-md-2">
                            <img
                                src="https://img.freepik.com/free-photo/one-beautiful-woman-smiling-looking-camera-exuding-confidence-generated-by-artificial-intelligence_188544-126053.jpg?t=st=1735450234~exp=1735453834~hmac=a300e3ba21a31cb8631eab23d0b36d09d351e20f240756dc296bd090ab1259b7&w=1380"
                                className="rounded float-start"
                                alt="profile"
                            />
                        </div>
                        <div className="flex-column col">
                            <h4 className="card-title">Name</h4>
                            <label className="form-label">
                                Last saved at Monday, 4:13 pm <a href="#">View logs</a>
                            </label>
                            <label className="form-label">Version</label>
                            <p>
                                <i className="bi bi-lock"></i>Private
                            </p>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group justify-content-between row gap-5 p-3 text-center">
                                <button type="button" className="btn col-md a-btn-primary">Publish</button>
                                <button type="button" className="btn col-md a-btn-primary">Customize</button>
                            </div>
                        </div>
                        <hr />
                    </div>
                </div>

                <br />
                <br />
                <div className="btn-sack">
                    <button type="button" className="a-btn-primary">Add Theme</button>
                </div>
            </div>
        </Layout>
    );
};

export default OnlineStore;