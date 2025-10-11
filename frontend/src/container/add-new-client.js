import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SelectComponent from "../components/SelectComponent";
import Select from "react-select";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import TagInput from "../components/TagInput";
import Aetextarea from "../components/Aetextarea";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getLoggedInUser } from "../utils/auth";
import { Country, State, City } from "country-state-city";

const CreateClient = () => {
    const navigate = useNavigate();
    const inputRefs = useRef({});
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        password: "",
        email: "",
        phone_number: "",
        profile_picture: null,
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        account_type: "client",
        tax_id: "",
        business_document_url: null, // for file
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

    const [selectedTags, setSelectedTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // ✅ Load countries once
    useEffect(() => {
        const fetchedCountries = Country.getAllCountries();
        const allCountries = fetchedCountries.map(c => ({
            label: c.name,
            value: c.isoCode, // important! use isoCode, not name
        }));
        setCountries(allCountries);
    }, []);

    // ✅ Load states when country changes
    useEffect(() => {
        console.log("Selected Country (ISO):", selectedCountry);

        if (selectedCountry) {
            const fetchedStates = State.getStatesOfCountry(selectedCountry);
            console.log("Fetched States:", fetchedStates);

            const allStates = fetchedStates.map(s => ({
                label: s.name,
                value: s.isoCode,
            }));
            setStates(allStates);
            setSelectedState("");
            setCities([]);
            setSelectedCity("");
        }
    }, [selectedCountry]);

    // ✅ Load cities when state changes
    useEffect(() => {
        console.log("Selected State (ISO):", selectedState);

        if (selectedCountry && selectedState) {
            const fetchedCities = City.getCitiesOfState(selectedCountry, selectedState);
            console.log("Fetched Cities:", fetchedCities);

            const allCities = fetchedCities.map(c => ({
                label: c.name,
                value: c.name,
            }));
            setCities(allCities);
            setSelectedCity("");
        }
    }, [selectedCountry, selectedState]);


    // fetch available tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await makeGetRequest("tags/geteventtags");
                const fetchedTags = response.data?.data || [];
                const tagNames = fetchedTags.map((tag) => tag.tag_name);
                setAvailableTags(tagNames);
            } catch (error) {
                console.error("Failed to fetch tags:", error);
                setAvailableTags(["default-tag"]);
            }
        };
        fetchTags();
    }, []);

    const handleInputChange = useCallback((e, customValue = null) => {
        if (e?.target) {
            const { name, type, value, checked } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        } else if (typeof e === "string" && customValue !== null) {
            setFormData((prev) => ({
                ...prev,
                [e]: customValue,
            }));
        }
    }, []);

    const handleTagsChange = useCallback((newTags) => {
        setSelectedTags(newTags);
        setFormData((prev) => ({ ...prev, tags: newTags }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            return;
        }

        const payload = new FormData(); // ✅ use FormData for file upload
        payload.append("full_name", formData.full_name);
        payload.append("username", formData.username);
        payload.append("password", formData.password);
        payload.append("email", formData.email);
        payload.append("phone_number", formData.phone_number);
        payload.append("address", formData.address);
        payload.append("city", formData.city);
        payload.append("state", formData.state);
        payload.append("country", formData.country);
        payload.append("pincode", formData.pincode);
        payload.append("account_type", "client");
        payload.append("tax_id", formData.tax_id || "");
        if (formData.profile_picture instanceof File) {
            payload.append("profile_picture", formData.profile_picture);
        }

        if (formData.business_document_url instanceof File) {
            payload.append("business_document_url", formData.business_document_url);
        }
        payload.append("company_name", formData.company_name);
        payload.append("industry", formData.industry || "");
        payload.append("website", formData.website || "");
        payload.append("social_links", formData.social_links || "");
        payload.append("company_size", formData.company_size || "");
        payload.append("services_required", JSON.stringify(formData.services_required));
        payload.append("work_arrangement", formData.work_arrangement || "");
        payload.append("project_frequency", formData.project_frequency || "");
        payload.append("hiring_preferences", formData.hiring_preferences || "");

        console.log("Submitting FormData", payload);

        try {
            const response = await makePostRequest("auth/register/client", payload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            showSuccessToast("🎉 Client added successfully!");
            navigate("/client");
        } catch (err) {
            console.error("Insert error:", err.response?.data || err.message);
            showErrorToast(err.response?.data?.message || "Failed to add client.");
        }
    };


    // Company Size options
    const companySizeOptions = [
        { value: "", label: "Select company size" },
        { value: "1-10", label: "1-10" },
        { value: "11-50", label: "11-50" },
        { value: "51-200", label: "51-200" },
        { value: "200+", label: "200+" },
    ];

    // Services Required options
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

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <FormHeader
                    title="Add New Client"
                    showAdd
                    backUrl="/client"
                    onBack={() => navigate("/client")}
                />
                <Row>
                    <Col md={7}>
                        <div className="form_section">
                            <h6 className="card-title">Client Details</h6>

                            {/* Row 1 */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.full_name = el)}
                                        label="Full Name"
                                        name="full_name"
                                        placeholder="Type full name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.username = el)}
                                        label="User Name"
                                        name="username"
                                        placeholder="Type User name"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.email = el)}
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="Type email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Password <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="form-control"
                                                placeholder="Enter password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                                style={{ paddingRight: "40px" }} // space for the icon
                                            />
                                            <span
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: "absolute",
                                                    right: "12px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    cursor: "pointer",
                                                    color: "#6c757d",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="form_section">
                            <h6 className="card-title">Contact Details</h6>
                            <TextInput
                                ref={(el) => (inputRefs.current.phone_number = el)}
                                label="Phone Number"
                                name="phone_number"
                                type="number"
                                placeholder="Type phone number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                required={true}
                                maxLength={10}
                                minLength={10}
                            />
                            <label className="form-label">
                                Profile Photo (Optional)
                            </label>
                            <input
                                type="file"
                                name="profile_picture"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0] || null;
                                    if (!file) return;

                                    if (!file.type.startsWith("image/")) {
                                        alert("Only image files are allowed.");
                                        e.target.value = "";
                                        return;
                                    }

                                    if (file.size > 5 * 1024 * 1024) {
                                        alert("File size must be less than 5MB.");
                                        e.target.value = "";
                                        return;
                                    }

                                    // ✅ Directly set the File object
                                    setFormData(prev => ({ ...prev, profile_picture: file }));
                                }}
                            />

                            <small className="text-muted">
                                Upload your profile photo. Max 5MB.
                            </small>
                            {showErrors && !formData.profile_picture && (
                                <small className="text-danger">Profile Photo is required.</small>
                            )}

                            <TextInput
                                ref={(el) => (inputRefs.current.address = el)}
                                label="Address"
                                name="address"
                                placeholder="Type address line 1"
                                value={formData.address}
                                onChange={handleInputChange}
                                required={true}
                            />
                            {showErrors && !formData.address && (
                                <small className="text-danger">Address is required.</small>
                            )}

                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="form-label">Country</label>
                                    <Select
                                        options={countries}
                                        value={countries.find(c => c.value === selectedCountry)}
                                        onChange={opt => {
                                            setSelectedCountry(opt.value);
                                            handleInputChange("country", opt.label); // update formData.country for review
                                        }}
                                        placeholder="Select Country"
                                    />
                                    {showErrors && !formData.country && (
                                        <small className="text-danger">Country is required.</small>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <label className="form-label">State</label>
                                    <Select
                                        options={states}
                                        value={states.find(s => s.value === selectedState)}
                                        onChange={opt => {
                                            setSelectedState(opt.value);
                                            handleInputChange("state", opt.label); // update formData.state
                                        }}
                                        placeholder="Select State"
                                        isDisabled={!selectedCountry}
                                    />
                                    {showErrors && !formData.state && (
                                        <small className="text-danger">State is required.</small>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="form-label">City</label>
                                    <Select
                                        options={cities}
                                        value={cities.find(c => c.value === selectedCity)}
                                        onChange={opt => {
                                            setSelectedCity(opt.value);
                                            handleInputChange("city", opt.label); // update formData.city
                                        }}
                                        placeholder="Select City"
                                        isDisabled={!selectedState}
                                    />
                                    {showErrors && !formData.city && (
                                        <small className="text-danger">City is required.</small>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.pincode = el)}
                                        label="Pincode"
                                        name="pincode"
                                        placeholder="Type pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {showErrors && !formData.pincode && (
                                        <small className="text-danger">Pincode is required.</small>
                                    )}
                                </Col>
                            </Row>
                            {/* <Row className="mb-3">
                                <SelectComponent
                                    label="ID Type"
                                    name="id_type"
                                    value={formData.id_type}
                                    onChange={(val) => handleInputChange("id_type", val)}
                                    options={[
                                        { value: "", label: "Select ID Type" },
                                        { value: "passport", label: "Passport" },
                                        { value: "driving_license", label: "Driving License" },
                                        { value: "national_id", label: "National ID" },
                                    ]}
                                    required
                                />
                            </Row> */}
                            <Row className="mb-3">
                                <label className="form-label">
                                    Business Registration Documents (Optional)
                                    <span className="text-danger"> *</span>
                                </label>
                                <input
                                    type="file"
                                    name="business_document_url"
                                    className="form-control"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        if (file.type !== "application/pdf") {
                                            alert("Only PDF files are allowed.");
                                            e.target.value = "";
                                            return;
                                        }

                                        if (file.size > 10 * 1024 * 1024) {
                                            alert("File size must be less than 10MB.");
                                            e.target.value = "";
                                            return;
                                        }

                                        setFormData(prev => ({ ...prev, business_document_url: file }));
                                        setShowErrors(false);
                                    }}
                                />

                                <small style={{ color: "blue" }}>
                                    Upload business registration documents. This will be mandatory before your first payout.
                                    Accepted format: PDF (Max 10MB)
                                </small>
                                {showErrors && (
                                    <small className="text-danger">
                                        Business Registration Document is required
                                    </small>
                                )}
                            </Row>

                            <Row className="mb-3">
                                <TextInput
                                    ref={(el) => (inputRefs.current.tax_id = el)}
                                    label="Tax ID / Business Number (Optional)"
                                    name="tax_id"
                                    placeholder="Enter your tax ID or business number"
                                    value={formData.tax_id}
                                    onChange={handleInputChange}
                                    required={true}
                                />
                                {showErrors && !formData.tax_id && (
                                    <small className="text-danger">Tax ID is required.</small>
                                )}
                            </Row>
                        </div>
                    </Col>

                    <Col md={5}>
                        <div className="form_section">
                            <h6 className="card-title">Professional Details</h6>
                            <TextInput
                                ref={(el) => (inputRefs.current.company_name = el)}
                                label="Company/Brand Name"
                                name="company_name"
                                placeholder="e.g., Avhad Enterprise"
                                value={formData.company_name}
                                onChange={handleInputChange}
                                required
                            />
                            {showErrors && !formData.company_name && (
                                <small className="text-danger">Company Name is required.</small>
                            )}
                            <SelectComponent
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={(val) => handleInputChange("industry", val)}
                                options={[
                                    { value: "", label: "Select Industry Type" },
                                    { value: "film", label: "Film" },
                                    { value: "ad_agency", label: "Ad Agency" },
                                    { value: "events", label: "Events" },
                                    { value: "youtube", label: "Youtube" },
                                    { value: "corporate", label: "Corporate" },
                                    { value: "other", label: "Other" },
                                ]}
                                required
                            />
                            {showErrors && !formData.industry && (
                                <small className="text-danger">Industry is required.</small>
                            )}

                            <TextInput
                                ref={(el) => (inputRefs.current.website = el)}
                                label="Website"
                                name="website"
                                placeholder="https://your-website.com"
                                value={formData.website}
                                onChange={handleInputChange}
                                required={true}
                            />
                            {showErrors && !formData.website && (
                                <small className="text-danger">Website is required.</small>
                            )}

                            <TextInput
                                ref={(el) => (inputRefs.current.social_links = el)}
                                label="Social Links"
                                name="social_links"
                                placeholder="https://linkedin.com"
                                value={formData.social_links}
                                onChange={handleInputChange}
                                required={true}
                            />
                            {showErrors && !formData.social_links && (
                                <small className="text-danger">Social Link is required.</small>
                            )}

                            <label className="form-label">Company Size <span className="text-danger"> *</span></label>
                            <Select
                                options={companySizeOptions}
                                value={companySizeOptions.find(c => c.value === formData.company_size)}
                                onChange={opt => handleInputChange("company_size", opt.value)}
                                placeholder="Select Company Size"
                            />
                            {showErrors && !formData.company_size && (
                                <small className="text-danger">Company Size is required.</small>
                            )}

                            <label className="form-label">Services Required <span className="text-danger"> *</span></label>
                            <Select
                                options={servicesOptions}
                                value={servicesOptions.filter(s =>
                                    Array.isArray(formData.services_required)
                                        ? formData.services_required.includes(s.value)
                                        : formData.services_required === s.value
                                )}
                                onChange={(opts) => {
                                    const values = opts ? opts.map(o => o.value) : [];
                                    handleInputChange("services_required", values);
                                }}
                                placeholder="Select Type of Service"
                                isMulti
                                required
                            />
                            {showErrors && !formData.services_required && (
                                <small className="text-danger">Services are required.</small>
                            )}
                        </div>


                        <div className="form_section">
                            <h6 className="card-title">Work Preferences</h6>
                            <SelectComponent
                                label="Preferred Work Arrangement"
                                name="work_arrangement"
                                value={formData.work_arrangement}
                                onChange={(val) => handleInputChange("work_arrangement", val)}
                                options={[
                                    { value: "", label: "Select Work Arrangement" },
                                    { value: "remote", label: "Remote Only" },
                                    { value: "hybrid", label: "Hybrid" },
                                    { value: "on_site", label: "On Site" },
                                ]}
                                required
                            />
                            {showErrors && !formData.work_arrangement && (
                                <small className="text-danger">Work Arrangement is required.</small>
                            )}

                            <SelectComponent
                                label="Project Frequency"
                                name="project_frequency"
                                value={formData.project_frequency}
                                onChange={(val) => handleInputChange("project_frequency", val)}
                                options={[
                                    { value: "", label: "Select Project Frequency" },
                                    { value: "one_time", label: "One Time" },
                                    { value: "occasional", label: "Occasional" },
                                    { value: "ongoing", label: "On Going" },
                                ]}
                                required
                            />
                            {showErrors && !formData.project_frequency && (
                                <small className="text-danger">Project Currency is required.</small>
                            )}

                            <SelectComponent
                                label="Hiring Preferences"
                                name="hiring_preferences"
                                value={formData.hiring_preferences}
                                onChange={(val) => handleInputChange("hiring_preferences", val)}
                                options={[
                                    { value: "", label: "Select Hiring Preferences" },
                                    { value: "individuals", label: "Individual Freelancers" },
                                    { value: "agencies", label: "Agencies Only" },
                                    { value: "both", label: "Both Individuals and Agencies" },
                                ]}
                                required
                            />
                            {showErrors && !formData.hiring_preferences && (
                                <small className="text-danger">Hiring Preferences is required.</small>
                            )}
                        </div>
                    </Col>
                </Row>
                <div className="text-end">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsReviewMode(true)}
                    >
                        Review Information
                    </button>
                </div>
                {isReviewMode && (
                    <div className="form_section mt-4">
                        <h6 className="card-title">Review Information</h6>
                        <p>Please review your information carefully before submitting</p>

                        <Row>
                            {/* Left Column: Basic & Contact Details */}
                            <Col md={6}>
                                <h6 className="card-title">Basic Information</h6>
                                <p><strong>Full Name:</strong> {formData.full_name}</p>
                                <p><strong>Username:</strong> {formData.username}</p>
                                <p><strong>Email:</strong> {formData.email}</p>

                                <h6 className="card-title mt-3">Contact Details</h6>
                                <p><strong>Phone:</strong> {formData.phone_number}</p>
                                <p><strong>Profile Photo:</strong> {formData.profile_picture ? formData.profile_picture.name : "Not provided"}</p>
                                <p><strong>Country:</strong> {formData.country}</p>
                                <p><strong>State:</strong> {formData.state}</p>
                                <p><strong>City:</strong> {formData.city}</p>
                                <p><strong>Pincode:</strong> {formData.pincode}</p>
                                <h6 className="card-title mt-3">Verification Details</h6>
                                <p>
                                    <strong>Business Registration Document:</strong>{" "}
                                    {formData.business_document_url
                                        ? formData.business_document_url.name
                                        : "Not provided"}
                                </p>

                                <p><strong>Tax ID / Business Number:</strong> {formData.tax_id || "Not provided"}</p>
                            </Col>

                            {/* Right Column: Professional & Work Details */}
                            <Col md={6}>
                                <h6 className="card-title">Professional Details</h6>
                                <p><strong>Company Name:</strong> {formData.company_name}</p>
                                <p><strong>Industry:</strong> {formData.industry?.label || formData.industry || ""}</p>
                                <p><strong>Company Size:</strong> {formData.company_size}</p>
                                <p><strong>Services Required:</strong> {formData.services_required?.join(", ")}</p>

                                <p><strong>Website:</strong> {formData.website}</p>
                                <p><strong>Social Links:</strong> {formData.social_links}</p>

                                <h6 className="card-title mt-3">Work Preferences</h6>
                                <p><strong>Preferred Work Arrangement:</strong> {formData.work_arrangement}</p>
                                <p><strong>Project Frequency:</strong> {formData.project_frequency}</p>
                                <p><strong>Hiring Preferences:</strong> {formData.hiring_preferences}</p>
                            </Col>
                        </Row>

                        <div className="text-end mt-3">
                            <button
                                type="button"
                                className="btn a-btn-primary"
                                onClick={handleSubmit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </Layout>
    );
};

export default CreateClient;
