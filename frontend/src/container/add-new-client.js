import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SelectComponent from "../components/SelectComponent";
import Select from "react-select";
import Layout from "./layout";
import FormHeader from "../components/FormHeader";
import TextInput from "../components/TextInput";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
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
    full_name: "",
    username: "",
    password: "",
    email: "",
    phone_number: "",
    profile_photo: "",
    address_line_first: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    account_type: "client",
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
    terms_accepted: false,
    privacy_policy_accepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showErrors] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

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

    const user = getLoggedInUser();
    if (!user?.user_id) {
      showErrorToast("User not authenticated.");
      return;
    }

    // ✅ Validate profile photo
    if (!profilePhoto) {
      showErrorToast("Profile photo is required.");
      return;
    }

    if (!formData.terms_accepted || !formData.privacy_policy_accepted) {
      showErrorToast("Please accept Terms & Privacy Policy before continuing.");
      return;
    }

    try {
      // ✅ Build multipart/form-data
      const fd = new FormData();
      fd.append("first_name", formData.first_name);
      fd.append("last_name", formData.last_name);
      fd.append("username", formData.username);
      fd.append("password", formData.password || "Client@1234");
      fd.append("email", formData.email);
      fd.append("phone_number", formData.phone_number);
      fd.append("address_line_first", formData.address_line_first);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("country", formData.country);
      fd.append("pincode", formData.pincode);
      fd.append("account_type", "client");
      fd.append("tax_id", formData.tax_id);
      fd.append("company_name", formData.company_name || "");
      fd.append("industry", formData.industry || "");
      fd.append("website", formData.website);
      fd.append("social_links", formData.social_links || "");
      fd.append("services_required", JSON.stringify(formData.services_required));
      fd.append("company_size", formData.company_size || "");
      fd.append("work_arrangement", formData.work_arrangement || "");
      fd.append("project_frequency", formData.project_frequency || "");
      fd.append("hiring_preferences", formData.hiring_preferences || "");
      fd.append("profile_picture", profilePhoto); // match backend field

      if (formData.business_document_url instanceof File) {
        fd.append("business_document", formData.business_document_url); // match backend
      }
      fd.append("terms_accepted", formData.terms_accepted);
      fd.append("privacy_policy_accepted", formData.privacy_policy_accepted);

      // ✅ Send request
      const response = await fetch("http://localhost:8000/api/v1/auth/register/client", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Client registration failed");
      }

      showSuccessToast("🎉 Client added successfully!");
      console.log("API Response:", data);
      navigate("/client");
    } catch (err) {
      console.error("Insert error:", err);
      showErrorToast(err.message || "Failed to add client.");
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
          // showAdd
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

              <label className="form-label">Upload Profile Photo<span className="text-danger"> *</span></label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handlePhotoChange}
              />

              <small className="text-muted">
                Upload your profile photo. Max 5MB.
              </small>
              {showErrors && !formData.profile_picture && (
                <small className="text-danger">Profile Photo is required.</small>
              )}

              <TextInput
                ref={(el) => (inputRefs.current.address_line_first = el)}
                label="Address"
                name="address_line_first"
                placeholder="Type Address"
                value={formData.address_line_first}
                onChange={handleInputChange}
                required={true}
              />
              {showErrors && !formData.address_line_first && (
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

              <Row className="mb-3">
                <label className="form-label">
                  Business Registration Documents (Optional)
                  <span className="text-danger"> *</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      business_document_url: e.target.files[0] || null,
                    }))
                  }
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
                <p><strong>First Name:</strong> {formData.first_name}</p>
                <p><strong>Last Name:</strong> {formData.last_name}</p>
                <p><strong>Username:</strong> {formData.username}</p>
                <p><strong>Email:</strong> {formData.email}</p>

                <h6 className="card-title mt-3">Contact Details</h6>
                <p><strong>Phone:</strong> {formData.phone_number}</p>
                <p><strong>Profile Photo:</strong> {formData.profile_photo}</p>
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
