import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import { Badge } from "react-bootstrap";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSweetAlert } from "../components/SweetAlert";
import { getLoggedInUser } from "../utils/auth";
import _ from "lodash";
import DataTable from "../components/DataTable";
import DateInput from "../components/DateInput";
import Button from "../components/Button";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const { showAlert } = useSweetAlert();
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const tableRef = useRef();

  const handleDateChange = useCallback((range) => {
    if (!range || range.length === 0 || !range[0]) {
      setSelectedDates([]);
      setFilteredData([]);
      setIsFiltered(false);
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
    setTableKey((prev) => prev + 1);
    // Reset selected transaction to the first filtered item if available
    setSelectedTransaction(filtered[0] || null);
  }, [allData]);

  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        const user = getLoggedInUser();
        if (!user?.user_id) {
          showErrorToast("Please log in to view transaction history.");
          navigate("/login");
          return;
        }
        const payload = { project_id: parseInt(project_id, 10) };
        const response = await makeGetRequest(`payment/project/${project_id}`);
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        console.log("Parsed Transactions Data:", data); // Debug log

        if (data.length === 0) {
          setError("No transactions found for this project.");
        } else {
          setTransactionsData(data);
          setAllData(data);
          setSelectedTransaction(data[0] || null); // Set initial selected transaction
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError(error.response?.data?.message || "Failed to fetch transactions");
        setTransactionsData([]);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchTransactionsData();
    } else {
      showErrorToast("Please log in to view transaction history.");
      navigate("/login");
    }
  }, [project_id, navigate]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleRowClick = useCallback((row) => {
    setSelectedTransaction(row);
  }, []);

  const handleBackNavigation = useCallback(() => {
    navigate("/fmpayouts"); // Adjust back URL as needed
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div>Loading transaction history...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form>
        <FormHeader
          title="Transaction History"
          showUpdate={false}
          showDelete={false}
          backUrl="/fmpayouts"
          onBack={handleBackNavigation}
        />
        <Row>
          <Col md={6}>
            <div className="form_section">
              <TextInput
                label="ID"
                name="id"
                value={selectedTransaction.id}
                disabled
              />
              <TextInput
                label="Payer ID"
                name="payer_id"
                value={selectedTransaction.payer_id}
                disabled
              />
              <TextInput
                label="Payee ID"
                name="payee_id"
                value={selectedTransaction.payee_id}
                disabled
              />
              <TextInput
                label="Application ID"
                name="application_id"
                value={selectedTransaction.application_id}
                disabled
              />
              <TextInput
                label="Description"
                name="description"
                value={selectedTransaction.description}
                disabled
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="form_section">
              <TextInput
                label="Date"
                name="created_at"
                value={new Date(selectedTransaction.created_at).toLocaleString("en-US", { dateStyle: "medium" }) || ""}
                disabled
              />
              <TextInput
                label="Amount"
                name="amount"
                value={selectedTransaction.amount}
                disabled
              />
              <TextInput
                label="Gateway_Transaction_Id"
                name="gateway_transaction_id"
                value={selectedTransaction.gateway_transaction_id}
                disabled
              />
              <TextInput
                label="Transaction Type"
                name="transaction_type"
                value={selectedTransaction.transaction_type}
                disabled
              />
              <TextInput
                label="Payment Gateway"
                name="payment_gateway"
                value={selectedTransaction.payment_gateway}
                disabled
              />
              <TextInput
                label="Transaction Status"
                name="transaction_status"
                value={selectedTransaction.transaction_status}
                disabled
              />
            </div>
          </Col>
        </Row>
      </form >
    </Layout >
  );
};

export default TransactionHistory;