import React, { useState, useEffect } from "react"

const Aetextarea = ({
    label = "Textarea",
    info = "",
    name = "",
    placeholder = "Enter text...",
    value = "",
    isWordCount = false,
    wordLimit = 300,
    onChange,
}) => {
    const [text, setText] = useState("");
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setText(value || "");
        if (isWordCount && value) {
            const words = value.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length);
        }
    }, [value, isWordCount]);

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (isWordCount) {
            const words = inputText.trim().split(/\s+/).filter(Boolean);
            if (words.length <= wordLimit) {
                setText(inputText);
                setWordCount(words.length);
                if (onChange) onChange(name, inputText);
            }
        } else {
            setText(inputText);
            if (onChange) onChange(name, inputText);
        }
    };

    return (
        <div className="form-group">
            <label htmlFor={name} className="form-label">{label}</label>
            <textarea
                style={{ height: 100 }}
                id={name}
                name={name}
                className="form-control resizable-textarea"
                placeholder={placeholder}
                value={text}
                onChange={handleTextChange}
                rows={4}
            ></textarea>

            {isWordCount && (
                <div className="d-flex justify-content-end">
                    <small className="word-count">
                        {wordCount}/{wordLimit}
                    </small>
                </div>
            )}
            <br />
            <small>{info}</small>
        </div>
    );
};

export default Aetextarea;
