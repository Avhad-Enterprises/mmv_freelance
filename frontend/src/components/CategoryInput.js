import React, { useState } from "react";
import Modal from "./Modal";
import TextInput from "./TextInput";
import SelectComponent from "./SelectComponent"; // ✅ Reuse your existing Select
import { getLoggedInUser } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest } from "../utils/api";

const CategoryInput = ({
  value,
  onChange,
  availableCategories = [],
  label = "Project Category",
  placeholder = "Select or type category",
  onCategoryAdded,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState("");
  const [valueSlug, setValueSlug] = useState("");

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

  const handleAddClick = () => {
    if (!inputValue.trim()) {
      showErrorToast("Please type a category first.");
      return;
    }
    setPendingCategory(inputValue.trim());
    setValueSlug(generateSlug(inputValue.trim()));
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!pendingCategory) {
      showErrorToast("Category name is required.");
      return;
    }

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }

    const payload = {
      name: pendingCategory,
      value: valueSlug,
      slug: valueSlug,
      is_active: 1,
      types: JSON.stringify(["projects"]),
      created_by: user.user_id,
      is_deleted: false,
    };

    try {
      const response = await makePostRequest("category/insertcategory", payload);
      showSuccessToast("Category added successfully!");
      setModalOpen(false);
      setPendingCategory("");
      setValueSlug("");

      if (onCategoryAdded) {
        onCategoryAdded(response.data?.data || {});
      }

      // ✅ Also update main input
      onChange && onChange(response.data?.data?.category_id);
    } catch (error) {
      console.error("❌ API Error:", error);
      showErrorToast(error?.response?.data?.message || "Failed to add category.");
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="d-flex gap-2">
        <div style={{ flex: 1 }}>
          <SelectComponent
            options={availableCategories}
            value={value}
            placeholder={placeholder}
            onChange={(val) => onChange && onChange(val)}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={handleAddClick}
        >
          +
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingCategory("");
          setValueSlug("");
        }}
        title="Add New Category"
      >
        <form>
          <TextInput
            label="Category Name"
            value={pendingCategory}
            onChange={(name, value) => {
              const safeValue = value || "";
              setPendingCategory(safeValue);
              setValueSlug(generateSlug(safeValue));
            }}
            placeholder="Enter category name"
            required
          />
          <TextInput label="Slug" value={valueSlug} readOnly required />
          <div className="btn-sack mt-3 d-flex gap-2">
            <button onClick={handleModalSubmit} className="a-btn-primary">
              Save
            </button>
            <button
              type="button"
              className="a-btn-primary"
              onClick={() => {
                setModalOpen(false);
                setPendingCategory("");
                setValueSlug("");
              }}
            >
              Close
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryInput;
