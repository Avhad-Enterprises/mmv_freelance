import React, { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const DateInput = ({
  label = "Date",
  name = "date",
  info = "",
  type = "all",
  includeTime = false,
  datePlaceholder = "Date",
  timePlaceholder = "Time",
  showCheckbox = false,
  checkboxLabel = "Enable Option",
  checkboxDefault = false,
  onCheckboxToggle = () => { },
  onDateChange = () => { },
  onTimeChange = () => { },
  onChange = () => { }, // ✅ ✅ ADD THIS LINE
  value = null,
  timeValue = null,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [checkboxChecked, setCheckboxChecked] = useState(checkboxDefault);

  useEffect(() => {
    const today = new Date().getDate();
    if (type === "past") setMaxDate(today);
    else if (type === "future") setMinDate(today);
  }, [type]);

  const handleCheckboxChange = () => {
    const newValue = !checkboxChecked;
    setCheckboxChecked(newValue);
    onCheckboxToggle(newValue);

    if (newValue) {
      setSelectedTime(null);
    }
  };

  const handleDateChange = (date) => {
    if (!date) return;
    // Convert to "yyyy-MM-dd" string without timezone shift
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().split("T")[0];
    
    setSelectedDate(localDate);
    onDateChange(formattedDate);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    onTimeChange(time);
  };

  useEffect(() => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (value) {
      setSelectedDate(new Date(value));
    }

    if (timeValue instanceof Date) {
      setSelectedTime(timeValue);
    } else if (timeValue) {
      const t = new Date();
      const [h, m] = timeValue.toString().split(":");
      t.setHours(h || 0);
      t.setMinutes(m || 0);
      t.setSeconds(0);
      t.setMilliseconds(0);
      setSelectedTime(t);
    }
  }, [value, timeValue]);

  return (
    <div className="form-group m-0">
      <Row>
        <Col>
          <label htmlFor={name} className="form-label">
            {label}
          </label>

          {type === "range" ? (
            <div className="date-picker-container">
              <i className="bi bi-calendar Flatpickr-icon"></i>
              <Flatpickr
                className="form-control pr-5"
                placeholder={datePlaceholder}
                style={{ paddingLeft: "40px" }}
                value={dateRange}
                options={{
                  mode: "range",
                  dateFormat: includeTime ? "Y-m-d H:i" : "Y-m-d",
                  enableTime: includeTime,
                  minDate: minDate || null,
                  maxDate: maxDate || null,
                }}
                onChange={(selectedDates) => {
                  setDateRange(selectedDates);
                  onChange(selectedDates); // ✅ Call parent handler here
                }}
              />
            </div>
          ) : (
            <div className="date-picker-container">
              <DatePicker
                className="form-control pl-5"
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate}
                dateFormat={includeTime ? "yyyy-MM-dd" : "yyyy-MM-dd"}
                placeholderText={datePlaceholder}
              />
              <i className="bi bi-calendar DatePicker-icon"></i>
            </div>
          )}
        </Col>

        {includeTime && type !== "range" && (
          <Col>
            <label className="form-label">Time</label>
            <div className="date-picker-container">
              <DatePicker
                className="form-control"
                selected={selectedTime}
                onChange={handleTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                placeholderText={timePlaceholder}
                disabled={checkboxChecked}
              />
              <i className="bi bi-clock DatePicker-icon"></i>
            </div>
          </Col>
        )}

        {showCheckbox && (
          <Col xs={12} className="mt-2">
            <label className="form-check-label">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checkboxChecked}
                onChange={handleCheckboxChange}
              />{" "}
              {checkboxLabel}
            </label>
          </Col>
        )}
      </Row>
      <small>{info}</small>
    </div>
  );
};

export default DateInput;
