import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import TextInput from "./TextInput";
import { getLoggedInUser } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";

const SkillInput = ({ selectedSkills, setSelectedSkills }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [pendingSkill, setPendingSkill] = useState("");
  const suggestionsRef = useRef(null);

  // Fetch skills from DB
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await makeGetRequest("tags/getallskill");
        const skills = res.data?.data || [];
        const validSkills = skills.filter(s => s?.skill_name && s?.skill_id);
        setAvailableSkills(validSkills);
      } catch (err) {
        showErrorToast("Failed to load skills ");
      }
    };
    fetchSkills();
  }, []);

  // Filter suggestions based on input and already selected skills
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = availableSkills
      .filter(
        s =>
          s?.skill_name &&
          s.skill_name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedSkills.some(sel => sel.skill_id === s.skill_id)
      )
      .map(s => ({ value: s.skill_name, skill: s, customAdd: false }));

    // Allow custom skill addition if input not found
    if (!availableSkills.some(s => s.skill_name.toLowerCase() === inputValue.toLowerCase())) {
      filtered.push({ value: inputValue, customAdd: true });
    }

    setFilteredSuggestions(filtered);
  }, [inputValue, availableSkills, selectedSkills]);

  // Add skill to selectedSkills safely
  const addSkill = skill => {
    if (!skill) return;
    if (!selectedSkills.some(s => s.skill_id === skill.skill_id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setInputValue("");
    setFilteredSuggestions([]);
  };

  const removeSkill = skillId => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_id !== skillId));
  };

  const handleModalSubmit = async e => {
    e.preventDefault();
    if (!pendingSkill.trim()) return showErrorToast("Skill name is required");

    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated");

    try {
      const res = await makePostRequest("tags/insertskill", {
        skill_name: pendingSkill.trim(),
        created_by: user.user_id,
        is_active: 1,
      });
      const newSkill = res.data?.data;
      setAvailableSkills([...availableSkills, newSkill]);
      addSkill(newSkill);
      showSuccessToast("Skill added successfully");
      setModalOpen(false);
      setPendingSkill("");
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.message || "Failed to add skill");
    }
  };

  return (
    <div className="form-group">
      <label className="form-label mt-2">Skills Required</label>
      <div className="skill-input-wrapper">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Add a skill"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!inputValue.trim()) return;
                const existing = availableSkills.find(
                  s => s.skill_name.toLowerCase() === inputValue.toLowerCase()
                );
                if (existing) addSkill(existing);
                else {
                  setPendingSkill(inputValue);
                  setModalOpen(true);
                }
              }
            }}
          />
          <button
            type="button"
            className="btn a-btn-primary"
            onClick={() => {
              if (!inputValue.trim()) return;
              const existing = availableSkills.find(
                s => s.skill_name.toLowerCase() === inputValue.toLowerCase()
              );
              if (existing) addSkill(existing);
              else {
                setPendingSkill(inputValue);
                setModalOpen(true);
              }
            }}
          >
            Add
          </button>
        </div>

        {/* Selected skills tags */}
        <div className="tags-container mt-2">
          {selectedSkills.map(skill => (
            <div key={skill.skill_id} className="tag">
              {skill.skill_name}{" "}
              <span className="remove-tag" onClick={() => removeSkill(skill.skill_id)}>
                ×
              </span>
            </div>
          ))}
        </div>

        {/* Suggestions dropdown */}
        {filteredSuggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-list-1">
            {filteredSuggestions.map(s => (
              <div
                key={s.customAdd ? `custom-${s.value}` : s.skill.skill_id}
                className={s.customAdd ? "suggestion-add-new" : "suggestion"}
                onClick={() => {
                  if (s.customAdd) {
                    setPendingSkill(s.value);
                    setModalOpen(true);
                  } else addSkill(s.skill);
                }}
              >
                {s.customAdd ? <>➕ Add "<strong>{s.value}</strong>"</> : s.value}
              </div>
            ))}
          </div>
        )}

        {/* Modal for adding new custom skill */}
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Skill">
          <form>
            <TextInput
              label="Skill Name"
              placeholder="Enter skill"
              required
              value={pendingSkill}
              onChange={(name, value) => setPendingSkill(value || "")}
            />
            <div className="btn-sack mt-2">
              <button onClick={handleModalSubmit} className="a-btn-primary">
                Save
              </button>
              <button type="button" className="a-btn-primary" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default SkillInput;
