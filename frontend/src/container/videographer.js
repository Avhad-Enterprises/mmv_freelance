import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Select from "react-select";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import { videoProductionSkills } from "../data/skilllist";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getLoggedInUser } from "../utils/auth";
import { Country, State, City } from "country-state-city";

const CreateEditor = () => {
    const navigate = useNavigate();
    const inputRefs = useRef({});

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        full_name: "",
        username: "",
        password: "",
        profile_photo: "",
        email: "",
        phone_number: "",
        street_address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        profile_title: "",
        short_description: "",
        experience_level: "",
        superpowers: [],
        skill_tags: [],
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
        id_document: "",
        languages: [],
        account_type: "videographer",
        terms_accepted: false,
        privacy_policy_accepted: false,
    });

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [, setAvailableSkills] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [links, setLinks] = useState(["", "", ""]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showErrors,] = useState(false);
    const [superpowersOptions, setSuperpowersOptions] = useState([]);
    const [selectedSuperpowers, setSelectedSuperpowers] = useState([]);

    const skillOptions = videoProductionSkills.map(skill => ({ value: skill, label: skill }));

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const { full_name } = formData;

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

    // fetch skills
    useEffect(() => {

        const fetchSkills = async () => {
            try {
                const response = await makeGetRequest("tags/getallskill");
                const fetchedSkills = response.data?.data || [];
                const skillNames = fetchedSkills.map((tag) => tag.skill_name) || ["default-skill"];
                setAvailableSkills(skillNames);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
                setAvailableSkills(["default-skill"]);
            }
        };

        fetchSkills();
    }, []);

    useEffect(() => {
        const fetchSuperpowers = async () => {
            try {
                const response = await makeGetRequest("categories");
                const fetched = response.data?.data || [];

                const editorCategories = fetched
                    .filter(cat => cat.category_type === "videographer" && cat.is_active)
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

        fetchSuperpowers();
    }, []);


    const handleInputChange = (e, customValue = null) => {
        if (e?.target) {
            const { name, value, type, checked } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        } else if (customValue !== null) {
            setFormData(prev => ({ ...prev, [e]: customValue }));
        }
    };

    // Regex for YouTube URL
    const isValidYouTubeUrl = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return regex.test(url);
    };

    const handleLinkChange = (index, value) => {
        const updatedLinks = [...links];
        updatedLinks[index] = value;
        setLinks(updatedLinks);

        setFormData((prev) => ({
            ...prev,
            portfolio: updatedLinks.filter((l) => l.trim() !== ""), // only keep filled links
        }));
    };

    const addNewLinkField = () => {
        setLinks([...links, ""]);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Optional: validate file type
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed!");
                return;
            }
            setProfilePhoto(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!profilePhoto) {
            showErrorToast("Profile photo is required.");
            return;
        }

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            return;
        }

        if (!formData.terms_accepted || !formData.privacy_policy_accepted) {
            showErrorToast("Please accept Terms & Privacy Policy before continuing.");
            return;
        }

        try {
            const fd = new FormData();

            fd.append("first_name", formData.first_name);
            fd.append("last_name", formData.last_name);
            fd.append("username", formData.username);
            fd.append("email", formData.email);
            fd.append("password", formData.password || "Test@1234");
            fd.append("profile_photo", profilePhoto); // File
            fd.append("phone_number", formData.phone_number);
            fd.append("country", formData.country);
            fd.append("state", formData.state);
            fd.append("city", formData.city);
            fd.append("short_description", formData.short_description);
            fd.append("rate_amount", formData.rate_amount || 0);
            fd.append("rate_currency", formData.rate_currency || "INR");
            fd.append("availability", formData.availability);
            fd.append("id_type", formData.id_type);
            if (formData.id_document) {
                fd.append("id_document", formData.id_document); // if using File object
            }
            fd.append("languages", JSON.stringify(formData.languages || []));
            fd.append("superpowers", JSON.stringify(formData.superpowers || []));
            fd.append("skill_tags", JSON.stringify(formData.skill_tags || []));
            fd.append("portfolio_links", JSON.stringify(links.filter((l) => l.trim() !== "")));
            fd.append("account_type", formData.account_type || "videographer");
            fd.append("terms_accepted", formData.terms_accepted);
            fd.append("privacy_policy_accepted", formData.privacy_policy_accepted);

            // Send request
            const response = await fetch(
                "http://localhost:8000/api/v1/auth/register/videographer",
                {
                    method: "POST",
                    body: fd, // FormData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            showSuccessToast("🎉 Video Grapher added successfully!");
            console.log("API Response:", data);

            navigate("/videographerhomepage");

        } catch (err) {
            console.error("Insert error:", err);
            showErrorToast(err.message || "Failed to add Video Grapher.");
        }
    };


    const availableLanguages = [
        "English", "Hindi", "Marathi", "Gujarati", "Bengali", "Telugu", "Tamil",
        "Kannada", "Malayalam", "Punjabi", "Urdu", "Sanskrit", "Spanish", "French",
        "German", "Chinese", "Japanese", "Korean", "Arabic", "Russian"
    ];

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <FormHeader
                    title="Add New VideoGrapher"
                    // showAdd
                    backUrl="/editors"
                    onBack={() => navigate("/editors")}
                />
                <Row>
                    <Col md={6}>
                        <div className="form_section">
                            <h6 className="card-title">Basic Information</h6>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <TextInput
                                        label="First Name"
                                        name="first_name"
                                        placeholder="Type First Name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        label="Last Name"
                                        name="last_name"
                                        placeholder="Type Last Name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.username = el)}
                                        label="Username"
                                        name="username"
                                        placeholder="Enter username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required={true}
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
                                        required={true}
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
                                        {/* Validation error */}
                                        {formData.password && formData.password.length < 6 && (
                                            <small style={{ color: "red" }}>
                                                Password must be at least 6 characters long.
                                            </small>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="form_section">
                            <h6 className="card-title">Contact Details</h6>
                            <TextInput
                                ref={(el) => (inputRefs.current.phone_number = el)}
                                label="Phone Number & OTP Verification"
                                name="phone_number"
                                type="number"
                                placeholder="Type phone number"
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                required={true}
                                maxLength={10}
                                minLength={10}
                            />

                            <Row className="mb-3">
                                <label className="form-label">Upload Profile Photo <span className="text-danger"> *</span></label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handlePhotoChange}
                                />
                                <small className="text-muted d-block mb-2">
                                    Please upload your original photo. If found that you are uploading fake, AI-generated or pseudo photos, your profile will be de-activated immediately.
                                </small>
                                {showErrors && !profilePhoto && (
                                    <small className="text-danger">Profile photo is required.</small>
                                )}
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <label className="form-label">ID Verification <span className="text-danger"> *</span></label>
                                    <select
                                        className="form-control"
                                        value={formData.id_type}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, id_type: e.target.value }))
                                        }
                                    >
                                        <option value="">Select ID Type*</option>
                                        <option value="passport">Passport</option>
                                        <option value="driving_license">Driving License</option>
                                        <option value="national_id">National ID</option>
                                    </select>
                                    {showErrors && !formData.id_type && (
                                        <small className="text-danger">ID Verification is required.</small>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <label className="form-label">Upload ID Document <span className="text-danger"> *</span></label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="form-control"
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                id_document: e.target.files[0] || null,
                                            }))
                                        }
                                    />
                                    {showErrors && !formData.id_document && (
                                        <small className="text-danger">ID Document is required.</small>
                                    )}
                                </Col>
                            </Row>

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
                                    <label className="form-label">Country <span className="text-danger"> *</span></label>
                                    <Select
                                        options={countries}
                                        value={countries.find(c => c.value === selectedCountry)}
                                        onChange={opt => {
                                            setSelectedCountry(opt.value);
                                            handleInputChange("country", opt.label); // update formData.country for review
                                        }}
                                        placeholder="Select Country"
                                        required={true}
                                    />
                                    {showErrors && !formData.country && (
                                        <small className="text-danger">Country is required.</small>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <label className="form-label">State <span className="text-danger"> *</span></label>
                                    <Select
                                        options={states}
                                        value={states.find(s => s.value === selectedState)}
                                        onChange={opt => {
                                            setSelectedState(opt.value);
                                            handleInputChange("state", opt.label); // update formData.state
                                        }}
                                        placeholder="Select State"
                                        isDisabled={!selectedCountry}
                                        required={true}
                                    />
                                    {showErrors && !formData.state && (
                                        <small className="text-danger">State is required.</small>
                                    )}
                                </Col>

                                <Col md={6}>
                                    <label className="form-label">City <span className="text-danger"> *</span></label>
                                    <Select
                                        options={cities}
                                        value={cities.find(c => c.value === selectedCity)}
                                        onChange={opt => {
                                            setSelectedCity(opt.value);
                                            handleInputChange("city", opt.label); // update formData.city
                                        }}
                                        placeholder="Select City"
                                        isDisabled={!selectedState}
                                        required={true}
                                    />
                                    {showErrors && !formData.city && (
                                        <small className="text-danger">City is required.</small>
                                    )}
                                </Col>
                            </Row>


                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="form_section">
                            <h6 className="card-title">Professional Details</h6>
                            <h5 className="mb-2">
                                Hi, I am {full_name}
                            </h5>

                            <label className="form-label">Skills <span className="text-danger"> *</span></label>
                            <Select
                                isMulti
                                options={skillOptions}
                                value={skillOptions.filter(opt => selectedSkills.includes(opt.value))}
                                onChange={(selected) => {
                                    const skillsArray = selected.map(opt => opt.value);
                                    setSelectedSkills(skillsArray);
                                    setFormData(prev => ({ ...prev, skill_tags: skillsArray }));
                                }}
                                placeholder="Select Skills"
                            />
                            {showErrors && !formData.skill_tags && (
                                <small className="text-danger">Skills are required.</small>
                            )}

                            <label className="form-label">My Superpowers are <span className="text-danger"> *</span></label>
                            <small>(Select up to 3 categories that best describe you)</small>
                            <Select
                                isMulti
                                options={superpowersOptions}
                                value={selectedSuperpowers}
                                onChange={(selected) => {
                                    if (selected.length <= 3) {
                                        setSelectedSuperpowers(selected);
                                        setFormData((prev) => ({
                                            ...prev,
                                            superpowers: selected.map((s) => s.value), // ✅ map to superpowers in payload
                                        }));
                                    }
                                }}
                                placeholder="Select Superpowers"
                                required
                            />
                            {selectedSuperpowers.length === 0 && (
                                <small>Please select at least 1 superpower.</small>
                            )}
                            {selectedSuperpowers.length > 3 && (
                                <small style={{ color: "red" }}>You can select up to 3 superpowers only.</small>
                            )}
                            {showErrors && !formData.superpowers && (
                                <small className="text-danger">Superpowers are required.</small>
                            )}

                            <label className="form-label">Portfolio Links (YouTube only)<span className="text-danger"> *</span></label>
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

                            {/* Validation message */}
                            {showErrors && !links.filter((l) => l.trim() !== "").length === 0 && (
                                <small style={{ color: "red", display: "block", marginTop: "5px" }}>
                                    At least one YouTube link is required.
                                </small>
                            )}
                            <Row>
                                <Col md={6}>
                                    <label className="form-label">Rate Amount <span className="text-danger"> *</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={0}
                                        max={10000}
                                        step={1}
                                        name="rate_amount"
                                        value={formData.rate_amount || ""}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                rate_amount: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter amount (max 10,000)"
                                        required
                                    />

                                    {/* Validation messages */}
                                    {formData.rate_amount && parseInt(formData.rate_amount, 10) > 10000 && (
                                        <small className="text-danger">Rate cannot exceed 10,000</small>
                                    )}

                                    {showErrors && !formData.rate_amount && (
                                        <small className="text-danger">Rate amount is required</small>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <label className="form-label">Currency <span className="text-danger"> *</span></label>
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
                                    {showErrors && !formData.rate_currency && (
                                        <small className="text-danger">Rate Currency is required.</small>
                                    )}
                                </Col>
                            </Row>
                        </div>

                        <div className="form_section">
                            <h6 className="card-title">Work Preferences</h6>
                            {/* Short Description */}
                            <label className="form-label">Short Description about yourself<span className="text-danger"> *</span></label>
                            <small>Short description (minimum 10 characters)</small>
                            <textarea
                                className="form-control"
                                value={formData.short_description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, short_description: e.target.value }))
                                }
                                placeholder="Describe yourself"
                                rows={4}
                            />
                            {showErrors && formData.short_description.length < 10 && (
                                <small className="text-danger">
                                    Description must be at least 10 characters long.
                                </small>
                            )}
                            <Row>
                                <Col md={6}>
                                    {/* Availability */}
                                    <label className="form-label">Availability <span className="text-danger"> *</span></label>
                                    <select
                                        className="form-control"
                                        value={formData.availability}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, availability: e.target.value }))
                                        }
                                    >
                                        <option value="">Select Availability</option>
                                        <option value="part_time">Part-time</option>
                                        <option value="full_time">Full-time</option>
                                        <option value="flexible">Flexible</option>
                                        <option value="on_demand">On-Demand</option>
                                    </select>
                                    {showErrors && !formData.availability && (
                                        <small className="text-danger">Availability is required.</small>
                                    )}
                                </Col>
                                <Col md={6}>
                                    {/* Languages */}
                                    <label className="form-label">Languages Spoken <span className="text-danger"> *</span></label>
                                    <Select
                                        isMulti
                                        options={availableLanguages.map((lang) => ({ value: lang, label: lang }))}
                                        value={formData.languages.map((lang) => ({ value: lang, label: lang }))}
                                        onChange={(selected) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                languages: selected.map((s) => s.value),
                                            }))
                                        }
                                        placeholder="Select Languages"
                                    />
                                    {showErrors && formData.languages.length === 0 && (
                                        <small className="text-danger">Please select at least one language.</small>
                                    )}
                                </Col>
                            </Row>
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
                            <Col md={6}>
                                {/* Basic Information */}
                                <div className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title">Basic Information</h6>
                                        <p><strong>Full Name:</strong> {formData.full_name}</p>
                                        <p><strong>Username:</strong> {formData.username}</p>
                                        <p><strong>Email:</strong> {formData.email}</p>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title">Contact Details</h6>
                                        <p><strong>Phone:</strong> {formData.phone_number}</p>
                                        <p><strong>ID Type:</strong> {formData.id_type}</p>
                                        <p>
                                            <strong>ID Document:</strong>{" "}
                                            {formData.id_document ? formData.id_document.name : "Not uploaded"}
                                        </p>
                                        <p><strong>Profile Photo:</strong> {profilePhoto ? profilePhoto.name : "Not uploaded"}</p>
                                    </div>
                                </div>
                            </Col>

                            <Col md={6}>
                                {/* Professional */}
                                <div className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title">Professional Details</h6>
                                        <p><strong>Superpowers:</strong> {selectedSuperpowers.map(s => s.label).join(", ")}</p>
                                        <p><strong>Skills:</strong> {selectedSkills.join(", ")}</p>
                                        <p><strong>Rate Amount:</strong> {formData.rate_amount} {formData.rate_currency}</p>
                                        <p><strong>Portfolio Links:</strong> {formData.portfolio_links?.join(", ")}</p>
                                    </div>
                                </div>

                                {/* Work Preferences */}
                                <div className="card mb-3 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="card-title">Work Preferences</h6>
                                        <p><strong>Short Description:</strong> {formData.short_description}</p>
                                        <p><strong>Availability:</strong> {formData.availability}</p>
                                        <p><strong>Languages:</strong> {formData.languages?.join(", ")}</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* ✅ NEW SECTION: Terms and Privacy */}
                        <div className="form_section mt-3">
                            <h6 className="card-title">Legal Agreements</h6>

                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="terms"
                                    name="terms_accepted"
                                    checked={formData.terms_accepted}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="terms" className="form-check-label">
                                    I agree to the{" "}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                                        Terms and Conditions
                                    </a>
                                </label>
                            </div>

                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="privacy"
                                    name="privacy_policy_accepted"
                                    checked={formData.privacy_policy_accepted}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="privacy" className="form-check-label">
                                    I have read and accept the{" "}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        </div>

                        <div className="text-end mt-3">
                            <button type="button" className="btn a-btn-primary" onClick={handleSubmit}>
                                Save
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </Layout >
    );
};

export default CreateEditor;
