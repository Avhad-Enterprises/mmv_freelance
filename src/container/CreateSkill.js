import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import { makePostRequest } from "../utils/api";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { getLoggedInUser } from "../utils/auth";

const CreateSkill = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        skill_name: "",
        is_active: true,
    });
    const [, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            setLoading(false);
            return;
        }

        const payload = {
            skill_name: formData.skill_name.trim(),
            is_active: formData.is_active,
            created_by: user.user_id,
            updated_by: user.user_id,
        };

        try {
            const response = await makePostRequest("skills", payload);
            showSuccessToast(response.data?.message || "Skill created successfully!");
            navigate("/skill");
            // Reset form
            setFormData({ skill_name: "", is_active: true });
        } catch (error) {
            console.error("Create skill error:", error);
            showErrorToast(
                error?.response?.data?.message || "Failed to create skill. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <FormHeader
                title="Add New Skill"
                // showAdd
                backUrl="/skill"
                onBack={() => navigate("/skill")}
            />
            <div
                className="container d-flex justify-content-center align-items-center"
                style={{ minHeight: "80vh" }}
            >
                <div className="w-100" style={{ maxWidth: "500px" }}>
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 shadow rounded bg-white"
                    >
                        <h5 className="mb-4 fw-bold">Create Skill</h5>

                        <div className="mb-3">
                            <label className="form-label">Skill Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="skill_name"
                                value={formData.skill_name}
                                onChange={handleChange}
                                required
                                placeholder="Enter skill name"
                            />
                        </div>

                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_active">
                                Active
                            </label>
                        </div>

                        <button type="submit" className="btn a-btn-primary">
                            Create Skill
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateSkill;
