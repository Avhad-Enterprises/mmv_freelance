import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import SelectComponent from "../components/SelectComponent";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePutRequest, makeGetRequest, makeDeleteRequest, makePostRequest, makePatchRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useSweetAlert } from "../components/SweetAlert";
import { getLoggedInUser } from "../utils/auth";
import _ from "lodash";

const EditVideoEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showAlert } = useSweetAlert();
    const [formData, setFormData] = useState({
        user_id: null,
        full_name: "",
        username: "",
        password: "",
        email: "",
        profile_photo: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        profile_title: "",
        short_description: "",
        skill_tags: [],
        superpowers: [],
        portfolio_links: [],
        certification: [],
        education: [],
        previous_works: [],
        services: [],
        rate_amount: "",
        rate_currency: "INR",
        availability: "",
        work_type: "",
        hours_per_week: "",
        id_type: "",
        id_document_url: "",
        languages: [],
    });
    const [loading, setLoading] = useState(true);
    const [initialState, setInitialState] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [canEdit, setCanEdit] = useState(true); // Adjust based on permissions
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [idDocument, setidDocument] = useState(null);
    const [links, setLinks] = useState(["", "", ""]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [superpowersOptions, setSuperpowersOptions] = useState([]);
    const [isBanned, setIsBanned] = useState(false);
    const [, setBannedReason] = useState("");

    const areObjectsEqual = (obj1, obj2) => {
        return _.isEqual(obj1, obj2);
    };

    useEffect(() => {
        const fetchVideoEditorData = async () => {
            try {
                const user = getLoggedInUser();
                if (!user?.user_id) {
                    showErrorToast("Please log in to edit video editor.");
                    navigate("/login");
                    return;
                }

                const response = await makeGetRequest(`videoeditors/${id}`);
                console.log("Video Editor API Response:", response); // Debug log
                const editorUser = response.data?.data?.user || {};
                setIsBanned(!!editorUser.is_banned);
                setBannedReason(editorUser.banned_reason || "");
                const profile = response.data?.data?.profile || {};

                if (!editorUser && !profile) {
                    showErrorToast("VideoEditor not found.");
                    navigate("/videoeditorhomepage");
                    return;
                }

                setCanEdit(true);

                const newFormData = {
                    user_id: editorUser.user_id || null,
                    first_name: editorUser.first_name || "",
                    last_name: editorUser.last_name || "",
                    username: editorUser.username || "",
                    email: editorUser.email || "",
                    phone_number: editorUser.phone_number || "",
                    address_line_first: editorUser.address_line_first || "",
                    city: editorUser.city || "",
                    state: editorUser.state || "",
                    country: editorUser.country || "",
                    pincode: editorUser.pincode || "",
                    profile_photo: editorUser.profile_picture || "",

                    // Professional/Profile Details
                    profile_title: profile.profile_title || "",
                    short_description: profile.short_description || "",
                    skill_tags: profile.skill_tags || [],
                    superpowers: profile.superpowers || [],
                    portfolio_links: profile.portfolio_links || [],
                    rate_amount: profile.rate_amount || "",
                    rate_currency: profile.rate_currency || "INR",
                    availability: profile.availability || "",
                    id_type: profile.id_type || "",
                    id_document_url: profile.id_document_url || "",
                    languages: profile.languages || [],
                };



                console.log("New Form Data:", newFormData); // Debug log
                setFormData(newFormData);
                // Portfolio links
                setLinks(profile.portfolio_links && profile.portfolio_links.length > 0
                    ? profile.portfolio_links
                    : ["", "", ""]);

                // Profile photo
                setProfilePhoto(editorUser.profile_picture || null);

                // ID document
                setidDocument(profile.id_document_url || null);

                setInitialState({ formData: { ...newFormData } });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching video editor:", error);
                showErrorToast("Failed to load videoeditor data.");
                setLoading(false);
                navigate("/videoeditorhomepage");
            }
        };

        if (localStorage.getItem("jwtToken")) {
            fetchVideoEditorData();
        } else {
            showErrorToast("Please log in to edit video editor.");
            navigate("/login");
        }
    }, [id, navigate]);

    useEffect(() => {
        if (initialState) {
            // Combine formData and links for comparison
            const currentState = { ...formData, portfolio_links: links };
            const hasFormChanges = !areObjectsEqual(currentState, initialState.formData);
            setHasChanges(hasFormChanges);
            console.log("hasChanges:", hasFormChanges, "Current State:", currentState, "Initial State:", initialState.formData);
        }
    }, [formData, links, initialState]);


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

    useEffect(() => {
        const fetchSuperpowers = async () => {
            try {
                const response = await makeGetRequest("categories");
                const fetched = response.data?.data || [];

                const editorCategories = fetched
                    .filter(cat => cat.category_type === "editor" && cat.is_active)
                    .map(cat => ({
                        value: cat.category_name,
                        label: cat.category_name,
                    }));

                setSuperpowersOptions(editorCategories);
            } catch (error) {
                console.error("Failed to fetch superpowers:", error);
                setSuperpowersOptions([]);
            }
        };

        const fetchSkills = async () => {
            try {
                const response = await makeGetRequest("skills");
                const fetchedSkills = response.data?.data || [];
                const skillNames = fetchedSkills.map(tag => ({
                    value: tag.skill_name,
                    label: tag.skill_name,
                }));
                setAvailableSkills(skillNames);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
                setAvailableSkills([]);
            }
        };

        fetchSkills();
        fetchSuperpowers();
    }, []);


    // Add new empty link field
    const addNewLinkField = () => {
        setLinks((prev) => [...prev, ""]);
    };

    // Handle link input changes
    const handleLinkChange = (index, value) => {
        setLinks((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // Validate YouTube URLs
    const isValidYouTubeUrl = (url) => {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return pattern.test(url);
    };


    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
        }
    };

    const handleIDDocument = (e) => {
        const file = e.target.files[0];
        if (file) {
            setidDocument(file);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canEdit) {
            showErrorToast("You are not authorized to edit this video editor.");
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

        const userPayload = {
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
            profile_picture: profilePhoto,
        };

        const profilePayload = {
            user_id: parseInt(id, 10),
            profile_title: formData.profile_title,
            short_description: formData.short_description,
            skill_tags: formData.skill_tags,
            superpowers: formData.superpowers,
            portfolio_links: links.filter((l) => l.trim() !== ""),
            rate_amount: formData.rate_amount,
            rate_currency: formData.rate_currency,
            // availability: formData.availability,
            id_type: formData.id_type,
            id_document_url: idDocument,
            languages: formData.languages,
        };

        try {
            // 1️⃣ Update basic user info
            await makePutRequest(`users/${id}`, userPayload);

            // 2️⃣ Update profile info (for video editor)
            await makePatchRequest(`videoeditors/profile`, profilePayload); // or makePatchRequest if you have it

            showSuccessToast("🎉 Video Editor updated successfully!");
            setHasChanges(false);
            navigate("/videoeditorhomepage");
        } catch (err) {
            console.error("Update error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            showErrorToast(err.response?.data?.message || "Failed to update video editor.");
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
                    navigate("/videoeditorhomepage");
                },
            });
        } else {
            navigate("/videoeditorhomepage");
        }
    };

    const handleDelete = async () => {
        if (!canEdit) {
            showErrorToast("You are not authorized to delete this videoeditor.");
            return;
        }

        showAlert({
            title: "Are you sure?",
            text: "Are you sure you want to delete this videoeditor? This action cannot be undone.",
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
                    showSuccessToast("Video Editor deleted successfully!");
                    navigate("/videoeditorhomepage");
                } catch (error) {
                    console.error("Delete error:", error);
                    showErrorToast(error.response?.data?.message || "Failed to delete video editor.");
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

    const availabilityOptions = [
        { value: "", label: "Select Project Frequency" },
        { value: "one_time", label: "One Time" },
        { value: "occasional", label: "Occasional" },
        { value: "ongoing", label: "On Going" },
    ];

    const availableLanguages = [
        "English", "Hindi", "Marathi", "Gujarati", "Bengali", "Telugu", "Tamil",
        "Kannada", "Malayalam", "Punjabi", "Urdu", "Sanskrit", "Spanish", "French",
        "German", "Chinese", "Japanese", "Korean", "Arabic", "Russian"
    ];

    const languageOptions = availableLanguages.map(lang => ({
        value: lang,
        label: lang,
    }));

    if (loading) {
        return (
            <Layout>
                <div>Loading video editor data...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <FormHeader
                    title="Edit Video Editor"
                    showUpdate={hasChanges && canEdit}
                    onUpdate={handleSubmit}
                    showDelete
                    onDelete={handleDelete}
                    showBan
                    isBanned={isBanned}
                    onBanToggle={handleBanToggle}
                    backUrl="/videoeditorhomepage"
                    onBack={handleBackNavigation}
                />
                <Row>
                    <Col md={7}>
                        <div className="form_section">
                            <h6 className="card-title">Basic Information</h6>

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
                                label="Phone Number & OTP Verification"
                                name="phone_number"
                                placeholder="Type phone number"
                                value={formData.phone_number || ""}
                                onChange={handleInputChange}
                                required
                                disabled={!canEdit}
                            />

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
                            <Row className="mb-3">
                                <Col md={6}>

                                    <label className="form-label">ID Verification*</label>
                                    <select
                                        className="form-control"
                                        value={formData.id_type}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, id_type: e.target.value }))
                                        }
                                    >
                                        <option value="">Select ID Type</option>
                                        <option value="passport">Passport</option>
                                        <option value="driving_license">Driving License</option>
                                        <option value="national_id">National ID</option>
                                        <option value="aadhaar">Aadhaar</option>
                                    </select>
                                </Col>
                                <Col md={6}>
                                    <label className="form-label">Upload ID Document</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleIDDocument} // separate handler if needed
                                        className="form-control"
                                    />

                                    {/* ✅ Show Preview */}
                                    {idDocument ? (
                                        <div className="mt-3">
                                            {typeof idDocument === "string" ? (
                                                <a
                                                    href={
                                                        idDocument.includes("http")
                                                            ? idDocument
                                                            : `${process.env.REACT_APP_API_BASE_URL}/${idDocument}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download Document
                                                </a>
                                            ) : (
                                                <p>{idDocument.name}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted mt-2">No document uploaded</p>
                                    )}

                                </Col>
                            </Row>

                        </div>
                    </Col>

                    <Col md={5}>
                        <div className="form_section">
                            <h6 className="card-title">Professinal Details</h6>
                            <SelectComponent
                                label="Skills"
                                name="skill_tags"
                                placeholder="Select Skills"
                                options={availableSkills}       // dynamic
                                value={formData.skill_tags || []}
                                onChange={(value) => handleInputChange("skill_tags", value)}
                                isMulti={true}
                                required
                                disabled={!canEdit}
                            />

                            <SelectComponent
                                label="My Superpowers are"
                                name="superpowers"
                                placeholder="Select Superpowers"
                                options={superpowersOptions}    // dynamic
                                value={formData.superpowers || []}
                                onChange={(value) => handleInputChange("superpowers", value)}
                                isMulti={true}
                                required
                                disabled={!canEdit}
                            />

                            <label className="form-label">Portfolio Links (YouTube only)</label>
                            <small className="d-block mb-2">
                                Minimum one valid YouTube link is mandatory.
                            </small>

                            {links.map((link, index) => (
                                <div key={index} className="d-flex align-items-center mb-2">
                                    <input
                                        type="url"
                                        className="form-control"
                                        placeholder={`YouTube Link ${index + 1}`}
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        required={index === 0} // first field mandatory
                                    />
                                    {!isValidYouTubeUrl(link) && link !== "" && (
                                        <small style={{ color: "red", marginLeft: "10px" }}>
                                            Invalid YouTube link
                                        </small>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={addNewLinkField}
                            >
                                + Add More
                            </button>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <TextInput
                                        label="Rate Amount"
                                        name="rate_amount"
                                        placeholder="Type phone number"
                                        value={formData.rate_amount || ""}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!canEdit}
                                    />
                                </Col>
                                <Col md={6}>
                                    <label className="form-label">Currency*</label>
                                    <select
                                        className="form-control"
                                        value={formData.rate_currency}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, rate_currency: e.target.value }))
                                        }
                                    >
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </Col>
                            </Row>
                        </div>
                        <div className="form_section">
                            <h6 className="card-title">Work Preferences</h6>
                            <TextInput
                                label="Short Description"
                                name="short_description"
                                placeholder="Type website name"
                                value={formData.short_description || ""}
                                onChange={handleInputChange}
                                required
                                disabled={!canEdit}
                            />
                            <Row className="md-3">
                                <Col md={6}>
                                    <label className="form-label">Availability*</label>
                                    <select
                                        className="form-control"
                                        value={formData.availability}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, availability: e.target.value }))
                                        }
                                    >
                                        <option value="">Select Availability</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="full-time">Full-Time</option>
                                        <option value="flexible"> Flexible</option>
                                        <option value="on-demand">On-Demand</option>
                                    </select>
                                </Col>
                                <Col md={6}>
                                    <SelectComponent
                                        label="Languages Spoken"
                                        name="languages"
                                        placeholder="Select languages"
                                        options={languageOptions}
                                        value={formData.languages || []} // array of selected languages
                                        onChange={(value) => handleInputChange("languages", value)}
                                        isMulti={true} // allow multiple selections
                                        required
                                        disabled={!canEdit}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </Col>
                </Row>
            </form>
        </Layout>
    );
};

export default EditVideoEditor;