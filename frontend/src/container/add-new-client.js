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
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        email: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        account_type: "client",
        id_type: "",
        id_document_url: null, // for file
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

        const payload = {
            first_name: formData.first_name,
            last_name: formData.first_name,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone_number: formData.phone_number,
            address: formData.address_line_first,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
            account_type: "client",
            id_type: formData.id_type,
            id_document_url: formData.id_document_url,
            company_name: formData.company_name,
            industry: formData.industry,
            website: formData.website,
            social_links: formData.social_links,
            company_size: formData.company_size,
            services_required: JSON.stringify(formData.services_required),
            work_arrangement: formData.work_arrangement?.value,
            project_frequency: formData.project_frequency?.value,
            hiring_preferences: formData.hiring_preferences?.value,
        };

        console.log("Submitting Payload", payload);

        try {
            const response = await makePostRequest("auth/register/client", payload);
            console.log("API Response", response);
            showSuccessToast("🎉 Client added successfully!");
            navigate("/client");
        } catch (err) {
            console.error("Insert error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
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
        { value: "", label: "Select required services" },
        { value: "videography", label: "Videography" },
        { value: "editing", label: "Editing" },
        { value: "motion_graphics", label: "Motion Graphics" },
        { value: "photography", label: "Photography" },
        { value: "other", label: "Other" },
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
                                        ref={(el) => (inputRefs.current.first_name = el)}
                                        label="First Name"
                                        name="first_name"
                                        placeholder="Type first name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.last_name = el)}
                                        label="Last Name"
                                        name="last_name"
                                        placeholder="Type last name"
                                        value={formData.last_name}
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
                            <TextInput
                                ref={(el) => (inputRefs.current.address = el)}
                                label="Address"
                                name="address"
                                placeholder="Type address line 1"
                                value={formData.address}
                                onChange={handleInputChange}
                                required={true}
                            />
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
                                <label className="form-label">Business Registration Documents (Optional)</label>
                                <input
                                    type="file"
                                    name="id_document_url"
                                    className="form-control"
                                    onChange={(e) => {
                                        handleInputChange({ target: { name: "id_document_url", value: e.target.files[0] } });
                                    }}
                                    accept=".jpg,.jpeg,.png,.pdf" // accept only images & pdf
                                />
                            </Row>
                            <Row className="mb-3">
                                <TextInput
                                    ref={(el) => (inputRefs.current.phone_number = el)}
                                    label="Tax ID / Business Number (Optional)"
                                    name="phone_number"
                                    type="number"
                                    placeholder="Type phone number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    required={true}
                                />
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
                            />
                            <SelectComponent
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={(val) => handleInputChange("industry", val)}
                                options={[
                                    { value: "", label: "Select Industry Type" },
                                    { value: "film", label: "Film" },
                                    { value: "egencies", label: "Ad Agency" },
                                    { value: "event", label: "Event" },
                                    { value: "youtube", label: "Youtube" },
                                    { value: "corporate", label: "Corporate" },
                                ]}
                                required
                            />
                            <TextInput
                                ref={(el) => (inputRefs.current.website = el)}
                                label="Website"
                                name="website"
                                placeholder="https://your-website.com"
                                value={formData.website}
                                onChange={handleInputChange}
                                required={true}
                            />
                            <TextInput
                                ref={(el) => (inputRefs.current.social_links = el)}
                                label="Social Links"
                                name="social_links"
                                placeholder="https://linkedin.com"
                                value={formData.social_links}
                                onChange={handleInputChange}
                                required={true}
                            />
                            <label className="form-label">Company Size</label>
                            <Select
                                options={companySizeOptions}
                                value={companySizeOptions.find(c => c.value === formData.company_size)}
                                onChange={opt => handleInputChange("company_size", opt.value)}
                                placeholder="Select Company Size"
                            />
                            <label className="form-label">Services Required</label>
                            <Select
                                options={servicesOptions}
                                value={servicesOptions.filter(s =>
                                    Array.isArray(formData.services_required)
                                        ? formData.services_required.includes(s.value)
                                        : formData.services_required === s.value
                                )}
                                onChange={(opts) => {
                                    // If multi-select, opts is an array; store values as array
                                    const values = opts ? opts.map(o => o.value) : [];
                                    handleInputChange("services_required", values);
                                }}
                                placeholder="Select Type of Service"
                                isMulti
                            />

                            <label className="form-label">Required Skills</label>
                            <Select
                                options={servicesOptions}
                                value={servicesOptions.filter(s =>
                                    Array.isArray(formData.services_required)
                                        ? formData.services_required.includes(s.value)
                                        : formData.services_required === s.value
                                )}
                                onChange={(opts) => {
                                    // If multi-select, opts is an array; store values as array
                                    const values = opts ? opts.map(o => o.value) : [];
                                    handleInputChange("services_required", values);
                                }}
                                placeholder="Select Type of Service"
                                isMulti
                            />

                            <label className="form-label">Required Editor Proficiencies</label>
                            <Select
                                options={servicesOptions}
                                value={servicesOptions.filter(s =>
                                    Array.isArray(formData.services_required)
                                        ? formData.services_required.includes(s.value)
                                        : formData.services_required === s.value
                                )}
                                onChange={(opts) => {
                                    // If multi-select, opts is an array; store values as array
                                    const values = opts ? opts.map(o => o.value) : [];
                                    handleInputChange("services_required", values);
                                }}
                                placeholder="Select Type of Service"
                                isMulti
                            />

                            <label className="form-label">Required Videographer Proficiencies</label>
                            <Select
                                options={servicesOptions}
                                value={servicesOptions.filter(s =>
                                    Array.isArray(formData.services_required)
                                        ? formData.services_required.includes(s.value)
                                        : formData.services_required === s.value
                                )}
                                onChange={(opts) => {
                                    // If multi-select, opts is an array; store values as array
                                    const values = opts ? opts.map(o => o.value) : [];
                                    handleInputChange("services_required", values);
                                }}
                                placeholder="Select Type of Service"
                                isMulti
                            />

                            <TextInput
                                ref={(el) => (inputRefs.current.phone_number = el)}
                                label="Project Budget Range"
                                name="phone_number"
                                type="number"
                                placeholder="Type phone number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                required={true}
                                maxLength={10}
                                minLength={10}
                            />
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
                                    { value: "remote-only", label: "Remote Only" },
                                    { value: "hybrid", label: "Hybrid" },
                                    { value: "on-site", label: "On Site" },
                                ]}
                                required
                            />
                            <SelectComponent
                                label="Project Frequency"
                                name="project_frequency"
                                value={formData.project_frequency}
                                onChange={(val) => handleInputChange("project_frequency", val)}
                                options={[
                                    { value: "", label: "Select Project Frequency" },
                                    { value: "full-time", label: "One Time" },
                                    { value: "occasional", label: "Occasional" },
                                    { value: "on-going", label: "On Going" },
                                ]}
                                required
                            />
                            <SelectComponent
                                label="Hiring Preferences"
                                name="hiring_preferences"
                                value={formData.hiring_preferences}
                                onChange={(val) => handleInputChange("hiring_preferences", val)}
                                options={[
                                    { value: "", label: "Select Hiring Preferences" },
                                    { value: "freelancers", label: "Freelancers" },
                                    { value: "agencies", label: "Agencies" },
                                    { value: "both", label: "Both" },
                                ]}
                                required
                            />
                            <label className="form-label">Expected Project Start Date</label>
                            <input
                                type="date"
                                name="expected_start_date"
                                className="form-control"
                                value={formData.expected_start_date}
                                onChange={handleInputChange}
                            />
                            <SelectComponent
                                label="Typical Project Duration"
                                name="hiring_preferences"
                                value={formData.hiring_preferences}
                                onChange={(val) => handleInputChange("hiring_preferences", val)}
                                options={[
                                    { value: "", label: "Select Project Duration" },
                                    { value: "less_than_week", label: "Less than a week" },
                                    { value: "1_2_weeks", label: "1-2 week" },
                                    { value: "2_4_weeks", label: "2-4 week" },
                                    { value: "1_3_months", label: "1-3 months" },
                                    { value: "3_plus_months", label: "3+ months" },
                                ]}
                                required
                            />
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
                                <p><strong>First Name:</strong> {formData.first_name}</p>
                                <p><strong>Last Name:</strong> {formData.last_name}</p>
                                <p><strong>Username:</strong> {formData.username}</p>
                                <p><strong>Email:</strong> {formData.email}</p>
                                <p><strong>Password:</strong> *******</p>

                                <h6 className="card-title mt-3">Contact Details</h6>
                                <p><strong>Phone:</strong> {formData.phone_number}</p>
                                <p><strong>Country:</strong> {formData.country}</p>
                                <p><strong>State:</strong> {formData.state}</p>
                                <p><strong>City:</strong> {formData.city}</p>
                                <p><strong>Pincode:</strong> {formData.pincode}</p>
                                <p><strong>ID Type:</strong> {formData.id_type?.label || formData.id_type || ""}</p>
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
                                <p><strong>Preferred Work Arrangement:</strong> {formData.work_arrangement?.label}</p>
                                <p><strong>Project Frequency:</strong> {formData.project_frequency?.label}</p>
                                <p><strong>Hiring Preferences:</strong> {formData.hiring_preferences?.label}</p>
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
