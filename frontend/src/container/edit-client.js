import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import TagInput from "../components/TagInput";
import Aetextarea from "../components/Aetextarea";
import CheckboxInput from "../components/CheckboxInput";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";
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
    email: "",
    phone_number: "",
    address_line_first: "",
    address_line_second: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    // notes: "",
    tags: [],
    is_active: true,
    bio: "",
    projects_created: 0,
    total_spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [canEdit, setCanEdit] = useState(true); // Adjust based on permissions

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

        const payload = { user_id: parseInt(id, 10) };
        const response = await makePostRequest("users/get_client_by_id", payload);
        console.log("Client API Response:", response); // Debug log
        const client = response.data?.data;

        if (!client) {
          showErrorToast("Client not found.");
          navigate("/client");
          return;
        }

        // Set canEdit based on permissions (e.g., only admins can edit)
        setCanEdit(true); // Adjust based on your permission logic

        let parsedTags = [];
        if (Array.isArray(client.tags)) {
          parsedTags = client.tags;
        } else if (typeof client.tags === "string") {
          try {
            parsedTags = JSON.parse(client.tags);
          } catch (e) {
            console.error("Error parsing tags:", e);
            parsedTags = [];
          }
        }
        setSelectedTags(parsedTags);

        const newFormData = {
          //   user_id: parseInt(client.user_id, 10),
          first_name: client.first_name || "",
          last_name: client.last_name || "",
          email: client.email || "",
          phone_number: client.phone_number || "",
          address_line_first: client.address_line_first || "",
          address_line_second: client.address_line_second || "",
          city: client.city || "",
          state: client.state || "",
          country: client.country || "",
          pincode: client.pincode || "",
          // notes: client.notes || "",
          tags: parsedTags,
          is_active: !!client.is_active,
          bio: client.bio || "",
          projects_created: client.projects_created || 0,
          total_spent: client.total_spent || 0,
        };

        console.log("New Form Data:", newFormData); // Debug log
        setFormData(newFormData);
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
      }
    },
    [canEdit]
  );

  const [availableTags, setAvailableTags] = useState([]);
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

    fetchTags();
  }, []);

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
      email: formData.email,
      phone_number: formData.phone_number,
      address_line_first: formData.address_line_first,
      address_line_second: formData.address_line_second,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      // notes: formData.notes,
      tags: JSON.stringify(selectedTags),
      role: formData.role,
      is_active: formData.is_active,
      bio: formData.bio,
    };

    try {
      await makePostRequest(`users/update_user_by_id`, payload);
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
          await makePostRequest("users/soft_delete_user", { user_id: parseInt(id, 10) });
          showSuccessToast("Client deleted successfully!");
          navigate("/client");
        } catch (error) {
          console.error("Delete error:", error);
          showErrorToast(error.response?.data?.message || "Failed to delete client.");
        }
      },
    });
  };

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
          showDelete
          onDelete={handleDelete}
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

              {/* Row 3: Bio */}
              <Row>
                <Col md={12}>
                  <Aetextarea
                    label="Bio"
                    name="bio"
                    placeholder="Type client bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row>

              {/* <Row className="mb-3">
                <Col md={12}>
                  <CheckboxInput
                    label="Clients agreed to receive emails"
                    name="email_verified"
                    checked={formData.agreed_to_emails || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
                <Col md={12}>
                  <CheckboxInput
                    label="Clients agreed to receive text/SMS"
                    name="phone_verified"
                    checked={formData.agreed_to_sms || false}
                    onChange={handleInputChange}
                    disabled={!canEdit}
                  />
                </Col>
              </Row> */}

            </div>
            {/* <div className="form_section">
              <h6 className="card-title">Project Details</h6>

            </div> */}
          </Col>

          <Col md={5}>
            <div className="form_section">
              <h6 className="card-title">Client Address</h6>

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
            </div>

            {/* <div className="form_section">
              <Aetextarea
                label="Notes"
                name="notes"
                placeholder="Type notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div> */}

            <Col>
              <div className="form_section">
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

export default EditClient;