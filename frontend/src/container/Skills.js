import React, { useState, useEffect } from "react";
import Layout from "./layout";
import { useNavigate } from "react-router-dom";
import { makeGetRequest, makeDeleteRequest, makePutRequest } from "../utils/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";
import { Modal, Form } from "react-bootstrap";

const Skills = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await makeGetRequest("skills");
        const data = Array.isArray(response.data?.data) ? response.data.data : [];
        setSkillsData(data);
      } catch (error) {
        console.error("Error fetching skills:", error);
        showErrorToast("Failed to load skills.");
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchSkills();
    } else {
      showErrorToast("Please log in to view skills.");
      navigate("/login");
    }
  }, [navigate]);

  // 🗑 Delete Skill
  const handleDelete = async (skill_id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await makeDeleteRequest(`skills/${skill_id}`);
      showSuccessToast("Skill deleted successfully!");
      setSkillsData((prev) => prev.filter((s) => s.skill_id !== skill_id));
    } catch {
      showErrorToast("Failed to delete skill.");
    }
  };

  // 🔄 Toggle Active Status
  const handleToggleActive = async (skill) => {
    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`skills/${skill.skill_id}`, {
        is_active: !skill.is_active,
        updated_by: user.user_id,
      });
      showSuccessToast("Skill updated successfully!");
      setSkillsData((prev) =>
        prev.map((s) =>
          s.skill_id === skill.skill_id ? { ...s, is_active: !s.is_active } : s
        )
      );
    } catch {
      showErrorToast("Failed to update skill.");
    }
  };

  // ✏️ Edit Skill (Modal)
  const handleEditClick = (skill) => setEditingSkill({ ...skill });
  const handleCloseModal = () => setEditingSkill(null);

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    const user = getLoggedInUser();
    if (!user?.user_id) return showErrorToast("User not authenticated.");

    try {
      await makePutRequest(`skills/${editingSkill.skill_id}`, {
        skill_name: editingSkill.skill_name.trim(),
        is_active: editingSkill.is_active,
        updated_by: user.user_id,
      });
      showSuccessToast("Skill updated successfully!");
      setSkillsData((prev) =>
        prev.map((s) =>
          s.skill_id === editingSkill.skill_id ? { ...editingSkill } : s
        )
      );
      handleCloseModal();
    } catch {
      showErrorToast("Failed to update skill.");
    }
  };

  const columns = [
    { headname: "Skill Name", dbcol: "skill_name", type: "text" },
    { headname: "Active", dbcol: "is_active", type: "badge", onChange: handleToggleActive },
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
            <i className="bi bi-pencil"></i>
          </button>
          <button
            type="button"
            className="btn p-0 border-0 bg-transparent text-danger"
            onClick={() => handleDelete(row.skill_id)}
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
        <h3 className="mt-3">Skills</h3>
        <Button buttonType="add" onClick={() => navigate("/skills/create")} label="Add New Skill" />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : skillsData.length === 0 ? (
        <div>No skills found.</div>
      ) : (
        <DataTable
          id="skillsTable"
          columns={columns}
          data={skillsData}
          defaultView="table"
          searchable
          filterable
          sortable
          paginated
        />
      )}

      {/* 📝 Edit Skill Modal */}
      {editingSkill && (
        <Modal show onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Skill</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleUpdateSkill}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Skill Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editingSkill.skill_name}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, skill_name: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                label="Active"
                checked={editingSkill.is_active}
                onChange={(e) =>
                  setEditingSkill({ ...editingSkill, is_active: e.target.checked })
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Skill
              </button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Layout>
  );
};

export default Skills;
