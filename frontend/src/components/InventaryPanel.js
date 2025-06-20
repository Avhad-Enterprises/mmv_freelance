import React, { useState } from "react";
import RadioInput from "../components/RadioInput";

import SelectComponent from "../components/SelectComponent";
import TextInput from "../components/TextInput";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CheckboxInput from "../components/CheckboxInput";
import DatePicker from "react-flatpickr";

const TabComponent = () => {
  // Set the default active tab
  const [activeTab, setActiveTab] = useState("pricing");

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTextInputChange = (value) => {
    console.log("TextInput:", value);
  };

  const [selectedSingle, setSelectedSingle] = useState("");
  const [selectedMulti, setSelectedMulti] = useState([]);

  const [selectedOption, setSelectedOption] = useState("");

  const radioOptions = [
    { label: "Worldwide delivery", value: "option3" },
    { label: "Selected Areas", value: "option4" },
    { label: "Local delivery", value: "option5" },
  ];

  const [isChecked, setIsChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State to hold selected date
  const [minDate, setMinDate] = useState(new Date()); // Minimum date (can be set to any specific date)
  const [maxDate, setMaxDate] = useState(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ); // Maximum date (1 year from today)

  // Handle checkbox change
  const handleCheckboxChange = (checked) => {
    setIsChecked(checked);
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Options for the SelectComponent (Areas)
  const areaOptions = [
    { label: "Area 1", value: "area1" },
    { label: "Area 2", value: "area2" },
    { label: "Area 3", value: "area3" },
  ];
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "4", label: "Option 4" },
  ];

  // Handle the change of the selected area
  const handleAreaChange = (selectedOption) => {
    setSelectedArea(selectedOption); // Update the selected area
  };

  // Initialize with no value
  const [selectedShipping, setSelectedShipping] = useState("");
  // State to track the selected area from SelectComponent
  const [selectedArea, setSelectedArea] = useState(null);

  // Shipping options
  const shipping = [
    {
      label: "Fulfilled by Seller",
      value: "option1",
      info: "You’ll be responsible for product delivery.Any damage or delay during shipping may cost you a Damage fee.",
    },
    {
      label: "Fulfilled by Us",
      value: "option2",
      info: "Your product, Our responsibility.For a measly fee, we will handle the delivery process for you.",
    },
  ];

  // Handle the change of the radio button
  const handleRadioChange = (value) => {
    setSelectedShipping(value); // Update selected shipping type
  };

  // Get additional info based on the selected shipping option
  const selectedShippingInfo = shipping.find(
    (option) => option.value === selectedShipping
  )?.info;

  return (
    <div className="inventarypanel">
      <h6 className="card-title">Inventory</h6>
      <div className="d-flex align-items-start">
        {/* Tab Links (Vertical tabs) */}
        <div
          className="nav flex-column nav-pills me-3"
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
          style={{ borderRight: "4px solid #ddd" }} // Adding a vertical line between the tabs and content
        >
          {/* Link for Pricing Tab */}
          <a
            className={`nav-link ${activeTab === "pricing" ? "active" : ""}`}
            onClick={() => handleTabChange("pricing")}
            id="v-pills-pricing-tab"
            role="tab"
            aria-controls="v-pills-pricing"
            aria-selected={activeTab === "pricing"}
          >
            Pricing
          </a>

          {/* Link for Restock Tab */}
          <a
            className={`nav-link ${activeTab === "restock" ? "active" : ""}`}
            onClick={() => handleTabChange("restock")}
            id="v-pills-restock-tab"
            role="tab"
            aria-controls="v-pills-restock"
            aria-selected={activeTab === "restock"}
          >
            Restock
          </a>

          {/* Link for Shipping Tab */}
          <a
            className={`nav-link ${activeTab === "shipping" ? "active" : ""}`}
            onClick={() => handleTabChange("shipping")}
            id="v-pills-shipping-tab"
            role="tab"
            aria-controls="v-pills-shipping"
            aria-selected={activeTab === "shipping"}
          >
            Shipping
          </a>

          {/* Link for Delivery Tab */}
          <a
            className={`nav-link ${activeTab === "delivery" ? "active" : ""}`}
            onClick={() => handleTabChange("delivery")}
            id="v-pills-delivery-tab"
            role="tab"
            aria-controls="v-pills-delivery"
            aria-selected={activeTab === "delivery"}
          >
            Delivery
          </a>

          {/* Link for Attributes Tab */}
          <a
            className={`nav-link ${activeTab === "attributes" ? "active" : ""}`}
            onClick={() => handleTabChange("attributes")}
            id="v-pills-attributes-tab"
            role="tab"
            aria-controls="v-pills-attributes"
            aria-selected={activeTab === "attributes"}
          >
            Attributes
          </a>
        </div>

        {/* Tab Content */}
        <div
          className="tab-content"
          id="v-pills-tabContent"
          style={{ paddingLeft: "20px" }}
        >
          {/* Content for Pricing Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "pricing" ? "show active" : ""
            }`}
            id="v-pills-pricing"
            role="tabpanel"
            aria-labelledby="v-pills-pricing-tab"
            tabIndex="0"
          >
            <SelectComponent
              label="Currency"
              name="singleSelect"
              options={options}
              isMulti={false}
              onChange={setSelectedSingle}
            />
            <TextInput
              label="Original Price"
              placeholder="Price"
              required={true}
              onChange={handleTextInputChange}
            />
            <TextInput
              label="Sale Price"
              placeholder="Price"
              required={true}
              onChange={handleTextInputChange}
            />
          </div>

          {/* Content for Restock Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "restock" ? "show active" : ""
            }`}
            id="v-pills-restock"
            role="tabpanel"
            aria-labelledby="v-pills-restock-tab"
            tabIndex="0"
          >
            <Row>
              <SelectComponent
                label="Add to Stock"
                name="singleSelect"
                options={options}
                isMulti={false}
                onChange={setSelectedSingle}
              />
              <div className="form-group row p-3 gap-2 text-center">
                <a type="submit" className="btn col-6 a-btn-primary">
                  Add
                </a>
              </div>
            </Row>
            <div className="row">
              <strong className="col-md">Product in stock now -</strong>
              <p className="col-md">5030</p>
            </div>
            <div className="row">
              <strong className="col-md">Product in transit -</strong>
              <p className="col-md">434</p>
            </div>
            <div className="row">
              <strong className="col-md">Last time restocked -</strong>
              <p className="col-md">1 Jan, 2025</p>
            </div>
          </div>

          {/* Content for Shipping Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "shipping" ? "show active" : ""
            }`}
            id="v-pills-shipping"
            role="tabpanel"
            aria-labelledby="v-pills-shipping-tab"
            tabIndex="0"
          >
            <h2>Shipping Type</h2>

            {/* RadioInput for shipping options */}
            <RadioInput
              name="shippingType"
              options={shipping}
              onChange={handleRadioChange}
            />

            {/* Conditionally render additional info for selected shipping option */}
            {selectedShippingInfo && (
              <div>
                <p>{selectedShippingInfo}</p>
              </div>
            )}
          </div>

          {/* Content for Delivery Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "delivery" ? "show active" : ""
            }`}
            id="v-pills-delivery"
            role="tabpanel"
            aria-labelledby="v-pills-delivery-tab"
            tabIndex="0"
          >
            <h2>Shipping Type</h2>

            {/* RadioInput for shipping options */}
            <RadioInput
              label="Select Shipping Type"
              name="shippingType"
              options={radioOptions}
              onChange={handleRadioChange}
            />

            {/* Conditionally render SelectComponent when "Selected Areas" is selected */}
            {selectedShipping === "option4" && (
              <SelectComponent
                name="areaSelect"
                options={areaOptions}
                onChange={handleAreaChange}
              />
            )}

            {/* Display the selected area */}
            {selectedArea && (
              <div>
                <h4> {selectedArea.label}</h4>
              </div>
            )}
          </div>

          {/* Content for Attributes Tab */}
          <div
            className={`tab-pane fade ${
              activeTab === "attributes" ? "show active" : ""
            }`}
            id="v-pills-attributes"
            role="tabpanel"
            aria-labelledby="v-pills-attributes-tab"
            tabIndex="0"
          >
            <Row>
              <h2>Atrributes</h2>
              <Col md={6}>
                <CheckboxInput label="Fragile Product" name="r1" />
                <CheckboxInput label="Biodegradable" name="r2" />
                <CheckboxInput label="Frozen Product" name="r3" />
                {/* CheckboxInput Component */}
                <CheckboxInput
                  label="Expiry Date of Product"
                  name="expiry-checkbox"
                  onChange={handleCheckboxChange}
                />

                {/* Conditionally render DatePicker if checkbox is checked */}
                {isChecked && (
                  <div>
                    <label>Choose Expiry Date</label>
                    <DatePicker
                      style={{ paddingRight: "40px" }}
                      className="form-control pl-5"
                      selected={selectedDate}
                      onChange={handleDateChange}
                      minDate={minDate}
                      maxDate={maxDate}
                      dateFormat="yyyy-MM-dd" // Modify date format as needed
                    />
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabComponent;
