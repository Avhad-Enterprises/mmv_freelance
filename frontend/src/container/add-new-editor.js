import React, { useState, useEffect, useRef } from "react";
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

const CreateEditor = () => {
    const navigate = useNavigate();
    const inputRefs = useRef({});

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        email: "",
        phone_number: "",
        address_line_first: "",
        // address_line_second: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        availability: "",
        hours_per_week: "",
        work_type: "",
        profile_title: "",
        skill: [],
        experience_level: "",
        portfolio_links: "",
        hourly_rate: "",
        id_type: "",
        id_document_url: null,
        account_type: "freelancer",
        languages: [],
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
    const [categories, setCategories] = useState([]); // all available categories
    const [selectedCategories, setSelectedCategories] = useState([]); // selected categories

    const skillOptions = videoProductionSkills.map(skill => ({ value: skill, label: skill }));

    const languageOptions = languages.map(lang => ({
        value: lang,
        label: lang
    }));

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
        const fetchCategories = async () => {
            try {
                const response = await makeGetRequest("category/getallcategorys"); // replace with your API
                const fetchedCategories = response.data?.data || [];
                const categoryOptions = fetchedCategories.map(cat => ({
                    value: cat.id,  // or cat.category_id depending on your API
                    label: cat.category_name,
                }));
                setCategories(categoryOptions);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);


    const handleInputChange = (e, customValue = null) => {
        if (e?.target) {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (customValue !== null) {
            setFormData(prev => ({ ...prev, [e]: customValue }));
        }
    };

    const hoursMap = {
        "less-20": 15,
        "20-30": 25,
        "30-40": 35,
        "more-40": 45
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

        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
            password: formData.password || "Test@1234",
            email: formData.email,
            phone_number: formData.phone_number,
            address_line_first: formData.address_line_first,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
            skill: selectedSkills.map(skill =>
                typeof skill === "string" ? skill : skill.skill_name
            ),
            categories: selectedCategories.map(cat => cat.value),
            experience_level: formData.experience_level || undefined,
            availability: formData.availability || undefined,
            work_type: formData.work_type || undefined,
            id_type: formData.id_type || undefined,
            id_document_url: formData.id_document_url?.name || undefined,
            hours_per_week: hoursMap[formData.hours_per_week] || undefined,
            portfolio_links: formData.portfolio_links?.startsWith("http")
                ? [formData.portfolio_links]
                : undefined,
            hourly_rate: Number(formData.hourly_rate) || 0,
            languages: formData.languages || [],
            company_name: formData.company_name || "",
            account_type: formData.account_type || "freelancer",
        };




        try {
            const response = await makePostRequest("auth/register", payload);
            console.log("API Response :", response);
            showSuccessToast("🎉 Editor added successfully!");
            navigate("/editors");
        } catch (err) {
            console.error("Insert error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            showErrorToast(err.response?.data?.message || "Failed to add Editor.");
        }
    };

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
                                ref={(el) => (inputRefs.current.address_line_first = el)}
                                label="Street Address"
                                name="address_line_first"
                                placeholder="Type address line 1"
                                value={formData.address_line_first}
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
                                        label="Pincode"
                                        name="pincode"
                                        placeholder="Type pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <SelectComponent
                                    label="ID Type"
                                    name="id_type"
                                    value={formData.id_type}
                                    onChange={(val) => handleInputChange("id_type", val?.value || "")}
                                    options={[
                                        { value: "", label: "Select ID Type" },
                                        { value: "passport", label: "Passport" },
                                        { value: "driving_license", label: "Driving License" },
                                        { value: "national_id", label: "National ID" },
                                    ]}
                                    required
                                />
                            </Row>
                            <Row className="mb-3">
                                <label className="form-label">Upload ID Document</label>
                                <input
                                    type="file"
                                    name="id_document_url"
                                    className="form-control"
                                    onChange={(e) => {
                                        handleInputChange({ target: { name: "id_document_url", value: e.target.files[0] } });
                                    }}
                                    accept=".jpg,.jpeg,.png,.pdf" // accept only images & pdf
                                    required
                                />
                            </Row>
                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="form_section">
                            <h6 className="card-title">Professional Details</h6>
                            <TextInput
                                ref={(el) => (inputRefs.current.profile_title = el)}
                                label="Profile Title"
                                name="profile_title"
                                placeholder="e.g. Professional Video Editor"
                                value={formData.profile_title}
                                onChange={handleInputChange}
                                required={true}
                            />

                            <label className="form-label">Categories</label>
                            <Select
                                isMulti
                                options={categories}
                                value={selectedCategories}
                                onChange={(selected) => {
                                    setSelectedCategories(selected);
                                    setFormData(prev => ({
                                        ...prev,
                                        categories: selected.map(s => s.value)
                                    }));
                                }}
                                placeholder="Select Categories"
                            />

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

                            <SelectComponent
                                label="Experience Level"
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={(val) => handleInputChange("experience_level", val?.value || "")}
                                options={[
                                    { value: "", label: "Select Experience Level" },
                                    { value: "entry", label: "Entry Level (0-2 years)" },
                                    { value: "intermediate", label: "Intermediate (2-5 years)" },
                                    { value: "experienced", label: "Experienced (5-8 years)" },
                                    { value: "expert", label: "Expert (8+ years)" },
                                ]}
                                required
                            />
                            <TextInput
                                ref={(el) => (inputRefs.current.portfolio_links = el)}
                                label="Potfolio Link"
                                name="portfolio_links"
                                placeholder="https://your-portfolio.com"
                                value={formData.portfolio_links}
                                onChange={handleInputChange}
                                required={true}
                            />
                            <TextInput
                                ref={(el) => (inputRefs.current.hourly_rate = el)}
                                label="Hourly Rate (INR)"
                                name="hourly_rate"
                                type="number"
                                placeholder="e.g. 48"
                                value={formData.hourly_rate}
                                onChange={handleInputChange}
                                required={true}
                            />
                        </div>

                        <div className="form_section">
                            <h6 className="card-title">Work Preferences</h6>
                            <SelectComponent
                                label="Availability"
                                name="availability"
                                value={formData.availability}
                                onChange={(val) => handleInputChange("availability", val?.value || "")}
                                options={[
                                    { value: "", label: "Select Availability" },
                                    { value: "full-time", label: "Full Time" },
                                    { value: "part-time", label: "Part Time" },
                                    { value: "flexible", label: "Flexible" },
                                    { value: "on-demand", label: "On Demand" },
                                ]}
                                required
                            />
                            <SelectComponent
                                label="Hours per Week"
                                name="hours_per_week"
                                value={formData.hours_per_week}
                                onChange={(val) => handleInputChange("hours_per_week", val)}
                                options={[
                                    { value: "", label: "Select Hours per Week" },
                                    { value: "less-20", label: "Less than 20 Hours" },
                                    { value: "20-30", label: "20-30 Hours" },
                                    { value: "30-40", label: "30-40 Hours" },
                                    { value: "more-40", label: "More than 40 Hours" },
                                ]}
                                required
                            />
                            <SelectComponent
                                label="Work Type"
                                name="work_type"
                                value={formData.work_type}
                                onChange={(val) => handleInputChange("work_type", val?.value || "")}
                                options={[
                                    { value: "", label: "Select Work Type" },
                                    { value: "remote-only", label: "Remote Only" },
                                    { value: "hybrid", label: "Hybrid" },
                                    { value: "on-site", label: "On Site" },
                                ]}
                                required
                            />

                            <label className="form-label">Languages Known</label>
                            <Select
                                isMulti
                                options={languageOptions}
                                value={languageOptions.filter(opt => formData.languages?.includes(opt.value))}
                                onChange={(selected) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        languages: selected.map(opt => opt.value)
                                    }));
                                }}
                                placeholder="Select Languages You Know"
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
                            <Col md={6}>
                                <h6 className="card-title">Basic Information</h6>
                                <p><strong>Full Name:</strong> {formData.full_name}</p>
                                <p><strong>Username:</strong> {formData.username}</p>
                                <p><strong>Email:</strong> {formData.email}</p>


                                <h6 className="card-title">Contact Details</h6>
                                <p><strong>Phone:</strong> {formData.phone_number}</p>
                                <p><strong>Country:</strong> {formData.country}</p>
                                <p><strong>State:</strong> {formData.state}</p>
                                <p><strong>City:</strong> {formData.city}</p>
                                <p><strong>Pincode:</strong> {formData.pincode}</p>
                                <p><strong>ID Type:</strong> {formData.id_type?.label || ""}</p>
                            </Col>
                            <Col md={6}>
                                <h6 className="card-title">Professional Details</h6>
                                <p><strong>Profile Title:</strong> {formData.profile_title}</p>
                                <p><strong>Categories:</strong> {selectedCategories.map(c => c.label).join(", ")}</p>
                                <p>
                                    <strong>Skills:</strong> {selectedSkills.map(skill => {
                                        // If it's an object, use label or skill_name, otherwise use it as is
                                        if (typeof skill === "object") {
                                            return skill.label || skill.skill_name || "";
                                        }
                                        return skill;
                                    }).join(", ")}
                                </p>
                                <p><strong>Hourly Rate:</strong> {formData.hourly_rate}</p>
                                <p><strong>Experience Level:</strong> {formData.experience_level?.label || ""}</p>
                                <p><strong>Portfolio Link:</strong> {formData.portfolio_links}</p>

                                <h6 className="card-title">Work Prefrences</h6>
                                <p><strong>Availability:</strong> {formData.availability?.label || ""}</p>
                                <p><strong>Hours per Week:</strong> {formData.hours_per_week?.label || ""}</p>
                                <p><strong>Work Type:</strong>{formData.work_type?.label || ""}</p>
                                <p><strong>Languages:</strong> {formData.languages?.join(", ")}</p>

                                {/* Add Education, Certification, Experience, Services, Previous Works similarly */}
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
