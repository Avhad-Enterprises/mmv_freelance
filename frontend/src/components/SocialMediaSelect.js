import React, { useState } from "react";

const SocialMediaSelect = ({ onSelectionChange }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);

    const platforms = [
        { id: "facebook", img: "https://storage.googleapis.com/sportzsaga_imgs/icons/67af0d9bf020c_Frame 1171277430.svg" },
       
        { id: "instagram", img: "https://storage.googleapis.com/sportzsaga_imgs/icons/67af0d9b59e66_Frame 1171277431.svg" },
        { id: "twitter", img: "https://storage.googleapis.com/sportzsaga_imgs/icons/67af0ef11bc4f_Frame 1171277437.svg" },
        
    ];

    const handleSelection = (id) => {
        let updatedSelection;
        if (selectedPlatforms.includes(id)) {
            updatedSelection = selectedPlatforms.filter((platform) => platform !== id);
        } else {
            updatedSelection = [...selectedPlatforms, id];
        }
        setSelectedPlatforms(updatedSelection);
        if (onSelectionChange) {
            onSelectionChange(updatedSelection);
        }
    };

    return (
        <div className="form_section">
            <div className="d-flex flex-wrap">
                {platforms.map((platform) => (
                    <div
                        key={platform.id}
                        className={`check-item ${selectedPlatforms.includes(platform.id) ? "selected" : ""}`}
                        onClick={() => handleSelection(platform.id)}
                    >
                        <img src={platform.img} alt={platform.id} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocialMediaSelect;