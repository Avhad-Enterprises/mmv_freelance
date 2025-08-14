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

const FMPayouts = () => {
    const [transactionsData, settransactionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const tableRef = useRef();
    const navigate = useNavigate();
    const [setSelectedDates] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [allData, setAllData] = useState([]); // assume this is your full dataset
    const [isFiltered, setIsFiltered] = useState(false);
    const [tableKey, setTableKey] = useState(0);

    const handleDateChange = (range) => {
        if (!range || range.length === 0 || !range[0]) {
            setSelectedDates([]);
            setFilteredData([]);
            setIsFiltered(false); // No filter
            return;
        }

        setSelectedDates(range);

        const normalizeToLocalMidnight = (date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
        };

        const start = normalizeToLocalMidnight(range[0]);
        const end = range.length === 2 ? normalizeToLocalMidnight(range[1]) : start;

        const filtered = allData.filter((item) => {
            if (!item.created_at) return false;

            const itemDate = normalizeToLocalMidnight(new Date(item.created_at));
            return itemDate >= start && itemDate <= end;
        });

        setFilteredData(filtered);
        setIsFiltered(true);
        setTableKey(prev => prev + 1); // 👈 Force remount
    };

    useEffect(() => {
        const fetchtransactionsData = async () => {
            try {
                const response = await makeGetRequest("payment/history");
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                console.log("Parsed Transactions Data:", data); // Debug log
                settransactionsData(data);
                setAllData(data);
            } catch (error) {
                settransactionsData([]);
            } finally {
                setLoading(false);
            }
        };

        if (localStorage.getItem("jwtToken")) fetchtransactionsData();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    const columns = [
        {
            headname: "Payout Id",
            dbcol: "payee_id",
            type: "link",
            linkTemplate: "/fmpayouts/view/:project_id",
            linkLabelFromRow: "payee_id",
            linkParamKey: "project_id",
        },
        { headname: "Editor Nmae", dbcol: "application_id" },
        {
            headname: "Amount",
            dbcol: "amount",
            type: "",
        },
        {
            headname: "Status",
            dbcol: "transaction_status",
            type: "badge",
        },
        {
            headname: "Date",
            dbcol: "created_at",
            type: "datetimetime",
        },
        {
            headname: "Method",
            dbcol: "transaction_type",
            type: "",
        },
    ];

    return (
        <Layout>
            <div className="d-flex justify-content-between">
                <div className="mt-3 d-flex align-items-center">
                    <div className="d-flex gap-5 md-date">
                        <DateInput label="" type="range" includeTime={false} onChange={handleDateChange} />
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
                            onClick={() => navigate("/fmpayout/create-transactions")}
                            label="Add New"
                        />
                    </div>
                </div>
            </div>

            <div className="card-container gap-4 flex-wrap">
                <Row className="metrix-container">
                    <Col xs={4} md={3}>
                        <MetricCard
                            title="Total Earnings"
                            operation="count"
                            column="transactions_title"
                            jsonData={transactionsData}
                            icon={calender}
                            tooltipText="This shows the count of live blogs"
                        />
                    </Col>
                    <Col xs={4} md={3}>
                        <MetricCard
                            title="Pending Payouts"
                            operation="count"
                            column="status"
                            jsonData={transactionsData}
                            icon={wallet}
                            tooltipText="This shows the count of completed transactionss"
                        />

                    </Col>
                    <Col xs={4} md={3}>
                        <MetricCard
                            title="Processed Transactions"
                            operation="count"
                            column="is_disputed"
                            jsonData={transactionsData}
                            customFilter={(item) => item.is_disputed === true}
                            icon={channel}
                            tooltipText="This shows the count of disputed transactionss"
                        />

                    </Col>
                    <Col xs={4} md={3}>
                        <MetricCard
                            title="Refunds Issued"
                            operation="total"
                            column="milestones" // assuming it's an array in transactionsData
                            jsonData={transactionsData}
                            icon={group}
                            tooltipText="This shows total completed milestones"
                        />
                    </Col>
                </Row>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : transactionsData.length === 0 ? (
                <div>No transactions found.</div>
            ) : (
                <DataTable
                    key={tableKey} // 👈 This forces re-render
                    id="table1"
                    tableRef={tableRef}
                    columns={columns}
                    data={isFiltered ? filteredData : transactionsData}
                    defaultView="table"
                    searchable
                    filterable
                    sortable
                    paginated
                    onFilteredDataChange={(data) => console.log("Filtered Data:", data)}
                />
            )}
        </Layout>
    );
};

export default FMPayouts;
