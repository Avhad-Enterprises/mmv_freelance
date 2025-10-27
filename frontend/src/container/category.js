import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makeDeleteRequest, makePutRequest } from "../utils/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";
import { Modal, Form } from "react-bootstrap";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  // 📦 Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await makeGetRequest("categories");
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showErrorToast("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchCategories();
    } else {
      showErrorToast("Please log in to view categories.");
      navigate("/login");
    }
  }, [navigate]);

  // 🗑 Delete Category
  const handleDelete = async (category_id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await makeDeleteRequest(`categories/${category_id}`);
      showSuccessToast("Category deleted successfully!");
      setCategories((prev) => prev.filter((c) => c.category_id !== category_id));
    } catch {
      showErrorToast("Failed to delete category.");
    }
  };

  // ✏️ Edit Category
  const handleEditClick = (category) => setEditingCategory({ ...category });
  const handleCloseModal = () => setEditingCategory(null);

  // 💾 Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`categories/${editingCategory.category_id}`, {
        category_name: editingCategory.category_name.trim(),
        is_active: editingCategory.is_active,
        updated_by: user.user_id,
      });
      showSuccessToast("Category updated successfully!");
      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === editingCategory.category_id ? { ...editingCategory } : c
        )
      );
      handleCloseModal();
    } catch {
      showErrorToast("Failed to update category.");
    }
  };

  // 🧩 Columns for DataTable
  const columns = [
    { headname: "Category Name", dbcol: "category_name", type: "text" },
    { headname: "Active", dbcol: "is_active", type: "badge" },
    { headname: "Category Type", dbcol: "category_type", type: "" },
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
            <i className="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            className="btn p-0 border-0 bg-transparent text-danger"
            onClick={() => handleDelete(row.category_id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h3 className="mt-3">Categories</h3>
        <Button buttonType="add" onClick={() => navigate("/category/create")} label="Add New Category" />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : categories.length === 0 ? (
        <div>No categories found.</div>
      ) : (
        <DataTable
          id="categoriesTable"
          columns={columns}
          data={categories}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
        />
      )}

      {/* 📝 Edit Category Modal */}
      {editingCategory && (
        <Modal show onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Category</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateCategory}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingCategory.category_name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, category_name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editingCategory.is_active}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, is_active: e.target.checked })
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Category
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Layout>
  );
};

export default Categories;
