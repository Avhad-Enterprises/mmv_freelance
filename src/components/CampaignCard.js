import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons are available

const CampaignCard = ({ campaign }) => {
    const { image, label, detail } = campaign;


    return (
        <div className="campaign d-flex align-items-center gap-2">
            {/* User Profile */}
            <img src={image} className="profile-pic" alt="" />
            {/* Campaign Details */}
            <div>
                <label>{label}</label>
                <p>{detail}</p>
            </div>
        </div>

    );
};

export default CampaignCard;