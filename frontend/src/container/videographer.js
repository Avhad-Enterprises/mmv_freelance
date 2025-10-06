import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Select from "react-select";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import SelectComponent from "../components/SelectComponent";
import { languages } from "../data/languages";
import { videoProductionSkills } from "../data/skilllist";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { makePostRequest, makeGetRequest } from "../utils/api";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { getLoggedInUser } from "../utils/auth";
import { Country, State, City } from "country-state-city";
import Aetextarea from "../components/Aetextarea";

const CreateEditor = () => {
    const navigate = useNavigate();
    const inputRefs = useRef({});

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        profilePhoto: "",
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
        skills: [],
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
        id_document_url: "",
        languages: [],
        account_type: "videoEditor",
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedSkillTags, setSelectedSkillTags] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [categories, setCategories] = useState([]); // all available categories
    const [selectedCategories, setSelectedCategories] = useState([]); // selected categories
    const [links, setLinks] = useState(["", "", ""]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showErrors, setShowErrors] = useState(false);
    const [superpowersOptions, setSuperpowersOptions] = useState([]);
    const [selectedSuperpowers, setSelectedSuperpowers] = useState([]);

    const skillOptions = videoProductionSkills.map(skill => ({ value: skill, label: skill }));

    const { first_name, last_name } = formData;

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

    // fetch tags & skills
    useEffect(() => {
        // const fetchTags = async () => {
        //     try {
        //         const response = await makeGetRequest("tags/geteventtags");
        //         const fetchedTags = response.data?.data || [];
        //         const tagNames = fetchedTags.map((tag) => tag.tag_name) || ["default-tag"];
        //         setAvailableTags(tagNames);
        //     } catch (error) {
        //         console.error("Failed to fetch tags:", error);
        //         setAvailableTags(["default-tag"]);
        //     }
        // };

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

        // fetchTags();
        fetchSkills();
    }, []);

    useEffect(() => {
        const fetchSuperpowers = async () => {
            try {
                const response = await makeGetRequest("category/getallcategorys");
                const fetched = response.data?.data || [];
                const options = fetched.map(cat => ({
                    value: cat.id,
                    label: cat.category_name,
                }));
                setSuperpowersOptions(options);
            } catch (error) {
                console.error("Failed to fetch superpowers:", error);
                setSuperpowersOptions([]);
            }
        };

        fetchSuperpowers();
    }, []);


    const handleInputChange = (e, customValue = null) => {
        if (e?.target) {
            const { name, type, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
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

    const hoursMap = {
        "less-20": 15,
        "20-30": 25,
        "30-40": 35,
        "more-40": 45
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

    // const handleTagsChange = useCallback((newTags, type) => {
    //     if (type === "tags") {
    //         setSelectedTags(newTags);
    //         setFormData((prev) => ({ ...prev, tags: newTags }));
    //     } else if (type === "skill") {
    //         setSelectedSkillTags(newTags);
    //         setFormData((prev) => ({ ...prev, skill: newTags }));
    //     }
    // }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = getLoggedInUser();
        if (!user?.user_id) {
            showErrorToast("User not authenticated.");
            return;
        }
        if (!profilePhoto) {
            showErrorToast("Profile photo is required.");
            return;
        }

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
            profile_picture: formData.profilePhoto,
            password: formData.password || "Test@1234",
            email: formData.email,
            phone_number: formData.phone_number,

            profile_title: formData.profile_title,
            short_description: formData.short_description,
            experience_level: formData.experience_level || undefined,

            skills: selectedSkills,
            superpowers: formData.superpowers,
            skill_tags: formData.skill_tags,

            portfolio_links: links.filter((l) => l.trim() !== ""),
            certification: formData.certification,
            education: formData.education,
            previous_works: formData.previous_works,
            services: formData.services,

            rate_amount: Number(formData.rate_amount) || 0,
            availability: formData.availability,
            work_type: formData.work_type,
            hours_per_week: formData.hours_per_week,

            id_type: formData.id_type,
            id_document_url: formData.id_document_url,

            languages: formData.languages,

            account_type: formData.account_type || "videoEditor",
        };


        try {
            const response = await makePostRequest("auth/register/videographer", payload);
            console.log("API Response :", response);
            showSuccessToast("🎉 Video Editor added successfully!");
            // navigate("/editors");
        } catch (err) {
            console.error("Insert error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            showErrorToast(err.response?.data?.message || "Failed to add Editor.");
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
                    title="Add New Editor"
                    showAdd
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
                                        ref={(el) => (inputRefs.current.first_name = el)}
                                        label="First Name"
                                        name="first_name"
                                        placeholder="Type First Name"
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        required={true}
                                    />
                                </Col>
                                <Col md={6}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current.last_name = el)}
                                        label="Last Name"
                                        name="last_name"
                                        placeholder="Type Last Name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        required={true}
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
                                <label>Upload Profile Photo*</label>
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
                                    <label className="form-label">ID Verification*</label>
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
                                        <option value="aadhaar">Aadhaar</option>
                                    </select>
                                </Col>
                                <Col md={6}>
                                    <label className="form-label">Upload ID Document*</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="form-control"
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                id_document_url: e.target.files[0]?.name || "",
                                            }))
                                        }
                                    />
                                </Col>
                            </Row>


                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="form_section">
                            <h6 className="card-title">Professional Details</h6>
                            <h5 className="mb-2">
                                Hi, I am {first_name || last_name ? `${first_name} ${last_name}`.trim() : "[Your Name]"}
                            </h5>

                            <label className="form-label">Skills</label>
                            <Select
                                isMulti
                                options={skillOptions}
                                value={skillOptions.filter(opt => selectedSkills.includes(opt.value))}
                                onChange={(selected) => {
                                    const skillsArray = selected.map(opt => opt.value);
                                    setSelectedSkills(skillsArray);
                                    setFormData(prev => ({ ...prev, skill: skillsArray }));
                                }}
                                placeholder="Select Skills"
                            />

                            <label className="form-label">My Superpowers are</label>
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
                                <small style={{ color: "red" }}>Please select at least 1 superpower.</small>
                            )}
                            {selectedSuperpowers.length > 3 && (
                                <small style={{ color: "red" }}>You can select up to 3 superpowers only.</small>
                            )}

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

                            {/* Validation message */}
                            {showErrors && !links.filter((l) => l.trim() !== "").length === 0 && (
                                <small style={{ color: "red", display: "block", marginTop: "5px" }}>
                                    At least one YouTube link is required.
                                </small>
                            )}
                            <Row>
                                <Col md={6}>
                                    <label className="form-label">Rate Amount*</label>
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
                            {/* Short Description */}
                            <label className="form-label">Short Description about yourself*</label>
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
                                    <label className="form-label">Availability*</label>
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
                                    <label className="form-label">Languages Spoken*</label>
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
                                        <p><strong>First Name:</strong> {formData.first_name}</p>
                                        <p><strong>Last Name:</strong> {formData.last_name}</p>
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
                                        <p><strong>ID Document:</strong> {formData.id_document_url}</p>
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
