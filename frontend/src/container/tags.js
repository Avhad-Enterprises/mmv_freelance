import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makeDeleteRequest, makePutRequest } from "../utils/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";
import { Modal, Form } from "react-bootstrap";

const Tags = () => {
  const [tagsData, setTagsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await makeGetRequest("tags");
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setTagsData(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
        showErrorToast("Failed to load tags.");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchTags();
    } else {
      showErrorToast("Please log in to view tags.");
      navigate("/login");
    }
  }, [navigate]);

  // 🗑 Delete Tag
  const handleDelete = async (tag_id) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    try {
      await makeDeleteRequest(`tags/${tag_id}`);
      showSuccessToast("Tag deleted successfully!");
      setTagsData((prev) => prev.filter((t) => t.tag_id !== tag_id));
    } catch {
      showErrorToast("Failed to delete tag.");
    }
  };

  // 🔄 Toggle Active Status
  const handleToggleActive = async (tag) => {
    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`tags/${tag.tag_id}`, {
        is_active: !tag.is_active,
        updated_by: user.user_id,
      });
      showSuccessToast("Tag updated successfully!");
      setTagsData((prev) =>
        prev.map((t) =>
          t.tag_id === tag.tag_id ? { ...t, is_active: !t.is_active } : t
        )
      );
    } catch {
      showErrorToast("Failed to update tag.");
    }
  };

  // ✏️ Edit Tag (Modal)
  const handleEditClick = (tag) => setEditingTag({ ...tag });
  const handleCloseModal = () => setEditingTag(null);

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`tags/${editingTag.tag_id}`, {
        tag_name: editingTag.tag_name.trim(),
        is_active: editingTag.is_active,
        updated_by: user.user_id,
      });
      showSuccessToast("Tag updated successfully!");
      setTagsData((prev) =>
        prev.map((t) =>
          t.tag_id === editingTag.tag_id ? { ...editingTag } : t
        )
      );
      handleCloseModal();
    } catch {
      showErrorToast("Failed to update tag.");
    }
  };

  const columns = [
    { headname: "Tag Name", dbcol: "tag_name", type: "text" },
    { headname: "Active", dbcol: "is_active", type: "badge", onChange: handleToggleActive },
    { headname: "Type", dbcol: "tag_type", type: ""},
    { headname: "Created At", dbcol: "created_at", type: "datetimetime" },
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
            onClick={() => handleDelete(row.tag_id)}
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
        <h3 className="mt-3">Tags</h3>
        <Button
          buttonType="add"
          onClick={() => navigate("/tags/create")}
          label="Add New Tag"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : tagsData.length === 0 ? (
        <div>No tags found.</div>
      ) : (
        <DataTable
          id="tagsTable"
          columns={columns}
          data={tagsData}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
        />
      )}

      {/* 📝 Edit Tag Modal */}
      {editingTag && (
        <Modal show onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Tag</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateTag}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tag Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingTag.tag_name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, tag_name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editingTag.is_active}
                onChange={(e) =>
                  setEditingTag({ ...editingTag, is_active: e.target.checked })
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
                Update Tag
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Layout>
  );
};

export default Tags;
