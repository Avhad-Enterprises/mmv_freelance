import React from "react";

const CheckboxInput = ({
    label,
    linkText,
    linkUrl = "#",
    info,
    name,
    checked,
    onChange
}) => {
    const handleCheckboxChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };

    return (
        <div className="form-group form-check m-0">
            <input
                className="form-check-input"
                type="checkbox"
                id={name}
                checked={checked}
                onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor={name}>
                {label}{" "}
                {linkText && (
                    <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                        {linkText}
                    </a>
                )}
            </label>
            <br />
            {info && <small>{info}</small>}
        </div>
    );
};

export default CheckboxInput;
