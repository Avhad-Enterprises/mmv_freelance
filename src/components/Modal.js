import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    // Close modal when pressing ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        } else {
            document.body.style.overflow = ""; // Restore scrolling
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null; // Don't render modal if not open

    return (
        <div className="custom-modal active">
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-container">
                <div className="modal-content form_section">
                    <h6>{title}</h6>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
