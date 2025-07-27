import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import NumberInputComponent from "../components/NumberInputComponent";
import Aetextarea from "../components/Aetextarea";
import SelectComponent from "../components/SelectComponent";
import DateInput from "../components/DateInput";
import MultiFileUploaderComponent from "../components/MultiFileUploaderComponent";
import CheckboxInput from "../components/CheckboxInput";
import CategoryInput from "../components/CategoryInput";
import TagInput from "../components/TagInput";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getLoggedInUser } from "../utils/auth";

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client_id: null,
    project_title: "",
    project_category: "",
    Deadline: null,
    project_description: "",
    Budget: null,
    skills_required: [],
    reference_links: "", // Changed to string
    additional_notes: "",
    audio_description: "",
    projects_type: "",
    project_format: "",
    audio_voiceover: "No",
    video_length: null,
    preferred_video_style: "",
    is_active: 0,
    created_by: null,
    updated_by: null,
    is_deleted: false,
    deleted_by: null,
    deleted_at: null,
  });
  const [uploadedSampleFiles, setUploadedSampleFiles] = useState([]);
  const [uploadedProjectFiles, setUploadedProjectFiles] = useState([]);
  const [uploadedShowFiles, setUploadedShowFiles] = useState([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableCategories, setAvailableCategory] = useState([]);
  const [skillsTags, setSkillsTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [showAudioDescription, setShowAudioDescription] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [clients, setClients] = useState([]); // New state for clients
  const [projectCategory, setProjectCategory] = useState([]);

  const handleInputChange = useCallback((e, customValue = null) => {
    const name = e?.target?.name || e;
    const value = e?.target?.type === "checkbox"
      ? e.target.checked
      : (e?.target?.value ?? customValue);

    const isNumberField = ["Budget", "video_length", "client_id"].includes(name);

    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? (value === "" ? null : parseFloat(value)) : value,
    }));
  }, []);

  const handleCheckboxChange = useCallback((checked) => {
    setShowAudioDescription(checked);

    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        audio_description: "", // ✅ Direct field, not nested
      }));
    }
  }, []);

  const handleTagsChange = useCallback((name) => (tags) => {
    console.log(`Selected ${name}:`, tags);
    if (name === "skills_required") {
      setSkillsTags(tags);
      setFormData((prev) => ({ ...prev, skills_required: tags }));
    } else {
      setSelectedTags(tags);
      setFormData((prev) => ({ ...prev, tags }));
    }
  }, []);

  const handleDateChange = useCallback((date) => {
    setFormData((prev) => ({
      ...prev,
      Deadline: date ? date.toISOString().split("T")[0] : null,
    }));
  }, []);

  const activeOptions = [
    { value: 0, label: "Inactive" },
    { value: 1, label: "Active" },
    { value: 2, label: "Archived" },
  ];

  const audioVoiceoverOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  useEffect(() => {
    const user = getLoggedInUser();
    if (user?.user_id) {
      setFormData((prev) => ({
        ...prev,
        created_by: user.user_id,

      }));
    }
    const fetchClients = async () => {
      try {
        const response = await makeGetRequest("users/customers/active", {});
        const fetchedClients = response.data?.data || [];
        // Map clients to the format required by SelectComponent
        const clientOptions = fetchedClients.map((client) => ({
          value: client.user_id,
          label: client.name || `${client.first_name || ""} ${client.last_name || ""}`.trim(),
        }));
        setClients(clientOptions);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        showErrorToast("Failed to load clients.");
      }
    };

    const fetchTags = async () => {
      try {
        const response = await makeGetRequest("tags/geteventtags");
        const fetchedTags = response.data?.data || [];
        const tagNames = fetchedTags.map((tag) => tag.tag_name);
        setAvailableTags(tagNames);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        showErrorToast("Failed to load tags.");
      }
    };

    const fetchSkills = async () => {
      try {
        const response = await makeGetRequest("tags/getskilltags");
        const fetchedSkills = response.data?.data || [];
        const skillNames = fetchedSkills.map((skill) => skill.tag_name);
        setAvailableSkills(skillNames);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        showErrorToast("Failed to load skills.");
      }
    };

    const fetchCategories = async () => {
      try {
        // use your existing route
        const response = await makeGetRequest("category/getallcategorys");
        const fetchedCategories = response.data?.data || [];
        const categoryOptions = fetchedCategories.map((cat) => ({
          value: cat.category_id,
          label: cat.category_name || `${cat.name}`,
        }));
        setAvailableCategory(categoryOptions);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        showErrorToast("Failed to load categories.");
      }
    };

    fetchClients();
    fetchTags();
    fetchSkills();
    fetchCategories();
  }, []);

  const resetForm = () => {
    const user = getLoggedInUser();
    setFormData({
      client_id: null,
      project_title: "",
      project_category: "",
      Deadline: null,
      project_description: "",
      Budget: null,
      tags: [],
      skills_required: [],
      reference_links: "",
      additional_notes: "",
      projects_type: "",
      project_format: "",
      audio_voiceover: "No",
      video_length: null,
      preferred_video_style: "",
      is_active: 0,
      created_by: user?.user_id || null,
      updated_by: null,
      is_deleted: false,
      deleted_by: null,
      deleted_at: null,

    });
    setSelectedTags([]);
    setSkillsTags([]);
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = getLoggedInUser();
    if (!user || !user.user_id || !user.token) {
      console.log("Authentication failed");
      showErrorToast("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }

    const requiredFields = {
      client_id: formData.client_id,
      project_title: formData.project_title,
      project_description: formData.project_description,
      Budget: formData.Budget,
      projects_type: formData.projects_type,
      project_format: formData.project_format,
      audio_voiceover: formData.audio_voiceover,
      video_length: formData.video_length,
      preferred_video_style: formData.preferred_video_style,
      skills_required: formData.skills_required,
      Deadline: formData.Deadline,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (Array.isArray(value) && value.length === 0))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      showErrorToast(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    const incompleteUploads = [
      ...uploadedSampleFiles,
      ...uploadedProjectFiles,
      ...uploadedShowFiles,
    ].filter((f) => f?.uploading || !f?.fileUrl);

    if (incompleteUploads.length > 0) {
      console.log("Incomplete uploads:", incompleteUploads);
      showErrorToast("Some files are still uploading or invalid. Please wait or remove them.");
      return;
    }

    const payload = {
      client_id: formData.client_id,
      project_title: formData.project_title,
      // ✅ do not include audio_description
      project_category: formData.project_category,
      Deadline: formData.Deadline,
      project_description: formData.project_description,
      Budget: formData.Budget,
      tags: JSON.stringify(selectedTags),
      skills_required: formData.skills_required,
      reference_links: formData.reference_links ? [formData.reference_links] : [],
      additional_notes: formData.additional_notes || "",
      projects_type: formData.projects_type,
      project_format: formData.project_format,
      audio_voiceover: formData.audio_voiceover,
      video_length: formData.video_length,
      preferred_video_style: formData.preferred_video_style,
      is_active: formData.is_active,
      created_by: formData.created_by,
      created_at: new Date().toISOString(),
      updated_by: formData.updated_by,
      is_deleted: formData.is_deleted,
      deleted_by: formData.deleted_by,
      deleted_at: formData.deleted_at,
    };


    console.log("Submitting payload:", JSON.stringify(payload, null, 2));

    try {
      console.log("Sending API request...");
      const response = await makePostRequest("projectsTask/insertprojects_task", payload);
      console.log("API Response:", response);
      showSuccessToast("🎉 Project created successfully!");
      resetForm();
      navigate("/projectmanagement");
    } catch (error) {
      console.error("Project creation error:", error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes("Wrong authentication token") || error.response?.status === 401) {
        console.log("Authentication error detected");
        showErrorToast("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      showErrorToast(`Failed to create project: ${errorMessage}`);
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <FormHeader title="Add New Project" showAdd backUrl="/projectmanagement" />
        <Row>
          <Col md={7}>
            <div className="form_section">
              <h6 className="card-title">Project Details</h6>
              <SelectComponent
                label="Client Name"
                name="client_id"
                options={clients}
                value={formData.client_id}
                onChange={(value) => handleInputChange("client_id", value)}
                placeholder="Select a client"
                required
              />
              <TextInput
                label="Project Title"
                name="project_title"
                placeholder="Type project title here"
                value={formData.project_title}
                onChange={handleInputChange}
                required
              />
              <Aetextarea
                label="Project Description"
                name="project_description"
                placeholder="Type description here"
                value={formData.project_description}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Preferred Video Style"
                name="preferred_video_style"
                placeholder="Type preferred video style"
                value={formData.preferred_video_style}
                onChange={handleInputChange}
                required
              />
              <SelectComponent
                label="Audio Voiceover"
                name="audio_voiceover"
                options={audioVoiceoverOptions}
                value={formData.audio_voiceover}
                onChange={(value) => handleInputChange("audio_voiceover", value)}
                required
              />
              {formData.audio_voiceover === "Yes" && (
                <>
                  <CheckboxInput
                    label="Add Audio Description"
                    name="audio_description_checkbox"
                    value={showAudioDescription}
                    onChange={handleCheckboxChange}
                  />
                  {showAudioDescription && (
                    <TextInput
                      label="Audio Description"
                      name="audio_description"
                      placeholder="Type audio description"
                      value={formData.audio_description}
                      onChange={handleInputChange}
                      required
                    />
                  )}
                </>
              )}

              <Aetextarea
                label="Additional Notes"
                name="additional_notes"
                placeholder="Type additional notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
              />
            </div>

          </Col>
          <Col md={5}>
            <div className="form_section">
              <h6 className="card-title">Project Settings</h6>
              <SelectComponent
                label="Status"
                name="is_active"
                placeholder="Select status"
                options={activeOptions}
                value={formData.is_active}
                onChange={(value) => handleInputChange("is_active", value)}
                required
              />
              <TagInput
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange("tags")}
                info="Select or add tags"
                tagTypeFieldName="tag_type"
                tagTypeValue="events"
              />
              <TagInput
                label="Skills Required"
                name="skills_required"
                availableTags={availableSkills}
                selectedTags={skillsTags}
                onTagsChange={handleTagsChange("skills_required")}
                info="Add skills (e.g., Video Editing, Animation)"
                tagTypeFieldName="tag_type"
                tagTypeValue="skills"
                required
              />
              <Aetextarea
                label="Reference Links"
                name="reference_links"
                placeholder="Type reference links or notes here"
                value={formData.reference_links}
                onChange={handleInputChange}
              />
              <DateInput
                label="Deadline"
                name="Deadline"
                type="future"
                includeTime={false}
                onDateChange={handleDateChange}
                required
              />
              <CategoryInput
                value={formData.project_category}
                availableCategories={availableCategories}
                onChange={(val) => handleInputChange("project_category", val)}
                onCategoryAdded={(newCat) => {
                  // Add new category to dropdown dynamically:
                  const newOption = {
                    value: newCat.category_id,
                    label: newCat.category_name,
                  };
                  setAvailableCategory((prev) => [...prev, newOption]);
                }}
              />

              <TextInput
                label="Project Type"
                name="projects_type"
                placeholder="Type project type"
                value={formData.projects_type}
                onChange={handleInputChange}
                required
              />
              <TextInput
                label="Project Format"
                name="project_format"
                placeholder="Type project format"
                value={formData.project_format}
                onChange={handleInputChange}
                required
              />
              <NumberInputComponent
                label="Budget"
                name="Budget"
                placeholder="Type budget"
                value={formData.Budget || ""}
                onChange={handleInputChange}
                min={1}
                required
              />
              <NumberInputComponent
                label="Video Length in Min"
                name="video_length"
                placeholder="Type video length (minutes)"
                value={formData.video_length || ""}
                onChange={handleInputChange}
                min={1}
                required
              />
            </div>
          </Col>
        </Row>
      </form>
    </Layout>
  );
};

export default CreateProject;