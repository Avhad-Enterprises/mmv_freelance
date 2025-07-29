import React, { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import TextInput from "./TextInput";
import { getLoggedInUser } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest } from "../utils/api";
import "../dashboard.css";

const TagInput = ({
  availableTags = [],
  onTagsChange,
  info,
  initialTags = [],
  tagTypeFieldName = "tag_type",
  label = "Tags",
  tagTypeValue = "",
  required="false",
}) => {
  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [pendingTag, setPendingTag] = useState("");
  const [valueSlug, setValueSlug] = useState("");
  useEffect(() => {
    setSelectedTags(initialTags || []);
  }, []);

  useEffect(() => {
    const filtered = availableTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      )
      .map((tag) => ({ value: tag, customAdd: false }));

    if (inputValue.trim() !== "" && !availableTags.includes(inputValue)) {
      setFilteredSuggestions([
        ...filtered,
        { value: inputValue, customAdd: true },
      ]);
    } else {
      setFilteredSuggestions(filtered);
    }
  }, [inputValue, availableTags, selectedTags]);

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      const updatedTags = [...selectedTags, tag];
      setSelectedTags(updatedTags);
      onTagsChange && onTagsChange(updatedTags);
    }
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeTag = (tag) => {
    const updatedTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(updatedTags);
    onTagsChange && onTagsChange(updatedTags);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (availableTags.includes(inputValue)) {
        addTag(inputValue);
      } else {
        setPendingTag(inputValue);
        const slug = generateSlug(inputValue);
        setValueSlug(slug);
        setModalOpen(true);
      }
    }
  };

  const handleSuggestionClick = (tagObj) => {
    if (tagObj.customAdd) {
      setPendingTag(tagObj.value);
      const slug = generateSlug(tagObj.value);
      setValueSlug(slug);
      setModalOpen(true);
    } else {
      addTag(tagObj.value);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (pendingTag.trim() === "" || valueSlug.trim() === "") {
      showErrorToast("Both title and value are required");
      return;
    }

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }

    const tagData = {
      tag_name: pendingTag.trim(),
      tag_value: valueSlug.trim(),
      tag_type: tagTypeValue,
      is_active: 1,
      created_by: user.user_id,
      is_deleted: false
    };

    try {
      await makePostRequest("tags/insertetag", tagData);
      addTag(pendingTag.trim());
      showSuccessToast("Tag added successfully");
      setModalOpen(false);
      setPendingTag("");
      setValueSlug("");
    } catch (error) {
      console.error("Failed to add tag:", error);
      showErrorToast(
        error.response?.data?.message || "Failed to add tag. Try again."
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setFilteredSuggestions([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="form-group">
      <label className="form-label mt-2">
        {label} {required && <span className="text-danger"></span>}
      </label>
      <div className="tag-input-wrapper">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className="tag-input col"
            placeholder="Add a tag"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="btn a-btn-primary"
            onClick={() => {
              if (inputValue.trim() !== "") {
                setPendingTag(inputValue);
                setValueSlug(generateSlug(inputValue));
              }
              setModalOpen(true);
            }}
          >
            Add
          </button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setModalOpen(false);
              setPendingTag("");
              setValueSlug("");
            }}
            title="Add Tags"
          >
            <form>
              <TextInput
                label="Title"
                info=""
                placeholder="Enter Title"
                required={true}
                value={pendingTag}
                onChange={(name, value) => {
                  const safeValue = value || "";
                  setPendingTag(safeValue);
                  setValueSlug(generateSlug(safeValue));
                }}
              />
              <TextInput
                label="Value"
                placeholder=""
                required={true}
                value={valueSlug}
                readOnly={true}
              />
              <br />
              <div className="btn-sack">
                <button onClick={handleModalSubmit} className="a-btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="a-btn-primary"
                  onClick={() => {
                    setModalOpen(false);
                    setPendingTag("");
                    setValueSlug("");
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </Modal>
        </div>
        <div className="tags-container">
          {selectedTags.map((tag) => (
            <div key={tag} className="tag">
              {tag} <span className="remove-tag" onClick={() => removeTag(tag)}>×</span>
            </div>
          ))}
        </div>
        <br />

        {inputValue.trim() !== "" && filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-list">
            {filteredSuggestions.map((tagObj) => (
              <div
                key={tagObj.customAdd ? `custom-${tagObj.value}` : tagObj.value}
                className={tagObj.customAdd ? "suggestion-add-new" : "suggestion"}
                onClick={() => handleSuggestionClick(tagObj)}
              >
                {tagObj.customAdd ? (
                  <>➕ Add "<strong>{tagObj.value}</strong>"</>
                ) : (
                  tagObj.value
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="hidden"
          id="tagsHiddenInput"
          name="tags"
          value={selectedTags.join(",")}
        />
        {tagTypeFieldName && tagTypeValue && (
          <input
            type="hidden"
            name={tagTypeFieldName}
            value={tagTypeValue}
          />
        )}
      </div>
    </div>
  );
};

export default TagInput;
