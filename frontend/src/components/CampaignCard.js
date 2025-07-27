import React from "react";
import Button from "./Button"; // Import your Button component
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons are available

const CampaignCard = ({ campaign }) => {
    const { id, image, label, detail } = campaign;


    return (
        <div className="campaign d-flex align-items-center gap-2">
            {/* User Profile */}
            <img src={image} className="profile-pic" alt="Image" />

            {/* Campaign Details */}
            <div>
                <label>{label}</label>
                <p>{detail}</p>
            </div>
        </div>

    );
};

export default CampaignCard;