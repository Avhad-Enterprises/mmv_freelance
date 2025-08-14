import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import TagInput from "../components/TagInput";
import Aetextarea from "../components/Aetextarea";
import CheckboxInput from "../components/CheckboxInput";
import { Badge } from "react-bootstrap";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makePutRequest, makeGetRequest } from "../utils/api";
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
    email_verified: "",
    phone_verified: "",
    email_notifications: "",
    aadhaar_verification: "",
    kyc_verified: "",
    address_line_first: "",
    address_line_second: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    availability: "full-time",
    notes: "",
    tags: [],
    skill: [],
    role: "",
    account_type: "",
    account_status: "Active",
    is_active: true,
    is_banned: false,
    bio: "",
    experience: "",
    education: "",
    timezone: "",
    certification: "",
    projects_created: 0,
    total_spent: 0,
    hire_count: "",
    review_id: "",
    total_earnings: "",
  });
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
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
        setCanEdit(user.role === "admin"); // Adjust based on your permission logic

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
          parsedSkills = editors.skill;
        } else if (typeof editors.skill === "string") {
          try {
            parsedSkills = JSON.parse(editors.skill);
          } catch (e) {
            console.error("Error parsing skill:", e);
            parsedSkills = [];
          }
        }
        setSelectedSkillTags(parsedSkills);

        const newFormData = {
          //   user_id: parseInt(Editor.user_id, 10),
          first_name: editors.first_name || "",
          last_name: editors.last_name || "",
          email: editors.email || "",
          phone_number: editors.phone_number || "",
          email_verified: editors.email_verified || "",
          email_notifications: editors.email_notifications || "",
          phone_verified: editors.phone_verified || "",
          aadhaar_verification: editors.aadhaar_verification || "",
          kyc_verified: editors.kyc_verified || "",
          address_line_first: editors.address_line_first || "",
          address_line_second: editors.address_line_second || "",
          city: editors.city || "",
          state: editors.state || "",
          country: editors.country || "",
          pincode: editors.pincode || "",
          availability: editors.availability || "full-time",
          notes: editors.notes || "",
          tags: parsedTags,
          skill: parsedSkills,
          role: editors.role || "",
          account_type: editors.account_type || "",
          account_status: editors.account_status || "",
          is_active: editors.is_active?.toString() || "0",
          is_banned: editors.is_banned || false,
          bio: editors.bio || "",
          experience: editors.experience || "",
          education: editors.education || "",
          timezone: editors.timezone || "",
          certification: editors.certification || "",
          projects_created: editors.projects_created || 0,
          total_spent: editors.total_spent || 0,
          hire_count: editors.hire_count || "",
          review_id: editors.review_id || "",
          total_earnings: editors.total_earnings || "",
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



  const [availableTags, setAvailableTags] = useState([]);
  const [availableSkillTags, setAvailableSkillTags] = useState([]);
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await makeGetRequest("tags/geteventtags");
        const fetchedTags = response.data?.data || [];
        const tagNames = fetchedTags.map((tag) => tag.tag_name) || ["default-tag"];
        setAvailableTags(tagNames);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAvailableTags(["default-tag"]);
      }
    };

    const fetchSkillsTags = async () => {
      try {
        const response = await makeGetRequest("tags/getskilltags");
        const fetchSkillsTags = response.data?.data || [];
        const skillNames = fetchSkillsTags.map((tag) => tag.tag_name) || ["default-skill"];
        setAvailableSkillTags(skillNames);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setAvailableSkillTags(["default-skill"]);
      }
    };

    fetchTags();
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
      email_verified: formData.email_verified,
      phone_verified: formData.phone_verified,
      email_notifications: formData.email_notifications,
      aadhaar_verification: formData.aadhaar_verification,
      kyc_verified: formData.kyc_verified,
      address_line_first: formData.address_line_first,
      address_line_second: formData.address_line_second,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      availability: formData.availability,
      notes: formData.notes,
      tags: JSON.stringify(selectedTags),
      skill: JSON.stringify(selectedSkillTags),
      role: formData.role,
      account_type: formData.account_type,
      account_status: formData.account_status,
      is_active: formData.is_active,
      is_banned: formData.is_banned,
      bio: formData.bio,
      experience: formData.experience,
      education: formData.education,
      certification: formData.certification,
      timezone: formData.timezone,
      hire_count: formData.hire_count,
      review_id: formData.review_id,
      total_earnings: formData.total_earnings,
    };

    try {
      await makePutRequest(`users/updateuserbyid`, payload);
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

  const accountStatusOptions = [
    { value: "0", label: "inActive" },
    { value: "1", label: "Active" },
  ];

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
          showDelete={false} // Add delete functionality if needed
          backUrl="/editors"
          onBack={handleBackNavigation}
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
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <CheckboxInput
                    label="Agreed to receive emails"
                    name="email_verified"
                    checked={formData.email_verified || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <CheckboxInput
                    label="Agreed to receive emails notification"
                    name="email_notifications"
                    checked={formData.email_notifications || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <CheckboxInput
                    label="Agreed to receive text/SMS"
                    name="phone_verified"
                    checked={formData.phone_verified || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <CheckboxInput
                    label="Agreed to recieve Aadhar Verification"
                    name="aadhaar_verification"
                    checked={formData.aadhaar_verification || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={6}>
                  <CheckboxInput
                    label="Agreed to receive KYC Verification"
                    name="kyc_verified"
                    checked={formData.kyc_verified || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>

            </div>
            <div className="form_section">
              <h6 className="card-title">Editors Professional Details</h6>
              <Row>
                <Col>
                  <Aetextarea
                    label="Bio"
                    name="bio"
                    placeholder="Type Editor bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                  <Aetextarea
                    label="Experience"
                    name="experience"
                    placeholder="Type Editor experience"
                    value={formData.experience || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                  <TextInput
                    label="Education"
                    name="education"
                    placeholder="Enter education"
                    value={formData.education || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                  <TextInput
                    label="Certification"
                    name="certification"
                    placeholder="Enter certification"
                    value={formData.certification || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>
            </div>
            <div className="form_section">
              <h6 className="card-title">
                Account Role & Status
                {formData.is_banned === true && (
                  <Badge bg="danger" className="ms-2">Banned</Badge>
                )}
                {formData.is_banned === false && (
                  <Badge bg="danger" className="ms-2">Empty</Badge>
                )}
              </h6>
              <Row>
                <Col md={6}>
                  <TextInput
                    label="Account Type"
                    name="account_type"
                    value={formData.account_type || ""}
                    disabled
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Account Status"
                    name="account_status"
                    options={accountStatusOptions}
                    value={formData.account_status || ""}
                    onChange={(value) => handleInputChange("account_status", value)}
                    disabled
                  />
                </Col>
              </Row>
            </div>
            <div className="form_section">
              <h6 className="card-title">Performance Indicators</h6>
              <Row>
                <Col md={6}>
                  <TextInput
                    label="Hire Count"
                    name="hire_count"
                    value={formData.hire_count}
                    disabled
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Review ID"
                    name="review_id"
                    value={formData.review_id}
                    disabled
                  />
                </Col>
                <Col md={6}>
                  <TextInput
                    label="Total Earnings"
                    name="total_earnings"
                    value={formData.total_earnings}
                    disabled
                  />
                </Col>
              </Row>
            </div>
          </Col>

          <Col md={5}>
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

            <div className="form_section">
              <h6 className="card-title">Availability & Timezone</h6>
              <TextInput
                label="Availability"
                name="availability"
                value={formData.availability || ""}
                disabled // 🔒 Make it non-editable
              />
              <TextInput
                label="Timezone"
                name="timezone"
                value={formData.timezone || ""}
                disabled // 🔒 Make it non-editable
              />
            </div>

            <div className="form_section">
              <Aetextarea
                label="Notes"
                name="notes"
                placeholder="Type notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            <Col>
              <div className="form_section">
                <TagInput
                  label="Skills"
                  name="skill"
                  availableTags={availableSkillTags}
                  initialTags={selectedSkillTags}
                  onTagsChange={(skill) => handleTagsChange(skill, "skill")}
                  info="Select or add skills"
                  tagTypeFieldName="tag_type"
                  tagTypeValue="skill"
                  disabled={!canEdit}
                />
                <TagInput
                  name="tags"
                  availableTags={availableTags}
                  initialTags={selectedTags}
                  onTagsChange={(tags) => handleTagsChange(tags, "tags")}
                  info="Select or add tags"
                  tagTypeFieldName="tag_type"
                  tagTypeValue="events"
                  disabled={!canEdit}
                />
              </div>
            </Col>

          </Col>
        </Row>
      </form>
    </Layout>
  );
};

export default EditEditor;