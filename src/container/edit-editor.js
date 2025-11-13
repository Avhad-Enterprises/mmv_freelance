import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import SkillInput from "../components/SkillInput";
import Aetextarea from "../components/Aetextarea";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSweetAlert } from "../components/SweetAlert";
import { getLoggedInUser } from "../utils/auth";
import _ from "lodash";

const EditEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useSweetAlert();
  const [formData, setFormData] = useState({
    user_id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address_line_first: "",
    address_line_second: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    skill: [],
    bio: "",
    experience: [],
    education: [],
    certification: [],
  });
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);
  const [, setSelectedTags] = useState([]);
  const [selectedSkillTags, setSelectedSkillTags] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [canEdit, setCanEdit] = useState(true); // Adjust based on permissions

  const areObjectsEqual = (obj1, obj2) => {
    return _.isEqual(obj1, obj2);
  };

  useEffect(() => {
    const fetchEditorData = async () => {
      try {
        const user = getLoggedInUser();
        if (!user?.user_id) {
          showErrorToast("Please log in to edit Editors.");
          navigate("/login");
          return;
        }

        const payload = { user_id: parseInt(id, 10) };
        const response = await makePostRequest("users/get_freelancer_by_id", payload);
        console.log("Editor API Response:", response); // Debug log
        const editors = response.data?.data;

        if (!editors) {
          showErrorToast("Editor not found.");
          navigate("/editors");
          return;
        }

        // Set canEdit based on permissions (e.g., only admins can edit)
        setCanEdit(true); // Adjust based on your permission logic

        let parsedTags = [];
        if (Array.isArray(editors.tags)) {
          parsedTags = editors.tags;
        } else if (typeof editors.tags === "string") {
          try {
            parsedTags = JSON.parse(editors.tags);
          } catch (e) {
            console.error("Error parsing tags:", e);
            parsedTags = [];
          }
        }
        setSelectedTags(parsedTags);

        let parsedSkills = [];
        if (Array.isArray(editors.skill)) {
          parsedSkills = editors.skill.map((s) => (typeof s === "string" ? s : s.skill_name));
        } else if (typeof editors.skill === "string") {
          try {
            const parsed = JSON.parse(editors.skill);
            parsedSkills = Array.isArray(parsed)
              ? parsed.map((s) => (typeof s === "string" ? s : s.skill_name))
              : [];
          } catch (e) {
            console.error("Error parsing skill:", e);
            parsedSkills = [];
          }
        }

        const skillObjects = parsedSkills.map((s, idx) =>
          typeof s === "string" ? { skill_id: `tmp-${idx}`, skill_name: s } : s
        );

        setSelectedSkillTags(skillObjects);



        const newFormData = {
          //   user_id: parseInt(Editor.user_id, 10),
          first_name: editors.first_name || "",
          last_name: editors.last_name || "",
          email: editors.email || "",
          phone_number: editors.phone_number || "",
          address_line_first: editors.address_line_first || "",
          address_line_second: editors.address_line_second || "",
          city: editors.city || "",
          state: editors.state || "",
          country: editors.country || "",
          pincode: editors.pincode || "",
          skill: parsedSkills,
          bio: editors.bio || "",
          experience: editors.experience || "",
          education: editors.education || "",
          certification: editors.certification || "",
          services: editors.services || "",
          previous_works: editors.previous_works || "",
        };

        console.log("New Form Data:", newFormData); // Debug log
        setFormData(newFormData);
        setInitialState({ formData: { ...newFormData } });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Editor:", error);
        showErrorToast("Failed to load Editor data.");
        setLoading(false);
        navigate("/editors");
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchEditorData();
    } else {
      showErrorToast("Please log in to edit Editors.");
      navigate("/login");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (initialState) {
      const currentState = { formData: { ...formData } };
      const hasFormChanges = !areObjectsEqual(currentState, initialState);
      setHasChanges(hasFormChanges);
      console.log("hasChanges:", hasFormChanges, "Current State:", currentState, "Initial State:", initialState);
    }
  }, [formData, initialState]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges && canEdit) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, canEdit]);

  const handleInputChange = useCallback(
    (e, customValue = null) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      if (e?.target) {
        const { name, value } = e.target;
        const isNumberField = ["Budget", "video_length", "Editor_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      } else if (typeof e === "string" && customValue !== null) {
        const name = e;
        const value = customValue;
        const isNumberField = ["Budget", "video_length", "Editor_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      }
    },
    [canEdit]
  );

  const handleDynamicChange = (field, index, key, value) => {
    setFormData(prev => {
      const updatedField = [...prev[field]];
      updatedField[index] = { ...updatedField[index], [key]: value };
      return { ...prev, [field]: updatedField };
    });
  };


  // const handleTagsChange = (newTags) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     tags: newTags,
  //   }));
  // };

  const handleTagsChange = useCallback(
    (newTags, type) => {
      if (!canEdit) {
        showErrorToast("You are not authorized to edit this project.");
        return;
      }
      if (type === "tags") {
        setSelectedTags(newTags);
        setFormData((prev) => ({ ...prev, tags: newTags }));
      } else if (type === "skill") {
        setSelectedSkillTags(newTags);
        setFormData((prev) => ({ ...prev, skill: newTags }));
      }
    },
    [canEdit]
  );

  const [availableSkillTags, setAvailableSkillTags] = useState([]);
  useEffect(() => {
    // const fetchTags = async () => {
    //   try {
    //     const response = await makeGetRequest("tags/geteventtags");
    //     const fetchedTags = response.data?.data || [];
    //     const tagNames = fetchedTags.map((tag) => tag.tag_name) || ["default-tag"];
    //     setAvailableTags(tagNames);
    //   } catch (error) {
    //     console.error("Failed to fetch tags:", error);
    //     setAvailableTags(["default-tag"]);
    //   }
    // };

    const fetchSkillsTags = async () => {
      try {
        const response = await makeGetRequest("tags/getallskill ");
        const fetchSkillsTags = response.data?.data || [];
        const skillNames = fetchSkillsTags.map((tag) => tag.tag_name) || ["default-skill"];
        setAvailableSkillTags(skillNames);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAvailableSkillTags(["default-skill"]);
      }
    };

    // fetchTags();
    fetchSkillsTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      showErrorToast("You are not authorized to edit this Editor.");
      return;
    }

    if (!hasChanges) {
      showErrorToast("No changes made to update.");
      return;
    }

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }

    const payload = {
      user_id: parseInt(id, 10),
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
      address_line_first: formData.address_line_first,
      address_line_second: formData.address_line_second,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      skill: JSON.stringify(
        selectedSkillTags.map(s => s.skill_name)
      ),
      bio: formData.bio,
      experience: JSON.stringify(formData.experience || []),
      education: JSON.stringify(formData.education || []),
      certification: JSON.stringify(formData.certification || []),
      services: JSON.stringify(formData.services || []),
      previous_works: JSON.stringify(formData.previous_works || []),
    };

    try {
      await makePostRequest(`users/update_user_by_id`, payload);
      showSuccessToast("🎉 Editor updated successfully!");
      setHasChanges(false);
      navigate("/editors");
    } catch (err) {
      console.error("Update error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showErrorToast(err.response?.data?.message || "Failed to update Editor.");
    }
  };

  const handleBackNavigation = () => {
    if (hasChanges && canEdit) {
      showAlert({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save them before leaving?",
        icon: "warning",
        confirmButton: {
          text: "Save & Leave",
          backgroundColor: "#372d80",
          textColor: "#fff",
        },
        cancelButton: {
          text: "Discard",
          backgroundColor: "#c0392b",
          textColor: "#fff",
        },
        denyButton: {
          text: "Cancel",
          backgroundColor: "#2c333a",
          textColor: "#fff",
        },
        onConfirm: async () => {
          await handleSubmit(new Event("submit"));
        },
        onCancel: () => {
          setHasChanges(false);
          navigate("/editors");
        },
      });
    } else {
      navigate("/editors");
    }
  };

  const handleDelete = async () => {
    showAlert({
      title: "Are you sure?",
      text: "This will soft delete the editor. You can’t undo this action.",
      icon: "warning",
      confirmButton: {
        text: "Yes, Delete",
        backgroundColor: "#c0392b",
        textColor: "#fff",
      },
      cancelButton: {
        text: "Cancel",
        backgroundColor: "#2c333a",
        textColor: "#fff",
      },
      onConfirm: async () => {
        try {
          const payload = { user_id: parseInt(id, 10) };
          await makePostRequest("users/soft_delete_user", payload);
          showSuccessToast("🗑️ Editor soft-deleted successfully!");
          navigate("/editors");
        } catch (err) {
          console.error("Delete error:", err);
          showErrorToast(err.response?.data?.message || "Failed to delete editor.");
        }
      },
    });
  };

  if (loading) {
    return (
      <Layout>
        <div>Loading Editor data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <FormHeader
          title="Edit Editor"
          showUpdate={hasChanges && canEdit}
          showDelete
          backUrl="/editors"
          onBack={handleBackNavigation}
          onDelete={handleDelete}
        />
        <Row>
          <Col md={7}>
            <div className="form_section">
              <h6 className="card-title">Editor Details</h6>

              {/* Row 1: First Name & Last Name */}
              <Row className="mb-3">
                <Col md={6}>
                  <TextInput
                    label="First Name"
                    name="first_name"
                    placeholder="Type first name"
                    value={formData.first_name || ""}
                    onChange={handleInputChange}
                    required
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Last Name"
                    name="last_name"
                    placeholder="Type last name"
                    value={formData.last_name || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>

              {/* Row 2: Email & Phone Number */}
              <Row className="mb-3">
                <Col md={6}>
                  <TextInput
                    label="Email"
                    name="email"
                    placeholder="Type email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    required
                    type="email"
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Phone Number"
                    name="phone_number"
                    placeholder="Type phone number"
                    value={formData.phone_number || ""}
                    onChange={handleInputChange}
                    required
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={12}>
                  <Aetextarea
                    label="Bio"
                    name="bio"
                    placeholder="Type editor bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>

            </div>
            <div className="form_section">
              <h6 className="card-title">Editor Address</h6>
              <TextInput
                label="Address Line 1"
                name="address_line_first"
                placeholder="Type address line 1"
                value={formData.address_line_first || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />
              <TextInput
                label="Address Line 2"
                name="address_line_second"
                placeholder="Type address line 2"
                value={formData.address_line_second || ""}
                onChange={handleInputChange}
                disabled={!canEdit}
              />

              {/* Row: City & State */}
              <Row className="mb-3">
                <Col md={6}>
                  <TextInput
                    label="City"
                    name="city"
                    placeholder="Type city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="State"
                    name="state"
                    placeholder="Type state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>

              {/* Row: Pincode & Country */}
              <Row className="mb-3">
                <Col md={6}>
                  <TextInput
                    label="Pincode"
                    name="pincode"
                    placeholder="Type pincode"
                    value={formData.pincode || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Country"
                    name="country"
                    placeholder="Type country"
                    value={formData.country || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>
            </div>

          </Col>

          <Col md={5}>
            <div className="form_section">
              <SkillInput
                selectedSkills={selectedSkillTags}
                setSelectedSkills={(skills) => handleTagsChange(skills, "skill")}
                availableSkills={availableSkillTags.filter((s) => s)}
              />
            </div>

            {/* ===== Education Section ===== */}
            <div className="form_section mb-3">
              <h6 className="card-title">Education</h6>
              {formData.education?.map((edu, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <TextInput
                      label="Degree"
                      value={edu.degree || ""}
                      onChange={(name, value) => handleDynamicChange("education", index, "degree", value)}
                    />
                  </Col>
                  <Col md={4}>
                    <TextInput
                      label="Institution"
                      value={edu.institution || ""}
                      onChange={(name, value) => handleDynamicChange("education", index, "institution", value)}
                    />
                  </Col>
                  <Col md={3}>
                    <TextInput
                      label="Year"
                      value={edu.year_of_completion || ""}
                      onChange={(name, value) => handleDynamicChange("education", index, "year_of_completion", value)}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          education: prev.education.filter((_, i) => i !== index),
                        }));
                      }}
                    >
                      ✕
                    </button>
                  </Col>
                </Row>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    education: [
                      ...formData.education,
                      { degree: "", institution: "", year_of_completion: "" },
                    ],
                  })
                }
              >
                + Add Education
              </button>
            </div>

            {/* ===== Certification Section ===== */}
            <div className="form_section mb-3">
              <h6 className="card-title">Certifications</h6>
              {formData.certification?.map((cert, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <TextInput
                      label="Name"
                      value={cert.name || ""}
                      onChange={(name, value) => handleDynamicChange("certification", index, "name", value)}
                    />
                  </Col>
                  <Col md={4}>
                    <TextInput
                      label="Issued By"
                      value={cert.issued_by || ""}
                      onChange={(name, value) => handleDynamicChange("certification", index, "issued_by", value)}
                    />
                  </Col>
                  <Col md={3}>
                    <TextInput
                      label="Year"
                      value={cert.year || ""}
                      onChange={(name, value) => handleDynamicChange("certification", index, "year", value)}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = formData.certification.filter((_, i) => i !== index);
                        setFormData({ ...formData, certification: updated });
                      }}
                    >
                      ✕
                    </button>
                  </Col>
                </Row>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    certification: [
                      ...formData.certification,
                      { name: "", issued_by: "", year: "" },
                    ],
                  })
                }
              >
                + Add Certification
              </button>
            </div>

            {/* ===== Experience Section ===== */}
            <div className="form_section mb-3">
              <h6 className="card-title">Experience</h6>
              {formData.experience?.map((exp, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <TextInput
                      label="Company"
                      value={exp.company || ""}
                      onChange={(name, value) => handleDynamicChange("experience", index, "company", value)}
                    />
                  </Col>
                  <Col md={4}>
                    <TextInput
                      label="Role"
                      value={exp.role || ""}
                      onChange={(name, value) => handleDynamicChange("experience", index, "role", value)}
                    />
                  </Col>
                  <Col md={3}>
                    <TextInput
                      label="Duration"
                      value={exp.duration || ""}
                      onChange={(name, value) => handleDynamicChange("experience", index, "duration", value)}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = formData.experience.filter((_, i) => i !== index);
                        setFormData({ ...formData, experience: updated });
                      }}
                    >
                      ✕
                    </button>
                  </Col>
                </Row>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    experience: [
                      ...formData.experience,
                      { company: "", role: "", duration: "" },
                    ],
                  })
                }
              >
                + Add Experience
              </button>
            </div>

            {/* ===== Services Section ===== */}
            <div className="form_section mb-3">
              <h6 className="card-title">Services</h6>
              {formData.services?.map((srv, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <TextInput
                      label="Title"
                      value={srv.title || ""}
                      onChange={(name, value) => handleDynamicChange("services", index, "title", value)}
                    />
                  </Col>
                  <Col md={4}>
                    <TextInput
                      type="number"
                      label="Rate"
                      value={srv.rate || ""}
                      onChange={(name, value) => handleDynamicChange("services", index, "rate", value)}
                    />
                  </Col>
                  <Col md={3}>
                    <TextInput
                      label="Currency"
                      value={srv.currency || ""}
                      onChange={(name, value) => handleDynamicChange("services", index, "currency", value)}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = formData.services.filter((_, i) => i !== index);
                        setFormData({ ...formData, services: updated });
                      }}
                    >
                      ✕
                    </button>
                  </Col>
                </Row>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    services: [...formData.services, { title: "", rate: "", currency: "" }],
                  })
                }
              >
                + Add Service
              </button>
            </div>

            {/* ===== Previous Works Section ===== */}
            <div className="form_section mb-3">
              <h6 className="card-title">Previous Works</h6>
              {formData.previous_works?.map((work, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={4}>
                    <TextInput
                      label="Title"
                      value={work.title || ""}
                      onChange={(name, value) => handleDynamicChange("previous_works", index, "title", value)}
                    />
                  </Col>
                  <Col md={5}>
                    <TextInput
                      label="Description"
                      value={work.description || ""}
                      onChange={(name, value) => handleDynamicChange("previous_works", index, "description", value)}
                    />
                  </Col>
                  <Col md={2}>
                    <TextInput
                      label="URL"
                      value={work.url || ""}
                      onChange={(name, value) => handleDynamicChange("previous_works", index, "url", value)}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = formData.previous_works.filter((_, i) => i !== index);
                        setFormData({ ...formData, previous_works: updated });
                      }}
                    >
                      ✕
                    </button>
                  </Col>
                </Row>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={() =>
                  setFormData({
                    ...formData,
                    previous_works: [
                      ...formData.previous_works,
                      { title: "", description: "", url: "" },
                    ],
                  })
                }
              >
                + Add Previous Work
              </button>
            </div>

          </Col>
        </Row>
      </form>
    </Layout>
  );
};

export default EditEditor;