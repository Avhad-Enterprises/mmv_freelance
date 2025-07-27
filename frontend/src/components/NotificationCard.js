import React from "react";
import Button from "./Button"; // Import your Button component
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons are available

const NotificationCard = ({ notification }) => {
    const { title, detail, user, action, time } = notification;

    // Render action buttons based on the type of notification
    const renderActionButtons = () => {
        if (action.includes("approval")) {
            return (
                <>
                    <Button buttonType="check" label="Accept" />
                    <Button buttonType="uncheck" label="Decline" btnStyle="red" />
                </>
            );
        }
        if (action.includes("boost")) {
            return <Button buttonType="grow" label="Boost Engagement" />;
        }
        if (action.includes("sale")) {
            return (
                <>
                    <Button buttonType="grow" label="Boost" />
                    <Button buttonType="check" label="Replicate" />
                </>
            );
        }
        return null;
    };

    return (
        <div className="notification ">
            {/* User Profile */}
            <img src={user} className="profile-pic" alt="User" />
            {/* Notification Details */}
            <div className="col">
                <div className="d-flex justify-content-between">
                    <div>
                        <label >{title}</label>
                        <p>{detail}</p>
                    </div>
                    {/* <div className="text-right gap-3 d-none d-md-flex">{renderActionButtons()}</div> */}
                </div>
            </div>

            {/* Time and Actions */}
            <div className="col-2 home_act">
                <a>
                    <i className="bi p-1 bi-three-dots"></i>
                </a>
                <p>{time}</p>
            </div>
            <div className="col-12 d-flex justify-content-center">
                <div className="text-right col-9 mb-2 gap-3 d-md-none justify-content-between d-flex">{renderActionButtons()}</div>
            </div>
        </div>
    );
};

export default NotificationCard;