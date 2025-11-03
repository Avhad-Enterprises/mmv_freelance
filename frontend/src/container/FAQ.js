import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import {
  makeGetRequest,
  makeDeleteRequest,
  makePutRequest,
} from "../utils/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";
import { Modal, Form } from "react-bootstrap";
import TagInput from "../components/TagInput";

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const navigate = useNavigate();

  // 📦 Fetch all FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await makeGetRequest("faq");
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setFaqs(data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        showErrorToast("Failed to load FAQs.");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchFaqs();
    } else {
      showErrorToast("Please log in to view FAQs.");
      navigate("/login");
    }
  }, [navigate]);

  // 🗑 Delete FAQ
  const handleDelete = async (faq_id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await makeDeleteRequest(`faq/${faq_id}`);
      showSuccessToast("FAQ deleted successfully!");
      setFaqs((prev) => prev.filter((f) => f.faq_id !== faq_id));
    } catch {
      showErrorToast("Failed to delete FAQ.");
    }
  };

  // ✏️ Edit FAQ
  const handleEditClick = (faq) => setEditingFaq({ ...faq });
  const handleCloseModal = () => setEditingFaq(null);

  // ✅ Handle tag updates in edit modal
  const handleTagsChange = (newTags) => {
    setEditingFaq((prev) => ({ ...prev, tags: newTags }));
  };

  // 💾 Update FAQ
  const handleUpdateFaq = async (e) => {
    e.preventDefault();

    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`faq/${editingFaq.faq_id}`, {
        question: editingFaq.question.trim(),
        answer: editingFaq.answer.trim(),
        type: editingFaq.type,
        tags: editingFaq.tags,
        is_active: editingFaq.is_active,
        updated_by: user.user_id,
      });

      showSuccessToast("FAQ updated successfully!");
      setFaqs((prev) =>
        prev.map((f) =>
          f.faq_id === editingFaq.faq_id ? { ...editingFaq } : f
        )
      );
      handleCloseModal();
    } catch {
      showErrorToast("Failed to update FAQ.");
    }
  };

  // 🧩 DataTable Columns
  const columns = [
    { headname: "Question", dbcol: "question", type: "text" },
    { headname: "Answer", dbcol: "answer", type: "text" },
    { headname: "Type", dbcol: "type", type: "text" },
    {
      headname: "Tags",
      dbcol: "tags",
      render: (row) =>
        Array.isArray(row.tags) && row.tags.length > 0
          ? row.tags.join(", ")
          : "—",
    },
    { headname: "Active", dbcol: "is_active", type: "badge" },
    {
      headname: "Actions",
      dbcol: "actions",
      render: (row) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn p-0 border-0 bg-transparent text-primary"
            onClick={() => handleEditClick(row)}
          >
            <i className="bi bi-pencil" style={{ fontSize: "22px" }}></i>
          </button>
          <button
            type="button"
            className="btn p-0 border-0 bg-transparent text-danger"
            onClick={() => handleDelete(row.faq_id)}
          >
            <i className="bi bi-trash" style={{ fontSize: "22px" }}></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h3 className="mt-3">FAQs</h3>
        <Button
          buttonType="add"
          onClick={() => navigate("/faq/create")}
          label="Add New FAQ"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : faqs.length === 0 ? (
        <div>No FAQs found.</div>
      ) : (
        <DataTable
          id="faqTable"
          columns={columns}
          data={faqs}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
        />
      )}

      {/* 📝 Edit FAQ Modal */}
      {editingFaq && (
        <Modal show onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit FAQ</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateFaq}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  value={editingFaq.question}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editingFaq.answer}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={editingFaq.type}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, type: e.target.value })
                  }
                >
                  <option value="general">General</option>
                  <option value="project">Project</option>
                  <option value="account">Account</option>
                  <option value="payment">Payment</option>
                  <option value="technical">Technical</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <TagInput
                  tags={editingFaq.tags || []}
                  setTags={handleTagsChange}
                  placeholder="Add tags (e.g., password, account, reset)"
                />
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Active"
                checked={editingFaq.is_active}
                onChange={(e) =>
                  setEditingFaq({
                    ...editingFaq,
                    is_active: e.target.checked,
                  })
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <button
                type="button"
                className="btn a-btn-primary"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn a-btn-primary">
                Update FAQ
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Layout>
  );
};

export default Faqs;
