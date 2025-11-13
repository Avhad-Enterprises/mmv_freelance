import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import SelectComponent from "../components/SelectComponent";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makeDeleteRequest, makeGetRequest, makePutRequest, makePostRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSweetAlert } from "../components/SweetAlert";
import { getLoggedInUser } from "../utils/auth";
import _ from "lodash";

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useSweetAlert();
  const [formData, setFormData] = useState({
    user_id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    address_line_first: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    profile_photo: "",
    tax_id: "",
    business_document_url: "", // for file
    company_name: "",
    industry: "",
    website: "",
    social_links: "",
    company_size: "",
    services_required: [], // multi-select
    work_arrangement: "",
    project_frequency: "",
    hiring_preferences: "",
  });
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [canEdit, setCanEdit] = useState(true); // Adjust based on permissions
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [businessDocument, setBusinessDocument] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [, setBannedReason] = useState(""); // optional, if you want to display reason


  const areObjectsEqual = (obj1, obj2) => {
    return _.isEqual(obj1, obj2);
  };

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const user = getLoggedInUser();
        if (!user?.user_id) {
          showErrorToast("Please log in to edit clients.");
          navigate("/login");
          return;
        }

        const response = await makeGetRequest(`clients/${id}`);
        console.log("Client API Response:", response); // Debug log
        const clientUser = response.data?.data?.user || {};
        setIsBanned(!!clientUser.is_banned);
        setBannedReason(clientUser.banned_reason || "");
        const clientProfile = response.data?.data?.profile || {};

        if (!clientUser && !clientProfile) {
          showErrorToast("Client not found.");
          navigate("/client");
          return;
        }

        setCanEdit(true);

        const newFormData = {
          user_id: clientUser.user_id || null,
          first_name: clientUser.first_name || "",
          last_name: clientUser.last_name || "",
          username: clientUser.username || "",
          email: clientUser.email || "",
          phone_number: clientUser.phone_number || "",
          address_line_first: clientUser.address_line_first_line_first || "",
          city: clientUser.city || "",
          state: clientUser.state || "",
          country: clientUser.country || "",
          pincode: clientUser.pincode || "",
          profile_photo: clientUser.profile_picture || "",

          // Profile fields
          tax_id: clientProfile.tax_id || "",
          business_document_url: clientProfile.business_document_url || "",
          company_name: clientProfile.company_name || "",
          industry: clientProfile.industry || "",
          website: clientProfile.website || "",
          social_links: clientProfile.social_links || "",
          company_size: clientProfile.company_size || "",
          services_required: clientProfile.services_required || [],
          work_arrangement: clientProfile.work_arrangement || "",
          project_frequency: clientProfile.project_frequency || "",
          hiring_preferences: clientProfile.hiring_preferences || "",
        };


        console.log("New Form Data:", newFormData); // Debug log
        setFormData(newFormData);
        setProfilePhoto(clientUser.profile_picture || null);
        setBusinessDocument(clientProfile.business_document_url || null);
        setInitialState({ formData: { ...newFormData } });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client:", error);
        showErrorToast("Failed to load client data.");
        setLoading(false);
        navigate("/client");
      }
    };

    if (localStorage.getItem("jwtToken")) {
      fetchClientData();
    } else {
      showErrorToast("Please log in to edit clients.");
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
        const isNumberField = ["Budget", "video_length", "client_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      } else if (typeof e === "string" && customValue !== null) {
        const name = e;
        const value = customValue;
        const isNumberField = ["Budget", "video_length", "client_id"].includes(name);
        setFormData((prev) => ({
          ...prev,
          [name]: isNumberField ? (value === "" ? null : parseInt(value, 10)) : value,
        }));
      }
    },
    [canEdit]
  );

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
    }
  };

  const handleBusinessDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBusinessDocument(file);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canEdit) {
      showErrorToast("You are not authorized to edit this client.");
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
      username: formData.username,
      email: formData.email,
      phone_number: formData.phone_number,
      address_line_first: formData.address_line_first,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      profile_picture: formData.profile_photo,
      // business_document_url: formData.business_document_url,
      // tax_id: formData.tax_id,
      // company_name: formData.company_name,
      // industry: formData.industry,
      // website: formData.website,
      // social_links: formData.social_links,
      // company_size: formData.company_size,
      // services_required: formData.services_required,
      // work_arrangement: formData.work_arrangement,
      // project_frequency: formData.project_frequency,
      // hiring_preferences: formData.hiring_preferences,
    };

    try {
      await makePutRequest(`users/${id}`, payload);
      showSuccessToast("🎉 Client updated successfully!");
      setHasChanges(false);
      navigate("/client");
    } catch (err) {
      console.error("Update error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      showErrorToast(err.response?.data?.message || "Failed to update client.");
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
          navigate("/client");
        },
      });
    } else {
      navigate("/client");
    }
  };

  const handleDelete = async () => {
    if (!canEdit) {
      showErrorToast("You are not authorized to delete this client.");
      return;
    }

    showAlert({
      title: "Are you sure?",
      text: "Are you sure you want to delete this client? This action cannot be undone.",
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
          await makeDeleteRequest(`users/${id}`);
          showSuccessToast("Client deleted successfully!");
          navigate("/client");
        } catch (error) {
          console.error("Delete error:", error);
          showErrorToast(error.response?.data?.message || "Failed to delete client.");
        }
      },
    });
  };

  const handleBanToggle = async () => {
    try {
      const user = getLoggedInUser();
      if (!user?.user_id) {
        showErrorToast("User not authenticated.");
        return;
      }

      const endpoint = `users/${id}/${isBanned ? "unban" : "ban"}`;
      await makePostRequest(endpoint);

      showSuccessToast(isBanned ? "User unbanned successfully!" : "User banned successfully!");
      setIsBanned(!isBanned);
      setBannedReason(isBanned ? "" : "Banned by admin");
    } catch (error) {
      console.error("Ban/Unban error:", error);
      showErrorToast(error.response?.data?.message || "Failed to update ban status.");
    }
  };


  const industryOptions = [
    { value: "", label: "Select Industry Type" },
    { value: "film", label: "Film" },
    { value: "ad_agency", label: "Ad Agency" },
    { value: "events", label: "Events" },
    { value: "youtube", label: "Youtube" },
    { value: "corporate", label: "Corporate" },
    { value: "other", label: "Other" },
  ];

  const companySizeOptions = [
    { value: "", label: "Select company size" },
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-200", label: "51-200" },
    { value: "200+", label: "200+" },
  ];

  const servicesOptions = [
    { value: "video_production", label: "Video Production" },
    { value: "photography", label: "Photography" },
    { value: "animation", label: "Animation" },
    { value: "motion_graphics", label: "Motion Graphics" },
    { value: "video_editing", label: "Video Editing" },
    { value: "sound_design", label: "Sound Design" },
    { value: "color_grading", label: "Color Grading" },
    { value: "vfx", label: "VFX" },
    { value: "live_streaming", label: "Live Streaming" },
    { value: "360_video", label: "360° Video" },
    { value: "drone_videography", label: "Drone Videography" },
  ];

  if (loading) {
    return (
      <Layout>
        <div>Loading client data...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <FormHeader
          title="Edit Client"
          showUpdate={hasChanges && canEdit}
          onUpdate={handleSubmit}
          showDelete
          onDelete={handleDelete}
          showBan
          isBanned={isBanned}
          onBanToggle={handleBanToggle}
          backUrl="/client"
          onBack={handleBackNavigation}
        />
        <Row>
          <Col md={7}>
            <div className="form_section">
              <h6 className="card-title">Client Details</h6>

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
                <Col md={6}>
                  <TextInput
                    label="User Name"
                    name="username"
                    placeholder="Type last name"
                    value={formData.username || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
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
              </Row>
            </div>
            <div className="form_section">
              <h6 className="card-title">Contact Details</h6>

              <TextInput
                label="Phone Number"
                name="phone_number"
                placeholder="Type phone number"
                value={formData.phone_number || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />


              <label className="form-label">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="form-control"
              />

              {/* ✅ Show Preview */}
              {profilePhoto ? (
                <div className="mt-3 text-left">
                  <img
                    src={
                      typeof profilePhoto === "string"
                        ? profilePhoto.includes("http")
                          ? profilePhoto // already full URL from backend
                          : `${process.env.REACT_APP_API_BASE_URL}/${profilePhoto}` // backend path
                        : URL.createObjectURL(profilePhoto)
                    }
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #ddd",
                    }}
                  />
                  <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                    Profile Preview
                  </p>
                </div>
              ) : (
                <p className="text-muted mt-2">No photo uploaded</p>
              )}



              <TextInput
                label="Address"
                name="address_line_first"
                // placeholder="Type address_line_first"
                value={formData.address_line_first || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />

              {/* Row: City & State */}
              <Row className="mb-3">
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
                    label="Pincode"
                    name="pincode"
                    placeholder="Type pincode"
                    value={formData.pincode || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>
              <label className="form-label">Business Registration Document</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleBusinessDocumentChange} // separate handler if needed
                className="form-control"
              />

              {/* ✅ Show Preview */}
              {businessDocument ? (
                <div className="mt-3">
                  {typeof businessDocument === "string" ? (
                    <a
                      href={
                        businessDocument.includes("http")
                          ? businessDocument
                          : `${process.env.REACT_APP_API_BASE_URL}/${businessDocument}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Document
                    </a>
                  ) : (
                    <p>{businessDocument.name}</p> // newly uploaded file
                  )}
                </div>
              ) : (
                <p className="text-muted mt-2">No document uploaded</p>
              )}


              <TextInput
                label="Tax ID / Business Number"
                name="tax_id"
                // placeholder="Type pincode"
                value={formData.tax_id || ""}
                onChange={handleInputChange}
                disabled={!canEdit}
              />

            </div>
          </Col>

          <Col md={5}>
            <div className="form_section">
              <h6 className="card-title">Professinal Details</h6>

              <TextInput
                label="Company/Brand Name"
                name="company_name"
                placeholder="Type company name"
                value={formData.company_name || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />
              <SelectComponent
                label="Industry"
                name="industry"
                placeholder="Select industry"
                options={industryOptions}
                value={formData.industry || ""}
                onChange={(value) => handleInputChange("industry", value)}
                required
                disabled={!canEdit}
              />
              <TextInput
                label="Website"
                name="website"
                placeholder="Type website name"
                value={formData.website || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />
              <TextInput
                label="Social Link"
                name="social_links"
                placeholder="Type company name"
                value={formData.social_links || ""}
                onChange={handleInputChange}
                required
                disabled={!canEdit}
              />
              <SelectComponent
                label="Company Size"
                name="company_size"
                placeholder="Select industry"
                options={companySizeOptions}
                value={formData.company_size || ""}
                onChange={(value) => handleInputChange("company_size", value)}
                required
                disabled={!canEdit}
              />
              <SelectComponent
                label="Services Required"
                name="services_required"
                placeholder="Select services"
                options={servicesOptions} // create a proper array for services
                value={formData.services_required || []}
                onChange={(value) => handleInputChange("services_required", value)}
                disabled={!canEdit}
              />

            </div>
            <div className="form_section">
              <h6 className="card-title">Work Preferences</h6>
              <SelectComponent
                label="Preferred Work Arrangement"
                name="work_arrangement"
                value={formData.work_arrangement || ""}
                onChange={(val) => handleInputChange("work_arrangement", val)}
                options={[
                  { value: "", label: "Select Work Arrangement" },
                  { value: "remote", label: "Remote Only" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "on_site", label: "On Site" },
                ]}
                required
                disabled={!canEdit}
              />
              <SelectComponent
                label="Project Frequency"
                name="project_frequency"
                value={formData.project_frequency || ""}
                onChange={(val) => handleInputChange("project_frequency", val)}
                options={[
                  { value: "", label: "Select Project Frequency" },
                  { value: "one_time", label: "One Time" },
                  { value: "occasional", label: "Occasional" },
                  { value: "ongoing", label: "On Going" },
                ]}
                required
                disabled={!canEdit}
              />
              <SelectComponent
                label="Hiring Preferences"
                name="hiring_preferences"
                value={formData.hiring_preferences || ""}
                onChange={(val) => handleInputChange("hiring_preferences", val)}
                options={[
                  { value: "", label: "Select Hiring Preferences" },
                  { value: "individuals", label: "Individual Freelancers" },
                  { value: "agencies", label: "Agencies Only" },
                  { value: "both", label: "Both Individuals and Agencies" },
                ]}
                required
                disabled={!canEdit}
              />
            </div>
          </Col>
        </Row>
      </form>
    </Layout>
  );
};

export default EditClient;